import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import Button from "../../component/ui/button/Button";
import { TrashBinIcon, PencilIcon } from "../../icons";
import useCreateBagangMutation from "../../features/bagang/hooks/useCreateBagangMutation";
import useUpdateBagangMutation from "../../features/bagang/hooks/useUpdateBagangMutation";
import useDeleteBagangMutation from "../../features/bagang/hooks/useDeleteBagangMutation";
import BagangFormModal from "./FormModal";
import { BagangProps } from "../../features/bagang/api/bagang.type";
import useBagangQuery from "../../features/bagang/hooks/useBagangQuery";

const BagangTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBagang, setEditingBagang] = useState<BagangProps | null>(null);
    const itemsPerPage = 5;

    const { data: response, isLoading, error } = useBagangQuery();
    const { mutate: createBagang, isPending: isCreating } = useCreateBagangMutation();
    const { mutate: updateBagang, isPending: isUpdating } = useUpdateBagangMutation();
    const { mutate: deleteBagang } = useDeleteBagangMutation();

    const data = response?.data?.data || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCreate = (formData: any) => {
        createBagang(formData, {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const handleUpdate = (formData: any) => {
        if (editingBagang) {
            updateBagang(
                { id: editingBagang.id, data: formData },
                {
                    onSuccess: () => setIsModalOpen(false),
                },
            );
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Apakah anda yakin ingin menghapus Bagang "${name}"?`)) {
            deleteBagang(id);
        }
    };

    const openCreateModal = () => {
        setEditingBagang(null);
        setIsModalOpen(true);
    };

    const openEditModal = (bagang: BagangProps) => {
        setEditingBagang(bagang);
        setIsModalOpen(true);
    };

    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

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
            key: "is_active",
            title: "Status",
            sortable: true,
            columnClassName: "w-1/12",
            render: (row) => (
                <span
                    className={`px-2 py-1 rounded text-xs text-white ${row.is_active ? "bg-green-500" : "bg-red-500"
                        }`}
                >
                    {row.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Actions",
            render: (row) => (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => openEditModal(row)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <PencilIcon className="size-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id, row.name)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <TrashBinIcon className="size-5" />
                    </button>
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
                    <Button size="sm" variant="primary" onClick={openCreateModal}>
                        Tambah Bagang
                    </Button>
                }
            />

            <BagangFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingBagang ? handleUpdate : handleCreate}
                initialData={editingBagang}
                isLoading={isCreating || isUpdating}
            />
        </div>
    );
};

export default BagangTable;
