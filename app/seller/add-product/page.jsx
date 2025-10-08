'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const BUCKET_NAME = 'product-images';

const LIMITS = {
  bigcard: 1,
  doublebigcard: 2,
  doublebigcardtext: 2,
  icons: 6,
  brandicon: 4,
};

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    bigcard: false,
    doublebigcard: false,
    doublebigcardtext: false,
    icons: false,
    brandicon: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('id, name');
      if (categoriesError) toast.error('Kategoriler alınamadı.');
      else setCategories(categoriesData);

      const { data: productsData, error: productsError } = await supabase.from('products').select('id, bigcard, doublebigcard, doublebigcardtext, icons, brandicon');
      if (productsError) toast.error('Mevcut ürünler kontrol edilemedi.');
      else setProducts(productsData);
    };
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFilesToUpload(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveNewImage = (filePreviewUrl) => {
    setFilesToUpload(prev => prev.filter(f => f.preview !== filePreviewUrl));
    URL.revokeObjectURL(filePreviewUrl);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const limit = LIMITS[name];
      if (limit !== undefined && checked) {
        const count = products.filter(p => p[name]).length;
        if (count >= limit) {
          toast.error(`Maksimum ${limit} adet "${name}" ürünü seçebilirsiniz!`);
          return;
        }
      }
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const uploadFiles = async () => {
    if (filesToUpload.length === 0) return [];
    const newImageUrls = [];
    for (const fileObj of filesToUpload) {
      const file = fileObj.file;
      const safeName = formData.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      const filePath = `${safeName}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
      if (error) {
        toast.error(`Dosya yüklenemedi: ${file.name}`);
        continue;
      }
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
      newImageUrls.push(publicUrlData.publicUrl);
    }
    filesToUpload.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
    return newImageUrls;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.price) {
      return toast.error('Lütfen isim, kategori ve fiyat alanlarını doldurun.');
    }

    setActionLoading(true);
    const toastId = toast.loading('Ürün ekleniyor...');
    
    const uploadedUrls = await uploadFiles();
    
    const { error } = await supabase
      .from('products')
      .insert([{
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        price: parseFloat(formData.price),
        image_urls: uploadedUrls,
        bigcard: formData.bigcard,
        doublebigcard: formData.doublebigcard,
        doublebigcardtext: formData.doublebigcardtext,
        icons: formData.icons,
        brandicon: formData.brandicon,
      }]);

    if (!error) {
      toast.success('Ürün başarıyla eklendi!', { id: toastId });
      router.push('/seller/product-list');
    } else {
      toast.error('Ekleme hatası: ' + error.message, { id: toastId });
    }
    setActionLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-4">
            Yeni Ürün Ekle
        </h1>
        <form onSubmit={handleAddProduct} className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6">
            <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Ürün Adı" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition" />
            <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Açıklama" rows="4" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition" />
            <select name="category_id" value={formData.category_id} onChange={handleFormChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 appearance-none bg-white focus:ring-indigo-500 focus:border-indigo-500 transition">
                <option value="" disabled>Kategori Seç</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <input type="number" name="price" value={formData.price} onChange={handleFormChange} placeholder="Fiyat" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 transition" />
            
            <div className="border border-indigo-200/50 bg-indigo-50/50 rounded-xl p-4 shadow-inner">
                <h3 className="font-bold text-lg text-indigo-700 mb-4">Görsel Yükle</h3>
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-100/50 transition">
                    <FiUploadCloud className="w-8 h-8 text-indigo-500" />
                    <p className="text-sm text-indigo-600">Sürükle bırak veya tıkla</p>
                </label>
                <input id="file-upload" type="file" name="files" onChange={handleFileChange} multiple accept="image/*" className="hidden" />
                {filesToUpload.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-3 text-gray-600">Yüklenecekler ({filesToUpload.length} adet)</h4>
                        <div className="flex flex-wrap gap-3">
                            {filesToUpload.map((fileObj, index) => (
                                <div key={`new-${index}`} className="relative w-20 h-20 border-2 border-green-500 rounded-lg overflow-hidden shadow-md group">
                                    <Image src={fileObj.preview} alt={fileObj.file.name} fill style={{objectFit:"cover"}} />
                                    <button type="button" onClick={() => handleRemoveNewImage(fileObj.preview)} className="absolute inset-0 bg-red-600 bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FiX className="text-white w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="border border-indigo-200/50 bg-indigo-50/50 rounded-xl p-4 shadow-inner">
                <h3 className="font-bold text-lg text-indigo-700 mb-4">Vitrin Ayarları</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(LIMITS).map(([key, value]) => (
                     <label key={key} className="flex items-center gap-2">
                        <input type="checkbox" name={key} checked={formData[key]} onChange={handleFormChange} className="h-4 w-4 rounded" /> 
                        {key} (Max: {value})
                     </label>
                  ))}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button type="submit" disabled={actionLoading} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50">
                    {actionLoading ? 'Ekleniyor...' : 'Ürünü Ekle'}
                </button>
            </div>
        </form>
    </div>
  );
}
