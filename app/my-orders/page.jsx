'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const Orders = () => {
    const { currency, isSeller } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const orderStatuses = ["Hazırlanıyor", "Kargolandı", "Teslim Edildi", "İptal Edildi"];

    const fetchSellerOrders = async () => {
        if (!isSeller) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_amount,
                status,
                address,
                order_items (
                    quantity,
                    products ( name )
                )
            `)
            .order('created_at', { ascending: false });

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
    }, [isSeller]);

    const handleStatusChange = async (orderId, newStatus) => {
        const toastId = toast.loading("Durum güncelleniyor...");
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            
            // State'i de anında güncelle
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
            toast.success("Sipariş durumu güncellendi.", { id: toastId });
        } catch (error) {
            toast.error("Güncelleme başarısız: " + error.message, { id: toastId });
        }
    };

    return (
        <div className="flex-1 h-screen overflow-y-auto flex flex-col text-sm">
            {loading ? <Loading /> : (
                <div className="p-4 sm:p-6 lg:p-10 space-y-5">
                    <h2 className="text-2xl font-semibold text-gray-800">Gelen Siparişler</h2>
                    {orders.length === 0 ? (
                        <p className="text-center py-10 text-gray-500">Henüz hiç sipariş yok.</p>
                    ) : (
                        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürünler</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adres</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="font-medium text-gray-900">
                                                    {order.order_items.map(item => `${item.products.name} x ${item.quantity}`).join(", ")}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Toplam {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} ürün
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="font-medium">{order.address.full_name}</p>
                                                <p className="text-gray-600 text-xs">{`${order.address.area}, ${order.address.city}`}</p>
                                                <p className="text-gray-600 text-xs">{order.address.phone_number}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{currency}{order.total_amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                >
                                                    {orderStatuses.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;