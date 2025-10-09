// components/ShopLayout.jsx

'use client';

import { usePathname } from 'next/navigation';
import VideoBar from './VideoBar';
import Footer from './Footer';

export default function ShopLayout({ children }) {
  const pathname = usePathname();

  // Bu yollarda navbar ve footer'ı HİÇ GÖSTERME
  const noLayoutPaths = ['/seller', '/auth', '/order-placed'];

  // Eğer mevcut yol, yukarıdaki listeki bir yolla başlıyorsa,
  // navbar ve footer olmadan sadece sayfa içeriğini göster.
  const hasNoLayout = noLayoutPaths.some(path => pathname.startsWith(path));

  if (hasNoLayout) {
    return <>{children}</>;
  }

  // Diğer tüm sayfalar için MainNavbar ve Footer'ı göster
  return (
    <>
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}