import { useEffect, useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import Button from "../../component/ui/button/Button";
import { useParams } from "react-router-dom";

const columns: TableHeader[] = [
    {
        key: "created_at",
        title: "Tanggal",
        sortable: true,
    },
    {
        key: "production_costs_type",
        title: "Jenis",
        sortable: true,
    },
    {
        key: "price",
        title: "Harga",
        sortable: true,
    },
    // {
    //     key: "actions",
    //     title: "Actions",
    //     render: (row) => (
    //         <div className="flex space-x-2">
    //             <a
    //                 className="text-blue-500 hover:underline text-center"
    //                 href={"pembelian/" + row.id}
    //             >
    //                 View
    //             </a>
    //         </div>
    //     ),
    // },
];

const ProductionCostDetailTable = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { id } = useParams<{ id: string }>()
    console.log(id);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:8081/production-costs/${id}`,
                );
                if (!response.ok) {
                    throw new Error("Data fetching failed");
                }
                const result = await response.json();
                console.log(result);
                setData(result.data);
            } catch (err) {
                console.log(err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "An unknown error occurred",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                Error: {error}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <BasicTableData
                title="Pengeluaran"
                buttons={
                    <>
                        <Button size="sm" variant="success">
                            Tambah Pengeluaran
                        </Button>
                    </>
                }
                columns={columns}
                data={paginatedData}
                isLoading={loading}
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

export default ProductionCostDetailTable;
