"use client";

import Image from "next/image";

export default function TiffanyIconsGrid() {
  const icons = [
    {
      title: "Knot",
      image: "/assets/shopnow.jpg", // Lütfen bu yolu kendi görsel yolunuzla değiştirin.
      alt: "Pırlantalı düğüm bilezik",
    },
    {
      title: "HardWear",
      image: "/assets/shopnow2.jpg", // Lütfen bu yolu kendi görsel yolunuzla değiştirin.
      alt: "Altın zincir bileklik",
    },
    {
      title: "Tiffany T",
      image: "/assets/shopnow3.jpg", // Lütfen bu yolu kendi görsel yolunuzla değiştirin.
      alt: "Pırlantalı T bilezik",
    },
    {
      title: "Lock",
      image: "/assets/shopnow4.jpg", // Lütfen bu yolu kendi görsel yolunuzla değiştirin.
      alt: "Pırlantalı kilit bilezik",
    },
  ];

  return (
    <section className="w-full bg-white py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Ana Başlık */}
        <h2 className="text-xl sm:text-2xl font-serif text-gray-900 text-center mb-12 sm:mb-16">
          The Tiffany Iconssssaa
        </h2>

        {/* Dört Sütunlu Grid Düzeni */}
        {/* Küçük ekranlarda 2, büyük ekranlarda 4 sütun gösterir */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {icons.map((item, index) => (
            <div key={index} className="text-center group">
              
              {/* Görsel Alanı */}
              <div className="relative w-full aspect-square overflow-hidden bg-teal-600">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition duration-500 ease-in-out group-hover:scale-[1.03]" // Hafif hover efekti
                  priority={index < 2} 
                />
              </div>

              {/* Metin Alanı */}
              <div className="mt-6">
                
                {/* Başlık */}
                <h3 className="text-xl font-serif text-gray-900 mb-4">
                  {item.title}
                </h3>

                {/* Buton/Link */}
                <a
                  href={`/shop/${item.title.toLowerCase().replace(/\s/g, '-')}`}
                  className="text-xs font-semibold tracking-widest uppercase text-gray-900 border-b border-gray-900 pb-1 hover:text-teal-600 hover:border-teal-600 transition duration-150"
                >
                  SHOP NOW
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}