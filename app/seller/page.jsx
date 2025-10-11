'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import FloatingLabelInput from '@/components/ui/FloatingLabelInput';

export default function SellerLoginPage() {
    const { signIn } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSellerLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        await signIn(email, password, 'seller');
        setLoading(false);
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">
                    Panele Giriş Yap
                </h2>
                <p className="text-center text-gray-600">Giriş yaptıktan sonra panele yönlendirileceksiniz.</p>
                <form className="space-y-8" onSubmit={handleSellerLogin}>
                    <FloatingLabelInput
                        id="email"
                        name="email"
                        type="email"
                        label="E-posta Adresi"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <FloatingLabelInput
                        id="password"
                        name="password"
                        type="password"
                        label="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}
                        className="w-full py-2.5 px-4 text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none disabled:bg-orange-300">
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
            </div>
        </div>
    );
}