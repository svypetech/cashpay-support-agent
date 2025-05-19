"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/layout/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export default function Layout({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const queryClient = new QueryClient()

    const router = useRouter()
    useEffect(() => {   
        const token = localStorage.getItem("token")
        const user = localStorage.getItem("user")
        if (!token || !user) {
           router.push("/signin")
        }
        else {
            setIsAuthenticated(true)
        }
    }
    , [])


    if(!isAuthenticated) {
        return null; // or a loading spinner
    }
  

  return (

    <QueryClientProvider client={queryClient}>
    <ClientLayout>{children}</ClientLayout>
  </QueryClientProvider>    
  )
  
  
  

}
