'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function Categories() {
  const [iconProducts, setIconProducts] = useState([]);

  useEffect(() => {
    fetchIconProducts();
  }, []);

  const fetchIconProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_urls')
      .eq('icons', true); // 👈 sütun ismi düzeltildi

    if (error) {
      console.error('Icon ürünleri alınamadı:', error.message);
      setIconProducts([]);
    } else {
      // Görselleri parse et
      const productsWithImages = (data || []).map(item => ({
        ...item,
        image_urls: item.image_urls
          ? Array.isArray(item.image_urls)
            ? item.image_urls
            : JSON.parse(item.image_urls)
          : [],
      }));
      setIconProducts(productsWithImages);
    }
  };

  const getValidImage = (imageArray) => {
    if (!imageArray || imageArray.length === 0) return '/assets/placeholder.jpg';
    const url = imageArray[0]?.trim();
    try {
      new URL(url);
      return url;
    } catch {
      return '/assets/placeholder.jpg';
    }
  };

  if (iconProducts.length === 0) return null;

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 text-center mt-12 mb-12">
          Shop By Category
        </h2>

        <div className="flex gap-4 overflow-x-auto lg:grid lg:grid-cols-6 lg:gap-6 lg:overflow-x-visible">
          {iconProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[40%] sm:w-[30%] md:w-[25%] lg:w-auto
                         relative cursor-pointer text-center group transition-transform duration-300 hover:scale-105"
            >
              <div className="relative w-full aspect-square rounded-xl shadow-xl overflow-hidden">
                <Image
                  src={getValidImage(product.image_urls)}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="mt-4 text-base font-semibold tracking-wide text-gray-900 group-hover:text-teal-600">
                {product.name}
              </h3>

              <div className="h-[3px] w-14 mx-auto mt-2 bg-gradient-to-r from-teal-400 via-teal-600 to-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
