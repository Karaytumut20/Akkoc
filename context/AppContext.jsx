'use client'
// Bu dosya, uygulamanın genel state yönetimini ve kimlik doğrulama (authentication)
// işlemlerini yöneten ana context dosyasıdır. İstekleriniz doğrultusunda, seller (satıcı)
// sayfası için özel oturum yönetimi eklenmiş ve güvenlik artırılmıştır.

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
    
    // Oturum zaman aşımı için referans
    const inactivityTimer = useRef(null);

    // Otomatik çıkış fonksiyonu
    const signOutAfterInactivity = useCallback(() => {
        toast('Oturum süreniz doldu, otomatik olarak çıkış yapıldı.', { icon: '👋' });
        supabase.auth.signOut();
        setCartItems({});
        setUser(null);
        setAddresses([]);
        setMyOrders([]);
        // Kullanıcıyı rolüne göre doğru giriş sayfasına yönlendir
        if (window.location.pathname.startsWith('/seller')) {
            router.push('/seller');
        } else {
            router.push('/auth');
        }
    }, [router]);

    // Oturum zamanlayıcısını sıfırlayan fonksiyon
    const resetInactivityTimer = useCallback(() => {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(signOutAfterInactivity, 10 * 60 * 1000); // 10 dakika
    }, [signOutAfterInactivity]);


    // Kullanıcı aktivitesini dinleyip zamanlayıcıyı sıfırlama
    useEffect(() => {
        if (user) {
            const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
            events.forEach(event => window.addEventListener(event, resetInactivityTimer));
            resetInactivityTimer(); // İlk zamanlayıcıyı başlat

            return () => {
                events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
                clearTimeout(inactivityTimer.current);
            };
        }
    }, [user, resetInactivityTimer]);


    // AUTH STATE CHANGE LISTENER (Oturum kalıcılığı için)
    useEffect(() => {
        setAuthLoading(true);
        const fetchUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                const role = profile?.role || 'customer';
                const userData = { ...session.user, role };
                setUser(userData);
            }
            setAuthLoading(false);
        };

        fetchUserSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user;
             if (currentUser) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
                const role = profile?.role || 'customer';
                const userData = { ...currentUser, role };
                setUser(userData);
            } else {
                setUser(null);
                setAddresses([]);
                setMyOrders([]);
            }
            setAuthLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // isSeller state'i
    const isSeller = user?.role === 'seller';
    
    // AUTH FUNCTIONS
    const signUp = async (email, password) => {
        const { data: signUpData, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            toast.error(error.message);
            return false;
        }
        
        if (signUpData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{ id: signUpData.user.id, role: 'customer' }]);
            
            if (profileError) {
                 console.error("Profil (Rol) atama hatası:", profileError.message);
            }
        }

        toast.success('Kayıt başarılı! Lütfen e-postanızı doğrulayın.');
        return true;
    };

    // GÜNCELLENMİŞ SIGN IN FONKSİYONU
    const signIn = async (email, password, source = 'customer') => {
        const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (authError) {
            toast.error('Kullanıcı adı veya parola hatalı.');
            return null;
        }
        
        if (signInData.user) {
            const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', signInData.user.id).single();
            
            if (profileError || !profile) {
                toast.error("Giriş başarılı, ancak profil bilgisi alınamadı.");
                await supabase.auth.signOut();
                return null;
            }
            
            const role = profile.role;

            // Satıcı giriş sayfasından sadece satıcılar girebilir
            if (source === 'seller' && role !== 'seller') {
                toast.error('Bu alan sadece satıcılara özeldir.');
                await supabase.auth.signOut();
                return null;
            }
            
            // Müşteri giriş sayfasından sadece müşteriler girebilir
            if (source === 'customer' && role === 'seller') {
                toast.error('Satıcılar bu sayfadan giriş yapamaz. Lütfen satıcı panelini kullanın.');
                await supabase.auth.signOut();
                return null;
            }
            
            const userData = { ...signInData.user, role };
            setUser(userData); // Bu state güncellemesi onAuthStateChange'i tetikleyecek
            toast.success('Giriş başarılı!');

            if (role === 'seller') {
                router.push('/seller/product-list');
            } else {
                router.push('/');
            }

            return userData;
        }
        
        return null;
    };

    const signOut = useCallback(async () => {
        const currentPath = window.location.pathname;
        await supabase.auth.signOut();
        
        // Timer'ı temizle
        clearTimeout(inactivityTimer.current);

        // State'leri sıfırla
        setCartItems({});
        setUser(null);
        setAddresses([]);
        setMyOrders([]);
        
        // Yönlendirme yap
        if (currentPath.startsWith('/seller')) {
            router.push('/seller');
        } else {
            router.push('/');
        }
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
        if (!userId || isSeller) return;
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
        user, authLoading, isSeller, signUp, signIn, signOut,
        addresses, fetchAddresses, addAddress,
        myOrders, fetchMyOrders,
        placeOrder, getSafeImageUrl
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
