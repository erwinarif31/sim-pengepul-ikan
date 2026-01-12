import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import useWorkerQuery from "../../features/worker/hooks/useWorker";
import useGeneratePayrollPDF from "../../features/payroll/hooks/useGeneratePayrollPDF";
import { DownloadIcon } from "../../icons";
import Input from "../../component/form/input/InputField";

const PayrollTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [search, setSearch] = useState("");

    const { data: response, isLoading, error } = useWorkerQuery();
    const { mutate: generatePDF, isPending: isGenerating } = useGeneratePayrollPDF();

    const data = response?.data?.data || [];

    // Client-side filtering
    const filteredData = data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleGeneratePDF = (workerID: string, workerName: string) => {
        generatePDF({ workerID, workerName });
    };

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const columns: TableHeader[] = [
        {
            key: "name",
            title: "Nama",
            sortable: true,
            columnClassName: "w-3/4",
        },
        {
            key: "actions",
            title: "Aksi",
            render: (row) => (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => handleGeneratePDF(row.id, row.name)}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        disabled={isGenerating}
                        title="Download Payroll PDF"
                    >
                        <DownloadIcon className="size-5" />
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
            <BasicTableData
                columns={columns}
                data={paginatedData}
                isLoading={isLoading}
                useNumbering={true}
                pagination={{
                    current_page: currentPage,
                    per_page: itemsPerPage,
                    total: filteredData.length,
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
