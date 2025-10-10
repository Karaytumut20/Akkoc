// app/wishlist/page.jsx

'use client';
import React from "react";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";

const Wishlist = () => {
    const { wishlist, loading } = useAppContext();

    if (loading) return <Loading />;

    return (
        <>
            <div className="min-h-[70vh] px-4 sm:px-6 md:px-16 lg:px-32 py-10">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-gray-800 border-b pb-4">Favorilerim</h1>
                {wishlist.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p>Favori ürününüz bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {wishlist.map(item => (
                            <ProductCard key={item.product.id} product={item.product} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Wishlist;