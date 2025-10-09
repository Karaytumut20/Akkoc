'use client';

import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import SellerNavbar from '@/components/seller/Navbar';
import SellerSidebar from '@/components/seller/Sidebar';
import { useRouter, usePathname } from 'next/navigation';
import Loading from '@/components/Loading'; 

// Ana SellerLayout Bileşeni
const SellerLayout = ({ children }) => {
    const { user, isSeller, authLoading } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Kimlik doğrulama durumu çözümlenene kadar yönlendirme yapma.
        if (authLoading) {
            return;
        }

        const isLoginPage = pathname === '/seller';

        // Yönlendirme Mantığı
        if (isLoginPage && user && isSeller) {
            // Giriş yapmış bir satıcı, giriş sayfasındaysa panele yönlendirilir.
            router.replace('/seller/product-list');
        } else if (!isLoginPage && (!user || !isSeller)) {
            // Korumalı bir sayfada yetkisiz bir kullanıcı varsa:
            // Giriş yapmamışsa -> /seller'a yönlendir.
            // Giriş yapmış ama satıcı değilse -> ana sayfaya (/) yönlendir.
            if (!user) {
                router.replace('/seller');
            } else if (!isSeller) {
                router.replace('/');
            }
        }
    }, [authLoading, user, isSeller, pathname, router]);

    // Kimlik doğrulama durumu kontrol edilirken her zaman yükleme ekranı göster.
    if (authLoading) {
        return <Loading />;
    }

    const isLoginPage = pathname === '/seller';

    // Korumalı bir sayfada olan yetkili bir satıcı için panel arayüzünü göster.
    if (!isLoginPage && isSeller) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <SellerNavbar />
                <div className="flex w-full">
                    <SellerSidebar />
                    <main className="flex-1 p-4 sm:p-6">{children}</main>
                </div>
            </div>
        );
    }
    
    // Giriş sayfasındaysa, sayfanın kendi içeriğini göster.
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Diğer tüm durumlarda (örn. yönlendirme gerçekleşene kadar)
    // yanlış içeriğin anlık görünmesini engellemek için yükleme ekranı göster.
    return <Loading />;
};

export default SellerLayout;

