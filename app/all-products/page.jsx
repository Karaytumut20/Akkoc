'use client'
import { useState, useEffect, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import Loading from "@/components/Loading";

const AllProducts = () => {
    const { products, loading: productsLoading } = useAppContext();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortOption, setSortOption] = useState('default');

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
                // Varsayılan sıralama (örneğin, eklenme tarihine göre olabilir, şimdilik sabit)
                break;
        }

        return processedProducts;
    }, [products, selectedCategory, sortOption]);

    if (productsLoading) {
        return (
            <>
                <Navbar />
                <Loading />
                <Footer />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 min-h-[70vh]">
                <div className="w-full pt-12">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                         <div className="flex flex-col items-start">
                            <p className="text-2xl font-medium">Tüm Ürünler</p>
                            <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1"></div>
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
                    
                    {filteredAndSortedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
                            {filteredAndSortedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                           <p>Bu kriterlere uygun ürün bulunamadı.</p>
                        </div>
                    )}

                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;
