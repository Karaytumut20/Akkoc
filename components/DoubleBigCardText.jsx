'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function FeaturedCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, image_urls, doublebigcardtext, category')
      .eq('doublebigcardtext', true); // sadece doublebigcard true olanlar

    if (error) {
      console.error('Ürünler alınamadı:', error.message);
      setCollections([]);
      setLoading(false);
      return;
    }

    if (!data || data.length < 2) {
      // Eğer 2'den az ürün varsa ekrana hiçbir şey gösterme
      setCollections([]);
      setLoading(false);
      return;
    }

    // JSON string olarak kaydedilmiş image_urls'i array'e çeviriyoruz
    const formattedData = data.map(item => ({
      id: item.id,
      title: item.name,
      description: item.description,
      image: item.image_urls && item.image_urls.length > 0
        ? (Array.isArray(item.image_urls) ? item.image_urls[0] : JSON.parse(item.image_urls)[0])
        : '/assets/default.jpg', // varsayılan görsel
      alt: item.name,
      linkText: 'DETAYLARI GÖR',
      linkHref: `/product/${item.id}`,
    }));

    setCollections(formattedData);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center items-center h-60 text-lg text-gray-700">Yükleniyor...</div>;
  if (collections.length === 0) return null; // 2'den az ürün varsa gösterme

  return (
    <section className="w-full bg-white py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {collections.map((item, index) => (
            <div key={item.id} className="text-center group">
              <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-500 ease-in-out group-hover:scale-[1.01]"
                  priority={index === 0}
                />
              </div>
              <div className="mt-8 px-4">
                <h3 className="text-2xl font-serif text-gray-900 mb-4">{item.title}</h3>
                <p className="text-sm text-gray-700 max-w-sm mx-auto mb-6 leading-relaxed">{item.description}</p>
                <a
                  href={item.linkHref}
                  className="text-xs font-semibold tracking-widest uppercase text-gray-900 border-b border-gray-900 pb-1 hover:text-teal-600 hover:border-teal-600 transition duration-150"
                >
                  {item.linkText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
