import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import type { BagangPerformanceItem } from "../../features/dashboard/api/dashboard.types";
import ComponentCard from "../../component/common/ComponentCard";

interface BagangPerformanceChartProps {
    data: BagangPerformanceItem[] | undefined;
    isLoading: boolean;
}

export default function BagangPerformanceChart({ data, isLoading }: BagangPerformanceChartProps) {
    const categories = data?.map((item) => item.bagang_name) ?? [];
    const revenues = data?.map((item) => item.sales_revenue) ?? [];
    const capitals = data?.map((item) => item.harvest_value) ?? [];

    const options: ApexOptions = {
        colors: ["#465fff", "#ff6b6b"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 300,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "50%",
                borderRadius: 5,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 4,
            colors: ["transparent"],
        },
        xaxis: {
            categories: categories,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    fontSize: "12px",
                },
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
        },
        yaxis: {
            title: {
                text: undefined,
            },
            labels: {
                formatter: (val: number) => `Rp ${(val / 1000000).toFixed(1)}jt`,
            },
        },
        grid: {
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: (val: number) => `Rp ${val.toLocaleString("id-ID")}`,
            },
        },
    };

    const series = [
        {
            name: "Pendapatan Penjualan",
            data: revenues,
        },
        {
            name: "Modal (Nilai Panen)",
            data: capitals,
        },
    ];

    if (isLoading) {
        return (
            <ComponentCard title="Performa Bagang" desc="Pendapatan penjualan vs modal (nilai panen)">
                <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            </ComponentCard>
        );
    }

    return (
        <ComponentCard title="Performa Bagang" desc="Pendapatan penjualan vs modal (nilai panen)">
            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-3 min-w-[300px] sm:min-w-[400px] xl:min-w-full">
                    <Chart options={options} series={series} type="bar" height={300} />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-3 py-2 font-medium">Bagang</th>
                            <th className="px-3 py-2 font-medium">Nilai Panen</th>
                            <th className="px-3 py-2 font-medium">Laba Bersih</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {data?.map((item) => (
                            <tr key={item.bagang_id ?? "unassigned"}>
                                <td className="px-3 py-2 text-gray-800 dark:text-white/90">{item.bagang_name}</td>
                                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">Rp {item.harvest_value.toLocaleString("id-ID")}</td>
                                <td className={`px-3 py-2 ${item.net_profit >= 0 ? "text-success-600" : "text-error-600"}`}>
                                    Rp {item.net_profit.toLocaleString("id-ID")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ComponentCard>
    );
}
