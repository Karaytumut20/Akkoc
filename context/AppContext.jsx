'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

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

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authUser.id)
                    .single();
                
                setUser({ ...authUser, role: profile?.role || 'customer' });
                fetchAddresses(authUser.id);
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        };

        fetchUserAndProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user;
            if (currentUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', currentUser.id)
                    .single();
                setUser({ ...currentUser, role: profile?.role || 'customer' });
                fetchAddresses(currentUser.id);
            } else {
                setUser(null);
                setAddresses([]);
            }
            setAuthLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const isSeller = user?.role === 'seller';
    
    const signUp = async (email, password) => {
        // Sadece kullanıcıyı kaydediyoruz. Profil oluşturma işlemi
        // artık veritabanındaki tetikleyici tarafından otomatik olarak yapılıyor.
        const { error } = await supabase.auth.signUp({ email, password });
        
        if (error) {
            toast.error(error.message);
            return; 
        }

        toast.success('Kayıt başarılı! Lütfen e-postanızı doğrulayın.');
        router.push('/');
    };

    const signIn = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success('Giriş başarılı!');
        // Otomatik yönlendirme kaldırıldı, artık bu işlemi çağıran sayfa/layout yönetecek.
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setCartItems({});
        setUser(null);
        setAddresses([]);
        router.push('/');
        toast.success('Başarıyla çıkış yapıldı.');
    };
    
    const fetchProducts = async () => {
        setLoading(true); setError(null);
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
            setError(error.message); setProducts([]);
        } else {
            const formattedProducts = (data || []).map(p => {
                let imageUrls = [];
                try {
                    imageUrls = Array.isArray(p.image_urls) ? p.image_urls : JSON.parse(p.image_urls || '[]');
                } catch {}
                return { ...p, image_urls: imageUrls };
            });
            setProducts(formattedProducts);
        }
        setLoading(false);
    };

    const fetchAddresses = async (userId) => {
        if (!userId) return;
        const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) {
            toast.error("Adresler alınamadı: " + error.message);
        } else {
            setAddresses(data || []);
        }
    };

    const addAddress = async (addressData) => {
        if (!user) {
            toast.error("Adres eklemek için giriş yapmalısınız.");
            return;
        }
        const toastId = toast.loading("Adresiniz ekleniyor...");
        try {
            const { error } = await supabase.from('addresses').insert({ ...addressData, user_id: user.id });
            if (error) throw error;
            await fetchAddresses(user.id);
            toast.success("Adres başarıyla eklendi!", { id: toastId });
            router.back();
        } catch (error) {
            toast.error("Adres eklenirken bir hata oluştu: " + error.message, { id: toastId });
        }
    };

    useEffect(() => { fetchProducts(); }, []);
    useEffect(() => {
        try { const storedCart = localStorage.getItem("cartItems"); if (storedCart) setCartItems(JSON.parse(storedCart)); } catch (e) { console.error(e); }
    }, []);
    useEffect(() => { localStorage.setItem("cartItems", JSON.stringify(cartItems)); }, [cartItems]);

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
        if (!user) {
            toast.error('Sipariş vermek için giriş yapmalısınız.');
            router.push('/auth');
            return;
        }
        if (Object.keys(cartItems).length === 0) {
            toast.error('Sepetiniz boş.');
            return;
        }
        const selectedAddress = addresses.find(addr => addr.id === addressId);
        if (!selectedAddress) {
            toast.error('Lütfen bir teslimat adresi seçin.');
            return;
        }

        const toastId = toast.loading('Siparişiniz oluşturuluyor...');

        try {
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    total_amount: getCartAmount(),
                    address: selectedAddress,
                    status: 'Hazırlanıyor'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            const orderItems = Object.values(cartItems).map(item => ({
                order_id: orderData.id,
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.product.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            setCartItems({});
            localStorage.removeItem('cartItems');
            
            toast.success('Siparişiniz başarıyla oluşturuldu!', { id: toastId });
            router.push('/order-placed');

        } catch (error) {
            toast.error('Sipariş oluşturulurken bir hata oluştu: ' + error.message, { id: toastId });
        }
    };

    const value = {
        currency, router, products, loading, error, fetchProducts,
        cartItems, setCartItems, addToCart, updateCartQuantity, getCartCount, getCartAmount,
        user, authLoading, isSeller, signUp, signIn, signOut,
        addresses, fetchAddresses, addAddress,
        placeOrder
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};