import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import LayoutContent from "@/components/LayoutContent"; // ✅ doğru import

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata = {
  title: "Nestcome",
  description: "Nestcome",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased text-gray-700`}>
        <Toaster />
        <AppContextProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppContextProvider>
      </body>
    </html>
  );
}
