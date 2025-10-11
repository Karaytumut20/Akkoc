// app/account/layout.jsx
'use client'

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import AccountSidebar from "./AccountSidebar"; // Yeni component'i import et

export default function AccountLayout({ children }) {
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

    return (
        <>
            <div className="min-h-[70vh] px-4 sm:px-6 md:px-16 lg:px-32 py-10">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-gray-800 border-b pb-4">Hesabım</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sol Menü */}
                    <div className="md:col-span-1">
                        <Suspense fallback={<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-[400px] animate-pulse"></div>}>
                            <AccountSidebar />
                        </Suspense>
                    </div>

                    {/* Sağ İçerik Alanı (Değişken içerik buraya gelecek) */}
                    <div className="md:col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}