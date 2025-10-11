'use client'

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import FloatingLabelInput from "./ui/FloatingLabelInput";

const AddressModal = ({ isOpen, onClose, addressToEdit }) => {
    const { addAddress, updateAddress } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({
        full_name: '', phone_number: '', pincode: '', area: '', city: '', state: '',
    });

    useEffect(() => {
        if (addressToEdit) {
            setAddress(addressToEdit);
        } else {
            setAddress({ full_name: '', phone_number: '', pincode: '', area: '', city: '', state: '' });
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
            await updateAddress(addressToEdit.id, address);
        } else {
            await addAddress(address);
        }
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl transform transition-all">
                <div className="p-6">
                    <div className="flex justify-between items-center border-b pb-3 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {addressToEdit ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={onSubmitHandler} className="space-y-8">
                        <FloatingLabelInput id="full_name" name="full_name" label="Ad Soyad" value={address.full_name} onChange={onChangeHandler} required />
                        <FloatingLabelInput id="phone_number" name="phone_number" label="Telefon Numarası" value={address.phone_number} onChange={onChangeHandler} required />
                        <FloatingLabelInput as="textarea" id="area" name="area" label="Adres (Sokak, Mahalle, Kapı No)" value={address.area} onChange={onChangeHandler} required />
                        <div className="flex gap-4">
                            <FloatingLabelInput id="city" name="city" label="İlçe / Şehir" value={address.city} onChange={onChangeHandler} required />
                            <FloatingLabelInput id="state" name="state" label="İl" value={address.state} onChange={onChangeHandler} required />
                        </div>
                        <FloatingLabelInput id="pincode" name="pincode" label="Posta Kodu (İsteğe bağlı)" value={address.pincode} onChange={onChangeHandler} />
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