'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { getSafeImageUrl } from "@/lib/utils";

const Orders = () => {
    const { currency } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(null); // Hangi siparişin güncellendiğini takip etmek için

    // Sipariş durum seçenekleri
    const orderStatuses = ['Hazırlanıyor', 'Kargolandı', 'Teslim Edildi', 'İptal Edildi'];

    const fetchSellerOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (
                        name,
                        image_urls
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Siparişler alınamadı: ' + error.message);
            console.error(error);
            setOrders([]);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSellerOrders();
    }, []);

    // Sipariş durumunu güncelleyen ve veritabanına kaydeden fonksiyon
    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingStatus(orderId); // Arayüzde güncellemenin başladığını belirt
        
        // Supabase veritabanındaki 'orders' tablosunu güncelle
        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus }) // 'status' sütununu yeni değerle set et
            .eq('id', orderId) // Hangi siparişin güncelleneceğini belirt
            .select(); // Güncellenen veriyi geri al

        if (error) {
            toast.error('Durum güncellenirken bir hata oluştu: ' + error.message);
        } else {
            toast.success(`Sipariş durumu "${newStatus}" olarak güncellendi.`);
            // Arayüzü de anında güncellemek için state'i set et
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        }
        setUpdatingStatus(null); // Güncelleme bitti
    };

    // Sipariş durumuna göre renk döndüren yardımcı fonksiyon
    const getStatusColor = (status) => {
        switch (status) {
            case 'Teslim Edildi': return 'bg-green-100 text-green-800';
            case 'Kargolandı': return 'bg-blue-100 text-blue-800';
            case 'İptal Edildi': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between text-sm">
            {loading ? <Loading /> : (
                <div className="md:p-10 p-4 space-y-5">
                    <h2 className="text-2xl font-bold text-gray-800">Gelen Siparişler</h2>

                    {orders.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Henüz sipariş bulunmuyor.</p>
                    ) : (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            {orders.map((order) => (
                                <div key={order.id} className="border-b last:border-b-0">
                                    <div className="p-5 flex flex-col md:flex-row gap-5 justify-between items-start">
                                        <div className="flex-1 flex gap-5">
                                            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                                <Image
                                                    className="w-full h-full object-cover"
                                                    src={getSafeImageUrl(order.order_items[0]?.products?.image_urls)}
                                                    alt={order.order_items[0]?.products?.name || 'Ürün Resmi'}
                                                    width={80}
                                                    height={80}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="font-bold text-base text-gray-800">
                                                    Sipariş #{order.id.slice(0, 8)}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {order.order_items.map(item => `${item.products.name} x ${item.quantity}`).join(", ")}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">Sipariş Tarihi:</span> {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                                 <p className="text-xs text-gray-500">
                                                    <span className="font-medium">Müşteri ID:</span> {order.user_id ? order.user_id.slice(0, 12) + '...' : 'Bilinmiyor'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-700">
                                            <p className="font-medium">{order.address.full_name}</p>
                                            <p>{order.address.area}</p>
                                            <p>{`${order.address.city}, ${order.address.state}`}</p>
                                            <p>{order.address.phone_number}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <p className="font-bold text-lg text-orange-600">{currency}{order.total_amount.toFixed(2)}</p>
                                            
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                disabled={updatingStatus === order.id}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full border-2 transition ${getStatusColor(order.status)} ${updatingStatus === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {orderStatuses.map(status => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Orders;