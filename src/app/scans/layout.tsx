import AppLayout from "@/components/layout/app-layout";

export default function ScansLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppLayout>{children}</AppLayout>;
}
