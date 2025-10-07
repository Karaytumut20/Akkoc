'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function TiffanyIconsGrid() {
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_urls, description')
      .eq('brandicon', true);

    if (error) {
      console.error('Icon ürünleri alınamadı:', error.message);
      setIcons([]);
    } else {
      const productsWithImages = (data || []).map(item => ({
        id: item.id,
        title: item.name,
        image: item.image_urls && item.image_urls.length > 0
          ? Array.isArray(item.image_urls)
            ? item.image_urls[0]
            : JSON.parse(item.image_urls)[0]
          : '/assets/shopnow.jpg', // fallback
        alt: item.description || item.name,
      }));
      setIcons(productsWithImages);
    }
  };

  // Eğer 4’ten az ürün varsa componenti göstermeme
  if (icons.length < 4) return null;

  return (
    <section className="w-full bg-white py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-serif text-gray-900 text-center mb-12 sm:mb-16">
          The Tiffany Icons
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {icons.map((item, index) => (
            <div key={item.id} className="text-center group">
              <div className="relative w-full aspect-square overflow-hidden bg-teal-600">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition duration-500 ease-in-out group-hover:scale-[1.03]"
                  priority={index < 2}
                />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-serif text-gray-900 mb-4">{item.title}</h3>
                <a
                  href={`/shop/${item.title.toLowerCase().replace(/\s/g, '-')}`}
                  className="text-xs font-semibold tracking-widest uppercase text-gray-900 border-b border-gray-900 pb-1 hover:text-teal-600 hover:border-teal-600 transition duration-150"
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
