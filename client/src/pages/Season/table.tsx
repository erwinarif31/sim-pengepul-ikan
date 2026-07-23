import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import useSeasonQuery from "../../features/season/hooks/useSeasonQuery";
import useEndSeasonMutation from "../../features/season/hooks/useEndSeasonMutation";
import Button from "../../component/ui/button/Button";
import { useAuth } from "../../context/AuthContext";

const columns: TableHeader[] = [
    {
        key: "start_date",
        title: "Tanggal Mulai",
        sortable: true,
        columnClassName: "w-1/2",
        render: (row) => {
            const date = new Date(row.start_date);
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        },
    },
    {
        key: "end_date",
        title: "Tanggal Berakhir",
        sortable: true,
        columnClassName: "w-1/2",
        render: (row) => {
            if (!row.end_date) return "-";
            const date = new Date(row.end_date);
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        },
    },
];

const SeasonTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [search, setSearch] = useState("");
    const { user } = useAuth();
    const canEndSeason = user?.role === "ADMIN";

    const { data: response, isLoading, error } = useSeasonQuery();
    const { mutate: endSeason, isPending: isEnding } = useEndSeasonMutation();

    const data = response?.data?.data || [];

    // Client-side filtering
    const filteredData = data.filter((item) => {
        const searchTerm = search.toLowerCase();

        const startDate = new Date(item.start_date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        let endDate = "-";
        if (item.end_date) {
            endDate = new Date(item.end_date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        }

        return (
            startDate.toLowerCase().includes(searchTerm) ||
            endDate.toLowerCase().includes(searchTerm)
        );
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEndSeason = () => {
        if (confirm("Apakah anda yakin ingin mengakhiri musim saat ini?")) {
            endSeason();
        }
    };

    const paginatedData = filteredData.slice(
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
            {canEndSeason && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mb-4">
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleEndSeason}
                        disabled={isEnding}
                        fullWidth
                    >
                        {isEnding ? "Memproses..." : "Akhiri Musim"}
                    </Button>
                </div>
            )}

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

export default SeasonTable;
