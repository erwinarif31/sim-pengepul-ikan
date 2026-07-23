import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import useHarvestTypeQuery from "../../features/harvest-type/hooks/useHarvestType";
import Button from "../../component/ui/button/Button";
import HarvestTypeFormModal from "./FormModal";
import useCreateHarvestTypeMutation from "../../features/harvest-type/hooks/useCreateHarvestTypeMutation";
import useDeleteHarvestTypeMutation from "../../features/harvest-type/hooks/useDeleteHarvestTypeMutation";
import { TrashBinIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";

const HarvestTypeTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 5;
    const [search, setSearch] = useState("");
    const { user } = useAuth();
    const canManage = user?.role === "ADMIN";

    const { data: response, isLoading, error } = useHarvestTypeQuery();
    const { mutate: createHarvestType, isPending: isCreating } =
        useCreateHarvestTypeMutation();
    const { mutate: deleteHarvestType } = useDeleteHarvestTypeMutation();

    const data = response?.data?.data || [];

    // Client-side filtering
    const filteredData = data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCreate = (formData: { name: string }) => {
        createHarvestType(formData, {
            onSuccess: () => {
                setIsModalOpen(false);
            },
        });
    };

    const handleDelete = (name: string) => {
        if (confirm(`Apakah anda yakin ingin menghapus "${name}"?`)) {
            deleteHarvestType(name);
        }
    };

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const columns: TableHeader[] = [
        {
            key: "name",
            title: "Nama",
            sortable: true,
            columnClassName: "w-full",
        },
        ...(canManage ? [{
            key: "action",
            title: "Aksi",
            render: (row: any) => (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => handleDelete(row.name)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <TrashBinIcon className="size-5" />
                    </button>
                </div>
            ),
        }] : []),
    ];

    if (error) {
        return (
            <div className="p-4 md:p-6 2xl:p-10 text-red-500">
                Error: {error instanceof Error ? error.message : "An unknown error occurred"}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            {canManage && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mb-4">
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        fullWidth
                    >
                        Tambah
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

            {canManage && (
                <HarvestTypeFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreate}
                    isLoading={isCreating}
                />
            )}
        </div>
    );
};

export default HarvestTypeTable;
