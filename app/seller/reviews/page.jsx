// app/seller/reviews/page.jsx

'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { FiCheck, FiTrash2, FiExternalLink, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import Loading from '@/components/Loading';
import Link from 'next/link';

const ReviewsPage = () => {
  const [reviewsWithUsers, setReviewsWithUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviewsAndUsers = useCallback(async () => {
    setLoading(true);

    // 1. ADIM: Tüm yorumları çek.
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('*, product:products(id, name)')
      .order('created_at', { ascending: false });

    if (reviewsError) {
      toast.error('Yorumlar alınamadı: ' + reviewsError.message);
      setLoading(false);
      return;
    }

    if (!reviewsData || reviewsData.length === 0) {
      setReviewsWithUsers([]);
      setLoading(false);
      return;
    }

    // 2. ADIM: Yorumlardaki tüm benzersiz kullanıcı ID'lerini topla.
    const userIds = [...new Set(reviewsData.map(review => review.user_id).filter(id => id))];

    if (userIds.length === 0) {
        setReviewsWithUsers(reviewsData.map(review => ({ ...review, user_profile: null })));
        setLoading(false);
        return;
    }

    // =================================================================================
    // 3. ADIM (GÜNCELLENDİ): 'auth.users' tablosuna erişmek için oluşturduğumuz
    // 'get_users_by_ids' RPC fonksiyonunu çağırıyoruz.
    // =================================================================================
    const { data: usersData, error: usersError } = await supabase
      .rpc('get_users_by_ids', { user_ids: userIds });

    if (usersError) {
      toast.error("Kullanıcı bilgileri RPC ile çekilemedi: " + usersError.message);
      setReviewsWithUsers(reviewsData.map(review => ({ ...review, user_profile: null })));
      setLoading(false);
      return;
    }

    // 4. ADIM: Yorumlar ve kullanıcıları kod içinde birleştir.
    const combinedData = reviewsData.map(review => {
      const userProfile = usersData.find(user => user.id === review.user_id) || null;
      return {
        ...review,
        user_profile: userProfile
      };
    });

    setReviewsWithUsers(combinedData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviewsAndUsers();
  }, [fetchReviewsAndUsers]);

  const handleApprove = async (e, id) => {
    e.stopPropagation();
    const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    if (error) toast.error('Yorum onaylanırken bir hata oluştu.');
    else {
      toast.success('Yorum onaylandı!');
      fetchReviewsAndUsers();
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) toast.error('Yorum silinirken bir hata oluştu.');
      else {
        toast.success('Yorum silindi!');
        fetchReviewsAndUsers();
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-4">
        Ürün Yorumları Yönetimi
      </h1>

      {reviewsWithUsers.length === 0 ? (
        <p className="text-center text-xl text-gray-500 py-10">Henüz yorum bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {reviewsWithUsers.map((review) => (
            <div key={review.id} className="block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 transition-all duration-200 group">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="flex-1">
                  <Link href={`/product/${review.product?.id}`} className="inline-block">
                    <p className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                      {review.product ? review.product.name : 'Silinmiş Ürün'}
                      <FiExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100"/>
                    </p>
                  </Link>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.561-.955L10 0l2.95 5.955 6.561.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-2">{review.comment}</p>
                  
                  {/* Veri artık 'review.user_profile' objesinden geliyor */}
                  <div className="mt-4 border-t pt-3 text-xs text-gray-500 space-y-1">
                    <p className="flex items-center gap-2">
                      <FiUser className="w-4 h-4 text-gray-400"/>
                      <strong>Kullanıcı:</strong> {review.user_profile?.raw_user_meta_data?.display_name || 'İsim Belirtilmemiş'}
                    </p>
                    <p className="flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-gray-400"/>
                      <strong>E-posta:</strong> {review.user_profile?.email || 'E-posta Yok'}
                    </p>
                    <p className="flex items-center gap-2">
                      <FiPhone className="w-4 h-4 text-gray-400"/>
                      <strong>Telefon:</strong> {review.user_profile?.raw_user_meta_data?.phone || 'Telefon Yok'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-4 sm:mt-0 flex-shrink-0">
                  {review.is_approved ? (
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">Onaylı</span>
                  ) : (
                    <button onClick={(e) => handleApprove(e, review.id)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition z-10">
                      <FiCheck /> Onayla
                    </button>
                  )}
                  <button onClick={(e) => handleDelete(e, review.id)} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition z-10">
                    <FiTrash2 /> Sil
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