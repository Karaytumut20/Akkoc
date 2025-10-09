'use client'
import { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import Loading from "./Loading";

const HomeProducts = () => {
  const { products, router, loading: productsLoading } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  
  // Anasayfada gösterilecek ürün sayısı
  const HOME_PRODUCT_LIMIT = 10;

  // Kategorileri veritabanından çekelim
  useEffect(() => {
    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('id, name');
        if (!error && data) {
            setCategories(data);
        }
    };
    fetchCategories();
  }, []);

  // Filtrelenmiş ve sıralanmış ürünleri hesaplayalım
  const filteredAndSortedProducts = useMemo(() => {
    let processedProducts = [...products];

    // Kategoriye göre filtrele
    if (selectedCategory !== 'all') {
        processedProducts = processedProducts.filter(p => p.category_id === selectedCategory);
    }

    // Fiyata göre sırala
    switch (sortOption) {
        case 'price-asc':
            processedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            processedProducts.sort((a, b) => b.price - a.price);
            break;
        default:
            // Varsayılan sıralama
            break;
    }

    return processedProducts;
  }, [products, selectedCategory, sortOption]);

  // Anasayfada gösterilecek ürünleri limitleyelim
  const productsToShow = filteredAndSortedProducts.slice(0, HOME_PRODUCT_LIMIT);

  if (productsLoading) {
      return <Loading />
  }

  return (
    <div className="flex flex-col items-center my-16 w-full">
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex flex-col items-center sm:items-start">
            <p className="text-3xl font-medium text-center sm:text-left">
                Öne Çıkan <span className="font-medium text-orange-600">Ürünler</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
        </div>
        
        {/* Filtreleme ve Sıralama Kontrolleri */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 w-full sm:w-40"
            >
                <option value="all">Tüm Kategoriler</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 w-full sm:w-40"
            >
                <option value="default">Sırala</option>
                <option value="price-asc">Fiyata Göre Artan</option>
                <option value="price-desc">Fiyata Göre Azalan</option>
            </select>
        </div>
      </div>

      {productsToShow.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10 w-full justify-items-center">
            {productsToShow.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 w-full">
            <p>Bu kriterlere uygun ürün bulunamadı.</p>
        </div>
      )}

      {/* Eğer daha fazla ürün varsa "Tüm Ürünleri Gör" butonu gösterilir */}
      {filteredAndSortedProducts.length > HOME_PRODUCT_LIMIT && (
        <div className="mt-16 w-full flex justify-center">
           <button
              onClick={() => router.push("/all-products")}
              className="px-10 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
              Tüm Ürünleri Gör
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeProducts;
