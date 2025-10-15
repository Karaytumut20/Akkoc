// components/ReviewList.jsx

import React from 'react';
import StarRating from './StarRating';

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500 mt-4">Bu ürün için henüz yorum yapılmamış.</p>;
  }

  return (
    <div className="space-y-6 mt-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
              {/* DÜZELTME: 'review.users.email' yerine 'review.user_id.email' kullanıldı. */}
              {review.user_id && review.user_id.email ? review.user_id.email.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="ml-3">
              {/* DÜZELTME: 'review.users.email' yerine 'review.user_id.email' kullanıldı. */}
              <p className="font-semibold text-gray-800">{review.user_id && review.user_id.email ? review.user_id.email.split('@')[0] : 'Anonim'}</p>
              <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <StarRating rating={review.rating} />
          <p className="text-gray-700 mt-2">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;