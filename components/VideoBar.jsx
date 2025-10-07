'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Next.js yönlendirme için

const icons = {
  Menu: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  Close: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Search: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Bell: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.8 11.2a1 1 0 0 0 .2-1.4 8.5 8.5 0 0 0-14 0 1 1 0 0 0 .2 1.4L6 13h12l.8-1.8z" />
      <path d="M12 2v2a8 8 0 0 0-8 8v4l-2 2h20l-2-2v-4a8 8 0 0 0-8-8z" />
      <path d="M12 22a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z" />
    </svg>
  ),
  ShoppingBag: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
};

export default function KnotVideoHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter(); // ✅ yönlendirme hook’u

  const navLinks = [
    "High Jewelry",
    "Jewelry",
    "Love & Engagement",
    "Fine Watches",
    "Home",
    "Accessories",
    "Gifts",
    "World of Tiffany",
  ];

  return (
    <section className="w-full h-screen relative overflow-hidden bg-black font-sans">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/assets/video.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-10"></div>

      {/* Content Layer */}
      <div className="relative z-20 w-full h-full flex flex-col">
        {/* NAVBAR */}
        <header className="w-full text-white pt-4 pb-2 px-5 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between relative">
            
            {/* LEFT ICONS */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Hamburger Menu Toggle */}
              <button
                aria-label="Menu"
                className="p-2 rounded-full hover:bg-white/20 transition lg:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <icons.Close className="w-6 h-6" />
                ) : (
                  <icons.Menu className="w-6 h-6" />
                )}
              </button>

              <button aria-label="Search" className="p-2 rounded-full hover:bg-white/20 transition">
                <icons.Search className="w-5 h-5" />
              </button>
            </div>

            {/* CENTER LOGO */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none text-center">
              <h1
                className="font-serif uppercase whitespace-nowrap tracking-[0.25em] text-white
                           text-[1rem] sm:text-[1.4rem] md:text-[1.8rem] lg:text-[2.1rem] xl:text-[2.4rem]
                           transition-all duration-300"
              >
                TIFFANY&CO.
              </h1>
              <div className="mt-[2px] h-[1px] bg-gradient-to-r from-white/10 via-white/60 to-white/10 w-full"></div>
            </div>

            {/* RIGHT ICONS */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button aria-label="Account/Notifications" className="p-2 rounded-full hover:bg-white/20 transition">
                <icons.Bell className="w-5 h-5" />
              </button>

              {/* 🛒 SHOPPING BAG BUTTON → /cart yönlendirme */}
              <button
                aria-label="Shopping Bag"
                className="p-2 rounded-full hover:bg-white/20 transition"
                onClick={() => router.push("/cart")} // ✅ yönlendirme eklendi
              >
                <icons.ShoppingBag className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* NAV LINKS (Desktop) */}
          <nav className="mt-6 hidden lg:flex justify-center space-x-10 text-sm font-light tracking-[0.25em] uppercase">
            {navLinks.map((item) => (
              <a
                key={item}
                href="#"
                className="relative group text-gray-200 hover:text-white transition"
              >
                {item}
                <span className="absolute left-1/2 -bottom-1 w-0 h-[1.5px] bg-white group-hover:w-6 group-hover:-translate-x-1/2 transition-all duration-300"></span>
              </a>
            ))}
          </nav>
        </header>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div
            className="absolute top-0 left-0 w-full h-full bg-black/90 z-30 flex flex-col items-center justify-center text-center space-y-8 text-white text-lg font-light uppercase tracking-widest animate-fadeIn"
          >
            {/* Close (X) Button */}
            <button
              aria-label="Close menu"
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/20 transition"
              onClick={() => setMenuOpen(false)}
            >
              <icons.Close className="w-7 h-7" />
            </button>

            {navLinks.map((item) => (
              <a
                key={item}
                href="#"
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-300 transition"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* SHOP NOW BUTTON */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-30">
        <a
          href="/shop/knot"
          className="bg-white/95 text-gray-900 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase py-3 px-10 hover:bg-white transition-all duration-300"
        >
          Shop Now
        </a>
      </div>
    </section>
  );
}
