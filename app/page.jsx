'use client'
import React from "react";
import HomeProducts from "@/components/HomeProducts";
import NewsLetter from "@/components/NewsLetter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryPicture from "@/components/CategoryPicture";
import Services from "@/components/Services";
import DoubleBigCard from "@/components/DoubleBigCard";
import DoubleBigCardText from "@/components/DoubleBigCardText";
import ShopNow from "@/components/ShopNow";
import VideoBar from "@/components/VideoBar";

const Home = () => {
  return (
    <>
      <VideoBar/>
      <Navbar/>
      <div className="px-6 md:px-16 lg:px-32">

        <CategoryPicture/>
        <HomeProducts />
        <DoubleBigCard/>
        <Services/>
        <ShopNow/>
        <DoubleBigCardText/>
        <NewsLetter />

      </div>
      <Footer />
    </>
  );
};

export default Home;