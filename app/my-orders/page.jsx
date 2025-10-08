'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const MyOrders = () => {
    const { currency, user } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            // Siparişleri ve ilgili sipariş kalemlerini (ürün detayları dahil) çekiyoruz
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        quantity,
                        price,
                        products (
                            name,
                            image_urls
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                toast.error("Siparişler alınamadı: " + error.message);
                setOrders([]);
            } else {
                setOrders(data || []);
            }
            setLoading(false);
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <h2 className="text-2xl font-medium mt-6">My Orders</h2>
                    {loading ? <Loading /> : (
                        <div className="max-w-5xl border-t border-gray-300 text-sm">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <div key={order.id} className="grid grid-cols-1 md:grid-cols-5 gap-5 p-5 border-b border-gray-300 items-start">
                                        <div className="md:col-span-2 flex gap-4">
                                            <Image
                                                className="w-16 h-16 object-cover"
                                                src={assets.box_icon}
                                                alt="box_icon"
                                            />
                                            <div>
                                                <p className="font-semibold text-base mb-2">
                                                    {order.order_items.map(item => `${item.products.name} x ${item.quantity}`).join(", ")}
                                                </p>
                                                <p className="text-gray-600">Items: {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="font-medium">{order.address.full_name}</p>
                                            <p className="text-gray-600">{order.address.area}</p>
                                            <p className="text-gray-600">{`${order.address.city}, ${order.address.state}`}</p>
                                            <p className="text-gray-600">{order.address.phone_number}</p>
                                        </div>
                                        
                                        <p className="font-semibold text-base my-auto">{currency}{order.total_amount.toFixed(2)}</p>

                                        <div>
                                            <p className="flex flex-col gap-1">
                                                <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
                                                <span className="font-medium text-green-600">Status: {order.status}</span>
                                                <span>Payment: COD (Pending)</span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-10 text-gray-500">Henüz siparişiniz bulunmuyor.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;