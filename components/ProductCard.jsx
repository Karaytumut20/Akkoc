'use client';

import React from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {
  const { router } = useAppContext();

  if (!product) {
    return null;
  }

  const getValidImage = (imageUrls) => {
    if (Array.isArray(imageUrls) && imageUrls.length > 0 && typeof imageUrls[0] === 'string' && imageUrls[0].trim() !== '') {
      return imageUrls[0];
    }
    return '/assets/placeholder.jpg'; // Varsayılan resim
  };

  return (
    <div
      onClick={() => { router.push('/product/' + product.id); scrollTo(0, 0); }}
      className="flex flex-col items-start w-full max-w-[210px] cursor-pointer group"
    >
      <div className="relative rounded-lg w-full aspect-[3.2/4] overflow-hidden bg-gray-100">
        <Image
          src={getValidImage(product.image_urls)}
          alt={product.name || 'Product image'}
          className="group-hover:scale-105 transition-transform duration-300 object-cover w-full h-full"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          <Image
            className="h-3 w-3"
            src={assets.heart_icon}
            alt="heart_icon"
          />
        </button>
      </div>
      <p className="text-base font-medium pt-2 w-full truncate text-center">
        {product.name}
      </p>
    </div>
  );
};

export default ProductCard;
