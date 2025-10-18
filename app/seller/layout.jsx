'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import SellerSidebar from '@/components/seller/Sidebar';
import { useRouter, usePathname } from 'next/navigation';
import Loading from '@/components/Loading';
import { supabase } from '@/lib/supabaseClient';

const SellerLayout = ({ children }) => {
  const { user, authLoading } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      // Kullanıcı yoksa direkt auth sayfasına
      if (!user) {
        setLoadingRole(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles') // 👈 rolün tutulduğu tablo
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Rol alınamadı:', error);
      }

      setRole(data?.role || null);
      setLoadingRole(false);
    };

    if (!authLoading) {
      fetchUserRole();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading || loadingRole) return;

    const isLoginPage = pathname === '/seller';

    // Kullanıcı yoksa auth sayfasına yönlendir
    if (!user) {
      router.replace('/auth');
      return;
    }

    // Kullanıcı var ama rolü seller değilse → logout + anasayfa
    if (role !== 'seller') {
      (async () => {
        await supabase.auth.signOut();
        router.replace('/');
      })();
      return;
    }

    // Seller kullanıcı login sayfasındaysa → panel
    if (isLoginPage && role === 'seller') {
      router.replace('/seller/product-list');
    }
  }, [authLoading, loadingRole, user, role, pathname, router]);

  // Loading ekranı
  if (authLoading || loadingRole) {
    return <Loading />;
  }

  const isLoginPage = pathname === '/seller';

  // Seller kullanıcı paneli
  if (!isLoginPage && user && role === 'seller') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex w-full">
          <SellerSidebar />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    );
  }

  // Login sayfası
  if (isLoginPage) {
    return <>{children}</>;
  }

  return <Loading />;
};

export default SellerLayout;
