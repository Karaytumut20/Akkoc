'use client';
import React, { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getSafeImageUrl } from "@/lib/utils";

const MyOrders = () => {
    const { currency, myOrders, fetchMyOrders, user, authLoading, isSeller, isAdmin, router } = useAppContext();

    useEffect(() => {
        // Yetkisiz rol kontrolü
        if (!authLoading && (isSeller || isAdmin)) {
            router.replace('/');
            return;
        }

        if (user && !isSeller && !isAdmin) {
            fetchMyOrders(user.id);
        }
    }, [user, isSeller, isAdmin, authLoading]);

    // Sipariş durumuna göre renk belirleyen fonksiyon
    const getStatusColor = (status) => {
        switch (status) {
            case 'Teslim Edildi': return 'bg-green-100 text-green-800';
            case 'Kargolandı': return 'bg-blue-100 text-blue-800';
            case 'İptal Edildi': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800'; // Hazırlanıyor
        }
    };
    
    // Yetkili olmayan kullanıcılar için yönlendirme sonrası yükleme veya giriş ekranı
    if (authLoading || isSeller || isAdmin) return <Loading />;
    if (!user) return (
        <>
            <Navbar />
            <div className="text-center py-20 min-h-[70vh]">Lütfen siparişlerinizi görmek için giriş yapın.</div>
            <Footer />
        </>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-[70vh] px-4 sm:px-6 md:px-16 lg:px-32 py-10">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-gray-800 border-b pb-4">Siparişlerim</h1>
                {myOrders.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p>Henüz hiç sipariş vermediniz.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {myOrders.map(order => (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                    <div>
                                        <p className="font-bold text-gray-800">Sipariş ID: #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold text-lg">{currency}{order.total_amount.toFixed(2)}</p>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t pt-4 mt-4">
                                    {order.order_items.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 mb-3">
                                            <Image 
                                                src={getSafeImageUrl(item.products.image_urls)}
                                                alt={item.products.name}
                                                width={64}
                                                height={64}
                                                className="rounded-md object-cover w-16 h-16"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800">{item.products.name}</p>
                                                <p className="text-sm text-gray-600">{item.quantity} x {currency}{item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;
