// app/page.jsx

'use client'
import React from "react";
import HomeProducts from "@/components/HomeProducts";
import NewsLetter from "@/components/NewsLetter";
import CategoryPicture from "@/components/CategoryPicture";
import Services from "@/components/Services";
import DoubleBigCard from "@/components/DoubleBigCard";
import DoubleBigCardText from "@/components/DoubleBigCardText";
import ShopNow from "@/components/ShopNow";
import VideoBar from "@/components/VideoBar";

const Home = () => {
  return (
    // Navbar ve Footer buradan tamamen kaldırıldı!
    <>
      <div className="px-6 md:px-16 lg:px-32">

        <CategoryPicture/>
        <HomeProducts />
        <DoubleBigCard/>
        <Services/>
        <ShopNow/>
        <DoubleBigCardText/>
        <NewsLetter />

      </div>
    </>
  );
};

export default Home;