"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    
      <LayoutContent>{children}</LayoutContent>
    
  );
}

// Separate component to use the context
function LayoutContent({ children }: { children: React.ReactNode }) {
  

  return (
    <div
      className={`min-h-screen flex flex-col items-between  transition-all duration-500 ${
        "bg-white text-textLight"
      }`}
    >
      <Header />
      <main className="flex-grow pb-[140px]">{children}</main>
      <Footer />
    </div>
  );
}
