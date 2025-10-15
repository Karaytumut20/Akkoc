import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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
    const simplifiedCart = JSON.parse(cartItems);
    const totalAmount = session.amount_total / 100;

    try {
      // DÜZELTME: Adres sorgusunu daha güvenli hale getiriyoruz.
      // .single() yerine normal bir sorgu yapıp sonucu kontrol ediyoruz.
      const { data: addresses, error: addressError } = await supabaseAdmin
        .from('addresses')
        .select('*')
        .eq('id', addressId);
      
      if (addressError) {
        throw new Error(`Adres sorgulanırken hata oluştu: ${addressError.message}`);
      }
      if (!addresses || addresses.length === 0) {
        throw new Error(`Veritabanında ${addressId} ID'li adres bulunamadı.`);
      }

      // Adresi dizinin ilk elemanı olarak alıyoruz.
      const addressData = addresses[0];

      // 2. 'orders' tablosuna yeni siparişi oluştur
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([{ 
            user_id: userId, 
            total_amount: totalAmount, 
            address: addressData, 
            status: 'Hazırlanıyor' 
        }])
        .select()
        .single();
      
      if (orderError) throw new Error(`Sipariş oluşturulamadı: ${orderError.message}`);
      
      // 3. Ürün detaylarını çek ve 'order_items' oluştur
      const productIds = simplifiedCart.map(item => item.productId);
      const { data: productsData, error: productsError } = await supabaseAdmin
        .from('products')
        .select('id, price, stock')
        .in('id', productIds);

      if (productsError) throw new Error(`Ürün detayları alınamadı: ${productsError.message}`);

      const orderItems = simplifiedCart.map(item => {
        const product = productsData.find(p => p.id === item.productId);
        if (!product) throw new Error(`Ürün bulunamadı: ${item.productId}`);
        return {
            order_id: orderData.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: product.price,
        };
      });

      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
      if (itemsError) throw new Error(`Sipariş ürünleri eklenemedi: ${itemsError.message}`);

      // 4. Stokları güncelle
      for (const item of orderItems) {
        const product = productsData.find(p => p.id === item.product_id);
        const newStock = product.stock - item.quantity;
        await supabaseAdmin
          .from('products')
          .update({ stock: newStock > 0 ? newStock : 0 })
          .eq('id', item.product_id);
      }
      
      console.log(`Sipariş ${orderData.id} başarıyla oluşturuldu.`);

    } catch (error) {
      console.error('Webhook işlenirken veritabanı hatası:', error.message);
      return new NextResponse(`Webhook Handler Veritabanı Hatası: ${error.message}`, { status: 500 });
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}