'use client';
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const OrderSummary = () => {
  const { currency, cartItems, updateCartQuantity, getCartCount, getCartAmount, setCartItems } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [coupon, setCoupon] = useState("");

  // 🧠 Sayfa yenilendiğinde localStorage'dan cartItems yükle
  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, [setCartItems]);

  // 💾 cartItems değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  return (
    <div className="w-full md:w-[500px] lg:w-[600px] bg-white shadow-2xl rounded-3xl p-8 mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3">Checkout</h2>

      {/* Sepetteki Ürünler */}
      <div className="space-y-5 max-h-[500px] overflow-y-auto mb-6">
        {Object.values(cartItems).map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl hover:shadow-md transition"
          >
            <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.product.image[0] || "/placeholder.png"}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 px-4">
              <p className="font-semibold text-gray-800">{item.product.name}</p>
              <p className="text-sm text-gray-500">{currency}{item.product.price}</p>
            </div>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 transition"
              >-</button>
              <span className="px-3 py-1 text-gray-700">{item.quantity}</span>
              <button
                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 transition"
              >+</button>
            </div>
            <div className="ml-4 font-semibold text-gray-900">
              {currency}{(item.product.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Adres Seçimi */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Select Address</label>
        <select
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          className="w-full border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">-- Choose an Address --</option>
          <option value="home">Home - 123 Main St</option>
          <option value="work">Work - 456 Office Rd</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Ödeme Yöntemi */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
        <div className="flex gap-4">
          <button
            onClick={() => setPaymentMethod("card")}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              paymentMethod === "card" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Credit Card
          </button>
          <button
            onClick={() => setPaymentMethod("cash")}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              paymentMethod === "cash" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Cash
          </button>
        </div>
      </div>

      {/* Kupon */}
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

      {/* Sepet Özeti */}
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

      {/* Place Order */}
      <button className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-orange-700 transition shadow-lg text-lg">
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;
