'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';

// ProductCard Component
const ProductCard = ({ product }) => {
  const { router } = useAppContext();

  return (
    <div
      onClick={() => { router.push('/product/' + product.id); scrollTo(0, 0); }}
      className="flex flex-col items-start gap-0.5 w-full max-w-[210px] cursor-pointer"
    >
      {/* Görsel alanı: Sabit en-boy oranı 3.2:4 olarak ayarlandı */}
      <div className="cursor-pointer group relative rounded-lg w-full aspect-[3.2/4] flex items-center justify-center overflow-hidden">
        <Image
          src={product.image_urls?.[0] || '/placeholder.png'}
          alt={product.name}
          className="group-hover:scale-105 transition object-cover w-full h-full"
          width={800}
          height={1000} // 3.2:4 oranı için height
        />
        <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
          <Image
            className="h-3 w-3"
            src={assets.heart_icon}
            alt="heart_icon"
          />
        </button>
      </div>

      <p className="md:text-base font-medium pt-2 w-full truncate text-center">
        {product.name}
      </p>
    </div>
  );
};

// ProductsGrid Component
export default function ProductsGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_urls');

    if (error) {
      console.error('Ürünler alınamadı:', error.message);
      setProducts([]);
    } else {
      setProducts((data || []).map(item => ({
        ...item,
        image_urls: item.image_urls
          ? Array.isArray(item.image_urls)
            ? item.image_urls
            : JSON.parse(item.image_urls)
          : []
      })));
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-lg text-gray-700">
      Ürünler yükleniyor...
    </div>
  );

  return (
    <div className="text-gray-800 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-4">
        Ürünler
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-xl text-gray-500 py-10">
          Henüz ürün bulunmuyor.
        </p>
      ) : (
        // Mobilde 2 sütun, sm'de 3, md'de 4, lg'de 5, xl ve üstünde 6 sütun
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
