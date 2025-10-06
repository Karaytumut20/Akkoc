import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {

  const { products, router } = useAppContext()

  return (
    <div className="flex flex-col">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>
      <div >
        <ProductCard />
      </div>
      <button onClick={() => { router.push('/all-products') }}>
        See mores
      </button>
    </div>
  );
};

export default HomeProducts;
