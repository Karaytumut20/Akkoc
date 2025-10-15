'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const Orders = () => {
    const { currency, getSafeImageUrl } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_orders_with_details');

        if (error) {
            toast.error("Siparişler alınamadı: " + error.message);
            setOrders([]);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSellerOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        // Arayüzü anında güncelle
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );

        // YENİ ve GÜVENLİ YÖNTEM: RPC fonksiyonunu çağır
        const { error } = await supabase.rpc('update_order_status', {
            order_id: orderId,
            new_status: newStatus
        });

        if (error) {
            toast.error("Durum güncellenirken bir hata oluştu: " + error.message);
            // Hata olursa listeyi yeniden çekerek eski haline getir
            fetchSellerOrders();
        } else {
            toast.success("Sipariş durumu başarıyla güncellendi!");
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between text-sm p-4 sm:p-6 lg:p-8">
            <div>
                <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-4">
                    Gelen Siparişler
                </h1>
                
                {orders.length === 0 ? (
                    <p className="text-center text-xl text-gray-500 py-10">Henüz sipariş bulunmuyor.</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4 mb-4">
                                    <div>
                                        <p className="font-semibold text-gray-800">Sipariş ID</p>
                                        <p className="text-xs text-gray-500">#{order.id.slice(0, 8)}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Tarih</p>
                                        <p>{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Müşteri</p>
                                        <p>{order.user_email || 'Bilinmiyor'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">Toplam Tutar</p>
                                        <p className="text-lg font-bold text-indigo-600">{currency}{order.total_amount.toFixed(2)}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-gray-700">Ürünler</h4>
                                        <div className="space-y-3">
                                            {order.items?.map((item, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <Image 
                                                        src={getSafeImageUrl(item.image_urls)}
                                                        alt={item.product_name}
                                                        width={48}
                                                        height={48}
                                                        className="rounded-md object-cover w-12 h-12 border"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{item.product_name}</p>
                                                        <p className="text-xs text-gray-600">{item.quantity} x {currency}{item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                         <h4 className="font-semibold mb-2 text-gray-700">Teslimat Adresi</h4>
                                         <div className="text-gray-600 text-xs sm:text-sm">
                                            <p className="font-medium">{order.address?.full_name}</p>
                                            <p>{order.address?.area}</p>
                                            <p>{order.address?.city}, {order.address?.state}</p>
                                            <p>{order.address?.phone_number}</p>
                                         </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                    <p className="font-semibold text-gray-700">Sipariş Durumu:</p>
                                    <select 
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="Hazırlanıyor">Hazırlanıyor</option>
                                        <option value="Kargolandı">Kargolandı</option>
                                        <option value="Teslim Edildi">Teslim Edildi</option>
                                        <option value="İptal Edildi">İptal Edildi</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;