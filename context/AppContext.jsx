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
        // 10 dakika
        inactivityTimer.current = setTimeout(signOutAfterInactivity, 10 * 60 * 1000);
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


    // ===============================================
    // YENİ SEPET MANTIKLARI (DB İLE ENTEGRASYON)
    // ===============================================

    const fetchUserCart = async (userId) => {
        const { data: cartData, error } = await supabase
            .from('user_cart')
            .select('product_id, quantity, products(*)') // products(*) ile ürün detaylarını da çekiyoruz
            .eq('user_id', userId);

        if (error) {
            console.error('Sepet veritabanından alınırken hata:', error.message);
            return {};
        }

        if (cartData && cartData.length > 0) {
            const newCartItems = {};
            cartData.forEach(item => {
                if (item.products) {
                    newCartItems[item.product_id] = { 
                        product: { 
                            ...item.products, 
                            image_urls: Array.isArray(item.products.image_urls) ? item.products.image_urls : [],
                        }, 
                        quantity: item.quantity 
                    };
                }
            });
            return newCartItems;
        }
        return {};
    };
    
    // Sepet öğesi güncelleme/silme işlemini DB'de yapan helper fonksiyon
    const updateCartItemDB = useCallback(async (productId, quantity, isRemove = false) => {
        if (!user) return;
        
        if (isRemove || quantity <= 0) {
            // Silme işlemi
            await supabase.from('user_cart').delete().match({ user_id: user.id, product_id: productId });
        } else {
            // Ekleme/Güncelleme işlemi
            const { error } = await supabase.from('user_cart').upsert({
                user_id: user.id,
                product_id: productId,
                quantity: quantity,
            }, { onConflict: 'user_id, product_id' });
            
            if (error) {
                console.error("Sepet DB güncelleme hatası:", error.message);
            }
        }
    }, [user]);

    // Sepeti DB'de temizleyen helper fonksiyon
    const clearCartDB = useCallback(async () => {
        if (!user) return;
        const { error } = await supabase.from('user_cart').delete().eq('user_id', user.id);
        if (error) {
            console.error("Sepet DB temizleme hatası:", error.message);
        }
    }, [user]);

    // Sepete ürün ekleme
    const addToCart = (product) => {
        const currentQuantityInCart = cartItems[product.id]?.quantity || 0;
        if (product.stock <= currentQuantityInCart) {
            return toast.error("Üzgünüz, bu ürünün stoğu tükendi.");
        }

        const newQuantity = currentQuantityInCart + 1;
        setCartItems(prev => ({ ...prev, [product.id]: { product, quantity: newQuantity } }));
        
        if (user) {
            updateCartItemDB(product.id, newQuantity);
        }
        
        toast.success(`${product.name} sepete eklendi!`);
    };

    // Sepet miktarını güncelleme (artırma/azaltma)
    const updateCartQuantity = (productId, quantity) => {
        setCartItems(prev => {
            const newItems = { ...prev };
            const product = newItems[productId]?.product;
            let finalQuantity = quantity;

            if (product) {
                if (quantity > product.stock) {
                    toast.error(`Maksimum ${product.stock} adet ekleyebilirsiniz.`);
                    finalQuantity = product.stock;
                }

                if (finalQuantity <= 0) {
                    delete newItems[productId];
                    // user'ı check etmeye gerek yok, updateCartItemDB içinde zaten var
                    updateCartItemDB(productId, 0, true);
                } else {
                    newItems[productId].quantity = finalQuantity;
                    updateCartItemDB(productId, finalQuantity);
                }
            }
            return newItems;
        });
    };

    // Public API için sepeti set eden fonksiyon
    const setLoadedCartItems = (newItems) => {
        setCartItems(newItems);
    }
    
    // Sepeti temizleyen ve DB'yi de temizleyen tek fonksiyon - useCallback ile sonsuz döngüden kaçınılır
    const clearCart = useCallback(async () => {
        setCartItems({});
        // Sadece user varsa DB'den temizler (Webhook da temizlediği için burada tekrar çağırmak sorun olmaz)
        if (user) { 
            await clearCartDB(); 
        } else {
            // User yoksa local storage'dan temizler
            localStorage.removeItem("cartItems");
        }
    }, [user, clearCartDB]);
    
    // ===============================================
    // USEEFFECT & SYNC MANTIKLARI
    // ===============================================

    // [1] İlk Yükleme: Kullanıcı yoksa localStorage'dan yükle
    useEffect(() => {
        if (!user) {
            try { 
                const storedCart = localStorage.getItem("cartItems"); 
                if (storedCart) {
                     setCartItems(JSON.parse(storedCart));
                } else {
                     setCartItems({});
                }
            } catch (e) { 
                console.error("Local Storage sepet yükleme hatası:", e); 
            }
        }
    }, [user]);

    // [2] Anonim Kullanıcı için Local Storage Sync
    useEffect(() => {
        if (!user) {
            if (Object.keys(cartItems).length > 0) {
                localStorage.setItem("cartItems", JSON.stringify(cartItems));
            } else {
                localStorage.removeItem("cartItems");
            }
        }
        // Not: user var iken sepeti localStorage'a yazmıyoruz.
    }, [cartItems, user]);

    // [3] Kullanıcı Girişi/Çıkışı: DB'den Yükle ve Diğer Verileri Çek
    useEffect(() => {
        if (user) {
            const loadAndSyncCart = async () => {
                const dbCart = await fetchUserCart(user.id);
                const localCartJson = localStorage.getItem("cartItems");
                
                if (Object.keys(dbCart).length === 0 && localCartJson) {
                    // DB boşsa ve localStorage doluysa: localStorage'ı DB'ye taşı
                    const localCart = JSON.parse(localCartJson);
                    const cartItemsToInsert = Object.values(localCart).map(item => ({
                        user_id: user.id,
                        product_id: item.product.id,
                        quantity: item.quantity,
                    }));
                    if (cartItemsToInsert.length > 0) {
                        // Batch insert
                        const { error: insertError } = await supabase.from('user_cart').insert(cartItemsToInsert);
                        if (insertError) {
                            console.error("Local Cart DB'ye taşınırken hata:", insertError.message);
                        }
                    }
                    setCartItems(localCart);
                    localStorage.removeItem("cartItems"); // Taşıma başarılı, localStorage'ı temizle
                } else {
                    // DB doluysa: DB'den çek
                    setCartItems(dbCart);
                    localStorage.removeItem("cartItems"); // DB varken local tutma
                }
                
                // Diğer user verilerini de yükle
                fetchAddresses(user.id);
                fetchMyOrders(user.id);
                fetchWishlist(user.id);
                fetchMyReviews(user.id);
                fetchSavedCards(user.id);
            }
            loadAndSyncCart();
        } else {
            // Kullanıcı çıkış yapınca diğer state'leri sıfırla
            setAddresses([]);
            setMyOrders([]);
            setWishlist([]);
            setMyReviews([]);
            setSavedCards([]);
        }
    }, [user, authLoading]);
    
    // Sepet hesaplama fonksiyonları
    const getCartCount = () => Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
    const getCartAmount = () => Object.values(cartItems).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    useEffect(() => { fetchProducts(); }, []);

    const value = {
        currency, router, products, loading, error, fetchProducts,
        cartItems, setCartItems: setLoadedCartItems, addToCart, updateCartQuantity, getCartCount, getCartAmount, clearCart,
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