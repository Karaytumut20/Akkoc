'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function HighJewelryBanner() {
  const [bigCardProducts, setBigCardProducts] = useState([]);

  useEffect(() => {
    fetchBigCardProducts();
  }, []);

  const fetchBigCardProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, image_urls')
      .eq('bigcard', true);

    if (error) {
      console.error('Bigcard ürünleri alınamadı:', error.message);
      setBigCardProducts([]);
    } else {
      const productsWithImages = (data || []).map(item => ({
        ...item,
        // image_urls'u dizi formatına çevir
        image_urls: item.image_urls
          ? Array.isArray(item.image_urls)
            ? item.image_urls
            : JSON.parse(item.image_urls) // Supabase'deki JSON string'i parse et
          : [],
      }));
      // Görsel URL'lerinin doğru olup olmadığını kontrol etmek için konsola yazdırın!
      // console.log("Alınan Ürünler:", productsWithImages); 
      setBigCardProducts(productsWithImages);
    }
  };

  const getValidImage = (imageArray) => {
    if (!imageArray || imageArray.length === 0) return '/assets/bigcard.jpg';
    
    // İlk öğeyi al ve boşlukları temizle
    const url = imageArray[0]?.trim(); 
    
    // URL'in varlığını ve geçerliliğini kontrol et
    if (!url) return '/assets/bigcard.jpg';
    
    try { 
      new URL(url); 
      return url; 
    }
    catch { 
      return '/assets/bigcard.jpg'; 
    }
  };

  if (bigCardProducts.length === 0) return null;

  return (
    <>
      {bigCardProducts.map(product => (
        <section
          key={product.id}
          className="w-full min-h-[85vh] md:h-[90vh] bg-white flex justify-center items-center overflow-hidden"
        >
          <div className="max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8 items-center">
            
            {/* SOL SÜTUN: Görsel - Yüksekliği ayarlanmış div */}
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[700px] flex justify-center items-center rounded-xl overflow-hidden">
              <Image
                src={getValidImage(product.image_urls)}
                alt={product.name}
                fill // Kapsayıcı div'i tamamen doldurur
                style={{ objectFit: 'contain' }}
                quality={100}
                className="transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* SAĞ SÜTUN: Metin */}
            <div className="flex flex-col justify-center items-start text-left py-8 md:py-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                {product.name}
              </h1>
              <p className="text-base sm:text-lg text-gray-700 max-w-lg mb-10">
                {product.description || 'Ürün açıklaması yok.'}
              </p>
              <a
                href="/collection"
                className="text-sm font-semibold tracking-widest uppercase text-gray-900 border-b-2 border-gray-900 pb-1 hover:text-teal-600 hover:border-teal-600 transition duration-200"
              >
                EXPLORE THE COLLECTION
              </a>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}