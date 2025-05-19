"use client"
import "./globals.css";
import {useEffect} from "react"



export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
      let user = localStorage.getItem("user");
      let token = localStorage.getItem("token");
      if (!user || !token) {
        window.location.href = "/signin";
      }
    }, []);
  return (
    <html lang="en">
      <body>
        
        {children}
        
      </body>
    </html>
  );
}
