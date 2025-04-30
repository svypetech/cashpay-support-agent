import ClientLayout from "@/components/layout/Layout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ClientLayout>{children}</ClientLayout>
    )
}