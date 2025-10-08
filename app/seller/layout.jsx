'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import SellerNavbar from '@/components/seller/Navbar';
import SellerSidebar from '@/components/seller/Sidebar';

// --- Bileşen 1: Satıcı Giriş Formu ---
// Kullanıcı giriş yapmamışsa bu gösterilir.
function SellerLogin() {
    const { signIn } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await signIn(email, password);
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">
                    Satıcı Paneli Girişi
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">E-posta Adresi</label>
                        <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Şifre</label>
                        <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-2 px-4 text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none disabled:bg-orange-300">
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- Bileşen 2: Yetkisiz Erişim Ekranı ---
// Kullanıcı giriş yapmış ama satıcı değilse bu gösterilir.
function UnauthorizedAccess() {
    const { user, signOut } = useAppContext();
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Erişim Reddedildi
                </h2>
                <p className="text-gray-600 mb-6">
                    Şu anda <span className="font-semibold">{user.email}</span> hesabı ile giriş yapmış durumdasınız. Bu alan sadece satıcılara özeldir.
                </p>
                <button
                    onClick={signOut}
                    className="w-full py-2 px-4 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Çıkış Yap ve Satıcı Olarak Giriş Yap
                </button>
            </div>
        </div>
    );
}

// --- Ana SellerLayout Bileşeni (Tüm Mantığı Yöneten Kısım) ---
const SellerLayout = ({ children }) => {
    const { user, isSeller, authLoading } = useAppContext();

    // Oturum kontrolü yapılırken bekleme ekranı
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700 text-lg">
                Oturum kontrol ediliyor...
            </div>
        );
    }

    // Oturum kontrolü bitti, şimdi duruma göre render yap
    if (user) { // Eğer bir kullanıcı giriş yapmışsa...
        if (isSeller) { // ...ve bu kullanıcı bir satıcı ise:
            // Satıcı Panelini göster
            return (
                <div className="min-h-screen flex flex-col bg-gray-50">
                    <SellerNavbar />
                    <div className="flex w-full">
                        <SellerSidebar />
                        <main className="flex-1 p-4 sm:p-6">{children}</main>
                    </div>
                </div>
            );
        } else { // ...ama bu kullanıcı bir satıcı DEĞİLSE:
            // Yetkisiz Erişim ekranını göster
            return <UnauthorizedAccess />;
        }
    } else { // Eğer hiç kimse giriş yapmamışsa:
        // Satıcı Giriş formunu göster
        return <SellerLogin />;
    }
};

export default SellerLayout;