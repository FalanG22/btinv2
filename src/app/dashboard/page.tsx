import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/page-header";
import { getDashboardStats } from "@/lib/actions";
import { ScanLine, Hash, MapPin, List } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const chartConfig = {
    total: {
      label: "Total Scans",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title="Dashboard"
        description="An overview of your scanning activity."
      />
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="bg-gradient-to-tr from-blue-500 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EAN Scans Today</CardTitle>
            <ScanLine className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eanScansToday}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-green-500 to-green-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Series Scans Today</CardTitle>
            <Hash className="h-4 w-4 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.seriesScansToday}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-orange-500 to-orange-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
            <MapPin className="h-4 w-4 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeZones}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-purple-500 to-purple-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scanned Items</CardTitle>
            <List className="h-4 w-4 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Scans by Zone</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart
                accessibilityLayer
                data={stats.chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    allowDecimals={false}
                 />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={8}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
