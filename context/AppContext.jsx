'use client'
// Bu dosya, uygulamanın genel state yönetimini ve kimlik doğrulama (authentication)
// işlemlerini yöneten ana context dosyasıdır. İsteğiniz üzerine, sadece 'customer'
// rolüne sahip kullanıcıların normal giriş yapabilmesi için `signIn` fonksiyonunu güncelledim.
// Satıcılar kendi panellerinden giriş yapmaya devam edebilirler.

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
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

    // AUTH STATE CHANGE LISTENER
    useEffect(() => {
        const fetchUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Kullanıcının rolünü profilden çek
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
                const role = profile?.role || 'customer';
                
                // Müşteri rolü yoksa veya belirlenemiyorsa varsayılan müşteri rolü verilebilir,
                // ancak Supabase'de profile tablosunu kontrol etmek en doğrusu.
                const userData = { ...session.user, role };
                
                setUser(userData);
                await fetchAddresses(session.user.id);
                
                // Satıcı değilse (yani müşteriyse) siparişleri çek
                if (role !== 'seller') {
                    await fetchMyOrders(session.user.id);
                }
            }
            setAuthLoading(false);
        };

        fetchUserSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user;
             if (currentUser) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).maybeSingle();
                const role = profile?.role || 'customer';
                
                const userData = { ...currentUser, role };
                setUser(userData);
                
                await fetchAddresses(currentUser.id);
                
                // Satıcı değilse (yani müşteriyse) siparişleri çek
                 if (role !== 'seller') {
                    await fetchMyOrders(currentUser.id);
                }
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

    const isSeller = user?.role === 'seller';
    
    // AUTH FUNCTIONS
    const signUp = async (email, password) => {
        const { data: signInData, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            toast.error(error.message);
            return false;
        }
        
        // Yeni kaydolan kullanıcıya otomatik olarak 'customer' rolü atayalım (örnek olarak)
        if (signInData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{ id: signInData.user.id, role: 'customer' }]);
            
            if (profileError) {
                 // Hata olsa bile kullanıcıyı kaydettik, sadece rolü atayamadık.
                 console.error("Profil (Rol) atama hatası:", profileError.message);
            }
        }

        toast.success('Kayıt başarılı! Lütfen e-postanızı doğrulayın.');
        return true;
    };

    // GÜNCELLENMİŞ SIGN IN FONKSİYONU
    const signIn = async (email, password) => {
        // Önce Supabase ile giriş yapmayı dene
        const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (authError) {
            // Kimlik doğrulama başarısız olursa (yanlış şifre/email), Supabase zaten hata mesajı döner.
            toast.error('Kullanıcı adı veya parola hatalı.');
            return { user: null, profile: null, error: authError };
        }
        
        // Giriş başarılı, şimdi profil rolünü kontrol et.
        if (signInData.user) {
            const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', signInData.user.id).maybeSingle();
            
            if (profileError) {
                // Profil verisi alınamazsa genel hata göster ve oturumu kapatma.
                toast.error("Giriş başarılı, ancak profil bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.");
                return { user: null, profile: null, error: profileError };
            }
            
            const role = profile?.role || 'customer';

            // Rol kontrolü: Müşteri giriş sayfasındayken satıcı girişi engelleniyor.
            // window.location.pathname'i kontrol ederek, sadece ana giriş sayfasında bu kısıtlamayı uyguluyoruz.
            if (window.location.pathname === '/auth' && role === 'seller') {
                // Satıcıysa hata verip oturumu hemen kapat.
                await supabase.auth.signOut(); 
                setUser(null);
                // Kullanıcının istediği hata mesajını göster
                toast.error('Kullanıcı adı veya parola hatalı.');
                return { user: null, profile: null, error: new Error('Satıcı girişi engellendi.') };
            }
            
            // Oturumu ayarla ve yönlendir
            const userData = { ...signInData.user, role };
            setUser(userData);
            toast.success('Giriş başarılı!');

            // Giriş sonrası yönlendirme
            if (role === 'seller') {
                // Satıcılar doğrudan satıcı paneline yönlendirilmeli (Bu kod, '/seller' sayfasındaki giriş formu için geçerli olacak.)
                router.push('/seller/product-list');
            } else {
                // Müşteriler ana sayfaya yönlendirilmeli
                router.push('/');
            }

            return { user: signInData.user, profile: { role }, error: null };
        }
        
        // Eğer Supabase login başarılı oldu ama user gelmediyse (ki nadir bir durum)
        return { user: null, profile: null, error: new Error('Bilinmeyen bir hata oluştu.') };
    };

    const signOut = async () => {
        const currentPath = window.location.pathname;
        await supabase.auth.signOut();
        setCartItems({});
        setUser(null);
        setAddresses([]);
        setMyOrders([]);
        
        // Eğer satıcı panelindeyse, satıcı giriş sayfasına yönlendir.
        if (currentPath.startsWith('/seller')) {
            router.push('/seller');
        } else {
            router.push('/');
        }
        toast.success('Başarıyla çıkış yapıldı.');
    };
    
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
