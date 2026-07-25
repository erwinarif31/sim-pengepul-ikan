import React, { useState } from "react";
import { Modal } from "../../component/ui/modal";
import Button from "../../component/ui/button/Button";
import Select from "../../component/form/Select";
import useCustomerQuery from "../../features/customer/hooks/useCustomer";
import useCreateSalesMutation from "../../features/sales/hooks/useCreateSalesMutation";
import CustomerFormModal from "../Customer/FormModal";
import useCreateCustomerMutation from "../../features/customer/hooks/useCreateCustomerMutation";

interface CreateSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateSalesModal: React.FC<CreateSalesModalProps> = ({ isOpen, onClose }) => {
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    const { data: customerResponse } = useCustomerQuery();
    const customers = customerResponse?.data?.data || [];

    const { mutate: createSales, isPending: isCreatingSales } = useCreateSalesMutation();
    const { mutate: createCustomer, isPending: isCreatingCustomer } = useCreateCustomerMutation();

    const customerOptions = customers.map((c) => ({
        value: c.name, // We use name as the value for Sales.Customer
        label: c.name,
    }));
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        createSales(
            { customer: selectedCustomer },
            {
                onSuccess: () => {
                    onClose();
                    setSelectedCustomer("");
                },
            },
        );
    };

    const handleCreateCustomer = (formData: any) => {
        createCustomer(formData, {
            onSuccess: () => {
                setIsCustomerModalOpen(false);
                // Optionally select the newly created customer? 
                // Since we invalidate query, the list will refresh.
                // We could set selectedCustomer to formData.name
                setSelectedCustomer(formData.name);
            },
        });
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                className="max-w-[500px] p-6"
            >
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Buat Penjualan Baru
                    </h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Pelanggan
                            </label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="grow">
                                    <Select
                                        options={customerOptions}
                                        value={selectedCustomer}
                                        onChange={setSelectedCustomer}
                                        placeholder="Pilih Pelanggan"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsCustomerModalOpen(true)}
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onClose}
                                type="button"
                                fullWidth
                            >
                                Batal
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                type="submit"
                                disabled={!selectedCustomer || isCreatingSales}
                                fullWidth
                            >
                                {isCreatingSales ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <CustomerFormModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                onSubmit={handleCreateCustomer}
                isLoading={isCreatingCustomer}
            />
        </>
    );
};

export default CreateSalesModal;
