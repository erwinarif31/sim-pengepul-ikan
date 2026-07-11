import { useEffect, useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import { useParams } from "react-router-dom";
import http from "../../lib/http";

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
];

const ProductionCostDetailTable = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await http.get(`/api/bagang/${id}/production-costs`);
                setData(response.data.data ?? []);
            } catch (err) {
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
    }, [id]);

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
