// components/ReviewModal.jsx

'use client';

import React from 'react';
import { FiX, FiInfo, FiCheckCircle } from 'react-icons/fi';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';

const ReviewModal = ({ isOpen, onClose, reviews, productId, onReviewSubmitted, reviewEligibility }) => {
  const { user, authLoading } = useAppContext();

  if (!isOpen) return null;

  // Yorum yapma formunu veya ilgili bilgilendirme mesajını render eden fonksiyon
  const renderFormOrMessage = () => {
    if (authLoading) {
      return <div className="text-center text-gray-500 p-4">Yükleniyor...</div>;
    }
    
    if (!user) {
      return (
        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-center">
          Yorum yapmak için <Link href="/auth" className="text-teal-600 font-semibold hover:underline">giriş yapmalısınız</Link>.
        </p>
      );
    }
    
    if (!reviewEligibility.hasPurchased) {
        return (
            <div className="text-gray-600 bg-yellow-50 p-4 rounded-lg flex items-center gap-3">
              <FiInfo className="w-5 h-5 text-yellow-600 flex-shrink-0"/>
              <p>Bu ürünü değerlendirmek için önce satın almanız gerekmektedir.</p>
            </div>
        );
    }

    if (reviewEligibility.hasExistingReview) {
        return (
            <div className="text-gray-600 bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                <FiCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                <p>Bu ürün için zaten bir değerlendirme yaptınız. Yorumunuz incelendikten sonra yayınlanacaktır.</p>
            </div>
        );
    }

    // Kullanıcı yorum yapabiliyorsa formu göster
    return <ReviewForm productId={productId} onReviewAdded={onReviewSubmitted} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-5 sticky top-0 bg-white rounded-t-lg z-10">
          <h2 className="text-xl font-semibold text-gray-800">Ürün Değerlendirmeleri</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition"><FiX className="w-6 h-6" /></button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Her zaman önce yorum yapma bölümünü (veya mesajını) göster */}
          {renderFormOrMessage()}

          {/* Eğer mevcut yorum varsa, bir ayırıcı çizgi ile listeyi aşağıda göster */}
          {reviews.length > 0 && (
            <>
              <div className="border-t my-6"></div>
              <h3 className="text-lg font-semibold text-gray-800">Diğer Değerlendirmeler</h3>
              <ReviewList reviews={reviews} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;