'use client'
// Bu dosya, uygulamanın genel state yönetimini ve kimlik doğrulama (authentication)
// işlemlerini yöneten ana context dosyasıdır. İstekleriniz doğrultusunda, rol (seller/customer)
// ayrımı tamamen kaldırılmış ve daha basit bir yapıya geçilmiştir.

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

    // AUTH STATE CHANGE LISTENER (Oturum yönetimi)
    useEffect(() => {
        setAuthLoading(true);
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user;
            setUser(currentUser || null); // Rol bilgisi olmadan sadece kullanıcıyı set et
            if (!currentUser) {
                // Kullanıcı çıkış yaptığında ilgili state'leri temizle
                setCartItems({});
                setAddresses([]);
                setMyOrders([]);
            }
            setAuthLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    
    // AUTH FUNCTIONS (Rol mantığı kaldırıldı)
    const signUp = async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            toast.error(error.message);
            return false;
        }
        // Profil tablosuna rol ekleme işlemi kaldırıldı
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
            // Rol kontrolü yok, sadece nereden giriş yapıldığına göre yönlendir
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
        router.push('/'); // Çıkış yapınca ana sayfaya yönlendir
        toast.success('Başarıyla çıkış yapıldı.');
    }, [router]);
    
    // DATA FETCHING FUNCTIONS
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
    
    useEffect(() => {
        if (user) {
            fetchAddresses(user.id);
            fetchMyOrders(user.id);
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
            router.back();
        } catch (error) {
            toast.error("Adres eklenirken hata: " + error.message, { id: toastId });
        }
    };

    // CART & ORDER
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
        setCartItems(prev => ({ ...prev, [product.id]: { product, quantity: (prev[product.id]?.quantity || 0) + 1 } }));
        toast.success(`${product.name} sepete eklendi!`);
    };

    const updateCartQuantity = (productId, quantity) => {
        setCartItems(prev => {
            const newItems = { ...prev };
            if (quantity <= 0) delete newItems[productId];
            else if (newItems[productId]) newItems[productId].quantity = quantity;
            return newItems;
        });
    };

    const getCartCount = () => Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
    const getCartAmount = () => Object.values(cartItems).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    const placeOrder = async (addressId) => {
        if (!user) return toast.error('Sipariş vermek için giriş yapmalısınız.');
        if (Object.keys(cartItems).length === 0) return toast.error('Sepetiniz boş.');
        const selectedAddress = addresses.find(addr => addr.id === addressId);
        if (!selectedAddress) return toast.error('Lütfen bir teslimat adresi seçin.');

        const toastId = toast.loading('Siparişiniz oluşturuluyor...');
        try {
            const { data: orderData, error: orderError } = await supabase.from('orders').insert([{ user_id: user.id, total_amount: getCartAmount(), address: selectedAddress, status: 'Hazırlanıyor' }]).select().single();
            if (orderError) throw orderError;

            const orderItems = Object.values(cartItems).map(item => ({ order_id: orderData.id, product_id: item.product.id, quantity: item.quantity, price: item.product.price }));
            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            setCartItems({});
            toast.success('Siparişiniz başarıyla oluşturuldu!', { id: toastId });
            router.push('/order-placed');
        } catch (error) {
            toast.error('Sipariş hatası: ' + error.message, { id: toastId });
        }
    };
    useEffect(() => { fetchProducts(); }, []);

    const value = {
        currency, router, products, loading, error, fetchProducts,
        cartItems, setCartItems, addToCart, updateCartQuantity, getCartCount, getCartAmount,
        user, authLoading, signUp, signIn, signOut, // isSeller kaldırıldı
        addresses, fetchAddresses, addAddress,
        myOrders, fetchMyOrders,
        placeOrder, getSafeImageUrl
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
