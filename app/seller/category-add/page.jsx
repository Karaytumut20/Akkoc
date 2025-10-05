'use client'
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CategoryAdd = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) return alert('Hata: ' + error.message);
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return alert('Kategori adı boş olamaz!');
    setLoading(true);
    const { error } = await supabase.from('categories').insert([{ name: categoryName }]);
    setLoading(false);
    if (error) return alert('Hata: ' + error.message);
    setCategoryName('');
    fetchCategories();
  };

  const handleUpdateCategory = async (id) => {
    if (!editName.trim()) return alert('Kategori adı boş olamaz!');
    setLoading(true);
    const { error } = await supabase.from('categories').update({ name: editName }).eq('id', id);
    setLoading(false);
    if (error) return alert('Hata: ' + error.message);
    setEditId(null);
    setEditName('');
    fetchCategories();
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğine emin misin?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return alert('Hata: ' + error.message);
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center sm:ml-0 md:ml-64 transition-all duration-300">
      {/* Kategori Ekleme Kartı */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg mb-8 transition hover:shadow-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Add New Category</h2>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Kategori adı"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="flex-1 min-w-[150px] border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
          <button
            onClick={handleAddCategory}
            disabled={loading}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition shadow-md"
          >
            {loading ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </div>
      </div>

      {/* Kategoriler Listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition flex flex-col justify-between"
          >
            {editId === cat.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
              />
            ) : (
              <h3 className="text-lg font-medium mb-2 text-gray-800 truncate">{cat.name}</h3>
            )}
            <p className="text-sm text-gray-500 mb-4">
              Created: {new Date(cat.created_at).toLocaleDateString()}
            </p>
            <div className="flex gap-2 flex-wrap">
              {editId === cat.id ? (
                <>
                  <button
                    onClick={() => handleUpdateCategory(cat.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => { setEditId(null); setEditName(''); }}
                    className="bg-gray-400 text-white px-3 py-1 rounded-lg hover:bg-gray-500 transition"
                  >
                    İptal
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                  >
                    Sil
                  </button>
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
