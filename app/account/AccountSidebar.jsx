'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FiGrid, FiPackage, FiHeart, FiStar, FiMapPin, FiLock, FiBell, FiLogOut, FiChevronRight, FiCreditCard } from 'react-icons/fi';
import { useAppContext } from "@/context/AppContext";

export default function AccountSidebar() {
    const { user, signOut } = useAppContext();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const menuItems = [
        { name: "Kontrol Paneli", href: "/account?tab=dashboard", activeIdentifier: "dashboard", isTab: true, icon: <FiGrid /> },
        { name: "Siparişlerim", href: "/account/my-orders", activeIdentifier: "/account/my-orders", isTab: false, icon: <FiPackage /> },
        { name: "Favorilerim", href: "/account/wishlist", activeIdentifier: "/account/wishlist", isTab: false, icon: <FiHeart /> },
        { name: "Değerlendirmelerim", href: "/account?tab=reviews", activeIdentifier: "reviews", isTab: true, icon: <FiStar /> },
        { name: "Adreslerim", href: "/account/addresses", activeIdentifier: "/account/addresses", isTab: false, icon: <FiMapPin /> },
        { name: "Parola Güvenliği", href: "/account?tab=password", activeIdentifier: "password", isTab: true, icon: <FiLock /> },
        { name: "Bildirim Tercihleri", href: "/account?tab=notifications", activeIdentifier: "notifications", isTab: true, icon: <FiBell /> },
        { name: "Kayıtlı Kartlarım", href: "/account?tab=saved-cards", activeIdentifier: "saved-cards", isTab: true, icon: <FiCreditCard /> } // <-- YENİ EKLENEN SATIR
    ];
    
    const activeTab = searchParams.get('tab');

    if (!user) {
        return null;
    }

    return (
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
                    const isActive = item.isTab
                        ? (pathname === '/account' && (activeTab === item.activeIdentifier || (!activeTab && item.activeIdentifier === 'dashboard')))
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
    );
}