import { useState, useMemo } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import useWorkerQuery from "../../features/worker/hooks/useWorker";
import useGeneratePayrollPDF from "../../features/payroll/hooks/useGeneratePayrollPDF";
import { DownloadIcon } from "../../icons";
import useBagangQuery from "../../features/bagang/hooks/useBagangQuery";
import Select from "../../component/form/Select";

const PayrollTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [search, setSearch] = useState("");
    const [selectedBagangs, setSelectedBagangs] = useState<Record<string, string>>({});

    const { data: workerResponse, isLoading: isLoadingWorkers, error: workerError } = useWorkerQuery();
    const { data: bagangResponse, isLoading: isLoadingBagangs } = useBagangQuery();
    const { mutate: generatePDF, isPending: isGenerating } = useGeneratePayrollPDF();

    const workers = workerResponse?.data?.data || [];
    const allBagangs = bagangResponse?.data?.data || [];

    // Client-side filtering
    const filteredWorkers = workers.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleGeneratePDF = (workerID: string, workerName: string) => {
        const bagangID = selectedBagangs[workerID];
        generatePDF({ workerID, workerName, bagangID: bagangID === "all" ? undefined : bagangID });
    };

    const handleBagangChange = (workerID: string, bagangID: string) => {
        setSelectedBagangs(prev => ({ ...prev, [workerID]: bagangID }));
    };

    const paginatedData = filteredWorkers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const columns: TableHeader[] = [
        {
            key: "name",
            title: "Nama Pekerja",
            sortable: true,
            columnClassName: "w-1/3",
        },
        {
            key: "bagang",
            title: "Pilih Bagang",
            columnClassName: "w-1/3",
            render: (row) => {
                // Filter bagangs where this worker is either worker or owner
                const workerBagangs = allBagangs.filter(b => b.worker_id === row.id || b.owner_id === row.id);
                const options = [
                    { value: "all", label: "Semua Bagang" },
                    ...workerBagangs.map(b => ({ value: b.id, label: b.name }))
                ];

                return (
                    <div className="w-full max-w-xs">
                        <Select
                            options={options}
                            value={selectedBagangs[row.id] || "all"}
                            onChange={(val) => handleBagangChange(row.id, val)}
                            placeholder="Pilih Bagang"
                        />
                    </div>
                );
            }
        },
        {
            key: "actions",
            title: "Cetak PDF",
            render: (row) => (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => handleGeneratePDF(row.id, row.name)}
                        className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        disabled={isGenerating}
                        title="Download Payroll PDF"
                    >
                        <DownloadIcon className="size-5" />
                        <span className="text-sm font-medium">Download</span>
                    </button>
                </div>
            ),
        },
    ];

    if (workerError) {
        return (
            <div className="p-4 md:p-6 2xl:p-10 text-red-500">
                Error: {workerError instanceof Error ? workerError.message : "An unknown error occurred"}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 2xl:p-10 space-y-4">
            <BasicTableData
                columns={columns}
                data={paginatedData}
                isLoading={isLoadingWorkers || isLoadingBagangs}
                useNumbering={true}
                pagination={{
                    current_page: currentPage,
                    per_page: itemsPerPage,
                    total: filteredWorkers.length,
                }}
                onPageChange={handlePageChange}
                onSearch={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                searchValue={search}
            />
        </div>
    );
};

export default PayrollTable;
