'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient'; // Hata düzeltmesi için eklendi

export default function SellerLoginPage() {
    // signOut fonksiyonu useAppContext'ten çıkarıldı, çünkü burada özel bir kullanım gerekiyor.
    const { signIn, user, isSeller, authLoading } = useAppContext();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Oturum kontrolü ve yönlendirme
    useEffect(() => {
        if (authLoading) {
            return; // Oturum bilgisi yüklenene kadar bekle
        }

        if (user) {
            if (isSeller) {
                // Eğer kullanıcı zaten bir satıcıysa, onu doğrudan ürün listesine yönlendir.
                router.replace('/seller/product-list');
            } else {
                // HATA DÜZELTMESİ: Eğer giriş yapan kullanıcı satıcı değilse,
                // oturumu kapatıp müşteri giriş sayfasına yönlendirerek sonsuz döngüyü engelle.
                const handleNonSeller = async () => {
                    await supabase.auth.signOut();
                    router.replace('/auth'); // Satıcı olmayanları müşteri girişine yönlendir
                };
                handleNonSeller();
            }
        }
    }, [user, isSeller, authLoading, router]);

    const handleSellerLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        // signIn fonksiyonuna 'seller' parametresi göndererek sadece satıcıların giriş yapmasını sağla
        await signIn(email, password, 'seller');
        setLoading(false);
    };

    // Yönlendirme veya oturum kontrolü sırasında bir yükleme ekranı göstererek arayüzün anlık görünmesini engelle.
    if (authLoading || user) {
        return (
             <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
                Oturum kontrol ediliyor ve yönlendiriliyor...
            </div>
        );
    }
    
    // Sadece oturum açık değilse ve yükleme bittiyse giriş formunu göster.
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">
                    Satıcı Paneli Girişi
                </h2>
                <form className="space-y-6" onSubmit={handleSellerLogin}>
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

