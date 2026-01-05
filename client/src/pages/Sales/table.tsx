import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import { EyeIcon } from "../../icons";
import useBagangQuery from "../../features/bagang/hooks/useBagangQuery";
import { Link } from "react-router-dom";

const SalesTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // TODO: Pass filter { is_active: true } when backend supports it
    const { data: response, isLoading, error } = useBagangQuery();

    const data = response?.data?.data || [];
    // Client-side filter for now until backend supports it
    const activeBagangs = data.filter((bagang) => bagang.is_active);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedData = activeBagangs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const columns: TableHeader[] = [
        {
            key: "name",
            title: "Nama Bagang",
            sortable: true,
            columnClassName: "w-1/4",
        },
        {
            key: "worker_name",
            title: "Pekerja",
            sortable: true,
            columnClassName: "w-1/4",
        },
        {
            key: "owner_name",
            title: "Pemilik",
            sortable: true,
            columnClassName: "w-1/4",
        },
        {
            key: "actions",
            title: "Detail",
            render: (row) => (
                <div className="flex justify-center">
                    <Link
                        to={`/pembelian/${row.id}`}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <EyeIcon className="size-5" />
                    </Link>
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
        <div className="p-4 md:p-6 2xl:p-10">
            <BasicTableData
                columns={columns}
                data={paginatedData}
                isLoading={isLoading}
                useNumbering={true}
                pagination={{
                    current_page: currentPage,
                    per_page: itemsPerPage,
                    total: activeBagangs.length,
                }}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default SalesTable;
