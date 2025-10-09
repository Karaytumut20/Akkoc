"use client"
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import React from "react";

const Product = () => {
    const { id } = useParams();
    const { router, addToCart, products: allProducts, getSafeImageUrl } = useAppContext();

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(name)') // Kategori adını da çekiyoruz
                .eq('id', id)
                .single();

            if (error) {
                console.error("Ürün alınamadı:", error.message);
                setProductData(null);
            } else {
                 let imageUrls = [];
                if (typeof data.image_urls === 'string') {
                    try { imageUrls = JSON.parse(data.image_urls); } catch { imageUrls = []; }
                } else if (Array.isArray(data.image_urls)) {
                    imageUrls = data.image_urls;
                }
                const formatted = { ...data, image_urls: imageUrls };
                setProductData(formatted);
                setMainImage(getSafeImageUrl(formatted.image_urls, 0));
            }
            setLoading(false);
        };

        fetchProductData();
    }, [id]);

    useEffect(() => {
        if (productData && allProducts.length > 0) {
            // İlgili ürünleri kategori ID'sine göre filtrele
            setRelatedProducts(
                allProducts.filter(p => p.category_id === productData.category_id && p.id !== productData.id).slice(0, 5)
            );
        }
    }, [productData, allProducts]);

    if (loading || !productData) return <Loading />;

    return (
        <>
            <Navbar />
            <div className="px-4 sm:px-6 md:px-16 lg:px-32 pt-14 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                    <div className="px-2 md:px-5 lg:px-16 xl:px-20">
                        <div className="rounded-lg overflow-hidden bg-gray-100 mb-4 w-full aspect-[3.2/4] relative">
                            <Image
                                src={mainImage}
                                alt={productData.name}
                                fill
                                className="object-contain" // contain olarak değiştirildi
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                            {productData.image_urls.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => setMainImage(image)}
                                    className={`cursor-pointer rounded-lg overflow-hidden bg-gray-100 w-full aspect-[3.2/4] relative border-2 ${mainImage === image ? 'border-orange-500' : 'border-transparent'}`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${productData.name} ${index + 1}`}
                                        fill
                                        className="object-contain" // contain olarak değiştirildi
                                        sizes="(max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                 
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
                            {productData.name}
                        </h1>
                        <p className="text-gray-600 mt-3">
                            {productData.description}
                        </p>
                        <p className="text-3xl font-medium mt-6">
                            ${productData.price}
                        </p>
                        <hr className="bg-gray-300 my-6" />
                        <table className="table-auto border-collapse w-full max-w-72">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 font-medium pr-4">Kategori</td>
                                    {/* Kategori adını ilişkili tablodan al */}
                                    <td className="text-gray-800/50">{productData.categories?.name || 'Belirtilmemiş'}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="flex flex-col sm:flex-row items-center mt-10 gap-4">
                            <button onClick={() => addToCart(productData)} className="w-full sm:w-auto flex-1 py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition rounded-md font-semibold">
                                Sepete Ekle
                            </button>
                            <button
                                onClick={() => { addToCart(productData); router.push('/cart'); }}
                                className="w-full sm:w-auto flex-1 py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition rounded-md font-semibold"
                            >
                                Hemen Al
                            </button>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="flex flex-col items-center">
                        <div className="flex flex-col items-center mb-4 mt-16">
                            <p className="text-3xl font-medium">İlgili <span className="font-medium text-orange-600">Ürünler</span></p>
                            <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                            {relatedProducts.map((product, index) => <ProductCard key={index} product={product} />)}
                        </div>
                    </div>
                )}
            </div>


            
            <Footer />
        </>
    );
};

export default Product;
