import AppLayout from "@/components/layout/app-layout";

export default function ZoneSummaryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppLayout>{children}</AppLayout>;
}
