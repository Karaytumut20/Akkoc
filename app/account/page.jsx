// app/account/page.jsx

'use client';
import { useAppContext } from "@/context/AppContext";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Loading from "@/components/Loading";
import Link from "next/link";
import Image from "next/image";
import { FiChevronRight, FiStar, FiBell } from "react-icons/fi";
import toast from "react-hot-toast";
import StarRating from "@/components/StarRating";
import { getSafeImageUrl } from "@/lib/utils";

// ===================================================================
// 1. KONTROL PANELİ (DASHBOARD) COMPONENT'İ
// ===================================================================
const AccountDashboard = () => {
    const { user, myOrders } = useAppContext();
    const latestOrder = myOrders?.[0];

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Hoş Geldiniz, {user?.user_metadata?.full_name || user.email.split('@')[0]}!</h2>
            <p className="text-gray-500 mb-8">Hesap bilgilerinizi buradan yönetebilir ve siparişlerinizi takip edebilirsiniz.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Son Sipariş Kartı */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-3">Son Siparişiniz</h3>
                    {latestOrder ? (
                        <div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500">Sipariş ID:</span>
                                <span className="font-medium text-gray-800">#{latestOrder.id.slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500">Tarih:</span>
                                <span className="font-medium text-gray-800">{new Date(latestOrder.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-4">
                                <span className="text-gray-500">Tutar:</span>
                                <span className="font-bold text-lg text-orange-600">${latestOrder.total_amount.toFixed(2)}</span>
                            </div>
                            <Link href="/account/my-orders" className="text-sm font-semibold text-orange-600 hover:underline flex items-center gap-1">
                                Tüm Siparişleri Gör <FiChevronRight />
                            </Link>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 py-4 text-center">Henüz bir sipariş vermediniz.</p>
                    )}
                </div>
                {/* Hızlı Erişim Kartı */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                     <h3 className="font-semibold text-gray-700 mb-3">Hızlı Erişim</h3>
                     <div className="space-y-2">
                        <Link href="/account/addresses" className="flex items-center justify-between text-sm text-gray-600 hover:text-orange-600 transition group">
                            <span>Adres Bilgilerim</span>
                            <FiChevronRight className="transform transition-transform group-hover:translate-x-1"/>
                        </Link>
                        <Link href="/account/wishlist" className="flex items-center justify-between text-sm text-gray-600 hover:text-orange-600 transition group">
                            <span>Favori Ürünlerim</span>
                            <FiChevronRight className="transform transition-transform group-hover:translate-x-1"/>
                        </Link>
                         <Link href="/account?tab=password" className="flex items-center justify-between text-sm text-gray-600 hover:text-orange-600 transition group">
                            <span>Parola Güvenliği</span>
                            <FiChevronRight className="transform transition-transform group-hover:translate-x-1"/>
                        </Link>
                     </div>
                </div>
            </div>
        </div>
    );
};


// ===================================================================
// 2. PAROLA DEĞİŞTİRME COMPONENT'İ
// ===================================================================
const ChangePassword = () => {
    const { updateUserPassword } = useAppContext();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Parolalar eşleşmiyor!");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Parola en az 6 karakter olmalıdır.");
            return;
        }
        setLoading(true);
        const success = await updateUserPassword(newPassword);
        if (success) {
            setNewPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Parola Değiştir</h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg">
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Yeni Parola</label>
                    <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500" placeholder="••••••••"/>
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Yeni Parolayı Onayla</label>
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500" placeholder="••••••••"/>
                </div>
                <button type="submit" disabled={loading} className="py-2 px-4 text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none disabled:bg-orange-300">
                    {loading ? 'Güncelleniyor...' : 'Parolayı Güncelle'}
                </button>
            </form>
        </div>
    );
};

// ===================================================================
// 3. YORUMLARIM COMPONENT'İ (GÜNCELLENDİ)
// ===================================================================
const MyReviews = () => {
    const { myReviews, authLoading } = useAppContext();

    const getStatusInfo = (isApproved) => {
        return isApproved
            ? { text: 'Onaylandı ve Yayında', color: 'text-green-600' }
            : { text: 'Onay Bekliyor', color: 'text-yellow-600' };
    };
    
    if (authLoading) return <Loading />;

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Yaptığım Değerlendirmeler</h2>
            {myReviews.length === 0 ? (
                 <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                    <FiStar className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                    <p>Henüz herhangi bir ürünü değerlendirmediniz.</p>
                    <p className="text-sm mt-1">Bir ürünü satın aldıktan sonra burada yorum yapabilirsiniz.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {myReviews.map(review => {
                        const status = getStatusInfo(review.is_approved);
                        return (
                            <div key={review.id} className="border-b pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                         <Link href={`/product/${review.products.id}`}>
                                            <div className="relative w-16 h-16 rounded-md overflow-hidden cursor-pointer">
                                                <Image 
                                                    src={getSafeImageUrl(review.products.image_urls)} 
                                                    alt={review.products.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </Link>
                                        <div className="ml-4">
                                            <Link href={`/product/${review.products.id}`}>
                                                <p className="font-semibold text-gray-800 hover:text-orange-600 transition">{review.products.name}</p>
                                            </Link>
                                            <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold ${status.color}`}>{status.text}</span>
                                </div>
                                <div className="mt-3 pl-20">
                                    <StarRating rating={review.rating} />
                                    <p className="text-gray-700 mt-2">{review.comment}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

// ===================================================================
// 4. BİLDİRİM TERCİHLERİ COMPONENT'İ
// ===================================================================
const NotificationPreferences = () => {
     const [preferences, setPreferences] = useState({
        campaigns: true,
        orderStatus: true,
        specialOffers: false,
    });
    const [loading, setLoading] = useState(false);

    const handleToggle = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setLoading(true);
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: 'Tercihler kaydediliyor...',
                success: 'Bildirim tercihleriniz güncellendi!',
                error: 'Bir hata oluştu.',
            }
        ).finally(() => setLoading(false));
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Bildirim ve İletişim İzinleri</h2>
            <div className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <label htmlFor="campaigns" className="font-medium text-gray-700">Kampanya ve indirim E-postaları</label>
                    <button onClick={() => handleToggle('campaigns')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.campaigns ? 'bg-orange-600' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.campaigns ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <label htmlFor="orderStatus" className="font-medium text-gray-700">Sipariş durumu bildirimleri</label>
                    <button onClick={() => handleToggle('orderStatus')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.orderStatus ? 'bg-orange-600' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.orderStatus ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <label htmlFor="specialOffers" className="font-medium text-gray-700">Kişiye özel teklifler</label>
                    <button onClick={() => handleToggle('specialOffers')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.specialOffers ? 'bg-orange-600' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.specialOffers ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
                <button onClick={handleSave} disabled={loading} className="py-2 px-4 mt-4 text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none disabled:bg-orange-300">
                    {loading ? "Kaydediliyor..." : "Tercihleri Kaydet"}
                </button>
            </div>
        </div>
    )
}

// ===================================================================
// ANA SAYFA İÇERİK YÖNETİCİSİ
// ===================================================================
const AccountPageContent = () => {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const renderContent = () => {
        switch (activeTab) {
            case 'password':
                return <ChangePassword />;
            case 'reviews':
                return <MyReviews />;
            case 'notifications':
                return <NotificationPreferences />;
            case 'dashboard':
            default:
                return <AccountDashboard />;
        }
    };

    return <>{renderContent()}</>;
};

// ===================================================================
// SAYFANIN DIŞA AKTARILAN ANA COMPONENT'İ
// ===================================================================
const AccountPage = () => (
    <Suspense fallback={<Loading />}>
        <AccountPageContent />
    </Suspense>
);

export default AccountPage;