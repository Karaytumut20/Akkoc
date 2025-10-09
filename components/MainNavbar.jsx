'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";

// === SVG ICONS ===
const icons = {
  Menu: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  Close: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Search: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  ShoppingBag: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
};

export default function MainNavbar() {
  const { products, getSafeImageUrl, user, signOut, getCartCount } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const cartCount = getCartCount();
  const isHomePage = pathname === "/";

  // === Sticky scroll kontrolü ===
  useEffect(() => {
    if (!isHomePage) {
      setIsSticky(true); // diğer sayfalarda direkt sticky (beyaz)
      return;
    }

    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // === Canlı arama ===
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/all-products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchVisible(false);
      setSearchQuery("");
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
    setIsSearchVisible(false);
    setSearchQuery("");
  };

  const navLinks = [
    { name: "High Jewelry", href: "/all-products" },
    { name: "Jewelry", href: "/all-products" },
    { name: "Love & Engagement", href: "/all-products" },
    { name: "Fine Watches", href: "/all-products" },
  ];

  // === Navbar renk durumu ===
  const headerClasses = isSticky
    ? "fixed top-0 left-0 right-0 z-50 bg-white text-gray-800 shadow-md animate-fadeInDown"
    : "absolute top-0 left-0 right-0 z-20 text-white";

  const logoSrc = assets.logo;

  return (
    <header
      className={`w-full pt-4 pb-2 px-5 sm:px-10 lg:px-16 transition-all duration-300 ${headerClasses}`}
    >
      <div className="flex items-center justify-between relative">
        {/* === Sol: Menü & Arama === */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            aria-label="Menu"
            className="p-2 rounded-full hover:bg-black/10 transition lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <icons.Close className="w-6 h-6" />
            ) : (
              <icons.Menu className="w-6 h-6" />
            )}
          </button>

          <button
            aria-label="Search"
            className="p-2 rounded-full hover:bg-black/10 transition"
            onClick={() => setIsSearchVisible(!isSearchVisible)}
          >
            <icons.Search className="w-5 h-5" />
          </button>
        </div>

        {/* === Orta: Logo === */}
        <div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            className="w-28 md:w-32"
            src={logoSrc}
            alt="logo"
            style={{
              filter: isSticky ? "none" : "brightness(0) invert(1)",
            }}
          />
        </div>

        {/* === Sağ: Kullanıcı & Sepet === */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-full hover:bg-black/10 transition">
                <Image
                  className="w-5 h-5"
                  src={assets.user_icon}
                  alt="user icon"
                  style={{
                    filter: isSticky ? "none" : "brightness(0) invert(1)",
                  }}
                />
                <span className="hidden md:block">
                  {user.email.split("@")[0]}
                </span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block text-gray-800">
                <Link
                  href="/my-orders"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Siparişlerim
                </Link>
                <button
                  onClick={signOut}
                  className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => router.push("/auth")}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-black/10 transition"
            >
              <Image
                className="w-5 h-5"
                src={assets.user_icon}
                alt="user icon"
                style={{
                  filter: isSticky ? "none" : "brightness(0) invert(1)",
                }}
              />
              <span className="hidden md:block">Giriş Yap</span>
            </button>
          )}

          <button
            aria-label="Shopping Bag"
            className="p-2 rounded-full hover:bg-black/10 transition relative"
            onClick={() => router.push("/cart")}
          >
            <icons.ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-white text-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* === Search Bar === */}
      {isSearchVisible && (
        <div className="relative mt-4 max-w-md mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün Ara..."
              autoFocus
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                isSticky
                  ? "bg-gray-100 text-gray-800 placeholder-gray-500 focus:ring-orange-500"
                  : "bg-white/20 text-white placeholder-white/70 focus:ring-white/50"
              }`}
            />
          </form>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white text-black mt-2 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
              <ul>
                {searchResults.map((product) => (
                  <li key={product.id}>
                    <div
                      onClick={() => handleProductClick(product.id)}
                      className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                        <Image
                          src={getSafeImageUrl(product.image_urls)}
                          alt={product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <span className="font-medium text-gray-800">
                        {product.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* === Desktop Menü === */}
      <nav
        className={`mt-6 hidden lg:flex justify-center space-x-10 text-sm font-light tracking-[0.25em] uppercase ${
          isSticky ? "text-gray-700" : "text-gray-200"
        }`}
      >
        {navLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="relative group hover:text-current transition"
          >
            {item.name}
            <span className="absolute left-1/2 -bottom-1 w-0 h-[1.5px] bg-current group-hover:w-6 group-hover:-translate-x-1/2 transition-all duration-300"></span>
          </Link>
        ))}
      </nav>

      {/* === Mobile Menü === */}
      {menuOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/90 z-50 flex flex-col items-center justify-center text-center space-y-8 text-white text-lg font-light uppercase tracking-widest animate-fadeIn">
          <button
            aria-label="Close menu"
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/20 transition"
            onClick={() => setMenuOpen(false)}
          >
            <icons.Close className="w-7 h-7" />
          </button>

          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="hover:text-orange-300 transition"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
