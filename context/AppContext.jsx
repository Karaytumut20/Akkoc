'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState(false);
    const [isSeller, setIsSeller] = useState(true);
    const [cartItems, setCartItems] = useState({}); 
    // cartItems: { productId: { product, quantity } }

    // Ürünleri çek
    const fetchProductData = async () => {
        setProducts(productsDummyData);
    };

    const fetchUserData = async () => {
        setUserData(userDummyData);
    };

    // Sepete ürün ekle
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

    useEffect(() => { fetchProductData(); }, []);
    useEffect(() => { fetchUserData(); }, []);

    const value = {
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
