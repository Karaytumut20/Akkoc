'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

// 1. Context'i oluşturun ve dışa aktarın.
export const AppContext = createContext(undefined);

// 2. Custom Hook'u oluşturun. Bu hook, context'in doğru kullanıldığını kontrol eder.
export const useAppContext = () => {
    const context = useContext(AppContext);
    // Eğer context, Provider'ın dışında kullanılırsa geliştiriciyi uyaran bir hata fırlat.
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};

// 3. Provider bileşenini oluşturun ve dışa aktarın.
export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState({});

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

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
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const isSeller = user?.role === 'seller';
    
    const signUp = async (email, password) => {
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
        router.push('/');
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setCartItems({});
        setUser(null); // Kullanıcı state'ini temizle
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

    const value = {
        currency, router, products, loading, error, fetchProducts,
        cartItems, setCartItems, addToCart, updateCartQuantity, getCartCount, getCartAmount,
        user, authLoading, isSeller, signUp, signIn, signOut
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

