// context/AppContext.jsx

'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Supabase client'ı import ediyoruz

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
    const router = useRouter();

    // State'leri tanımlıyoruz
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); // Yüklenme durumu için state
    const [error, setError] = useState(null); // Hata durumu için state
    const [isSeller, setIsSeller] = useState(true);
    const [cartItems, setCartItems] = useState({});

    // Supabase'den ürünleri çeken asenkron fonksiyon
    const fetchProducts = async () => {
        setLoading(true); // Veri çekme işlemi başlarken loading'i true yap
        setError(null); // Önceki hataları temizle

        const { data, error } = await supabase
            .from('products')
            .select('*'); // Veritabanındaki 'products' tablosundan tüm verileri çek

        if (error) {
            console.error("Supabase'den ürünler alınamadı:", error.message);
            setError(error.message); // Hata varsa state'i güncelle
            setProducts([]); // Ürün listesini boşalt
        } else {
            // Veri başarıyla geldiyse, state'i güncelle
            // image_urls'in JSON string ise array'e çevrildiğinden emin ol
            const formattedProducts = data.map(p => ({
                ...p,
                image_urls: p.image_urls
                    ? Array.isArray(p.image_urls)
                        ? p.image_urls
                        : JSON.parse(p.image_urls)
                    : [],
            }));
            setProducts(formattedProducts);
        }
        setLoading(false); // Veri çekme işlemi bitince loading'i false yap
    };

    // Sayfa ilk yüklendiğinde ürünleri çek
    useEffect(() => {
        fetchProducts();
    }, []);
    
    // Sepet işlemleri (Mevcut kodunuzdaki gibi kalabilir)
    const addToCart = (product) => {
        let cartData = structuredClone(cartItems);
        if (cartData[product.id]) {
            cartData[product.id].quantity += 1;
        } else {
            cartData[product.id] = { product, quantity: 1 };
        }
        setCartItems(cartData);
    };

    const updateCartQuantity = (productId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity <= 0) {
            delete cartData[productId];
        } else {
            cartData[productId].quantity = quantity;
        }
        setCartItems(cartData);
    };

    const getCartCount = () => {
        return Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
    };

    const getCartAmount = () => {
        return Math.floor(Object.values(cartItems).reduce((total, item) => total + item.product.price * item.quantity, 0) * 100) / 100;
    };

    // Context'e sağlanacak değerler
    const value = {
        currency,
        router,
        isSeller,
        setIsSeller,
        products,
        loading, // loading ve error durumlarını da context'e ekliyoruz
        error,
        fetchProducts, // Dilerseniz başka sayfalardan tekrar veri çekmek için bunu da ekleyebilirsiniz
        cartItems,
        setCartItems,
        addToCart,
        updateCartQuantity,
        getCartCount,
        getCartAmount
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};