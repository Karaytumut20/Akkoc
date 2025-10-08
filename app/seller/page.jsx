'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';

export default function SellerLoginPage() {
    const { user, isSeller, authLoading } = useAppContext();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Eğer kullanıcı zaten bir satıcı olarak giriş yapmışsa, doğrudan dashboard'a yönlendir.
    useEffect(() => {
        if (!authLoading && user && isSeller) {
            router.push('/seller/dashboard/product-list');
        }
    }, [user, isSeller, authLoading, router]);

    const handleSellerLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            toast.error("Giriş başarısız: " + error.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                toast.error("Profil bilgisi alınamadı.");
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            if (profile && profile.role === 'seller') {
                toast.success('Satıcı olarak giriş yapıldı!');
                router.push('/seller/dashboard/product-list'); // Başarılı girişte korumalı alana yönlendir
            } else {
                toast.error('Bu alana sadece satıcılar giriş yapabilir.');
                await supabase.auth.signOut();
                setLoading(false);
            }
        }
    };

    // Eğer satıcı zaten giriş yapmışsa ve yönlendirme bekleniyorsa, boş bir ekran göster.
    if (authLoading || (user && isSeller)) {
        return (
             <div className="flex items-center justify-center h-screen bg-gray-50">
                Yönlendiriliyor...
            </div>
        );
    }
    
    // Ana giriş formunu göster
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