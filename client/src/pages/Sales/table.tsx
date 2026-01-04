import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import { EyeIcon } from "../../icons";
import useSalesQuery from "../../features/sales/hooks/useSales";

const columns: TableHeader[] = [
    {
        key: "id",
        title: "ID",
        sortable: true,
        columnClassName: "w-1/12",
    },
    {
        key: "customer",
        title: "Customer",
        sortable: true,
        columnClassName: "w-1/4",
    },
    {
        key: "issued_at",
        title: "Date",
        sortable: true,
        columnClassName: "w-1/4",
        render: (row) => new Date(row.issued_at).toLocaleDateString(),
    },
    {
        key: "is_paid_off",
        title: "Status",
        sortable: true,
        columnClassName: "w-1/4",
        render: (row) => (
            <span
                className={`px-2 py-1 rounded text-xs text-white ${
                    row.is_paid_off ? "bg-green-500" : "bg-red-500"
                }`}
            >
                {row.is_paid_off ? "Paid" : "Unpaid"}
            </span>
        ),
    },
    {
        key: "actions",
        title: "Actions",
        render: (row) => (
            <a
                className="flex justify-center text-blue-500 hover:underline"
                href={"/pembelian/" + row.id}
            >
                <EyeIcon className="text-blue-700 cursor-pointer size-5 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500" />
            </a>
        ),
    },
];

const SalesTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { data: response, isLoading, error } = useSalesQuery();

    const data = response?.data?.data || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    if (error) {
        return (
            <div className="p-4 md:p-6 2xl:p-10 text-red-500">
                Error: {error instanceof Error ? error.message : "An unknown error occurred"}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <BasicTableData
                columns={columns}
                data={paginatedData}
                isLoading={isLoading}
                useNumbering={true}
                pagination={{
                    current_page: currentPage,
                    per_page: itemsPerPage,
                    total: data.length,
                }}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default SalesTable;
