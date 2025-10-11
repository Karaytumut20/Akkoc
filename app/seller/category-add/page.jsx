'use client'
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import FloatingLabelInput from '@/components/ui/FloatingLabelInput';
import toast from 'react-hot-toast';

const CategoryAdd = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) toast.error('Kategoriler alınamadı: ' + error.message);
    else setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return toast.error('Kategori adı boş olamaz!');
    setLoading(true);
    const { error } = await supabase.from('categories').insert([{ name: categoryName }]);
    setLoading(false);
    if (error) return toast.error('Hata: ' + error.message);
    toast.success('Kategori başarıyla eklendi!');
    setCategoryName('');
    fetchCategories();
  };

  const handleUpdateCategory = async (id) => {
    if (!editName.trim()) return toast.error('Kategori adı boş olamaz!');
    setLoading(true);
    
    // GÜNCELLEME: .select() metodu eklendi ve sonuç kontrolü yapıldı.
    const { data, error } = await supabase
      .from('categories')
      .update({ name: editName })
      .eq('id', id)
      .select(); // Bu satır, güncelleme sonrası veriyi geri döndürmeyi sağlar.

    setLoading(false);

    if (error) {
      // Gerçek bir veritabanı veya ağ hatası varsa göster.
      toast.error('Hata: ' + error.message);
      return;
    }

    // Eğer data varsa ve içinde en az bir eleman varsa güncelleme başarılıdır.
    if (data && data.length > 0) {
      toast.success('Kategori güncellendi!');
      setEditId(null);
      setEditName('');
      fetchCategories(); // Listeyi yenilemek için en güvenli yol.
    } else {
      // data boş veya null ise, işlem veritabanı seviyesinde gerçekleşmemiştir.
      // Bu genellikle RLS (Row Level Security) yetki sorunlarından kaynaklanır.
      toast.error('Güncelleme başarısız oldu. Veritabanı yetkilerinizi kontrol edin.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğine emin misin?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return toast.error('Hata: ' + error.message);
    toast.success('Kategori silindi!');
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg mb-8 transition hover-shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Yeni Kategori Ekle</h2>
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-[150px]">
            <FloatingLabelInput
              id="categoryName"
              name="categoryName"
              label="Kategori Adı"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddCategory}
            disabled={loading}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition shadow-md"
          >
            {loading ? '...' : 'Ekle'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition flex flex-col justify-between"
          >
            {editId === cat.id ? (
              <div className="mb-4">
                <FloatingLabelInput
                  id={`edit-${cat.id}`}
                  name="editName"
                  label="Yeni Kategori Adı"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
            ) : (
              <h3 className="text-lg font-medium mb-2 text-gray-800 truncate">{cat.name}</h3>
            )}
            <p className="text-sm text-gray-500 mb-4">
              Oluşturulma: {new Date(cat.created_at).toLocaleDateString()}
            </p>
            <div className="flex gap-2 flex-wrap">
              {editId === cat.id ? (
                <>
                  <button onClick={() => handleUpdateCategory(cat.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition">Kaydet</button>
                  <button onClick={() => { setEditId(null); setEditName(''); }} className="bg-gray-400 text-white px-3 py-1 rounded-lg hover:bg-gray-500 transition">İptal</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">Düzenle</button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition">Sil</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryAdd;

