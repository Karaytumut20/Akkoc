// app/api/webhook/route.js

import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ÖNEMLİ: API rotalarında güvenlik için "Service Role Key" kullanılmalıdır.
// Bu anahtarı Supabase projenizin "Project Settings > API" bölümünden alabilirsiniz.
// .env.local dosyanıza SUPABASE_SERVICE_KEY olarak ekleyin.
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
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
    
    // --- IDEMPOTENCY KONTROLÜ ---
    // Bu checkout session'ı daha önce işleyip işlemediğimizi kontrol et
    const { data: existingOrder, error: lookupError } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_checkout_id', session.id)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') { // 'PGRST116' = no rows found (kayıt yok hatası)
        console.error('Sipariş kontrol hatası:', lookupError);
        return new NextResponse('Internal Server Error while checking for existing order.', { status: 500 });
    }

    if (existingOrder) {
      console.log(`Sipariş zaten mevcut: ${existingOrder.id}. Tekrarlı istek yoksayılıyor.`);
      return new NextResponse(JSON.stringify({ received: true, message: 'Order already processed' }), { status: 200 });
    }
    // --- IDEMPOTENCY KONTROLÜ SONU ---

    const { userId, addressId, cartItems } = session.metadata;
    if (!userId || !addressId || !cartItems) {
        return new NextResponse('Webhook Hatası: Gerekli metadata eksik.', { status: 400 });
    }
    const simplifiedCart = JSON.parse(cartItems);
    const totalAmount = session.amount_total / 100;

    try {
      // 1. Adres bilgisini al
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .single();
      
      if (addressError) throw new Error(`Adres bulunamadı (ID: ${addressId}): ${addressError.message}`);

      // 2. 'orders' tablosuna yeni siparişi oluştur
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ 
            user_id: userId, 
            total_amount: totalAmount, 
            address: addressData, 
            status: 'Hazırlanıyor',
            stripe_checkout_id: session.id, // Idempotency için checkout_id'yi kaydet
        }])
        .select()
        .single();
      
      if (orderError) throw new Error(`Sipariş oluşturulamadı: ${orderError.message}`);
      
      // 3. Ürün detaylarını (fiyat, stok) veritabanından çek ve 'order_items' oluştur
      const productIds = simplifiedCart.map(item => item.productId);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, price, stock')
        .in('id', productIds);

      if (productsError) throw new Error(`Ürün detayları alınamadı: ${productsError.message}`);

      const orderItems = simplifiedCart.map(item => {
        const product = productsData.find(p => p.id === item.productId);
        if (!product) throw new Error(`ID'si ${item.productId} olan ürün veritabanında bulunamadı.`);
        if (product.stock < item.quantity) throw new Error(`Yetersiz stok: ${product.name}`);
        return {
            order_id: orderData.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: product.price, // Fiyatı her zaman veritabanından al, client'a güvenme
        };
      });

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw new Error(`Sipariş ürünleri eklenemedi: ${itemsError.message}`);

      // 4. Stokları güncelle (İleri seviye çözüm: Supabase Edge Function ile transaction kullanmak)
      for (const item of orderItems) {
        const product = productsData.find(p => p.id === item.product_id);
        const newStock = product.stock - item.quantity;
        const { error: stockUpdateError } = await supabase
          .from('products')
          .update({ stock: newStock > 0 ? newStock : 0 })
          .eq('id', item.product_id);
        
        if (stockUpdateError) {
          // Bu hatayı loglamak önemli, ancak süreci durdurmayabiliriz.
          console.error(`Stok güncellenemedi (Ürün ID: ${item.product_id}):`, stockUpdateError.message);
        }
      }
      
      console.log(`Sipariş ${orderData.id} başarıyla oluşturuldu.`);

    } catch (error) {
      console.error('Webhook işlenirken veritabanı hatası:', error.message);
      // Hata durumunda Stripe'a 500 döndürerek işlemi daha sonra tekrar denemesini sağlayabiliriz.
      return new NextResponse(`Webhook Handler Veritabanı Hatası: ${error.message}`, { status: 500 });
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}