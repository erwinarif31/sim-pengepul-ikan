import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../component/ui/modal";
import Button from "../../component/ui/button/Button";
import InputField from "../../component/form/input/InputField";
import TextArea from "../../component/form/input/TextArea";
import { CustomerProps } from "../../features/customer/api/customer.type";

const schema = z.object({
    name: z.string().min(1, "Nama wajib diisi").max(255, "Nama maksimal 255 karakter"),
    contact: z.string().max(255, "Kontak maksimal 255 karakter").optional(),
    address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
    initialData?: CustomerProps | null;
    isLoading?: boolean;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    contact: initialData.contact || "",
                    address: initialData.address || "",
                });
            } else {
                reset({
                    name: "",
                    contact: "",
                    address: "",
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const handleFormSubmit = (data: FormData) => {
        onSubmit(data);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[500px] p-6"
        >
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {initialData ? "Edit Pelanggan" : "Tambah Pelanggan"}
                </h3>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Nama
                            </label>
                            <InputField
                                {...register("name")}
                                placeholder="Masukkan nama pelanggan"
                                error={!!errors.name}
                                hint={errors.name?.message}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Kontak
                            </label>
                            <InputField
                                {...register("contact")}
                                placeholder="Masukkan kontak (HP/Email)"
                                error={!!errors.contact}
                                hint={errors.contact?.message}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Alamat
                            </label>
                            <TextArea
                                {...register("address")}
                                placeholder="Masukkan alamat"
                                error={!!errors.address}
                                hint={errors.address?.message}
                            />
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
                            disabled={isLoading}
                            fullWidth
                        >
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CustomerFormModal;
