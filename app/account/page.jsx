// app/account/page.jsx

'use client';
import { useAppContext } from "@/context/AppContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import Link from "next/link";
import { FiUser, FiHeart, FiMapPin, FiPackage, FiLogOut, FiChevronRight } from "react-icons/fi";

// Profil Bilgileri için component
const ProfileInformation = () => {
    const { user, updateUserData } = useAppContext();
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        await updateUserData({ full_name: fullName });
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Profil Bilgileri</h2>
            <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Tam Adınız</label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="py-2 px-4 text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none disabled:bg-orange-300"
                >
                    {loading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
                </button>
            </form>
        </div>
    );
};


const AccountPageContent = () => {
    const { user, authLoading, signOut } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/auth');
        }
    }, [authLoading, user, router]);

    if (authLoading || !user) {
        return <Loading />;
    }

    const menuItems = [
        { name: "Profil Bilgileri", tab: "profile", icon: <FiUser /> },
        { name: "Siparişlerim", tab: "my-orders", icon: <FiPackage />, href: "/my-orders" },
        { name: "Favorilerim", tab: "wishlist", icon: <FiHeart />, href: "/wishlist" },
        { name: "Adreslerim", tab: "addresses", icon: <FiMapPin />, href: "/account/addresses" },
    ];

    return (
        <>
            <div className="min-h-[70vh] px-4 sm:px-6 md:px-16 lg:px-32 py-10">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-gray-800 border-b pb-4">Hesabım</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sol Menü */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xl font-bold">
                                    {user.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <p className="font-semibold text-gray-800 truncate">{user?.user_metadata?.full_name || user.email.split('@')[0]}</p>
                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link href={item.href || `/account?tab=${item.tab}`} key={item.name}>
                                        <div className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${activeTab === item.tab ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-50 text-gray-700'}`}>
                                            {item.icon}
                                            <span className="ml-3 font-medium">{item.name}</span>
                                            <FiChevronRight className="ml-auto w-5 h-5" />
                                        </div>
                                    </Link>
                                ))}
                                <div onClick={signOut} className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-700">
                                    <FiLogOut />
                                    <span className="ml-3 font-medium">Çıkış Yap</span>
                                </div>
                            </nav>
                        </div>
                    </div>

                    {/* Sağ İçerik Alanı */}
                    <div className="md:col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
                            {activeTab === 'profile' && <ProfileInformation />}
                            {/* Diğer tab'lar için içerik buraya eklenebilir. Şimdilik sadece yönlendirme yapıyoruz. */}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

// Suspense, useSearchParams'in client-side'da düzgün çalışması için gereklidir.
const AccountPage = () => (
    <Suspense fallback={<Loading />}>
        <AccountPageContent />
    </Suspense>
);

export default AccountPage;