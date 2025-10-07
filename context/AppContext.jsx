'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSeller, setIsSeller] = useState(true);
    const [cartItems, setCartItems] = useState({});

    useEffect(() => {
        try {
            const storedCart = localStorage.getItem("cartItems");
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error("Sepet localStorage'dan yüklenemedi:", error);
        }
    }, []);

    useEffect(() => {
        if (Object.keys(cartItems).length > 0) {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
        } else {
            localStorage.removeItem("cartItems");
        }
    }, [cartItems]);

    // GÜVENLİ VERİ ÇEKME VE İŞLEME FONKSİYONU
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
            console.error("Supabase'den ürünler alınamadı:", error.message);
            setError(error.message);
            setProducts([]);
        } else {
            const formattedProducts = (data || []).map(p => {
                let imageUrls = [];
                if (p.image_urls) {
                    if (Array.isArray(p.image_urls)) {
                        imageUrls = p.image_urls;
                    } else {
                        try {
                            const parsed = JSON.parse(p.image_urls);
                            if (Array.isArray(parsed)) {
                                imageUrls = parsed;
                            }
                        } catch (e) {
                            console.error(`Ürün ${p.id} için image_urls parse edilemedi:`, p.image_urls);
                        }
                    }
                }
                return { ...p, image_urls: imageUrls };
            });
            setProducts(formattedProducts);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);
    
    const addToCart = (product) => {
        setCartItems(prevItems => {
            const newItems = { ...prevItems };
            if (newItems[product.id]) {
                newItems[product.id].quantity += 1;
            } else {
                newItems[product.id] = { product, quantity: 1 };
            }
            return newItems;
        });
    };

    const updateCartQuantity = (productId, quantity) => {
        setCartItems(prevItems => {
            const newItems = { ...prevItems };
            if (quantity <= 0) {
                delete newItems[productId];
            } else if (newItems[productId]) {
                newItems[productId].quantity = quantity;
            }
            return newItems;
        });
    };

    const getCartCount = () => {
        return Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
    };

    const getCartAmount = () => {
        return Math.floor(Object.values(cartItems).reduce((total, item) => total + item.product.price * item.quantity, 0) * 100) / 100;
    };

    const value = {
        currency, router, isSeller, setIsSeller,
        products, loading, error, fetchProducts,
        cartItems, setCartItems, addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
