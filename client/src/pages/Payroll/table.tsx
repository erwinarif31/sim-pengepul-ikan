import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import useGeneratePayrollPDF from "../../features/payroll/hooks/useGeneratePayrollPDF";
import usePayrollQuery from "../../features/payroll/hooks/usePayrollQuery";
import type { PayrollRow } from "../../features/payroll/api/payroll.type";
import { DownloadIcon } from "../../icons";
import Select from "../../component/form/Select";

const formatSeason = (row: PayrollRow) =>
    `${row.season_start_date.slice(0, 10)}${row.season_end_date ? ` - ${row.season_end_date.slice(0, 10)}` : " (Aktif)"}`;

const PayrollTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("all");
    const [bagangFilter, setBagangFilter] = useState("all");
    const [seasonFilter, setSeasonFilter] = useState("all");
    const { data: payrollResponse, isLoading, error } = usePayrollQuery();
    const { mutate: generatePDF, isPending: isGenerating } = useGeneratePayrollPDF();

    const rows = payrollResponse?.data?.data || [];
    const names = [...new Set(rows.map((row) => row.worker_name))].sort();
    const bagangs = [...new Map(rows.map((row) => [row.bagang_id, row.bagang_name])).entries()]
        .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB));
    const seasons = [...new Map(rows.map((row) => [row.season_id, formatSeason(row)])).entries()]
        .sort(([idA], [idB]) => idB - idA);

    const filteredRows = rows.filter((row) =>
        (nameFilter === "all" || row.worker_name === nameFilter) &&
        (bagangFilter === "all" || row.bagang_id === bagangFilter) &&
        (seasonFilter === "all" || row.season_id.toString() === seasonFilter),
    );

    const columns: TableHeader[] = [
        {
            key: "worker_name",
            title: "Nama",
            columnClassName: "w-1/4",
        },
        {
            key: "bagang_name",
            title: "Bagang",
            columnClassName: "w-1/4",
        },
        {
            key: "season_id",
            title: "Musim",
            columnClassName: "w-1/4",
            render: (row: PayrollRow) => formatSeason(row),
        },
        {
            key: "actions",
            title: "Cetak PDF",
            hideOnMobile: true,
            render: (row: PayrollRow) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => generatePDF({
                            workerID: row.worker_id,
                            workerName: row.worker_name,
                            bagangID: row.bagang_id,
                            seasonID: row.season_id,
                        })}
                        className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        disabled={isGenerating}
                        aria-label={`Cetak PDF ${row.worker_name} ${row.bagang_name}`}
                        title="Cetak PDF"
                    >
                        <DownloadIcon className="size-5" />
                        <span className="text-sm font-medium">Cetak PDF</span>
                    </button>
                </div>
            ),
        },
    ];

    if (error) {
        return (
            <div className="p-4 md:p-6 2xl:p-10 text-red-500">
                Error: {error instanceof Error ? error.message : "An unknown error occurred"}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 2xl:p-10 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Select
                    aria-label="Filter Nama"
                    options={[{ value: "all", label: "Semua Nama" }, ...names.map((name) => ({ value: name, label: name }))]}
                    value={nameFilter}
                    onChange={(value) => {
                        setNameFilter(value);
                        setCurrentPage(1);
                    }}
                />
                <Select
                    aria-label="Filter Bagang"
                    options={[{ value: "all", label: "Semua Bagang" }, ...bagangs.map(([id, name]) => ({ value: id, label: name }))]}
                    value={bagangFilter}
                    onChange={(value) => {
                        setBagangFilter(value);
                        setCurrentPage(1);
                    }}
                />
                <Select
                    aria-label="Filter Musim"
                    options={[{ value: "all", label: "Semua Musim" }, ...seasons.map(([id, label]) => ({ value: id.toString(), label }))]}
                    value={seasonFilter}
                    onChange={(value) => {
                        setSeasonFilter(value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            <BasicTableData
                title="Penggajian"
                columns={columns}
                data={filteredRows.slice((currentPage - 1) * 50, currentPage * 50)}
                isLoading={isLoading}
                pagination={{
                    current_page: currentPage,
                    per_page: 50,
                    total: filteredRows.length,
                }}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default PayrollTable;
