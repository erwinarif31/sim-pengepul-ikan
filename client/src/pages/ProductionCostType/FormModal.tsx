import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Label from "../../component/form/Label";
import Input from "../../component/form/input/InputField";
import { Modal } from "../../component/ui/modal";

const schema = z.object({
    name: z.string().min(1, "Nama jenis pengeluaran wajib diisi"),
});

type FormProps = z.infer<typeof schema>;

interface ProductionCostTypeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormProps) => void;
    isLoading?: boolean;
}

export default function ProductionCostTypeFormModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: ProductionCostTypeFormModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormProps>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[90%] md:max-w-[500px] mx-auto"
        >
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Tambah Jenis Pengeluaran
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Nama Jenis Pengeluaran</Label>
                        <Input
                            type="text"
                            placeholder="Masukkan nama jenis pengeluaran"
                            error={!!errors.name}
                            hint={errors.name?.message}
                            {...register("name")}
                        />
                    </div>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-xs hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-xs bg-brand-600 hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                        >
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
