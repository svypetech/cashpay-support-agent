"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { DarkModeProvider, useDarkMode } from "@/components/providers/DarkModeProvider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeProvider>
      <LayoutContent>{children}</LayoutContent>
    </DarkModeProvider>
  );
}

// Separate component to use the context
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { darkMode } = useDarkMode(); // Get dark mode state

  return (
    <div
      className={`min-h-screen flex flex-col items-between  transition-all duration-500 ${
        darkMode ? "bg-black/25 text-white" : "bg-white text-textLight"
      }`}
    >
      {/* Pass darkMode and setDarkMode to Header */}
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
