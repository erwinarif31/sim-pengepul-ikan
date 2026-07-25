import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import type { HarvestByTypeItem } from "../../features/dashboard/api/dashboard.types";
import ComponentCard from "../../component/common/ComponentCard";

interface HarvestByTypeChartProps {
    data: HarvestByTypeItem[] | undefined;
    isLoading: boolean;
}

const CHART_COLORS = ["#3641f5", "#7592ff", "#dde9ff", "#465FFF", "#9CB9FF", "#b3c7ff"];

export default function HarvestByTypeChart({ data, isLoading }: HarvestByTypeChartProps) {
    const labels = data?.map((item) => item.type) ?? [];
    const values = data?.map((item) => item.harvest_value) ?? [];
    const total = values.reduce((acc, val) => acc + val, 0);

    const options: ApexOptions = {
        colors: CHART_COLORS.slice(0, labels.length),
        labels: labels,
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "donut",
            width: 280,
            height: 280,
        },
        stroke: {
            show: false,
            width: 4,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    background: "transparent",
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            offsetY: 0,
                            color: "#1D2939",
                            fontSize: "12px",
                            fontWeight: "normal",
                            formatter: () => "Total",
                        },
                        value: {
                            show: true,
                            offsetY: 10,
                            color: "#667085",
                            fontSize: "14px",
                            formatter: () => `Rp ${(total / 1000000).toFixed(1)}jt`,
                        },
                        total: {
                            show: true,
                            label: "Total",
                            color: "#000000",
                            fontSize: "16px",
                            fontWeight: "bold",
                            formatter: () => `Rp ${(total / 1000000).toFixed(1)}jt`,
                        },
                    },
                },
            },
        },
        states: {
            hover: {
                filter: {
                    type: "none",
                },
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                    type: "darken",
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: (val: number) => `Rp ${val.toLocaleString("id-ID")}`,
            },
        },
        legend: {
            show: false,
        },
        responsive: [
            {
                breakpoint: 640,
                options: {
                    chart: {
                        width: 260,
                        height: 260,
                    },
                },
            },
        ],
    };

    if (isLoading) {
        return (
            <ComponentCard title="Panen per Jenis">
                <div className="flex flex-col items-center gap-8 xl:flex-row">
                    <div className="h-[280px] w-[280px] bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse"></div>
                    <div className="flex flex-col gap-4 w-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </ComponentCard>
        );
    }

    return (
        <ComponentCard title="Panen per Jenis">
            <div className="flex flex-col items-center gap-8 xl:flex-row">
                <div id="chartDarkStyle">
                    <Chart options={options} series={values} type="donut" height={280} />
                </div>
                <div className="flex flex-col items-start gap-4 w-full">
                    {data?.map((item, index) => {
                        const percentage = total > 0 ? ((item.harvest_value / total) * 100).toFixed(1) : 0;
                        return (
                            <div key={item.type} className="flex items-start gap-2.5 w-full">
                                <div
                                    className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="mb-1 font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate">
                                        {item.type}
                                    </h5>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                                            {percentage}%
                                        </p>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                                            Rp {item.harvest_value.toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </ComponentCard>
    );
}
