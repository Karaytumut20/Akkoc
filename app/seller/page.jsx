'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function SellerLoginPage() {
    const { signIn } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Not: Yönlendirme mantığı artık app/seller/layout.jsx içinde yönetiliyor.
    // Bu sayfa sadece giriş yapmamış kullanıcılara gösterilecektir.

    const handleSellerLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        // signIn fonksiyonuna 'seller' parametresi göndererek giriş sonrası doğru yönlendirmeyi sağla
        await signIn(email, password, 'seller');
        setLoading(false);
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">
                    Panele Giriş Yap
                </h2>
                <p className="text-center text-gray-600">Giriş yaptıktan sonra panele yönlendirileceksiniz.</p>
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
