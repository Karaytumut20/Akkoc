'use client';

import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import SellerNavbar from '@/components/seller/Navbar';
import SellerSidebar from '@/components/seller/Sidebar';
import { useRouter, usePathname } from 'next/navigation';
import Loading from '@/components/Loading'; 

// Ana SellerLayout Bileşeni
const SellerLayout = ({ children }) => {
    const { user, authLoading } = useAppContext(); // isSeller kaldırıldı
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Kimlik doğrulama durumu çözümlenene kadar bekle.
        if (authLoading) {
            return;
        }

        const isLoginPage = pathname === '/seller';

        // Giriş yapmış bir kullanıcı, /seller sayfasındaysa panele yönlendirilir.
        if (isLoginPage && user) {
            router.replace('/seller/product-list');
        } 
        // Korumalı bir sayfada giriş yapmamış bir kullanıcı varsa, ana giriş sayfasına yönlendir.
        else if (!isLoginPage && !user) {
            router.replace('/auth');
        }
    }, [authLoading, user, pathname, router]);

    // Kimlik doğrulama durumu kontrol edilirken her zaman yükleme ekranı göster.
    if (authLoading) {
        return <Loading />;
    }

    const isLoginPage = pathname === '/seller';

    // Korumalı bir sayfada olan ve giriş yapmış herhangi bir kullanıcı için panel arayüzünü göster.
    if (!isLoginPage && user) {
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
    
    // Giriş sayfasındaysa (ve kullanıcı giriş yapmamışsa), sayfanın kendi içeriğini göster.
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Diğer tüm durumlarda (örn. yönlendirme gerçekleşene kadar) yükleme ekranı göster.
    return <Loading />;
};

export default SellerLayout;
