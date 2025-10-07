// components/HomeProducts.jsx

import React from "react";
import ProductCard from "./ProductCard"; // Bu artık doğru bir şekilde tek bir kart bileşenini import ediyor
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { products, router } = useAppContext();

  // Ana sayfada gösterilecek ürün sayısını sınırlayalım (örneğin ilk 8 ürün)
  const popularProducts = products.slice(0, 8);

  return (
    <div className="flex flex-col items-center my-16 w-full px-4">
      <div className="flex flex-col items-center mb-10">
        <p className="text-3xl font-medium text-center">
          Popüler <span className="font-medium text-orange-600">Ürünler</span>
        </p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      {/* Ürün kartları için grid yapısı */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 w-full justify-items-center">
        {popularProducts.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>

      {/* Eğer daha fazla ürün varsa "Daha Fazla Gör" butonu gösterilir */}
      {products.length > popularProducts.length && (
        <button
          onClick={() => {
            router.push("/all-products");
            window.scrollTo(0, 0);
          }}
          className="mt-12 px-8 py-2 border rounded text-gray-600 hover:bg-gray-100 hover:shadow-sm transition-all duration-200"
        >
          Daha Fazla Gör
        </button>
      )}
    </div>
  );
};

export default HomeProducts;