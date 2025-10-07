'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function FeaturedCategories() {
  const [featuredItems, setFeaturedItems] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_urls')
      .eq('doublebigcard', true);

    if (error) {
      console.error('DoubleBigCard ürünleri alınamadı:', error.message);
      setFeaturedItems([]);
    } else {
      const productsWithImages = (data || []).map((item) => ({
        ...item,
        image_urls: item.image_urls
          ? Array.isArray(item.image_urls)
            ? item.image_urls
            : JSON.parse(item.image_urls)
          : [],
      }));
      setFeaturedItems(productsWithImages);
    }
  };

  const getValidImage = (imageArray) => {
    if (!imageArray || imageArray.length === 0) return '/assets/bigcard.jpg';
    const url = imageArray[0]?.trim();
    try {
      new URL(url);
      return url;
    } catch {
      return '/assets/bigcard.jpg';
    }
  };

  if (featuredItems.length === 0) return null;

  return (
    <section className="w-full bg-white py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {featuredItems.map((item) => (
            <div key={item.id} className="text-center group cursor-pointer">
              <div className="relative w-full aspect-[4/3] sm:aspect-[3/4] overflow-hidden rounded-xl">
                <Image
                  src={getValidImage(item.image_urls)}
                  alt={item.name}
                  fill
                  // Hata Düzeltildi: Fazla yıldız işaretleri kaldırıldı
                  style={{ objectFit: 'cover' }} 
                  className="transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-serif text-gray-900 mb-4 tracking-wide">
                  {item.name}
                </h3>
                <a
                  href={`/shop/${item.name.toLowerCase().replace(/\s/g, '-')}`}
                  className="text-xs font-semibold tracking-widest uppercase text-gray-900 border-b border-gray-900 pb-1 hover:text-teal-600 hover:border-teal-600 transition duration-200"
                >
                  SHOP NOW
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}