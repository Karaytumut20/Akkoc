// components/seller/Sidebar.jsx

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiPlusSquare, FiList, FiBox, FiMessageSquare } from 'react-icons/fi'; // react-icons kütüphanesinden ikonlar kullandım

const SideBar = () => {
    const pathname = usePathname();
    const menuItems = [
        // 'Add Product' linkini /seller/add-product olarak güncelledim
        { name: 'Add Product', path: '/seller/add-product', icon: <FiPlusSquare className="w-6 h-6" /> },
        { name: 'Product List', path: '/seller/product-list', icon: <FiList className="w-6 h-6" /> },
        { name: 'Orders', path: '/seller/orders', icon: <FiBox className="w-6 h-6" /> },
        { name: 'Category Add', path: '/seller/category-add', icon: <FiList className="w-6 h-6" /> },
        { name: 'Reviews', path: '/seller/reviews', icon: <FiMessageSquare className="w-6 h-6" /> }, // YENİ EKLENDİ
    ];

    return (
        <div className='flex flex-col border-r min-h-screen bg-white border-gray-200 py-4
                        w-20 md:w-64 transition-all duration-300'>
            {menuItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                    <Link href={item.path} key={item.name} passHref>
                        <div
                            className={
                                `flex items-center justify-center md:justify-start py-3 px-4 md:px-6 gap-4 my-1 mx-2 rounded-lg
                                ${isActive
                                    ? "bg-orange-100 text-orange-600 font-semibold"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`
                            }
                        >
                            <div className="flex-shrink-0">{item.icon}</div>
                            <p className='md:block hidden text-sm'>{item.name}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default SideBar;