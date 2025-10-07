'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryPicture from "@/components/CategoryPicture";
import Services from "@/components/Services";
import Bigcard from "@/components/Bigcard";
import DoubleBigCard from "@/components/DoubleBigCard";
import DoubleBigCardText from "@/components/DoubleBigCardText";
import ShopNow from "@/components/ShopNow";
import VideoBar from "@/components/VideoBar";

const Home = () => {
  return (
    <>
      <VideoBar/>
      <div className="px-6 md:px-16 lg:px-32">

              <CategoryPicture/>

        <HomeProducts />
        <Bigcard/>
              <Services/>
              
<DoubleBigCard/>
<ShopNow/>
<DoubleBigCardText/>

      </div>
      <Footer />
    </>
  );
};

export default Home;
