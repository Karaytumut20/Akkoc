import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { items, userId, addressId } = await req.json();

    if (!items || !userId || !addressId) {
      return NextResponse.json({ error: { message: "Eksik parametreler: Sepet, kullanıcı veya adres ID'si gönderilmedi." } }, { status: 400 });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'try',
        product_data: {
          name: item.product.name,
          images: item.product.image_urls && item.product.image_urls.length > 0 ? [item.product.image_urls[0]] : [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    // SADECE GEREKLİ BİLGİLERİ GÖNDER
    const simplifiedCart = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/order-placed`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
      metadata: {
        userId,
        addressId,
        // Tüm ürün objesi yerine sadece ID ve adet bilgilerini gönder
        cartItems: JSON.stringify(simplifiedCart),
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("Stripe Checkout Session Hatası:", err.message);
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}