import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import useProductionCostTypeQuery from "../../features/production-cost-type/hooks/useProductionCostType";
import Button from "../../component/ui/button/Button";
import ProductionCostTypeFormModal from "./FormModal";
import useCreateProductionCostTypeMutation from "../../features/production-cost-type/hooks/useCreateProductionCostTypeMutation";
import useDeleteProductionCostTypeMutation from "../../features/production-cost-type/hooks/useDeleteProductionCostTypeMutation";
import { TrashBinIcon } from "../../icons";

const ProductionCostTypeTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 5;

    const { data: response, isLoading, error } = useProductionCostTypeQuery();
    const { mutate: createProductionCostType, isPending: isCreating } =
        useCreateProductionCostTypeMutation();
    const { mutate: deleteProductionCostType } =
        useDeleteProductionCostTypeMutation();

    const data = response?.data?.data || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCreate = (formData: { name: string }) => {
        createProductionCostType(formData, {
            onSuccess: () => {
                setIsModalOpen(false);
            },
        });
    };

    const handleDelete = (name: string) => {
        if (confirm(`Apakah anda yakin ingin menghapus "${name}"?`)) {
            deleteProductionCostType(name);
        }
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
            columnClassName: "w-full",
        },
        {
            key: "action",
            title: "Action",
            render: (row) => (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => handleDelete(row.name)}
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
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tambah
                    </Button>
                }
            />

            <ProductionCostTypeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={isCreating}
            />
        </div>
    );
};

export default ProductionCostTypeTable;
