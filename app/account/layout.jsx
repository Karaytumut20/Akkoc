// app/account/layout.jsx

'use client';

import { useAppContext } from "@/context/AppContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import Link from "next/link";
import { FiGrid, FiPackage, FiHeart, FiStar, FiMapPin, FiLock, FiBell, FiLogOut, FiChevronRight } from "react-icons/fi";

const AccountLayout = ({ children }) => {
    const { user, authLoading, signOut } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Auth kontrolü
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/auth');
        }
    }, [authLoading, user, router]);

    if (authLoading || !user) {
        return <Loading />;
    }

    // Menü öğelerini ve onların aktif olup olmadığını belirleyecek anahtarları tanımlayalım
    const menuItems = [
        { name: "Kontrol Paneli", href: "/account?tab=dashboard", activeIdentifier: "dashboard" , icon: <FiGrid /> },
        { name: "Siparişlerim", href: "/account/my-orders", activeIdentifier: "/account/my-orders", icon: <FiPackage /> },
        { name: "Favorilerim", href: "/account/wishlist", activeIdentifier: "/account/wishlist", icon: <FiHeart /> },
        { name: "Değerlendirmelerim", href: "/account?tab=reviews", activeIdentifier: "reviews", icon: <FiStar /> },
        { name: "Adreslerim", href: "/account/addresses", activeIdentifier: "/account/addresses", icon: <FiMapPin /> },
        { name: "Parola Güvenliği", href: "/account?tab=password", activeIdentifier: "password", icon: <FiLock /> },
        { name: "Bildirim Tercihleri", href: "/account?tab=notifications", activeIdentifier: "notifications", icon: <FiBell /> },
    ];

    // Aktif sekmeyi URL'den alalım. Eğer tab yoksa varsayılan olarak 'dashboard' olsun.
    const activeTab = searchParams.get('tab') || 'dashboard';

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
                                <div className="ml-3 overflow-hidden">
                                    <p className="font-semibold text-gray-800 truncate">{user?.user_metadata?.full_name || user.email.split('@')[0]}</p>
                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    // Aktiflik kontrolü:
                                    // 1. Eğer link bir sekme linki ise (`?tab=`) aktif sekmeyle eşleşiyor mu diye bak.
                                    // 2. Eğer normal bir sayfa linki ise `pathname` ile eşleşiyor mu diye bak.
                                    const isTabLink = item.href.startsWith('/account?');
                                    const isActive = isTabLink 
                                        ? pathname === '/account' && activeTab === item.activeIdentifier
                                        : pathname === item.activeIdentifier;

                                    return (
                                        <Link href={item.href} key={item.name}>
                                            <div className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-50 text-gray-700'}`}>
                                                {item.icon}
                                                <span className="ml-3 font-medium">{item.name}</span>
                                                <FiChevronRight className="ml-auto w-5 h-5" />
                                            </div>
                                        </Link>
                                    );
                                })}
                                <div onClick={signOut} className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-700">
                                    <FiLogOut />
                                    <span className="ml-3 font-medium">Çıkış Yap</span>
                                </div>
                            </nav>
                        </div>
                    </div>

                    {/* Sağ İçerik Alanı (Değişken içerik buraya gelecek) */}
                    <div className="md:col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AccountLayout;