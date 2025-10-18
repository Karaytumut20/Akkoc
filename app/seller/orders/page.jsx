'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const OrdersPage = () => {
  const { currency } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchSellerOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Siparişler getirilirken bir hata oluştu: " + error.message);
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Sipariş durumu güncellenemedi.");
    } else {
      toast.success("Sipariş durumu güncellendi!");
      fetchSellerOrders();
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-4">
        Tüm Gelen Siparişler
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-xl text-gray-500 py-10">
          Henüz sipariş bulunmuyor.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Ana Sipariş Bilgisi Satırı */}
              <div
                className="flex flex-wrap justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="font-medium text-gray-800">
                  <span className="text-sm text-gray-500">ID:</span> #
                  {order.id.slice(0, 8)}...
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString("tr-TR")}
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {currency}
                  {order.total_amount.toFixed(2)}
                </div>
                <div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-semibold rounded-full px-3 py-1 border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Hazırlanıyor">Hazırlanıyor</option>
                    <option value="Kargolandı">Kargolandı</option>
                    <option value="Teslim Edildi">Teslim Edildi</option>
                    <option value="İptal Edildi">İptal Edildi</option>
                  </select>
                </div>
                <div className="text-gray-500">
                  {expandedOrder === order.id ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}
                </div>
              </div>

              {/* Açılır Detay Alanı */}
              {expandedOrder === order.id && (
                <div className="border-t bg-gray-50 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ürün Detayları */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                      Ürünler
                    </h4>
                    <div className="space-y-3">
                      {order.order_items.map((item) => {
                        // 📸 JSON Parse Fix
                        let imageArray = [];
                        try {
                          imageArray = Array.isArray(item.products.image_urls)
                            ? item.products.image_urls
                            : JSON.parse(item.products.image_urls || "[]");
                        } catch {
                          imageArray = [];
                        }
                        const imageUrl =
                          imageArray[0] || "/assets/placeholder.jpg";

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-4"
                          >
                            <Image
                              src={imageUrl}
                              alt={item.products.name}
                              width={60}
                              height={60}
                              className="rounded-md object-cover"
                            />
                            <div>
                              <p className="font-medium text-sm text-gray-900">
                                {item.products.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {item.quantity} x {currency}
                                {item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Adres Detayları */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                      Teslimat Adresi
                    </h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-semibold">Alıcı:</span>{" "}
                        {order.address.full_name}
                      </p>
                      <p>
                        <span className="font-semibold">Telefon:</span>{" "}
                        {order.address.phone_number}
                      </p>
                      <p>
                        <span className="font-semibold">Adres:</span>{" "}
                        {order.address.area}
                      </p>
                      <p>
                        <span className="font-semibold">İlçe/İl:</span>{" "}
                        {order.address.city}, {order.address.state}
                      </p>
                      {order.address.pincode && (
                        <p>
                          <span className="font-semibold">Posta Kodu:</span>{" "}
                          {order.address.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
