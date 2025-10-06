'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/seller/Navbar';
import Sidebar from '@/components/seller/Sidebar';
import { supabase } from '@/lib/supabaseClient';

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user ?? null);
      } catch (err) {
        console.error('getUser error', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // cleanup
    return () => {
      try {
        listener?.subscription?.unsubscribe?.();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert('Giriş hatası: ' + error.message);
      }
    } catch (err) {
      alert('Giriş hatası: ' + (err.message || err));
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
        Yükleniyor...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          marginTop: '60px',
          padding: '30px',
          maxWidth: '400px',
          marginInline: 'auto',
          borderRadius: '10px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Satıcı Paneline Giriş Yap</h2>
        <form
          onSubmit={handleLogin}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%',
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
            }}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  // logged in
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>

      <div className="flex justify-center p-4">
        <button
          onClick={handleLogout}
          className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default Layout;
