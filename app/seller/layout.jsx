'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import SellerNavbar from '@/components/seller/Navbar';
import SellerSidebar from '@/components/seller/Sidebar';
import { useRouter } from 'next/navigation';

// Yetkisiz Erişim Ekranı
function UnauthorizedAccess() {
    const { user, signOut, router } = useAppContext();
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Erişim Reddedildi
                </h2>
                {user ? (
                    <p className="text-gray-600 mb-6">
                        Bu alan sadece satıcılara özeldir. Lütfen satıcı hesabınızla giriş yapın.
                    </p>
                ) : (
                    <p className="text-gray-600 mb-6">
                        Bu alanı görmek için lütfen satıcı olarak giriş yapın.
                    </p>
                )}
                <button
                    onClick={() => user ? signOut() : router.push('/seller')}
                    className="w-full py-2 px-4 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
                >
                    {user ? 'Çıkış Yap ve Yeniden Giriş Yap' : 'Giriş Sayfasına Git'}
                </button>
            </div>
        </div>
    );
}

// Ana SellerLayout Bileşeni
const SellerLayout = ({ children }) => {
    const { user, isSeller, authLoading } = useAppContext();
    const router = useRouter();

    // Oturum kontrolü yapılırken bekleme ekranı
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700 text-lg">
                Oturum kontrol ediliyor...
            </div>
        );
    }

    // Oturum kontrolü bitti, kullanıcı bir satıcı ise paneli göster
    if (user && isSeller) {
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

    // Kullanıcı giriş yapmamışsa veya satıcı değilse, yetkisiz erişim ekranını göster.
    // Bu ekran kullanıcıyı doğru sayfaya yönlendirecektir.
    return <UnauthorizedAccess />;
};

export default SellerLayout;
