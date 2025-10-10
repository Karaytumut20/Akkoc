'use client'

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

const AddressModal = ({ isOpen, onClose, addressToEdit }) => {
    const { addAddress, updateAddress } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({
        full_name: '',
        phone_number: '',
        pincode: '',
        area: '',
        city: '',
        state: '',
    });

    // Düzenleme modu için formu doldur
    useEffect(() => {
        if (addressToEdit) {
            setAddress(addressToEdit);
        } else {
            // Ekleme modu için formu temizle
            setAddress({
                full_name: '',
                phone_number: '',
                pincode: '',
                area: '',
                city: '',
                state: '',
            });
        }
    }, [addressToEdit, isOpen]);

    const onChangeHandler = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (!address.full_name || !address.phone_number || !address.area || !address.city || !address.state) {
            toast.error("Lütfen tüm zorunlu alanları doldurun.");
            setLoading(false);
            return;
        }

        if (addressToEdit) {
            // Güncelleme işlemi
            await updateAddress(addressToEdit.id, address);
        } else {
            // Ekleme işlemi
            await addAddress(address);
        }

        setLoading(false);
        onClose(); // İşlem sonrası modalı kapat
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl transform transition-all">
                <div className="p-6">
                    <div className="flex justify-between items-center border-b pb-3 mb-5">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {addressToEdit ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={onSubmitHandler} className="space-y-4">
                        <input
                            name="full_name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            type="text"
                            placeholder="Ad Soyad"
                            onChange={onChangeHandler}
                            value={address.full_name}
                            required
                        />
                        <input
                            name="phone_number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            type="text"
                            placeholder="Telefon Numarası"
                            onChange={onChangeHandler}
                            value={address.phone_number}
                            required
                        />
                         <textarea
                            name="area"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            rows={3}
                            placeholder="Adres (Sokak, Mahalle, Kapı No)"
                            onChange={onChangeHandler}
                            value={address.area}
                            required
                        ></textarea>
                        <div className="flex gap-4">
                            <input
                                name="city"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                type="text"
                                placeholder="İlçe / Şehir"
                                onChange={onChangeHandler}
                                value={address.city}
                                required
                            />
                            <input
                                name="state"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                type="text"
                                placeholder="İl"
                                onChange={onChangeHandler}
                                value={address.state}
                                required
                            />
                        </div>
                         <input
                            name="pincode"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            type="text"
                            placeholder="Posta Kodu (İsteğe bağlı)"
                            onChange={onChangeHandler}
                            value={address.pincode}
                        />
                        <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold disabled:bg-orange-400">
                            {loading ? "Kaydediliyor..." : (addressToEdit ? 'Adresi Güncelle' : 'Adresi Kaydet')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;