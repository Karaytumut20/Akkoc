'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [user, setUser] = useState(null);

  // Login bilgileri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Ürün bilgileri
  const [files, setFiles] = useState([null, null, null, null, null, null]);
  const [previews, setPreviews] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  // Oturum kontrolü
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Dosya önizlemesi
  useEffect(() => {
    const urls = files.map(file => (file ? URL.createObjectURL(file) : null));
    setPreviews(urls);

    // Cleanup
    return () => urls.forEach(url => url && URL.revokeObjectURL(url));
  }, [files]);

  // Giriş yapma
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert('Giriş hatası: ' + error.message);
  };

  // Çıkış yapma
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Ürün ekleme
  const handleUpload = async () => {
    if (!files.some(f => f) || !name || !description || !price || !category) {
      return alert('Tüm alanları doldurun ve en az bir dosya seçin.');
    }

    try {
      const imageUrls = [];

      for (let file of files) {
        if (!file) continue;
        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false, contentType: file.type });

        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrlData.publicUrl);
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert([{ name, description, price: parseFloat(price), category, image_urls: imageUrls }]);

      if (insertError) throw new Error(insertError.message);

      alert('Ürün başarıyla eklendi!');
      setFiles([null, null, null, null, null, null]);
      setPreviews([]);
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '60px', border: '1px solid #ccc', borderRadius: '10px', padding: '30px', maxWidth: '400px', marginInline: 'auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Giriş Yap</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Giriş Yap</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '60px', border: '1px solid #ccc', borderRadius: '10px', padding: '30px', maxWidth: '600px', marginInline: 'auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Hoş geldin, {user.email}</h2>

      <input type="text" placeholder="Ürün Adı" value={name} onChange={e => setName(e.target.value)} style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px', width: '100%' }} />
      <textarea placeholder="Açıklama" value={description} onChange={e => setDescription(e.target.value)} style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px', width: '100%' }} />
      <input type="number" placeholder="Fiyat" value={price} onChange={e => setPrice(e.target.value)} style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px', width: '100%' }} />
      <input type="text" placeholder="Kategori" value={category} onChange={e => setCategory(e.target.value)} style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px', width: '100%' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%' }}>
        {files.map((file, idx) => (
          <label key={idx} style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '0', width: '100%', aspectRatio: '1 / 1', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
            {previews[idx] ? (
              <img src={previews[idx]} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#999' }}>Seç</span>
            )}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const newFiles = [...files];
              newFiles[idx] = e.target.files[0];
              setFiles(newFiles);
            }} />
          </label>
        ))}
      </div>

      <button onClick={handleUpload} style={{ padding: '10px', backgroundColor: 'green', color: 'white', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>Ürünü Kaydet</button>
      <button onClick={handleLogout} style={{ padding: '10px', backgroundColor: '#555', color: 'white', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>Çıkış Yap</button>
    </div>
  );
}
