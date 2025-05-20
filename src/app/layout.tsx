"use client";
import "./globals.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthenticateUser } from "@/utils/functions";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  useEffect(() => {
    if (!AuthenticateUser()) {
      router.push("/signin");
    }
  }, []);
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
