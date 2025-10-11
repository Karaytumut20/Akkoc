// components/ReviewForm.jsx

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';

const ReviewForm = ({ productId, onReviewAdded }) => {
  const { user } = useAppContext();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      return toast.error('Lütfen puan verin ve yorumunuzu yazın.');
    }
    setLoading(true);
    const { error } = await supabase
      .from('reviews')
      .insert([{
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
      }]);

    setLoading(false);
    if (error) {
      toast.error('Yorum eklenirken bir hata oluştu.');
    } else {
      toast.success('Yorumunuz alındı ve incelendikten sonra yayınlanacak.');
      setRating(0);
      setComment('');
      if (onReviewAdded) {
        onReviewAdded();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Yorum Yap</h3>
      <div className="mb-4">
        <span className="text-gray-700">Puanınız:</span>
        <div className="flex items-center mt-1">
          {[...Array(5)].map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className="focus:outline-none"
            >
              <svg
                className={`w-6 h-6 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.561-.955L10 0l2.95 5.955 6.561.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Yorumunuzu buraya yazın..."
        rows="4"
        className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
      ></textarea>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-orange-400"
      >
        {loading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
      </button>
    </form>
  );
};

export default ReviewForm;