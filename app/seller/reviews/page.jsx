// app/seller/reviews/page.jsx

'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import Loading from '@/components/Loading';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    
    // YENİ: RPC fonksiyonunu çağırıyoruz
    const { data, error } = await supabase.rpc('get_reviews_with_details');

    if (error) {
      toast.error('Yorumlar alınamadı: ' + error.message);
      setReviews([]);
    } else {
      // Gelen veriyi bileşenin beklediği formata dönüştürüyoruz
      const formattedData = data.map(review => ({
        ...review,
        product: { name: review.product_name },
        users: { email: review.user_email }
      }));
      setReviews(formattedData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', id);

    if (error) {
      toast.error('Yorum onaylanırken bir hata oluştu.');
    } else {
      toast.success('Yorum onaylandı!');
      fetchReviews();
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) {
        toast.error('Yorum silinirken bir hata oluştu.');
      } else {
        toast.success('Yorum silindi!');
        fetchReviews();
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-4">
        Ürün Yorumları
      </h1>

      {reviews.length === 0 ? (
        <p className="text-center text-xl text-gray-500 py-10">Henüz yorum bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg text-gray-800">{review.product.name}</p>
                  <p className="text-sm text-gray-500">{review.users ? review.users.email : 'Bilinmeyen Kullanıcı'}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.561-.955L10 0l2.95 5.955 6.561.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-2">{review.comment}</p>
                </div>
                <div className="flex items-center gap-3">
                  {review.is_approved ? (
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">Onaylı</span>
                  ) : (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
                    >
                      <FiCheck />
                      Onayla
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition"
                  >
                    <FiTrash2 />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;