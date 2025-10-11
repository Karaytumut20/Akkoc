// components/ProductCard.jsx

'use client';

import React from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import { FiHeart } from 'react-icons/fi'; // react-icons'tan kalp ikonu

const ProductCard = ({ product }) => {
  const { router, wishlist, addToWishlist, removeFromWishlist } = useAppContext();

  if (!product) {
    return null;
  }

  const isFavorited = wishlist.some(item => item.product_id === product.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Kartın tıklama olayını tetiklemesini engelle
    if (isFavorited) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const getValidImage = (imageUrls) => {
    if (
      Array.isArray(imageUrls) &&
      imageUrls.length > 0 &&
      typeof imageUrls[0] === 'string' &&
      imageUrls[0].trim() !== ''
    ) {
      return imageUrls[0];
    }
    return '/assets/placeholder.jpg';
  };

  return (
    <div
      onClick={() => {
        router.push('/product/' + product.id);
      }}
      className="flex flex-col items-start w-full max-w-[210px] cursor-pointer group"
    >
      <div className="relative rounded-lg w-full aspect-[3.4/4] overflow-hidden bg-gray-100">
        <Image
          src={getValidImage(product.image_urls)}
          alt={product.name || 'Product image'}
          className="group-hover:scale-105 transition-transform duration-300 object-cover w-full h-full"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* 🔴 FAVORİ BUTONU ARTIK HER ZAMAN GÖRÜNÜR */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md transition-all z-10 hover:scale-110"
        >
          <FiHeart
            className={`w-4 h-4 ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
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
