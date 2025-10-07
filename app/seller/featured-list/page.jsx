'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

// BUCKET adı (kendi projenle aynı olmalı)
const BUCKET_NAME = 'product-images';

export default function FeaturedProductsTable() {
  const [products, setProducts] = useState([]);
  const [featuredList, setFeaturedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Ürünleri ve vitrin listesini çek
  useEffect(() => {
    fetchProducts();
    fetchFeaturedList();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, category, image_urls');
    if (error) console.error('Ürünler alınamadı:', error);
    else
      setProducts(
        (data || []).map((item) => ({
          ...item,
          image_urls: Array.isArray(item.image_urls)
            ? item.image_urls
            : JSON.parse(item.image_urls || '[]'),
        }))
      );
    setLoading(false);
  };

  const fetchFeaturedList = async () => {
    const { data, error } = await supabase.from('featured_list').select('*');
    if (error) console.error('Vitrin listesi alınamadı:', error);
    else setFeaturedList(data || []);
  };

  // Ürünün vitrin durumunu bul
  const getFeatureState = (productId, key) => {
    const record = featuredList.find((f) => f.product_id === productId);
    return record ? record[key] : false;
  };

  // Checkbox değiştiğinde çağrılır
  const handleCheckboxChange = async (productId, key, value) => {
    setSaving(true);

    // Kaydı bul
    const existing = featuredList.find((f) => f.product_id === productId);

    if (existing) {
      // Güncelleme
      const { data, error } = await supabase
        .from('featured_list')
        .update({ [key]: value })
        .eq('product_id', productId);

      if (error) console.error('Güncelleme hatası:', error);
      else
        setFeaturedList((prev) =>
          prev.map((item) =>
            item.product_id === productId ? { ...item, [key]: value } : item
          )
        );
    } else {
      // Yeni kayıt ekle
      const { data, error } = await supabase
        .from('featured_list')
        .insert([{ product_id: productId, [key]: value }]);

      if (error) console.error('Ekleme hatası:', error);
      else
        setFeaturedList((prev) => [
          ...prev,
          { product_id: productId, [key]: value },
        ]);
    }

    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        Ürünler yükleniyor...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-4">
        🏷️ Vitrin Ürünleri Yönetimi
      </h1>

      <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm font-semibold text-gray-600">
              <th className="px-4 py-3">Resim</th>
              <th className="px-4 py-3">Ürün Adı</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-right">Fiyat</th>
              <th className="px-4 py-3 text-center">BigCard</th>
              <th className="px-4 py-3 text-center">DoubleBigCard</th>
              <th className="px-4 py-3 text-center">DoubleBigCardText</th>
              <th className="px-4 py-3 text-center">Icons</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-indigo-50/50 transition duration-150"
              >
                <td className="px-4 py-3">
                  {product.image_urls?.length > 0 ? (
                    <Image
                      src={product.image_urls[0]}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover w-14 h-14 border border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg text-xs">
                      Yok
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {product.category}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                  {product.price} ₺
                </td>

                {/* Checkboxlar */}
                {['bigcard', 'doublebigcard', 'doublebigcardtext', 'icons'].map(
                  (key) => (
                    <td key={key} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={getFeatureState(product.id, key)}
                        onChange={(e) =>
                          handleCheckboxChange(product.id, key, e.target.checked)
                        }
                        className="w-5 h-5 accent-indigo-600 cursor-pointer"
                        disabled={saving}
                      />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {saving && (
        <div className="fixed bottom-5 right-5 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md">
          Kaydediliyor...
        </div>
      )}
    </div>
  );
}
