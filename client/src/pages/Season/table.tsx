import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import useSeasonQuery, {
    useEndSeasonMutation,
} from "../../features/season/hooks/useSeason";
import Button from "../../component/ui/button/Button";

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

    const { data: response, isLoading, error } = useSeasonQuery();
    const { mutate: endSeason, isPending: isEnding } = useEndSeasonMutation();

    const data = response?.data?.data || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEndSeason = () => {
        if (confirm("Apakah anda yakin ingin mengakhiri musim saat ini?")) {
            endSeason();
        }
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
                buttons={
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleEndSeason}
                        disabled={isEnding}
                    >
                        {isEnding ? "Memproses..." : "Akhiri Musim"}
                    </Button>
                }
            />
        </div>
    );
};

export default SeasonTable;