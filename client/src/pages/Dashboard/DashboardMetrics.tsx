import type { DashboardMetrics } from "../../features/dashboard/api/dashboard.types";
import { 
    BoxIconLine, 
    DollarLineIcon, 
    ShootingStarIcon, 
    GroupIcon,
    PieChartIcon,
    BoxCubeIcon,
    GridIcon,
    AlertIcon
} from "../../icons";

interface DashboardMetricsProps {
    data: DashboardMetrics | undefined;
    isLoading: boolean;
}

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export default function DashboardMetricsCard({ data, isLoading }: DashboardMetricsProps) {
    // Row 1: 4 equal cards
    const row1Metrics = [
        {
            id: 1,
            title: "Nilai Panen",
            value: formatCurrency(data?.total_harvest_value ?? 0),
            icon: BoxIconLine,
            iconBg: "bg-brand-50 dark:bg-brand-500/10",
            iconColor: "text-brand-500",
        },
        {
            id: 2,
            title: "Biaya Produksi (Pinjaman)",
            value: formatCurrency(data?.total_costs ?? 0),
            icon: GroupIcon,
            iconBg: "bg-warning-50 dark:bg-warning-500/10",
            iconColor: "text-warning-500",
        },
        {
            id: 3,
            title: "Total Penjualan",
            value: formatCurrency(data?.total_sales_revenue ?? 0),
            icon: DollarLineIcon,
            iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10",
            iconColor: "text-blue-light-500",
        },
        {
            id: 4,
            title: "Piutang",
            value: formatCurrency(data?.accounts_receivable ?? 0),
            icon: AlertIcon,
            iconBg: data?.accounts_receivable && data.accounts_receivable > 0
                ? "bg-error-50 dark:bg-error-500/10"
                : "bg-gray-100 dark:bg-gray-500/10",
            iconColor: data?.accounts_receivable && data.accounts_receivable > 0
                ? "text-error-600"
                : "text-gray-500",
        },
    ];

    // Row 2: Laba Bersih (large) + supporting metrics
    const netProfit = data?.net_profit ?? 0;
    const isProfit = netProfit >= 0;

    if (isLoading) {
        return (
            <div className="space-y-4 md:space-y-6">
                {/* Row 1 skeleton */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
                        >
                            <div className="h-[52px] w-[52px] bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
                {/* Row 2 skeleton - Laba Bersih (row-span-2, col-span-2) + 2 small on right top + 1 wide on right bottom */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 xl:grid-rows-2">
                    {/* Large card skeleton - spans 2 cols and 2 rows */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse xl:col-span-2 xl:row-span-2">
                        <div className="h-[52px] w-[52px] bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    {/* 2 small cards skeleton - top right */}
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
                        >
                            <div className="h-[52px] w-[52px] bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    ))}
                    {/* Wide card skeleton - bottom right, spans 2 cols */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse xl:col-span-2">
                        <div className="h-[52px] w-[52px] bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Row 1: 4 equal cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                {row1Metrics.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
                        >
                            <div
                                className={`mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-xl ${item.iconBg}`}
                            >
                                <Icon className={`size-6 ${item.iconColor}`} />
                            </div>

                            <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                                {item.title}
                            </p>

                            <div className="mt-3">
                                <h4 className={`font-bold text-title-sm dark:text-white/90 ${item.iconColor}`}>
                                    {item.value}
                                </h4>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Row 2: Laba Bersih (large, row-span-2, col-span-2) + 3 smaller cards on right */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 xl:grid-rows-2">
                {/* Laba Bersih - large card spanning 2 cols and 2 rows */}
                <div
                    className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 xl:col-span-2 xl:row-span-2 flex flex-col justify-center ${
                        isProfit ? "" : ""
                    }`}
                >
                    <div
                        className={`mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-xl ${
                            isProfit 
                                ? "bg-success-50 dark:bg-success-500/10" 
                                : "bg-error-50 dark:bg-error-500/10"
                        }`}
                    >
                        <ShootingStarIcon className={`size-6 ${isProfit ? "text-success-600" : "text-error-600"}`} />
                    </div>

                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                        Laba Bersih
                    </p>

                    <div className="mt-3">
                        <h4 className={`font-bold text-title-lg dark:text-white/90 ${isProfit ? "text-success-600" : "text-error-600"}`}>
                            {formatCurrency(netProfit)}
                        </h4>
                    </div>
                </div>

                {/* Margin */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                        <PieChartIcon className="size-6 text-purple-500" />
                    </div>
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">Margin</p>
                    <div className="mt-3">
                        <h4 className="font-bold text-title-sm dark:text-white/90 text-purple-500">
                            {formatPercent(data?.profit_margin ?? 0)}
                        </h4>
                    </div>
                </div>

                {/* Rata-rata Laba/Bagang */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10">
                        <BoxCubeIcon className="size-6 text-cyan-500" />
                    </div>
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">Rata-rata Laba/Bagang</p>
                    <div className="mt-3">
                        <h4 className="font-bold text-title-sm dark:text-white/90 text-cyan-500">
                            {formatCurrency(data?.avg_profit_per_bagang ?? 0)}
                        </h4>
                    </div>
                </div>

                {/* Bagang Aktif - spans 2 cols to fill the remaining space */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 xl:col-span-2">
                    <div className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                        <GridIcon className="size-6 text-orange-500" />
                    </div>
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">Bagang Aktif</p>
                    <div className="mt-3">
                        <h4 className="font-bold text-title-sm dark:text-white/90 text-orange-500">
                            {(data?.active_bagang_count ?? 0).toString()}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
