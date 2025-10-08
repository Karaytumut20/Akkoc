"use client"
import React from "react";
import { assets } from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {

    const { router, user, signOut, getCartCount } = useAppContext();
    const cartCount = getCartCount();

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 sticky top-0 bg-white z-50">
            <Image
                className="cursor-pointer w-28 md:w-32"
                onClick={() => router.push('/')}
                src={assets.logo}
                alt="logo"
            />
            <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
                <Link href="/" className="hover:text-gray-900 transition">
                    Home
                </Link>
                <Link href="/all-products" className="hover:text-gray-900 transition">
                    Shop
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/cart')} className="relative p-2 rounded-full hover:bg-gray-100 transition">
                    <Image className="w-5 h-5" src={assets.cart_icon} alt="cart icon" />
                    {cartCount > 0 && (
                        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-orange-600 text-white text-xs text-center">
                            {cartCount}
                        </span>
                    )}
                </button>

                {user ? (
                    <div className="relative group">
                        <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition">
                            <Image className="w-5 h-5" src={assets.user_icon} alt="user icon" />
                            <span className="hidden md:block">{user.email.split('@')[0]}</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                            <Link href="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Siparişlerim</Link>
                            <button onClick={signOut} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => router.push('/auth')} className="flex items-center gap-2 hover:text-gray-900 transition p-2 rounded-full hover:bg-gray-100">
                        <Image className="w-5 h-5" src={assets.user_icon} alt="user icon" />
                        <span className="hidden md:block">Giriş Yap</span>
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;