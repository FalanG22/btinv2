import AppLayout from "@/components/layout/app-layout";

export default function ArticlesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppLayout>{children}</AppLayout>;
}
