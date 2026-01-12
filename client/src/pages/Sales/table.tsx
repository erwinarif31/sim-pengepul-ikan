import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import { EyeIcon } from "../../icons";
import useSalesQuery from "../../features/sales/hooks/useSales";
import { Link } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import CreateSalesModal from "./CreateModal";

const SalesTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [search, setSearch] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: response, isLoading, error } = useSalesQuery();

    const data = response?.data?.data || [];

    // Client-side filtering
    const filteredData = data.filter((item) => {
        const searchTerm = search.toLowerCase();
        const dateStr = new Date(item.issued_at).toLocaleDateString("id-ID");
        const amountStr = `Rp ${item.total_amount?.toLocaleString("id-ID") || 0}`;
        const statusStr = item.is_paid_off ? "lunas" : "belum lunas";

        return (
            item.customer.toLowerCase().includes(searchTerm) ||
            dateStr.toLowerCase().includes(searchTerm) ||
            amountStr.toLowerCase().includes(searchTerm) ||
            statusStr.includes(searchTerm)
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
            key: "id",
            title: "ID",
            sortable: true,
            columnClassName: "w-1/12",
        },
        {
            key: "customer",
            title: "Pelanggan",
            sortable: true,
            columnClassName: "w-1/4",
        },
        {
            key: "issued_at",
            title: "Tanggal",
            sortable: true,
            columnClassName: "w-1/4",
            render: (row) => new Date(row.issued_at).toLocaleDateString("id-ID"),
        },
        {
            key: "total_amount",
            title: "Total",
            sortable: true,
            columnClassName: "w-1/6",
            render: (row) => `Rp ${row.total_amount?.toLocaleString("id-ID") || 0}`,
        },
        {
            key: "is_paid_off",
            title: "Status",
            sortable: true,
            columnClassName: "w-1/6",
            render: (row) => (
                <span
                    className={`px-2 py-1 rounded text-xs text-white ${row.is_paid_off ? "bg-green-500" : "bg-red-500"
                        }`}
                >
                    {row.is_paid_off ? "Lunas" : "Belum Lunas"}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Detail",
            render: (row) => (
                <div className="flex justify-center">
                    <Link
                        to={`/penjualan/${row.id}`}
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
        <div className="p-4 md:p-6 2xl:p-10 space-y-4">
            <div className="flex justify-end mb-4">
                <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Tambah Penjualan
                </Button>
            </div>

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

            <CreateSalesModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default SalesTable;
