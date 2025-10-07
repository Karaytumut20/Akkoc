"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
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
    const { router, addToCart } = useAppContext();

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tek bir ürün verisini Supabase'den çek
    const fetchProductData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Ürün alınamadı:", error.message);
            setProductData(null);
        } else {
            const formatted = {
                ...data,
                image: data.image_urls
                    ? Array.isArray(data.image_urls)
                        ? data.image_urls
                        : JSON.parse(data.image_urls)
                    : [],
            };
            setProductData(formatted);
            setMainImage(formatted.image[0] || null);
        }
        setLoading(false);
    };

    // Diğer ürünleri (featured products) Supabase'den çek
    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(10);

        if (!error && data) {
            const formattedProducts = data.map(p => ({
                ...p,
                image: p.image_urls
                    ? Array.isArray(p.image_urls)
                        ? p.image_urls
                        : JSON.parse(p.image_urls)
                    : [],
            }));
            setProducts(formattedProducts.filter(p => p.id !== id));
        } else {
            console.error("Featured ürünler alınamadı:", error?.message);
        }
    };

    useEffect(() => {
        fetchProductData();
        fetchProducts();
    }, [id]);

    if (loading || !productData) return <Loading />;

    return (
        <>
            <Navbar />
            <div className="px-4 sm:px-6 md:px-16 lg:px-32 pt-14 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                    {/* Sol taraf: Ana görsel ve alt görseller */}
                    <div className="px-2 md:px-5 lg:px-16 xl:px-20">
                        {/* Ana görsel */}
                        <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 w-full aspect-[3.2/4] relative">
                            <Image
                                src={mainImage || productData.image[0]}
                                alt={productData.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                        </div>

                        {/* Alt görseller */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                            {productData.image.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => setMainImage(image)}
                                    className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 w-full aspect-[3.2/4] relative"
                                >
                                    <Image
                                        src={image}
                                        alt={productData.name + " " + index}
                                        fill
                                        className="object-cover"
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
                        <div className="flex items-center gap-2">
                             {/*   <div className="flex items-center gap-0.5">
                                <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                                <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                                <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                                <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                                <Image className="h-4 w-4" src={assets.star_dull_icon} alt="star_dull_icon" />
                            </div>
                            <p>(4.5)</p> */}
                        </div>
                        <p className="text-gray-600 mt-3">
                            {productData.description}
                        </p>
                        <p className="text-3xl font-medium mt-6">
                            ${productData.price}
                        </p>
                        <hr className="bg-gray-600 my-6" />
                        <div className="overflow-x-auto">
                            <table className="table-auto border-collapse w-full max-w-72">
                                <tbody>
                                    <tr>
                                        <td className="text-gray-600 font-medium">Category</td>
                                        <td className="text-gray-800/50">{productData.category}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center mt-10 gap-4">
                            <button onClick={() => addToCart(productData.id)} className="w-full sm:w-auto flex-1 py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition">
                                Add to Cart
                            </button>
                           <button
    onClick={() => { addToCart(productData); router.push('/cart'); }}
    className="w-full sm:w-auto flex-1 py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition"
>
    Buy now
</button>

                        </div>
                    </div>
                </div>

                {/* Featured Products */}
                <div className="flex flex-col items-center">
                    <div className="flex flex-col items-center mb-4 mt-16">
                        <p className="text-3xl font-medium">Featured <span className="font-medium text-orange-600">Products</span></p>
                        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                        {products.slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
                    </div>
                    <button className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
                        See more
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Product;
