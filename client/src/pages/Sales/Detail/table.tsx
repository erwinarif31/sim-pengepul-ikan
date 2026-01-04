import { useState } from "react";
import BasicTableData from "../../../component/table/BasicTableData";
import type { TableHeader } from "../../../component/table/types";
import Button from "../../../component/ui/button/Button";
import { useParams } from "react-router-dom";
import useGetAllHarvest from "../../../features/harvest/hooks/useGetAllHarvest";

const columns: TableHeader[] = [
    {
        key: "harvest_at",
        title: "Tanggal Panen",
        sortable: true,
        columnClassName: "w-1/6",
    },
    {
        key: "types",
        title: "Tipe",
        sortable: true,
        columnClassName: "w-1/12",
    },
    {
        key: "weight",
        title: "Berat (kg)",
        sortable: true,
        columnClassName: "w-1/12",
    },
    {
        key: "price",
        title: "Harga",
        sortable: true,
        columnClassName: "w-1/6",
    },
    {
        key: "total",
        title: "Total",
        sortable: true,
        columnClassName: "w-1/6",
    },
    {
        key: "bagang_name",
        title: "Nama Bagang",
        sortable: true,
        columnClassName: "w-1/6",
    },
    {
        key: "owner_name",
        title: "Pemilik",
        sortable: true,
        columnClassName: "w-1/6",
    },
    {
        key: "worker_name",
        title: "Pekerja",
        sortable: true,
        columnClassName: "w-1/6",
    },
    {
        key: "created_by_name",
        title: "Dibuat Oleh",
        sortable: true,
        columnClassName: "w-1/6",
    },
    {
        key: "description",
        title: "Deskripsi",
        sortable: false, // Description fields are often not sortable
        columnClassName: "w-1/4",
    },
    {
        key: "actions",
        title: "Actions",
        render: (row) => (
            <div className="flex space-x-2">
                <a
                    className="text-blue-500 hover:underline"
                    href={"pembelian/" + row.id}
                >
                    View
                </a>
            </div>
        ),
    },
];

const SalesDetailTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { id } = useParams<{ id: string }>();

    const { data: result, isLoading, error } = useGetAllHarvest(id!, {
        queryKeys: [currentPage]
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const data = result?.data ?? [];

    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    if (error) {
        return (
            <div className="p-4 md:p-6 2xl:p-10 text-red-500">
                Error: {error.message}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <BasicTableData
                title="Hasil Panen"
                buttons={
                    <>
                        <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => {
                                window.location.href = `/hasil-panen/tambah`;
                            }}
                        >
                            Tambah Hasil Panen
                        </Button>
                    </>
                }
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

export default SalesDetailTable;
