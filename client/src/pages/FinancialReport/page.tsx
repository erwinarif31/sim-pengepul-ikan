import { useEffect, useMemo, useState } from "react";
import ComponentCard from "../../component/common/ComponentCard";
import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import Input from "../../component/form/input/InputField";
import Select from "../../component/form/Select";
import useBagangQuery from "../../features/bagang/hooks/useBagangQuery";
import useFinancialReport from "../../features/financial-report/hooks/useFinancialReport";
import useSeasonQuery from "../../features/season/hooks/useSeasonQuery";

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function FinancialReportPage() {
    const [selectedSeasonId, setSelectedSeasonId] = useState<number>();
    const [bagangId, setBagangId] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { data: seasonResponse, isLoading: isLoadingSeasons, error: seasonError } = useSeasonQuery();
    const { data: bagangResponse, isLoading: isLoadingBagangs } = useBagangQuery();
    const seasons = useMemo(() => seasonResponse?.data?.data ?? [], [seasonResponse]);
    const bagangs = bagangResponse?.data?.data ?? [];

    useEffect(() => {
        if (selectedSeasonId === undefined && seasons.length > 0) {
            const activeSeason = seasons.find((season) => !season.end_date);
            setSelectedSeasonId(activeSeason?.id ?? seasons[0].id);
        }
    }, [seasons, selectedSeasonId]);

    const query = useMemo(() => {
        if (selectedSeasonId === undefined) {
            return undefined;
        }
        return {
            seasonId: selectedSeasonId,
            ...(bagangId !== "all" ? { bagangId } : {}),
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
        };
    }, [bagangId, endDate, selectedSeasonId, startDate]);

    const { data, isLoading, error } = useFinancialReport(query);
    const hasError = Boolean(seasonError || error);
    const report = data?.data;
    const seasonOptions = seasons.map((season) => ({
        value: season.id.toString(),
        label: `${season.start_date.slice(0, 10)}${!season.end_date ? " (Aktif)" : ""}`,
    }));
    const bagangOptions = [
        { value: "all", label: "Semua bagang" },
        ...bagangs.map((bagang) => ({ value: bagang.id, label: bagang.name })),
    ];

    return (
        <>
            <PageMeta title="Catchery | Laporan Keuangan" description="Ringkasan pendapatan dan biaya" />
            <PageBreadcrumb pageTitle="Laporan Keuangan" />
            <div className="space-y-6">
                <ComponentCard title="Filter Laporan" desc="Laporan menggunakan pendapatan penjualan dan biaya produksi">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Musim</label>
                            <Select
                                options={seasonOptions}
                                value={selectedSeasonId?.toString() ?? ""}
                                onChange={(value) => setSelectedSeasonId(Number(value))}
                                placeholder={isLoadingSeasons ? "Memuat musim..." : "Pilih musim"}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Bagang</label>
                            <Select
                                options={bagangOptions}
                                value={bagangId}
                                onChange={setBagangId}
                                placeholder={isLoadingBagangs ? "Memuat bagang..." : "Semua bagang"}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Tanggal awal</label>
                            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Tanggal akhir</label>
                            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                        </div>
                    </div>
                </ComponentCard>

                {hasError && <p className="text-error-600">Gagal memuat musim atau laporan keuangan.</p>}
                {isLoading && <p className="text-gray-500 dark:text-gray-400">Memuat laporan keuangan...</p>}
                {!isLoading && !hasError && report && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            {[
                                ["Pendapatan penjualan", report.total_sales_revenue],
                                ["Total pembayaran", report.total_paid],
                                ["Piutang", report.accounts_receivable],
                                ["Biaya produksi", report.total_production_cost],
                                ["Laba bersih", report.net_profit],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                                    <p className={`mt-2 text-xl font-bold ${label === "Laba bersih" && Number(value) < 0 ? "text-error-600" : "text-gray-800 dark:text-white/90"}`}>
                                        {formatCurrency(Number(value))}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Margin laba</p>
                            <p className="mt-2 text-2xl font-bold text-brand-500">{report.profit_margin.toFixed(1)}%</p>
                        </div>

                        <ComponentCard title="Rincian Penjualan" desc="Nilai penjualan dan pembayaran per transaksi">
                            {report.sales.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">Tidak ada penjualan untuk filter ini.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="border-b border-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                            <tr>
                                                <th className="px-3 py-3 font-medium">Tanggal</th>
                                                <th className="px-3 py-3 font-medium">Pelanggan</th>
                                                <th className="px-3 py-3 font-medium">Bagang</th>
                                                <th className="px-3 py-3 font-medium">Pendapatan</th>
                                                <th className="px-3 py-3 font-medium">Dibayar</th>
                                                <th className="px-3 py-3 font-medium">Piutang</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {report.sales.map((sale) => (
                                                <tr key={sale.id}>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{sale.issued_at.slice(0, 10)}</td>
                                                    <td className="px-3 py-3 text-gray-800 dark:text-white/90">{sale.customer}</td>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{sale.bagang_name}</td>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatCurrency(sale.total_sales_revenue)}</td>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatCurrency(sale.total_paid)}</td>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatCurrency(sale.accounts_receivable)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </ComponentCard>

                        <ComponentCard title="Rincian Biaya Produksi" desc="Biaya produksi per bagang">
                            {report.production_costs.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">Tidak ada biaya produksi untuk filter ini.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="border-b border-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                            <tr>
                                                <th className="px-3 py-3 font-medium">Tanggal</th>
                                                <th className="px-3 py-3 font-medium">Bagang</th>
                                                <th className="px-3 py-3 font-medium">Jenis biaya</th>
                                                <th className="px-3 py-3 font-medium">Jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {report.production_costs.map((cost) => (
                                                <tr key={cost.id}>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{cost.created_at.slice(0, 10)}</td>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{cost.bagang_name}</td>
                                                    <td className="px-3 py-3 text-gray-800 dark:text-white/90">{cost.production_costs_type}</td>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatCurrency(cost.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </ComponentCard>
                    </>
                )}
            </div>
        </>
    );
}
