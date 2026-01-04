import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import Button from "../../component/ui/button/Button";
import { EyeIcon } from "../../icons";
import useGetAllSeasons from "../../features/season/hooks/useGetAllSeasons";

const columns: TableHeader[] = [
    {
        key: "start_date",
        title: "Tanggal Mulai",
        sortable: true,
        columnClassName: "w-1/3",
    },
    {
        key: "end_date",
        title: "Tanggal Berakhir",
        sortable: true,
        columnClassName: "w-1/3",
    },
    {
        key: "actions",
        title: "Actions",
        render: (row) => (
            <a
                className="flex justify-center text-blue-500 hover:underline"
                href={"/" + row.id}
            >
                <EyeIcon className="text-blue-700 cursor-pointer size-5 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500" />
            </a>
        ),
    },
];

const SeasonTable = () => {
    const { data: response, isLoading, isError } = useGetAllSeasons();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (isError) {
        return (
            <div className="p-4 md:p-6 2xl:p-10 text-red-500">
                Error: {isError}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <BasicTableData
                // title="Data "
                buttons={
                    <>
                        <Button size="sm" variant="success">
                            Selesaikan Musim Berjalan
                        </Button>
                    </>
                }
                columns={columns}
                isLoading={isLoading}
                useNumbering={true}
                pagination={{
                    current_page: currentPage,
                    per_page: itemsPerPage,
                    total: response?.data.length ?? 0,
                }}
                onPageChange={handlePageChange}
                data={response?.data ?? []}
            />
        </div>
    );
};

export default SeasonTable;
