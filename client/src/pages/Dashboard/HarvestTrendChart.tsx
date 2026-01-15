import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import type { HarvestTrendItem } from "../../features/dashboard/api/dashboard.types";
import ComponentCard from "../../component/common/ComponentCard";

interface HarvestTrendChartProps {
    data: HarvestTrendItem[] | undefined;
    isLoading: boolean;
}

export default function HarvestTrendChart({ data, isLoading }: HarvestTrendChartProps) {
    const categories = data?.map((item) => item.month) ?? [];
    const revenues = data?.map((item) => item.revenue) ?? [];

    const options: ApexOptions = {
        legend: {
            show: false,
        },
        colors: ["#465FFF"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            height: 280,
            type: "area",
            toolbar: {
                show: false,
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.55,
                opacityTo: 0,
            },
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        height: 220,
                    },
                },
            },
        ],
        stroke: {
            curve: "smooth",
            width: 2,
        },
        markers: {
            size: 0,
        },
        grid: {
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            y: {
                formatter: (val: number) => `Rp ${val.toLocaleString("id-ID")}`,
            },
        },
        xaxis: {
            type: "category",
            categories: categories,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                formatter: (val: number) => `Rp ${(val / 1000000).toFixed(1)}jt`,
            },
        },
    };

    const series = [
        {
            name: "Pendapatan",
            data: revenues,
        },
    ];

    if (isLoading) {
        return (
            <ComponentCard title="Tren Pendapatan Panen" desc="Pendapatan panen per bulan">
                <div className="h-[280px] bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            </ComponentCard>
        );
    }

    return (
        <ComponentCard title="Tren Pendapatan Panen" desc="Pendapatan panen per bulan">
            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-4 min-w-[500px] xl:min-w-full pl-2">
                    <Chart options={options} series={series} type="area" height={280} />
                </div>
            </div>
        </ComponentCard>
    );
}
