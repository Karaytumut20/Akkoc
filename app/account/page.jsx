// app/account/page.jsx

'use client';
import { useAppContext } from "@/context/AppContext";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Loading from "@/components/Loading";
import Link from "next/link";
import Image from "next/image";
import { FiChevronRight, FiStar, FiBell, FiCreditCard } from "react-icons/fi";
import toast from "react-hot-toast";
import StarRating from "@/components/StarRating";
import { getSafeImageUrl } from "@/lib/utils";

// ===================================================================
// DİĞER COMPONENT'LER (Değişiklik yok)
// ===================================================================
const AccountDashboard = () => { /* ... (önceki cevaptaki kodun aynısı) ... */ };
const ChangePassword = () => { /* ... (önceki cevaptaki kodun aynısı) ... */ };
const MyReviews = () => { /* ... (önceki cevaptaki kodun aynısı) ... */ };
const NotificationPreferences = () => { /* ... (önceki cevaptaki kodun aynısı) ... */ };

// ===================================================================
// YENİ: KAYITLI KARTLAR COMPONENT'İ
// ===================================================================
const SavedCards = () => {
    const { savedCards, deleteSavedCard } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Kayıtlı Kartlarım</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-md text-sm">
                    <FiCreditCard />
                    <span>Yeni Kart Ekle</span>
                </button>
            </div>
            
            {savedCards.length > 0 ? (
                <div className="space-y-4">
                    {savedCards.map(card => (
                        <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-4">
                                <img src={`/assets/visa.png`} alt={card.card_brand} className="w-10 h-auto"/>
                                <div>
                                    <p className="font-semibold">**** **** **** {card.last4}</p>
                                    <p className="text-sm text-gray-500">Son Kul. Tar: {card.exp_month}/{card.exp_year}</p>
                                </div>
                            </div>
                            <button onClick={() => {if(confirm('Bu kartı silmek istediğinizden emin misiniz?')) deleteSavedCard(card.id)}} className="text-sm text-red-600 hover:underline">
                                Sil
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                    <FiCreditCard className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                    <p>Henüz kayıtlı bir kartınız bulunmuyor.</p>
                </div>
            )}

            {isModalOpen && <AddCardModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

// ===================================================================
// YENİ: KART EKLEME MODAL'I
// ===================================================================
const AddCardModal = ({ onClose }) => {
    const { addSavedCard } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expMonth: '',
        expYear: '',
        cvc: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if(cardData.cardNumber.length < 16 || cardData.cvc.length < 3) {
            toast.error("Lütfen geçerli kart bilgileri girin.");
            setLoading(false);
            return;
        }
        const success = await addSavedCard(cardData);
        setLoading(false);
        if (success) {
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex justify-between items-center border-b pb-3 mb-5">
                        <h2 className="text-xl font-semibold text-gray-800">Yeni Kart Ekle</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                    <div className="space-y-4">
                        <input name="cardNumber" onChange={handleChange} placeholder="Kart Numarası (örn: 1234...)" className="w-full px-3 py-2 border rounded-md" required />
                        <input name="cardName" onChange={handleChange} placeholder="Kart Üzerindeki İsim" className="w-full px-3 py-2 border rounded-md" required />
                        <div className="flex gap-4">
                            <input name="expMonth" onChange={handleChange} placeholder="AA" className="w-full px-3 py-2 border rounded-md" required />
                            <input name="expYear" onChange={handleChange} placeholder="YY" className="w-full px-3 py-2 border rounded-md" required />
                            <input name="cvc" onChange={handleChange} placeholder="CVC" className="w-full px-3 py-2 border rounded-md" required />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full mt-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400">
                        {loading ? "Kaydediliyor..." : "Kartı Kaydet"}
                    </button>
                </form>
            </div>
        </div>
    );
};


// ANA SAYFA İÇERİK YÖNETİCİSİ
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
            case 'saved-cards': // <-- YENİ CASE
                return <SavedCards />;
            case 'dashboard':
            default:
                return <AccountDashboard />;
        }
    };

    return <>{renderContent()}</>;
};

const AccountPage = () => (
    <Suspense fallback={<Loading />}>
        <AccountPageContent />
    </Suspense>
);

export default AccountPage;