"use client";

import { useEffect, useState, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import React from "react";
import { FiChevronLeft, FiChevronRight, FiHeart, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { getSafeImageUrl } from "@/lib/utils";
import StarRating from "@/components/StarRating";

const Product = () => {
  const { id } = useParams();
  const {
    router,
    addToCart,
    products: allProducts,
    user,
    wishlist,
    addToWishlist,
    removeFromWishlist,
  } = useAppContext();

  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [userReview, setUserReview] = useState(null);

  // 📥 Ürün ve yorumları çek
  const fetchProductDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Ürün bilgisi
      const { data: productInfo } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id)
        .single();

      let imageUrls = [];
      if (typeof productInfo.image_urls === "string") {
        try {
          imageUrls = JSON.parse(productInfo.image_urls);
        } catch {
          imageUrls = [];
        }
      } else if (Array.isArray(productInfo.image_urls)) {
        imageUrls = productInfo.image_urls;
      }
      setProductData({ ...productInfo, image_urls: imageUrls });

      // Yorumlar
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false });
      setReviews(reviewData || []);

      // Kullanıcı kendi yorumunu yazmış mı
      if (user) {
        const { data: userRev } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", id)
          .eq("user_id", user.id)
          .single();
        setUserReview(userRev || null);
      }

      // Ortalama puan
      const { data: avgRatingData } = await supabase.rpc(
        "get_average_rating",
        { p_product_id: id }
      );
      setAverageRating(avgRatingData || 0);
    } catch (err) {
      toast.error("Veri çekilirken bir sorun oluştu.");
    }
    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    fetchProductDetails();
  }, [id, fetchProductDetails]);

  // 📌 İlgili ürünleri filtrele
  useEffect(() => {
    if (productData && allProducts.length > 0) {
      setRelatedProducts(
        allProducts
          .filter(
            (p) => p.category_id === productData.category_id && p.id !== productData.id
          )
          .slice(0, 5)
      );
    }
  }, [productData, allProducts]);

  const isFavorited = wishlist.some((item) => item.product_id === productData?.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Favorilere eklemek için giriş yapın.");
      router.push("/auth");
      return;
    }
    if (isFavorited) removeFromWishlist(productData.id);
    else addToWishlist(productData.id);
  };

  const handleNextImage = () =>
    setCurrentImageIndex(
      (prev) => (prev + 1) % (productData.image_urls.length || 1)
    );
  const handlePrevImage = () =>
    setCurrentImageIndex(
      (prev) =>
        (prev - 1 + (productData.image_urls.length || 1)) %
        (productData.image_urls.length || 1)
    );

  const approvedReviews = reviews.filter((r) => r.is_approved == true);
  if (loading || !productData) return <Loading />;
  const mainImage =
    productData.image_urls[currentImageIndex] ||
    getSafeImageUrl(productData.image_urls, 0);

  // ⭐ Yıldızlara her tıklamada popup aç
  const handleStarClick = () => {
    setIsReviewModalOpen(true);
  };

  // 📌 Yorum gönderme
  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Yorum yapmak için giriş yapın.");
      router.push("/auth");
      return;
    }

    if (userReview) {
      toast.error("Bu ürün için zaten yorum yaptınız.");
      return;
    }

    if (userRating === 0) {
      toast.error("Lütfen bir yıldız puanı seçin.");
      return;
    }

    const { error } = await supabase.from("reviews").insert([
      {
        product_id: productData.id,
        user_id: user.id,
        rating: Number(userRating),
        comment: userComment,
        is_approved: false,
      },
    ]);

    if (error) {
      toast.error("Yorum gönderilemedi.");
      return;
    }

    toast.success("Yorum gönderildi!");
    setUserRating(0);
    setUserComment("");
    fetchProductDetails();
  };

  return (
    <>
      <div className="bg-white mt-0 sm:mt-4 md:mt-8 lg:mt-12 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
            {/* 🖼️ ÜRÜN GÖRSELİ */}
            <div className="w-full">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden group mb-4 bg-gray-50">
                <Image
                  src={mainImage}
                  alt={productData.name}
                  fill
                  className="object-cover object-center transition-all duration-300"
                  priority
                />
                <button
                  onClick={handleFavoriteClick}
                  className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:scale-110 transition"
                >
                  <FiHeart
                    className={`w-5 h-5 ${
                      isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>
                {productData.image_urls.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/60 p-2 rounded-full shadow-md"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/60 p-2 rounded-full shadow-md"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 🧾 ÜRÜN BİLGİLERİ */}
            <div className="w-full flex flex-col justify-center lg:h-full">
              <h1 className="text-3xl font-serif tracking-wide text-gray-900">
                {productData.name}
              </h1>
              <p className="text-2xl text-gray-700 mt-2">${productData.price}</p>

              {/* ⭐ Yıldızlar ve popup açma */}
              <div
                onClick={handleStarClick}
                className="inline-flex items-center gap-3 mt-4 cursor-pointer group"
              >
                {approvedReviews.length > 0 && (
                  <span className="font-bold text-lg text-gray-800">
                    {averageRating.toFixed(1)}
                  </span>
                )}
                <StarRating rating={averageRating} />
                <span className="text-gray-500 text-sm underline group-hover:text-gray-800 transition">
                  Yorumları Gör
                </span>
              </div>

              {/* 📝 Ürün Açıklaması + Detaylar (lüks görünüm) */}
              <div className="mt-10 space-y-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="border-b pb-4">
                  <h2 className="font-semibold text-xl text-gray-900 mb-2 tracking-wide">
                    Ürün Açıklaması
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {productData.description ||
                      "Bu ürün için bir açıklama mevcut değil."}
                  </p>
                </div>

                <div>
                  <h2 className="font-semibold text-xl text-gray-900 mb-2 tracking-wide">
                    Ürün Detayları
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-700">
                    <span className="px-3 py-1 bg-gray-100 rounded-full">
                      <strong>Kategori:</strong>{" "}
                      {productData.categories?.name || "Belirtilmemiş"}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">
                      <strong>Stok:</strong> {productData.stock} adet
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">
                      <strong>Ürün Kodu:</strong>{" "}
                      {productData.id.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🛒 Sepete Ekle */}
              <div className="mt-8">
                <button
                  onClick={() => addToCart(productData)}
                  className="w-full py-4 bg-teal-600 text-white hover:bg-teal-700 rounded-md font-semibold"
                >
                  Sepete Ekle
                </button>
              </div>
            </div>
          </div>

          {/* 🛍️ İLGİLİ ÜRÜNLER */}
          {relatedProducts.length > 0 && (
            <div className="py-16 border-t mt-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif text-gray-900">
                  İlgili Ürünler
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✨ POPUP — Yorumlar + Yorum Yazma */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            >
              <FiX className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Ürün Yorumları
            </h2>

            {/* 📜 Mevcut yorumlar */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
              {approvedReviews.length === 0 ? (
                <p className="text-gray-500 text-center">Henüz yorum yok.</p>
              ) : (
                approvedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b pb-3 last:border-none flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <StarRating rating={Number(review.rating)} />
                      <span className="text-sm text-gray-500">
                        {review.user_id === user?.id ? "Siz" : "Kullanıcı"}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm">{review.comment}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleString("tr-TR")}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* ✍️ Yorum yazma alanı (eğer daha önce yazmamışsa) */}
            {!userReview && user && (
              <>
                <div className="flex justify-center mb-3">
                  <StarRating rating={userRating} onRatingChange={setUserRating} />
                </div>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Yorumunuzu yazın..."
                  className="w-full h-20 border rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none resize-none mb-3"
                />
                <button
                  onClick={handleSubmitReview}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Gönder
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Product;
