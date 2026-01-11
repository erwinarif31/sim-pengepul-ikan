import { useState, useEffect } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import { EyeIcon } from "../../icons";
import useSalesQuery from "../../features/sales/hooks/useSales";
import { Link } from "react-router-dom";
import Input from "../../component/form/input/InputField";
import Select from "../../component/form/Select";

const SalesTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    // Construct params
    const params: any = {};
    if (debouncedSearch) params.customer = debouncedSearch;
    if (statusFilter) {
        if (statusFilter === "lunas") params.is_paid_off = "true";
        if (statusFilter === "belum_lunas") params.is_paid_off = "false";
    }

    const { data: response, isLoading, error } = useSalesQuery({ params });

    const data = response?.data?.data || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedData = data.slice(
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
            title: "Customer",
            sortable: true,
            columnClassName: "w-1/4",
        },
        {
            key: "issued_at",
            title: "Date",
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
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                    <Input
                        placeholder="Cari Customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-1/4">
                    <Select
                        options={[
                            { value: "", label: "Semua Status" },
                            { value: "lunas", label: "Lunas" },
                            { value: "belum_lunas", label: "Belum Lunas" },
                        ]}
                        placeholder="Filter Status"
                        value={statusFilter}
                        onChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1); // Reset page on filter change
                        }}
                    />
                </div>
            </div>

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
