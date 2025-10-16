// app/api/webhook/route.js

'use server'; // Next.js 13+ server component

import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// STRIPE ve SUPABASE SERVICE ROLE KEY ile admin client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env variable is missing!');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // sadece server-side kullan
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const buf = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook imza doğrulama hatası: ${err.message}`);
    return new NextResponse(`Webhook Hatası: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, addressId, cartItems } = session.metadata;

    // Sepetteki ürünleri parse et
    const simplifiedCart = JSON.parse(cartItems);
    const totalAmount = session.amount_total / 100;

    try {
      // 1️⃣ Adres bilgisi (opsiyonel: ister kullan ister null bırak)
      let addressData = null;
      if (addressId) {
        const { data: addrData, error: addrError } = await supabaseAdmin
          .from('addresses')
          .select('*')
          .eq('id', addressId)
          .single();

        if (addrError) {
          console.warn('Adres bulunamadı, sipariş oluşturuluyor ama address null:', addrError.message);
        } else {
          addressData = addrData;
        }
      }

      // 2️⃣ Siparişi oluştur
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([{
          user_id: userId,
          total_amount: totalAmount,
          address: addressData, // JSON veya null
          status: 'Hazırlanıyor'
        }])
        .select()
        .single();

      if (orderError) throw new Error(`Sipariş oluşturulamadı: ${orderError.message}`);

      // 3️⃣ Ürün detaylarını çek
      const productIds = simplifiedCart.map(item => item.productId);
      const { data: productsData, error: productsError } = await supabaseAdmin
        .from('products')
        .select('id, price, stock')
        .in('id', productIds);

      if (productsError) throw new Error(`Ürün detayları alınamadı: ${productsError.message}`);

      // 4️⃣ Order items ekle
      const orderItems = simplifiedCart.map(item => {
        const product = productsData.find(p => p.id === item.productId);
        return {
          order_id: orderData.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      });

      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
      if (itemsError) throw new Error(`Sipariş ürünleri eklenemedi: ${itemsError.message}`);

      // 5️⃣ Stokları güncelle
      for (const item of orderItems) {
        const product = productsData.find(p => p.id === item.product_id);
        const newStock = product.stock - item.quantity;
        await supabaseAdmin
          .from('products')
          .update({ stock: newStock > 0 ? newStock : 0 })
          .eq('id', item.product_id);
      }

      // 6️⃣ Sepeti temizle
      const { error: cartClearError } = await supabaseAdmin
        .from('user_cart')
        .delete()
        .eq('user_id', userId);

      if (cartClearError) {
        console.error('Sepet temizlenirken hata oluştu:', cartClearError.message);
      }

      console.log(`Sipariş ${orderData.id} başarıyla oluşturuldu.`);

    } catch (error) {
      console.error('Webhook işlenirken veritabanı hatası:', error.message);
      return new NextResponse(`Webhook Handler Veritabanı Hatası: ${error.message}`, { status: 500 });
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
