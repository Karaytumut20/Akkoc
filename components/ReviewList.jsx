"use client";

import React from "react";
import StarRating from "./StarRating";

const ReviewList = ({ reviews }) => {
  // ✅ Boolean veya string true kontrolü
  const approvedReviews = reviews.filter((r) => r.is_approved == true);

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-xl font-semibold mb-4">Yorumlar</h2>

      {approvedReviews.length === 0 && (
        <p className="text-gray-600">Henüz yorum yapılmamış.</p>
      )}

      <div className="space-y-5">
        {approvedReviews.map((review) => (
          <div
            key={review.id}
            className="border-b pb-4 last:border-none flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} />
              <span className="text-sm text-gray-500">
                {review.users?.email || "Anonim Kullanıcı"}
              </span>
            </div>
            <p className="text-gray-800 text-base">{review.comment}</p>
            <span className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleString("tr-TR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
