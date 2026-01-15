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
    const revenues = data?.map((item) => item.revenue) ?? [];
    const costs = data?.map((item) => item.cost) ?? [];

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
            name: "Pendapatan",
            data: revenues,
        },
        {
            name: "Biaya",
            data: costs,
        },
    ];

    if (isLoading) {
        return (
            <ComponentCard title="Performa Bagang" desc="Perbandingan pendapatan vs biaya per bagang">
                <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            </ComponentCard>
        );
    }

    return (
        <ComponentCard title="Performa Bagang" desc="Perbandingan pendapatan vs biaya per bagang">
            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-3 min-w-[400px] xl:min-w-full">
                    <Chart options={options} series={series} type="bar" height={300} />
                </div>
            </div>
        </ComponentCard>
    );
}
