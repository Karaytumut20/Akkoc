'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { FiTrash2, FiX, FiMenu } from 'react-icons/fi'; // Menü ve Kapat ikonları eklendi

// Varsayılan Supabase Storage Bucket adı (kendi projenize göre değiştirin)
const BUCKET_NAME = 'product-images'; 

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Yeni: Mobil menü state'i (Sidebar için kullanılıyor varsayımıyla)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  const [editingProduct, setEditingProduct] = useState(null);
  const [filesToUpload, setFilesToUpload] = useState([]); 
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image_urls: [], 
  });

  // --- Veri Çekme Fonksiyonları (Aynı Kaldı) ---
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => { /* ... (fonksiyon içeriği aynı) ... */
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, category, image_urls');

    if (error) {
      console.error('Ürünler alınamadı:', error.message);
      setProducts([]);
    } else {
      setProducts((data || []).map(item => ({
        ...item,
        image_urls: item.image_urls
          ? Array.isArray(item.image_urls)
            ? item.image_urls
            : JSON.parse(item.image_urls)
          : []
      })));
    }
    setLoading(false);
  };

  const fetchCategories = async () => { /* ... (fonksiyon içeriği aynı) ... */
    const { data, error } = await supabase
      .from('categories')
      .select('name');

    if (!error && data) {
      setCategories(data.map(item => item.name));
    } else {
      console.error('Kategoriler alınamadı:', error?.message);
    }
  };
  
  // --- Görsel ve CRUD Fonksiyonları (Aynı Kaldı) ---

  const getValidImage = (imageArray) => { /* ... (fonksiyon içeriği aynı) ... */
    if (!imageArray || imageArray.length === 0) return null;
    const url = imageArray[0]?.trim();
    try { new URL(url); return url; }
    catch { return null; }
  };
  
  const handleFileChange = (e) => { /* ... (fonksiyon içeriği aynı) ... */
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file), 
      }));
      setFilesToUpload(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveNewImage = (filePreviewUrl) => { /* ... (fonksiyon içeriği aynı) ... */
      setFilesToUpload(prev => prev.filter(f => f.preview !== filePreviewUrl));
      URL.revokeObjectURL(filePreviewUrl); 
  };

  const uploadFiles = async () => { /* ... (fonksiyon içeriği aynı) ... */
    if (filesToUpload.length === 0) return [];

    const newImageUrls = [];
    
    for (const fileObj of filesToUpload) {
      const file = fileObj.file;
      const filePath = `${formData.name.replace(/\s/g, '_')}/${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (error) {
        console.error('Dosya yükleme hatası:', error);
        alert(`Dosya yüklenemedi: ${file.name}`);
        continue;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      if (publicUrlData) {
        newImageUrls.push(publicUrlData.publicUrl);
      }
    }
    
    filesToUpload.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
    setFilesToUpload([]); 
    
    return newImageUrls;
  };
  
  const handleRemoveImage = (urlToRemove) => { /* ... (fonksiyon içeriği aynı) ... */
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter(url => url !== urlToRemove),
    }));
  };
  
  const handleDelete = async (id) => { /* ... (fonksiyon içeriği aynı) ... */
    if (!confirm('Bu ürünü silmek istediğine emin misin?')) return;
    setActionLoading(true);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
    setActionLoading(false);
  };

  const handleEditClick = (product) => { /* ... (fonksiyon içeriği aynı) ... */
    setEditingProduct(product.id);
    setFilesToUpload([]); 
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      image_urls: product.image_urls || [],
    });
  };

  const handleFormChange = (e) => { /* ... (fonksiyon içeriği aynı) ... */
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => { /* ... (fonksiyon içeriği aynı) ... */
    if (!formData.name || !formData.category || !formData.price) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setActionLoading(true);
    
    const uploadedUrls = await uploadFiles();
    const finalImageUrls = [...formData.image_urls, ...uploadedUrls];
    
    const { error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price), 
        image_urls: JSON.stringify(finalImageUrls), 
      })
      .eq('id', editingProduct);

    if (!error) {
      setEditingProduct(null);
      fetchProducts();
    } else {
      alert('Güncelleme hatası: ' + error.message);
    }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg text-gray-700">Ürünler yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      


      {/* ⚠️ [DİKKAT] Gerçek bir Sidebar burada olmalıdır. Aşağıdaki sadece menü açma/kapama mantığını gösterir. */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-white shadow-xl p-6 lg:hidden transition-transform duration-300">
            <p className="text-gray-600">-- Sidebar İçeriği Buraya Gelir --</p>
            <div className="mt-4 space-y-2">
                <a href="#" className="block px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">Ürünler</a>
                <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Ayarlar</a>
            </div>
        </div>
      )}
      
      {/* Ana İçerik Alanı */}
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-4">
            Ürünler Yönetim Paneli
        </h1>

        {products.length === 0 ? (
          <p className="text-center text-xl text-gray-500 py-10">Henüz ürün bulunmuyor.</p>
        ) : (
          /* 🛠️ [GÜNCELLENDİ] Responsive ve Lüks Tablo Yapısı */
          <div className="overflow-x-auto shadow-2xl rounded-xl border border-gray-100/70 bg-white">
            <table className="min-w-full divide-y divide-gray-200/60">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <th className="px-4 py-3 sm:px-6">Resim</th>
                  <th className="px-4 py-3 sm:px-6 w-1/4">İsim</th>
                  <th className="px-4 py-3 sm:px-6 hidden md:table-cell">Açıklama</th>
                  <th className="px-4 py-3 sm:px-6 hidden sm:table-cell">Kategori</th>
                  <th className="px-4 py-3 sm:px-6 text-right">Fiyat</th>
                  <th className="px-4 py-3 sm:px-6 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-indigo-50/20 transition duration-150">
                    <td className="px-4 py-3 sm:px-6">
                      {getValidImage(product.image_urls) ? (
                        <Image 
                            src={getValidImage(product.image_urls)} 
                            alt={product.name} 
                            width={56} 
                            height={56} 
                            className="rounded-lg object-cover w-14 h-14 border border-gray-200" 
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg text-xs">Yok</div>
                      )}
                    </td>
                    <td className="px-4 py-3 sm:px-6 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 sm:px-6 hidden md:table-cell text-sm text-gray-600 truncate max-w-xs">{product.description}</td>
                    <td className="px-4 py-3 sm:px-6 hidden sm:table-cell">
                        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 text-right text-lg font-bold text-indigo-600">{product.price} ₺</td>
                    <td className="px-4 py-3 sm:px-6 text-center space-y-1 sm:space-x-2 sm:space-y-0 flex flex-col sm:flex-row justify-center items-center">
                      <button 
                        onClick={() => handleEditClick(product)} 
                        className="w-full sm:w-auto px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition shadow-md"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)} 
                        disabled={actionLoading} 
                        className="w-full sm:w-auto px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition shadow-md disabled:opacity-50"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 🛠️ [GÜNCELLENDİ] Güncelleme Modal - Tamamen Responsive */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-0 sm:p-4">
            {/* Modal içeriği mobil cihazlarda tam ekran, masaüstünde ortalanmış olacak */}
            <div className="bg-white rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-2xl overflow-y-auto transform transition-all duration-300 shadow-3xl">
              <div className="p-4 sm:p-8">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Ürünü Güncelle</h2>
                    <button onClick={() => { setEditingProduct(null); setFilesToUpload([]); }} className="text-gray-500 hover:text-gray-800 transition">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-5">
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Ürün Adı" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                  <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Açıklama" rows="3" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition" />

                  <select name="category" value={formData.category} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 appearance-none bg-white focus:ring-indigo-500 focus:border-indigo-500 transition">
                    <option value="" disabled>Kategori Seç</option>
                    {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                  </select>

                  <input type="number" name="price" value={formData.price} onChange={handleFormChange} placeholder="Fiyat" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                  
                  {/* Görsel Yönetimi Bölümü */}
                  <div className="border border-indigo-200/50 bg-indigo-50/50 rounded-xl p-4 shadow-inner">
                    <h3 className="font-bold text-lg text-indigo-700 mb-4">Görsel Yönetimi</h3>
                    
                    {/* Mevcut Görseller */}
                    <div className="mb-6 pb-4 border-b border-indigo-100">
                      <h4 className="text-sm font-semibold mb-3 text-gray-600">Mevcut Görseller ({formData.image_urls.length} adet)</h4>
                      <div className="flex flex-wrap gap-3">
                        {formData.image_urls.map((url, index) => (
                          <div key={`existing-${index}`} className="relative w-20 h-20 border-2 border-white rounded-lg overflow-hidden shadow-md group">
                            <Image src={url} alt={`Görsel ${index + 1}`} layout="fill" objectFit="cover" />
                            <button 
                              onClick={() => handleRemoveImage(url)} 
                              className="absolute inset-0 bg-red-600 bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiTrash2 className="text-white w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        {formData.image_urls.length === 0 && (
                            <p className="text-sm text-gray-500 italic">Mevcut görsel yok. Yeni görsel yükleyin.</p>
                        )}
                      </div>
                    </div>

                    {/* Yeni Görsel Yükleme */}
                    <div>
                      <label htmlFor="file-upload" className="block text-sm font-semibold text-indigo-700 mb-2 cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition shadow-lg">
                          Görsel Yükle (Dosya Seç)
                        </span>
                      </label>
                      <input 
                        id="file-upload"
                        type="file" 
                        name="files" 
                        onChange={handleFileChange} 
                        multiple 
                        accept="image/*"
                        className="hidden"
                      />

                      {/* Yüklenecek Dosyaların Canlı Önizlemesi */}
                      {filesToUpload.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-3 text-gray-600">Yüklenecek Yeni Görseller ({filesToUpload.length} adet)</h4>
                            <div className="flex flex-wrap gap-3">
                                {filesToUpload.map((fileObj, index) => (
                                    <div key={`new-${index}`} className="relative w-20 h-20 border-2 border-green-500 rounded-lg overflow-hidden shadow-md group">
                                        <Image src={fileObj.preview} alt={fileObj.file.name} layout="fill" objectFit="cover" />
                                        <button 
                                            onClick={() => handleRemoveNewImage(fileObj.preview)} 
                                            className="absolute inset-0 bg-red-600 bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiTrash2 className="text-white w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
                
                {/* Kaydet/İptal Butonları */}
                <div className="flex justify-end mt-6 space-x-3 border-t pt-4">
                  <button onClick={() => { setEditingProduct(null); setFilesToUpload([]); }} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition">İptal</button>
                  <button onClick={handleUpdate} disabled={actionLoading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition shadow-lg disabled:opacity-50">
                    {actionLoading ? 'Güncelleniyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}