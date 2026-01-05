import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import useWorkerQuery from "../../features/worker/hooks/useWorker";
import Button from "../../component/ui/button/Button";
import WorkerFormModal from "./FormModal";
import useCreateWorkerMutation from "../../features/worker/hooks/useCreateWorkerMutation";
import useUpdateWorkerMutation from "../../features/worker/hooks/useUpdateWorkerMutation";
import useDeleteWorkerMutation from "../../features/worker/hooks/useDeleteWorkerMutation";
import { TrashBinIcon, PencilIcon } from "../../icons";
import { WorkerProps } from "../../features/worker/api/worker.type";

const WorkerTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<WorkerProps | null>(null);
    const itemsPerPage = 5;

    const { data: response, isLoading, error } = useWorkerQuery();
    const { mutate: createWorker, isPending: isCreating } = useCreateWorkerMutation();
    const { mutate: updateWorker, isPending: isUpdating } = useUpdateWorkerMutation();
    const { mutate: deleteWorker } = useDeleteWorkerMutation();

    const data = response?.data?.data || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCreate = (formData: { name: string }) => {
        createWorker(formData, {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const handleUpdate = (formData: { name: string }) => {
        if (editingWorker) {
            updateWorker(
                { id: editingWorker.id, data: formData },
                {
                    onSuccess: () => setIsModalOpen(false),
                },
            );
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Apakah anda yakin ingin menghapus "${name}"?`)) {
            deleteWorker(id);
        }
    };

    const openCreateModal = () => {
        setEditingWorker(null);
        setIsModalOpen(true);
    };

    const openEditModal = (worker: WorkerProps) => {
        setEditingWorker(worker);
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
            columnClassName: "w-3/4",
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
                        Tambah
                    </Button>
                }
            />

            <WorkerFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingWorker ? handleUpdate : handleCreate}
                initialData={editingWorker}
                isLoading={isCreating || isUpdating}
            />
        </div>
    );
};

export default WorkerTable;
