import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import Button from "../../component/ui/button/Button";
import { EyeIcon } from "../../icons";
import useGetAllBagangs from "../../features/bagang/hooks/useGetAllBagangs";

const columns: TableHeader[] = [
    {
        key: "name",
        title: "Name",
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

const BagangTable = () => {
    const { data: response, isLoading, isError } = useGetAllBagangs();
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
                            Tambah Bagang
                        </Button>
                    </>
                }
                columns={columns}
                data={response?.data ?? []}
                isLoading={isLoading}
                useNumbering={true}
                pagination={{
                    current_page: currentPage,
                    per_page: itemsPerPage,
                    total: response?.data.length ?? 0,
                }}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default BagangTable;
