// context/AppContext.jsx

'use client'

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { getSafeImageUrl } from "@/lib/utils";

export const AppContext = createContext(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};

export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState({});
    
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    
    const [addresses, setAddresses] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [savedCards, setSavedCards] = useState([]);

    const inactivityTimer = useRef(null);

    const signOutAfterInactivity = useCallback(() => {
        toast('Oturum süreniz doldu, otomatik olarak çıkış yapıldı.', { icon: '👋' });
        supabase.auth.signOut();
    }, []);

    const resetInactivityTimer = useCallback(() => {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(signOutAfterInactivity, 10 * 60 * 1000); // 10 dakika
    }, [signOutAfterInactivity]);

    useEffect(() => {
        if (user) {
            const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
            events.forEach(event => window.addEventListener(event, resetInactivityTimer));
            resetInactivityTimer();

            return () => {
                events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
                clearTimeout(inactivityTimer.current);
            };
        }
    }, [user, resetInactivityTimer]);

    useEffect(() => {
        setAuthLoading(true);
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user;
            setUser(currentUser || null);
            if (!currentUser) {
                setCartItems({});
                setAddresses([]);
                setMyOrders([]);
                setWishlist([]);
                setMyReviews([]);
                setSavedCards([]);
            }
            setAuthLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    
    const signUp = async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            toast.error(error.message);
            return false;
        }
        toast.success('Kayıt başarılı! Lütfen e-postanızı doğrulayın.');
        return true;
    };

    const signIn = async (email, password, source) => {
        const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (authError) {
            toast.error('Kullanıcı adı veya parola hatalı.');
            return;
        }
        
        if (signInData.user) {
            toast.success('Giriş başarılı!');
            if (source === 'seller') {
                router.push('/seller/product-list');
            } else {
                router.push('/');
            }
        }
    };

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        clearTimeout(inactivityTimer.current);
        router.push('/');
        toast.success('Başarıyla çıkış yapıldı.');
    }, [router]);
    
    const changeUserPassword = async (currentPassword, newPassword) => {
        if (!user) {
            toast.error("Bu işlem için giriş yapmış olmalısınız.");
            return false;
        }
        const toastId = toast.loading("İşlem yürütülüyor...");
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });
            if (signInError) {
                throw new Error("Mevcut parolanız hatalı.");
            }
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (updateError) {
                throw new Error("Parola güncellenirken bir hata oluştu: " + updateError.message);
            }
            toast.success("Parolanız başarıyla güncellendi!", { id: toastId });
            return true;
        } catch (error) {
            toast.error(error.message, { id: toastId });
            return false;
        }
    };

    const updateUserData = async (data) => {
        const toastId = toast.loading("Bilgileriniz güncelleniyor...");
        const { error } = await supabase.auth.updateUser({ data });
        if (error) {
            toast.error("Bilgiler güncellenirken hata: " + error.message, { id: toastId });
            return false;
        }
        toast.success("Bilgileriniz başarıyla güncellendi!", { id: toastId });
        return true;
    };

    const fetchProducts = async () => {
        setLoading(true); setError(null);
        const { data, error } = await supabase.from('products').select('*, categories(name)');
        if (error) {
            setError(error.message); setProducts([]);
        } else {
            const formattedProducts = (data || []).map(p => ({
                ...p,
                image_urls: Array.isArray(p.image_urls) ? p.image_urls : [],
            }));
            setProducts(formattedProducts);
        }
        setLoading(false);
    };

    const fetchAddresses = async (userId) => {
        if (!userId) return;
        const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (!error) setAddresses(data || []);
    };

    const fetchMyOrders = async (userId) => {
        if (!userId) return;
        const { data, error } = await supabase.from('orders').select(`*, order_items(*, products(*, categories(name)))`).eq('user_id', userId).order('created_at', { ascending: false });
        if (!error) setMyOrders(data || []);
    };

    const fetchWishlist = async (userId) => {
        if (!userId) return;
        const { data, error } = await supabase
            .from('wishlist')
            .select('*, product:products(*)')
            .eq('user_id', userId);

        if (!error) {
            setWishlist(data || []);
        }
    };

    const fetchMyReviews = async (userId) => {
        if (!userId) return;
        const { data, error } = await supabase
            .from('reviews')
            .select(`*, products (id, name, image_urls)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
    
        if (!error) {
            setMyReviews(data || []);
        }
    };

    const fetchSavedCards = async (userId) => {
        if (!userId) return;
        const { data, error } = await supabase
            .from('saved_cards')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error) {
            setSavedCards(data || []);
        }
    };
    
    const addSavedCard = async (cardData) => {
        if (!user) return toast.error("Kart eklemek için giriş yapmalısınız.");
        
        const fakeToken = `tok_${Math.random().toString(36).substr(2, 14)}`;
        const last4 = cardData.cardNumber.slice(-4);
        const cardBrand = "visa"; 

        const { error } = await supabase.from('saved_cards').insert({
            user_id: user.id,
            card_brand: cardBrand,
            last4: last4,
            exp_month: parseInt(cardData.expMonth),
            exp_year: parseInt(cardData.expYear),
            payment_provider_token: fakeToken,
        });

        if (error) {
            toast.error("Kart eklenirken bir hata oluştu: " + error.message);
            return false;
        } else {
            toast.success("Kart başarıyla eklendi!");
            fetchSavedCards(user.id);
            return true;
        }
    };

    const deleteSavedCard = async (cardId) => {
        if (!user) return toast.error("Bu işlem için giriş yapmalısınız.");

        const { error } = await supabase.from('saved_cards').delete().eq('id', cardId);

        if (error) {
            toast.error("Kart silinirken bir hata oluştu: " + error.message);
        } else {
            toast.success("Kart başarıyla silindi.");
            setSavedCards(prev => prev.filter(card => card.id !== cardId));
        }
    };

    const addToWishlist = async (productId) => {
        if (!user) return toast.error("Favorilere eklemek için giriş yapmalısınız.");
        const { error } = await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
        if (error) {
            toast.error("Bu ürün zaten favorilerinizde.");
        } else {
            toast.success("Ürün favorilere eklendi!");
            fetchWishlist(user.id);
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user) return;
        const { error } = await supabase.from('wishlist').delete().match({ user_id: user.id, product_id: productId });
        if (error) {
            toast.error("Favorilerden kaldırırken hata oluştu.");
        } else {
            toast.success("Ürün favorilerden kaldırıldı!");
            fetchWishlist(user.id);
        }
    };
    
    useEffect(() => {
        if (user) {
            fetchAddresses(user.id);
            fetchMyOrders(user.id);
            fetchWishlist(user.id);
            fetchMyReviews(user.id);
            fetchSavedCards(user.id);
        }
    }, [user]);

    const addAddress = async (addressData) => {
        if (!user) return toast.error("Adres eklemek için giriş yapmalısınız.");
        const toastId = toast.loading("Adresiniz ekleniyor...");
        try {
            const { error } = await supabase.from('addresses').insert({ ...addressData, user_id: user.id });
            if (error) throw error;
            await fetchAddresses(user.id);
            toast.success("Adres başarıyla eklendi!", { id: toastId });
            return true;
        } catch (error) {
            toast.error("Adres eklenirken hata: " + error.message, { id: toastId });
            return false;
        }
    };
    
    const updateAddress = async (addressId, addressData) => {
        if (!user) return toast.error("Adres güncellemek için giriş yapmalısınız.");
        const toastId = toast.loading("Adresiniz güncelleniyor...");
        try {
            const { id, user_id, created_at, ...updateData } = addressData;
            const { error } = await supabase.from('addresses').update(updateData).eq('id', addressId);
            if (error) throw error;
            await fetchAddresses(user.id);
            toast.success("Adres başarıyla güncellendi!", { id: toastId });
            return true;
        } catch (error) {
            toast.error("Adres güncellenirken hata: " + error.message, { id: toastId });
            return false;
        }
    };

    const deleteAddress = async (addressId) => {
        if (!user) return toast.error("Adres silmek için giriş yapmalısınız.");
        const toastId = toast.loading("Adresiniz siliniyor...");
        try {
            const { error } = await supabase.from('addresses').delete().eq('id', addressId);
            if (error) throw error;
            setAddresses(prev => prev.filter(addr => addr.id !== addressId));
            toast.success("Adres başarıyla silindi!", { id: toastId });
        } catch (error) {
            toast.error("Adres silinirken hata: " + error.message, { id: toastId });
        }
    };


    useEffect(() => {
        try { const storedCart = localStorage.getItem("cartItems"); if (storedCart) setCartItems(JSON.parse(storedCart)); } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        if (Object.keys(cartItems).length > 0) {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
        } else {
            localStorage.removeItem("cartItems");
        }
    }, [cartItems]);

    const addToCart = (product) => {
        const currentQuantityInCart = cartItems[product.id]?.quantity || 0;
        if (product.stock <= currentQuantityInCart) {
            return toast.error("Üzgünüz, bu ürünün stoğu tükendi.");
        }

        setCartItems(prev => ({ ...prev, [product.id]: { product, quantity: (prev[product.id]?.quantity || 0) + 1 } }));
        toast.success(`${product.name} sepete eklendi!`);
    };

    const updateCartQuantity = (productId, quantity) => {
        setCartItems(prev => {
            const newItems = { ...prev };
            const product = newItems[productId]?.product;

            if (product && quantity > product.stock) {
                toast.error(`Maksimum ${product.stock} adet ekleyebilirsiniz.`);
                newItems[productId].quantity = product.stock;
                return newItems;
            }

            if (quantity <= 0) delete newItems[productId];
            else if (newItems[productId]) newItems[productId].quantity = quantity;
            return newItems;
        });
    };

    const getCartCount = () => Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
    const getCartAmount = () => Object.values(cartItems).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    useEffect(() => { fetchProducts(); }, []);

    const value = {
        currency, router, products, loading, error, fetchProducts,
        cartItems, setCartItems, addToCart, updateCartQuantity, getCartCount, getCartAmount,
        user, authLoading, signUp, signIn, signOut, 
        changeUserPassword, 
        updateUserData,
        addresses, fetchAddresses, addAddress, updateAddress, deleteAddress,
        myOrders, fetchMyOrders,
        myReviews,
        getSafeImageUrl,
        wishlist, addToWishlist, removeFromWishlist,
        savedCards, addSavedCard, deleteSavedCard
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};