import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Label from "../../../component/form/Label";
import Input from "../../../component/form/input/InputField";
import Select from "../../../component/form/Select";
import { Modal } from "../../../component/ui/modal";
import useHarvestTypeQuery from "../../../features/harvest-type/hooks/useHarvestType";

const schema = z.object({
    harvest_type: z.string().min(1, "Jenis ikan wajib dipilih"),
    weight: z.string().transform((v) => parseFloat(v)).pipe(z.number().min(1)),
    price: z.string().transform((v) => parseInt(v)).pipe(z.number().min(0)),
});

type FormInput = z.input<typeof schema>;
type FormProps = z.output<typeof schema>;

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    initialData?: any;
}

export default function AddItemModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
}: AddItemModalProps) {
    const { data: harvestTypeResponse } = useHarvestTypeQuery();
    const harvestTypes = useMemo(() => {
        return (
            harvestTypeResponse?.data?.data?.map((t) => ({
                value: t.name,
                label: t.name,
            })) || []
        );
    }, [harvestTypeResponse]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormInput, unknown, FormProps>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    harvest_type: initialData.harvest_types,
                    weight: initialData.weight.toString(),
                    price: initialData.price.toString(),
                });
                // Force update value for Select component if needed, though reset should handle it
                setValue("harvest_type", initialData.harvest_types);
            } else {
                reset({
                    harvest_type: "",
                    weight: "",
                    price: "",
                });
            }
        }
    }, [isOpen, initialData, reset, setValue]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[90%] md:max-w-[500px] mx-auto"
        >
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {initialData ? "Edit Item Penjualan" : "Tambah Item Penjualan"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Jenis Ikan</Label>
                        <Select
                            options={harvestTypes}
                            placeholder="Pilih Jenis Ikan"
                            error={!!errors.harvest_type}
                            hint={errors.harvest_type?.message}
                            {...register("harvest_type")}
                            onChange={(value) => setValue("harvest_type", value as string)}
                            value={watch("harvest_type")}
                        />
                    </div>
                    <div>
                        <Label>Berat (kg)</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            step={0.1}
                            error={!!errors.weight}
                            hint={errors.weight?.message}
                            {...register("weight")}
                        />
                    </div>
                    <div>
                        <Label>Harga (Rp)</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            error={!!errors.price}
                            hint={errors.price?.message}
                            {...register("price")}
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
                            {isLoading ? "Simpan" : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
