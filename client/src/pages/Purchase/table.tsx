import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import { EyeIcon } from "../../icons";
import useBagangQuery from "../../features/bagang/hooks/useBagangQuery";
import { Link } from "react-router-dom";

const PurchaseTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const [search, setSearch] = useState("");
    
    // Fetch all data
    const { data: response, isLoading, error } = useBagangQuery();

    const data = response?.data?.data || [];
    
    // Client-side filtering
    const filteredData = data.filter((item) => {
        const searchTerm = search.toLowerCase();
        return (
            item.name.toLowerCase().includes(searchTerm) ||
            item.worker_name.toLowerCase().includes(searchTerm) ||
            item.owner_name.toLowerCase().includes(searchTerm)
        );
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedData = filteredData.slice(
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
            hideOnMobile: true,
        },
        {
            key: "actions",
            title: "Detail",
            hideOnMobile: true,
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
            mobileRender: (row) => (
                <Link
                    to={`/pembelian/${row.id}`}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg text-center"
                >
                    Lihat Detail
                </Link>
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

export default PurchaseTable;
