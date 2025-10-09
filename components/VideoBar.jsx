'use client';

import React from "react";
import MainNavbar from "./MainNavbar";
import { usePathname } from "next/navigation"; // Aktif route'u almak için

export default function KnotVideoHero() {
  const pathname = usePathname(); // Şu anki sayfanın yolunu alıyoruz
  const isHomePage = pathname === "/"; // Anasayfa mı kontrolü

  // Eğer anasayfadaysak video arka planlı hero gözükecek
  // Diğer sayfalarda sadece Navbar olacak
  return (
    <>
      {isHomePage ? (
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

          {/* Navbar */}
          <MainNavbar />

          {/* SHOP NOW BUTTON */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-30">
            <a
              href="/all-products"
              className="bg-white/95 text-gray-900 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase py-3 px-10 hover:bg-white transition-all duration-300"
            >
              Shop Now
            </a>
          </div>
        </section>
      ) : (
        // Diğer sayfalarda sadece Navbar göster
        <div className="relative w-full bg-black/70 backdrop-blur-md">
          <MainNavbar />
        </div>
      )}
    </>
  );
}
