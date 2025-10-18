"use client";
import React from "react";
import StarRating from "./StarRating";

const ReviewModal = ({ isOpen, onClose, reviews }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white max-w-lg w-full rounded-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Ürün Değerlendirmeleri</h2>

        {reviews.length === 0 && (
          <p className="text-gray-600">Henüz yorum yapılmamış.</p>
        )}

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b pb-3 last:border-none flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                <span className="text-sm text-gray-500">
                  {review.users?.email || "Anonim Kullanıcı"}
                </span>
              </div>
              {/* 👇 YORUM METNİ BURADA GÖZÜKECEK */}
              <p className="text-gray-800 text-base mt-1">
                {review.comment || "Yorum yok"}
              </p>
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleString("tr-TR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
