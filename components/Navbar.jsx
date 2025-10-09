// components/MainNavbar.jsx

'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";

const icons = {
  Menu: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>,
  Close: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Search: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
  ShoppingBag: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
};

export default function MainNavbar() {
    const { user, signOut, getCartCount } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    
    const [isSticky, setIsSticky] = useState(pathname !== '/');
    const [menuOpen, setMenuOpen] = useState(false);
    const cartCount = getCartCount();

    useEffect(() => {
        const isHomePage = pathname === '/';
        const handleScroll = () => {
            setIsSticky(window.scrollY > 50);
        };

        if (isHomePage) {
            window.addEventListener('scroll', handleScroll);
            handleScroll(); // initial check
        } else {
            setIsSticky(true); // Always sticky on other pages
        }

        return () => {
            if (isHomePage) {
                window.removeEventListener('scroll', handleScroll);
            }
        };
    }, [pathname]);

    const headerClasses = isSticky
      ? 'fixed top-0 left-0 right-0 z-50 bg-white text-gray-800 shadow-md animate-fadeInDown'
      : 'absolute top-0 left-0 right-0 z-20 text-white'; // Only for homepage at top

    return (
        <header className={`w-full pt-4 pb-2 px-5 sm:px-10 lg:px-16 transition-all duration-300 ${headerClasses}`}>
            <div className="flex items-center justify-between relative">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button aria-label="Menu" className="p-2 rounded-full hover:bg-black/10 transition lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <icons.Close className="w-6 h-6" /> : <icons.Menu className="w-6 h-6" />}
                    </button>
                    {/* Arama butonu ve işlevselliği buraya eklenebilir */}
                </div>

                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => router.push('/')}>
                    <Image src={assets.logo} alt="logo" width={128} height={32} style={{ filter: isSticky ? 'none' : 'brightness(0) invert(1)' }}/>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    {user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-2 rounded-full hover:bg-black/10 transition">
                                <Image src={assets.user_icon} alt="user icon" width={20} height={20} style={{ filter: isSticky ? 'none' : 'brightness(0) invert(1)' }}/>
                                <span className="hidden md:block">{user.email.split('@')[0]}</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block text-gray-800">
                                <Link href="/my-orders" className="block px-4 py-2 text-sm hover:bg-gray-100">Siparişlerim</Link>
                                <button onClick={signOut} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100">Çıkış Yap</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => router.push('/auth')} className="flex items-center gap-2 p-2 rounded-full hover:bg-black/10 transition">
                            <Image src={assets.user_icon} alt="user icon" width={20} height={20} style={{ filter: isSticky ? 'none' : 'brightness(0) invert(1)' }}/>
                            <span className="hidden md:block">Giriş Yap</span>
                        </button>
                    )}
                    <button aria-label="Shopping Bag" className="p-2 rounded-full hover:bg-black/10 transition relative" onClick={() => router.push("/cart")}>
                        <icons.ShoppingBag className="w-5 h-5" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-white text-xs">{cartCount}</span>}
                    </button>
                </div>
            </div>
            {/* Diğer menü ve arama pop-up'ları buraya eklenebilir */}
        </header>
    );
}