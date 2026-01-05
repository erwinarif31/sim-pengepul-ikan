import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Label from "../../../component/form/Label";
import Input from "../../../component/form/input/InputField";
import Select from "../../../component/form/Select";
import { Modal } from "../../../component/ui/modal";
import useProductionCostTypeQuery from "../../../features/production-cost-type/hooks/useProductionCostType";
import { ProductionCostProps } from "../../../features/production-cost/api/production-cost.type";

const schema = z.object({
    production_costs_type: z.string().min(1, "Jenis pengeluaran wajib dipilih"),
    price: z.string().transform((v) => parseInt(v)).pipe(z.number().min(0)),
});

type FormProps = z.infer<typeof schema>;

interface ProductionCostFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: ProductionCostProps | null;
    isLoading?: boolean;
}

export default function ProductionCostFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
}: ProductionCostFormModalProps) {
    const { data: costTypeResponse } = useProductionCostTypeQuery();
    const costTypes = useMemo(() => {
        return (
            costTypeResponse?.data?.data?.map((t) => ({
                value: t.name,
                label: t.name,
            })) || []
        );
    }, [costTypeResponse]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormProps>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    production_costs_type: initialData.production_costs_type,
                    price: initialData.price.toString() as any,
                });
            } else {
                reset({
                    production_costs_type: "",
                    price: "" as any,
                });
            }
        }
    }, [isOpen, initialData, reset]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[90%] md:max-w-[500px] mx-auto"
        >
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {initialData ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Jenis Pengeluaran</Label>
                        <Select
                            options={costTypes}
                            placeholder="Pilih Jenis Pengeluaran"
                            error={!!errors.production_costs_type}
                            hint={errors.production_costs_type?.message}
                            {...register("production_costs_type")}
                            onChange={(value) =>
                                setValue("production_costs_type", value as string)
                            }
                            value={watch("production_costs_type")}
                        />
                    </div>
                    <div>
                        <Label>Biaya (Rp)</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            error={!!errors.price}
                            hint={errors.price?.message}
                            {...register("price")}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-xs hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-xs bg-brand-600 hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                        >
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
