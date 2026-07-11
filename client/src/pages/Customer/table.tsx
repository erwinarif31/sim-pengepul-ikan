import { useState } from "react";
import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import useCustomerQuery from "../../features/customer/hooks/useCustomer";
import Button from "../../component/ui/button/Button";
import CustomerFormModal from "./FormModal";
import useCreateCustomerMutation from "../../features/customer/hooks/useCreateCustomerMutation";
import useUpdateCustomerMutation from "../../features/customer/hooks/useUpdateCustomerMutation";
import useDeleteCustomerMutation from "../../features/customer/hooks/useDeleteCustomerMutation";
import { TrashBinIcon, PencilIcon } from "../../icons";
import { CustomerProps } from "../../features/customer/api/customer.type";

const CustomerTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerProps | null>(null);
    const itemsPerPage = 5;
    const [search, setSearch] = useState("");

    const { data: response, isLoading, error } = useCustomerQuery();
    const { mutate: createCustomer, isPending: isCreating } = useCreateCustomerMutation();
    const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomerMutation();
    const { mutate: deleteCustomer } = useDeleteCustomerMutation();

    const data = response?.data?.data || [];

    // Client-side filtering
    const filteredData = data.filter((item) => {
        const searchTerm = search.toLowerCase();
        return (
            item.name.toLowerCase().includes(searchTerm) ||
            (item.contact && item.contact.toLowerCase().includes(searchTerm)) ||
            (item.address && item.address.toLowerCase().includes(searchTerm))
        );
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCreate = (formData: any) => {
        createCustomer(formData, {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const handleUpdate = (formData: any) => {
        if (editingCustomer) {
            updateCustomer(
                { id: editingCustomer.id, data: formData },
                {
                    onSuccess: () => setIsModalOpen(false),
                },
            );
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Apakah anda yakin ingin menghapus Pelanggan "${name}"?`)) {
            deleteCustomer(id);
        }
    };

    const openCreateModal = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const openEditModal = (customer: CustomerProps) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
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
            columnClassName: "w-1/4",
        },
        {
            key: "contact",
            title: "Kontak",
            sortable: true,
            columnClassName: "w-1/4",
            hideOnMobile: true,
        },
        {
            key: "address",
            title: "Alamat",
            sortable: true,
            columnClassName: "w-1/3",
            hideOnMobile: true,
        },
        {
            key: "actions",
            title: "Aksi",
            hideOnMobile: true,
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
            mobileRender: (row) => (
                <>
                    <button
                        onClick={() => openEditModal(row)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(row.id, row.name)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg"
                    >
                        Hapus
                    </button>
                </>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mb-4">
                <Button size="sm" variant="primary" onClick={openCreateModal} fullWidth>
                    Tambah
                </Button>
            </div>

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

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingCustomer ? handleUpdate : handleCreate}
                initialData={editingCustomer}
                isLoading={isCreating || isUpdating}
            />
        </div>
    );
};

export default CustomerTable;
