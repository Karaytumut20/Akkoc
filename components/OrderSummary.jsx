// components/OrderSummary.jsx

'use client';
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import React, { useState } from "react";
import toast from 'react-hot-toast';

const OrderSummary = () => {
  const { currency, cartItems, user, updateCartQuantity, getCartCount, getCartAmount, setCartItems, addresses, router } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      const updatedCart = { ...cartItems };
      delete updatedCart[productId];
      setCartItems(updatedCart);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Ödeme yapmak için lütfen giriş yapın.");
      router.push('/auth');
      return;
    }
    if (!selectedAddress) {
        toast.error("Lütfen bir teslimat adresi seçin!");
        return;
    }
    setLoading(true);

    try {
      // ✅ DÜZELTME: API isteği için tam URL kullanılıyor. Bu, canlı ortamda (deployment) hatayı önler.
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/checkout_sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: Object.values(cartItems),
          userId: user.id,
          addressId: selectedAddress,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error.message);
      }
      
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Ödeme sayfasına yönlendirilemedi.');
      }
    } catch (error) {
      toast.error(`Bir hata oluştu: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-[500px] lg:w-[600px] bg-white shadow-2xl rounded-3xl p-6 md:p-8 mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3">Checkout</h2>

      <div className="space-y-5 mb-6 max-h-[60vh] md:max-h-[500px] overflow-y-auto">
        {Object.keys(cartItems).length === 0 ? (
          <p className="text-gray-500 text-center py-10">Sepetiniz boş.</p>
        ) : (
          Object.values(cartItems).map((item, idx) => (
            <div
              key={item.product.id || idx}
              className="flex items-center justify-between bg-gray-50 p-3 md:p-4 rounded-2xl hover:shadow-md transition"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.product.image_urls?.[0] || "/assets/placeholder.jpg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 px-3 md:px-4">
                <p className="font-semibold text-gray-800 text-sm md:text-base">{item.product.name}</p>
                <p className="text-xs md:text-sm text-gray-500">{currency}{item.product.price}</p>
              </div>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                  className="px-2 py-1 md:px-3 md:py-1 bg-gray-200 hover:bg-gray-300 transition"
                >-</button>
                <span className="px-2 py-1 md:px-3 md:py-1 text-gray-700">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                  className="px-2 py-1 md:px-3 md:py-1 bg-gray-200 hover:bg-gray-300 transition"
                >+</button>
              </div>
              <div className="ml-2 md:ml-4 font-semibold text-gray-900 text-sm md:text-base">
                {currency}{(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-medium">Select Address</label>
            <button onClick={() => router.push('/account/addresses')} className="text-sm text-orange-600 hover:underline">Adres Ekle/Düzenle</button>
        </div>
        <select
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          className="w-full border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="" disabled>-- Adres seçin --</option>
          {addresses.length > 0 ? (
            addresses.map(addr => (
                <option key={addr.id} value={addr.id}>{`${addr.full_name} - ${addr.area}, ${addr.city}`}</option>
            ))
          ) : (
            <option disabled>Kayıtlı adresiniz bulunmuyor.</option>
          )}
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
        <div className="flex gap-4">
          <button
            onClick={() => setPaymentMethod("card")}
            className={`flex-1 py-3 rounded-lg font-medium transition ${paymentMethod === "card" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Credit Card
          </button>
          <button
            onClick={() => setPaymentMethod("cash")}
            disabled // DÜZELTME: Sadece kartla ödeme aktif olduğu için bu butonu devre dışı bırakıyoruz.
            className={`flex-1 py-3 rounded-lg font-medium transition ${paymentMethod === "cash" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Cash on Delivery
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Coupon Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter code"
            className="flex-1 border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button className="bg-orange-500 text-white px-4 rounded-lg hover:bg-orange-600 transition font-semibold">
            Apply
          </button>
        </div>
      </div>

      <div className="mt-6 border-t pt-4 space-y-3">
        <div className="flex justify-between text-gray-700 font-medium">
          <span>Items ({getCartCount()})</span>
          <span>{currency}{getCartAmount().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-900 font-bold text-xl">
          <span>Total</span>
          <span>{currency}{getCartAmount().toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={getCartCount() === 0 || !selectedAddress || loading}
        className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-orange-700 transition shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Yönlendiriliyor...' : 'Şimdi Öde'}
      </button>
    </div>
  );
};
 
export default OrderSummary;