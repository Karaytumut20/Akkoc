'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Merkezi state yönetiminden gerekli bilgileri alıyoruz.
import { useAppContext } from '@/context/AppContext';

// Satıcı paneline özel Navbar ve Sidebar bileşenleri
import SellerNavbar from '@/components/seller/Navbar';
import SellerSidebar from '@/components/seller/Sidebar';

// Bu bileşen, /seller altındaki tüm sayfalar için bir "gardiyan" görevi görür.
const SellerLayout = ({ children }) => {
  // Gerekli tüm bilgileri (kullanıcı, rolü, yükleme durumu) tek bir yerden alıyoruz.
  const { user, isSeller, authLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // `authLoading` true ise, kimlik doğrulama kontrolü henüz bitmemiştir.
    // Bu durumda herhangi bir yönlendirme yapmadan bekliyoruz.
    if (authLoading) {
      return;
    }

    // Kimlik doğrulama bittiğinde, eğer kullanıcı giriş yapmamışsa VEYA
    // giriş yapmış kullanıcının rolü 'seller' değilse, erişimi engelle.
    if (!user || !isSeller) {
      toast.error("Bu alana erişim yetkiniz bulunmamaktadır.");
      router.push('/'); // Kullanıcıyı ana sayfaya yönlendir.
    }
    // Bağımlılıklar: Bu kontrol, bu değerlerden herhangi biri değiştiğinde yeniden çalışır.
  }, [user, isSeller, authLoading, router]);

  // Henüz yetki kontrolü tamamlanmadıysa veya kullanıcı yetkili değilse,
  // içeriği (children) göstermek yerine bir yükleme mesajı gösteriyoruz.
  // Bu, sayfanın yetkisiz kullanıcılar tarafından anlık olarak bile görülmesini engeller.
  if (authLoading || !isSeller) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700 text-lg">
        Yetkiniz kontrol ediliyor, lütfen bekleyin...
      </div>
    );
  }
  
  // Eğer yukarıdaki kontrollerin hepsi geçildiyse, kullanıcı bir satıcıdır.
  // Bu durumda satıcı panelini (Navbar, Sidebar ve ilgili sayfa içeriği) render et.
  // Gördüğünüz gibi, burada artık bir giriş formu yok çünkü bu layout'a sadece
  // yetkili satıcılar ulaşabilir.
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <SellerNavbar />
      <div className="flex w-full">
        <SellerSidebar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default SellerLayout;
