'use client'
import React from "react";
import Navbar from "@/components/Navbar";
import OrderSummary from "@/components/OrderSummary";

const Cart = () => {
  return (
    <>
      <Navbar />
      <div className="flex justify-center px-6 md:px-16 lg:px-32 pt-14 mb-20">
        {/* Sadece Order Summary */}
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
