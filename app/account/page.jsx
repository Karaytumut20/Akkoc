// app/account/page.jsx

'use client';
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

const AccountPage = () => {
    const { user, authLoading } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/auth');
        }
    }, [authLoading, user, router]);

    if (authLoading || !user) {
        return <Loading />;
    }

    const menuItems = [
        { name: "Siparişlerim", href: "/my-orders" },
        { name: "Favorilerim", href: "/wishlist" },
        { name: "Adreslerim", href: "/add-address" },
    ];

    return (
        <>
            <div className="min-h-[70vh] px-4 sm:px-6 md:px-16 lg:px-32 py-10">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-gray-800 border-b pb-4">Hesabım</h1>
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-2xl font-bold">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                            <p className="font-semibold text-lg text-gray-800">{user.email.split('@')[0]}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <Link href={item.href} key={item.name}>
                                <div className="flex justify-between items-center p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    <span className="font-medium text-gray-700">{item.name}</span>
                                    <FiChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AccountPage;