import AppLayout from "@/components/layout/app-layout";

export default function ZonesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppLayout>{children}</AppLayout>;
}
