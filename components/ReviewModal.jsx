// components/ReviewModal.jsx

'use client';

import React from 'react';
import { FiX } from 'react-icons/fi';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';

const ReviewModal = ({ isOpen, onClose, reviews, productId, fetchReviews, hasPurchased }) => {
  const { user, authLoading } = useAppContext();

  if (!isOpen) return null;

  // Yorum formunu veya ilgili mesajı gösterecek olan fonksiyon
  const renderFormOrMessage = () => {
    // Kullanıcı bilgisi yüklenirken bekle
    if (authLoading) {
      return <div className="text-center text-gray-500 p-4">Yükleniyor...</div>;
    }
    
    // Kullanıcı giriş yapmamışsa
    if (!user) {
      return (
        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
          Yorum yapmak için <Link href="/auth" className="text-teal-600 font-semibold hover:underline">giriş yapmalısınız</Link>.
        </p>
      );
    }

    // Kullanıcı ürünü satın almışsa formu göster
    if (hasPurchased) {
      return <ReviewForm productId={productId} onReviewAdded={fetchReviews} />;
    } 
    // Kullanıcı ürünü satın almamışsa uyarı mesajı göster
    else {
      return (
        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
          Bu ürünü değerlendirmek için önce satın almanız gerekmektedir.
        </p>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-5 sticky top-0 bg-white rounded-t-lg z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            Ürün Değerlendirmeleri
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {renderFormOrMessage()}
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;