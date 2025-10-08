'use client'
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const AddAddress = () => {
    const { addAddress } = useAppContext();
    const [loading, setLoading] = useState(false);

    const [address, setAddress] = useState({
        full_name: '',
        phone_number: '',
        pincode: '',
        area: '',
        city: '',
        state: '',
    });

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

        await addAddress(address);
        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
                <form onSubmit={onSubmitHandler} className="w-full">
                    <p className="text-2xl md:text-3xl text-gray-500">
                        Add Shipping <span className="font-semibold text-orange-600">Address</span>
                    </p>
                    <div className="space-y-3 max-w-sm mt-10">
                        <input
                            name="full_name"
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Full name"
                            onChange={onChangeHandler}
                            value={address.full_name}
                            required
                        />
                        <input
                            name="phone_number"
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Phone number"
                            onChange={onChangeHandler}
                            value={address.phone_number}
                            required
                        />
                        <input
                            name="pincode"
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Pin code"
                            onChange={onChangeHandler}
                            value={address.pincode}
                        />
                        <textarea
                            name="area"
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
                            type="text"
                            rows={4}
                            placeholder="Address (Area and Street)"
                            onChange={onChangeHandler}
                            value={address.area}
                            required
                        ></textarea>
                        <div className="flex space-x-3">
                            <input
                                name="city"
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="City/District/Town"
                                onChange={onChangeHandler}
                                value={address.city}
                                required
                            />
                            <input
                                name="state"
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="State"
                                onChange={onChangeHandler}
                                value={address.state}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="max-w-sm w-full mt-6 bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase disabled:bg-orange-400">
                        {loading ? "Saving..." : "Save address"}
                    </button>
                </form>
                <Image
                    className="md:mr-16 mt-16 md:mt-0"
                    src={assets.my_location_image}
                    alt="my_location_image"
                />
            </div>
            <Footer />
        </>
    );
};

export default AddAddress;