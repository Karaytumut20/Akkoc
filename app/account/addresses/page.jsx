'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Loading from '@/components/Loading';
import Footer from '@/components/Footer';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import AddressModal from '@/components/AddressModal'; // Birazdan oluşturacağımız component

const AddressesPage = () => {
    const { addresses, loading, deleteAddress } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);

    const handleOpenModal = (address = null) => {
        setAddressToEdit(address);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setAddressToEdit(null); // Modalı kapatırken düzenlenecek adresi temizle
    };

    const handleDelete = (id) => {
        if (confirm('Bu adresi silmek istediğinize emin misiniz?')) {
            deleteAddress(id);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <div className="min-h-[70vh] px-4 sm:px-6 md:px-16 lg:px-32 py-10">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Adreslerim</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-md"
                    >
                        <FiPlus />
                        <span>Yeni Adres Ekle</span>
                    </button>
                </div>

                {addresses.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p>Kayıtlı adresiniz bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                            <div key={address.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
                                <div>
                                    <p className="font-bold text-lg text-gray-800">{address.full_name}</p>
                                    <p className="text-gray-600 mt-2">{address.area}</p>
                                    <p className="text-gray-600">{`${address.city}, ${address.state}`}</p>
                                    <p className="text-gray-500 text-sm mt-1">{address.phone_number}</p>
                                </div>
                                <div className="flex gap-3 mt-4 pt-4 border-t">
                                    <button
                                        onClick={() => handleOpenModal(address)}
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition"
                                    >
                                        <FiEdit />
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition"
                                    >
                                        <FiTrash2 />
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <AddressModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                addressToEdit={addressToEdit}
            />

            <Footer />
        </>
    );
};

export default AddressesPage;