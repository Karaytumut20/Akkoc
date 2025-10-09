// app/cart/page.jsx

'use client'
import React from "react";
import OrderSummary from "@/components/OrderSummary";
// Navbar import'u ve kullanımı kaldırıldı

const Cart = () => {
  return (
    // pt-28 (padding-top) eklendi
    <div className="pt-28 flex justify-center px-6 md:px-16 lg:px-32 py-14 mb-20">
      {/* Sadece Order Summary */}
      <OrderSummary />
    </div>
  );
};

export default Cart;