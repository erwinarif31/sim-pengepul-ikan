import { useEffect, useMemo, useState } from "react";
import ComponentCard from "../../component/common/ComponentCard";
import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import Input from "../../component/form/input/InputField";
import Select from "../../component/form/Select";
import useBagangQuery from "../../features/bagang/hooks/useBagangQuery";
import useHarvestTypeQuery from "../../features/harvest-type/hooks/useHarvestType";
import useSeasonQuery from "../../features/season/hooks/useSeasonQuery";
import useStockSummary from "../../features/stock/hooks/useStockSummary";

const formatNumber = (value: number) =>
    value.toLocaleString("id-ID", { maximumFractionDigits: 2 });

export default function StockPage() {
    const [selectedSeasonId, setSelectedSeasonId] = useState<number>();
    const [bagangId, setBagangId] = useState("all");
    const [harvestType, setHarvestType] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { data: seasonResponse, isLoading: isLoadingSeasons, error: seasonError } = useSeasonQuery();
    const { data: bagangResponse, isLoading: isLoadingBagangs } = useBagangQuery();
    const { data: harvestTypeResponse, isLoading: isLoadingHarvestTypes } = useHarvestTypeQuery();

    const seasons = useMemo(() => seasonResponse?.data?.data ?? [], [seasonResponse]);
    const bagangs = bagangResponse?.data?.data ?? [];
    const harvestTypes = harvestTypeResponse?.data?.data ?? [];

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
            ...(harvestType !== "all" ? { harvestType } : {}),
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
        };
    }, [bagangId, endDate, harvestType, selectedSeasonId, startDate]);

    const { data, isLoading, error } = useStockSummary(query);
    const hasError = Boolean(seasonError || error);
    const rows = data?.data ?? [];
    const totals = rows.reduce(
        (result, row) => ({
            stockIn: result.stockIn + row.stock_in_kg,
            stockOut: result.stockOut + row.stock_out_kg,
            balance: result.balance + row.stock_balance_kg,
        }),
        { stockIn: 0, stockOut: 0, balance: 0 },
    );

    const seasonOptions = seasons.map((season) => ({
        value: season.id.toString(),
        label: `${season.start_date.slice(0, 10)}${!season.end_date ? " (Aktif)" : ""}`,
    }));
    const bagangOptions = [
        { value: "all", label: "Semua bagang" },
        ...bagangs.map((bagang) => ({ value: bagang.id, label: bagang.name })),
    ];
    const harvestTypeOptions = [
        { value: "all", label: "Semua jenis ikan" },
        ...harvestTypes.map((type) => ({ value: type.name, label: type.name })),
    ];

    return (
        <>
            <PageMeta title="Catchery | Stok" description="Ringkasan stok ikan" />
            <PageBreadcrumb pageTitle="Stok" />
            <div className="space-y-6">
                <ComponentCard title="Filter Stok" desc="Filter menggunakan musim dan periode laporan">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                            <label htmlFor="stock-season" className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Musim</label>
                            <Select
                                id="stock-season"
                                options={seasonOptions}
                                value={selectedSeasonId?.toString() ?? ""}
                                onChange={(value) => setSelectedSeasonId(Number(value))}
                                placeholder={isLoadingSeasons ? "Memuat musim..." : "Pilih musim"}
                            />
                        </div>
                        <div>
                            <label htmlFor="stock-bagang" className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Bagang</label>
                            <Select
                                id="stock-bagang"
                                options={bagangOptions}
                                value={bagangId}
                                onChange={setBagangId}
                                placeholder={isLoadingBagangs ? "Memuat bagang..." : "Semua bagang"}
                            />
                        </div>
                        <div>
                            <label htmlFor="stock-harvest-type" className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Jenis ikan</label>
                            <Select
                                id="stock-harvest-type"
                                options={harvestTypeOptions}
                                value={harvestType}
                                onChange={setHarvestType}
                                placeholder={isLoadingHarvestTypes ? "Memuat jenis..." : "Semua jenis ikan"}
                            />
                        </div>
                        <div>
                            <label htmlFor="stock-start-date" className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Tanggal awal</label>
                            <Input id="stock-start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="stock-end-date" className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Tanggal akhir</label>
                            <Input id="stock-end-date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                        </div>
                    </div>
                </ComponentCard>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        ["Stok masuk", totals.stockIn],
                        ["Stok keluar", totals.stockOut],
                        ["Saldo stok", totals.balance],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{label} (kg)</p>
                            <p className={`mt-2 text-2xl font-bold ${label === "Saldo stok" && Number(value) < 0 ? "text-error-600" : "text-gray-800 dark:text-white/90"}`}>
                                {formatNumber(Number(value))}
                            </p>
                        </div>
                    ))}
                </div>

                <ComponentCard title="Ringkasan Stok" desc="Stok masuk dikurangi stok keluar">
                    {hasError && <p className="text-error-600">Gagal memuat musim atau ringkasan stok.</p>}
                    {isLoading && <p className="text-gray-500 dark:text-gray-400">Memuat data stok...</p>}
                    {!isLoading && !hasError && rows.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400">Tidak ada aktivitas stok untuk filter ini.</p>
                    )}
                    {!isLoading && !hasError && rows.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                    <tr>
                                        <th className="px-3 py-3 font-medium">Bagang</th>
                                        <th className="px-3 py-3 font-medium">Jenis ikan</th>
                                        <th className="px-3 py-3 font-medium">Masuk (kg)</th>
                                        <th className="px-3 py-3 font-medium">Keluar (kg)</th>
                                        <th className="px-3 py-3 font-medium">Saldo (kg)</th>
                                        <th className="px-3 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {rows.map((row) => (
                                        <tr key={`${row.bagang_id ?? "unassigned"}-${row.harvest_type}`}>
                                            <td className="px-3 py-3 text-gray-800 dark:text-white/90">{row.bagang_name}</td>
                                            <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{row.harvest_type || "-"}</td>
                                            <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatNumber(row.stock_in_kg)}</td>
                                            <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatNumber(row.stock_out_kg)}</td>
                                            <td className={`px-3 py-3 font-medium ${row.is_negative ? "text-error-600" : "text-gray-800 dark:text-white/90"}`}>
                                                {formatNumber(row.stock_balance_kg)}
                                            </td>
                                            <td className="px-3 py-3">
                                                {row.is_negative ? <span className="text-error-600">Saldo negatif</span> : <span className="text-success-600">Normal</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </ComponentCard>
            </div>
        </>
    );
}
