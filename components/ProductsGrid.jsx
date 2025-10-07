// components/ProductsGrid.jsx

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from './ProductCard'; // 1. Adımda oluşturduğumuz yeni bileşeni import ediyoruz

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
        Tüm Ürünler
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-xl text-gray-500 py-10">
          Henüz ürün bulunmuyor.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}