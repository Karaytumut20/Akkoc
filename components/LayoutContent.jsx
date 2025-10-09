'use client';

import { usePathname } from "next/navigation";
import VideoBar from "@/components/VideoBar";
import MainNavbar from "@/components/MainNavbar";
import React from "react";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <>
      {isHomePage ? (
        <>
          <VideoBar />
          <div>{children}</div>
        </>
      ) : (
        <>
          <MainNavbar />
          <div className="pt-20">{children}</div>
        </>
      )}
    </>
  );
}
