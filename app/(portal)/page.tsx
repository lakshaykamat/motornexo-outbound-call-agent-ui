import { DashboardKpis } from "@/components/DashboardKpis";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DashboardRecent } from "@/components/DashboardRecent";

export default function DashboardPage() {
  return (
    <>
      <DashboardKpis />
      <DashboardCharts />
      <DashboardRecent />
    </>
  );
}
