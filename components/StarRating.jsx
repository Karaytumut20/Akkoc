"use client";

import React from "react";
import { FiStar } from "react-icons/fi";

const StarRating = ({ rating = 0, onRatingChange = null }) => {
  const handleClick = (value) => {
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`w-6 h-6 cursor-pointer transition ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
          }`}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;
