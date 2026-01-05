import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Label from "../../../component/form/Label";
import Input from "../../../component/form/input/InputField";
import Select from "../../../component/form/Select";
import TextArea from "../../../component/form/input/TextArea";
import { Modal } from "../../../component/ui/modal";
import useHarvestTypeQuery from "../../../features/harvest-type/hooks/useHarvestType";
import { HarvestProps } from "../../../features/harvest/api/harvest.type";

const schema = z.object({
    harvest_date: z.string().min(1, "Tanggal wajib diisi"),
    harvest_type: z.string().min(1, "Jenis ikan wajib dipilih"),
    weight: z.string().transform((v) => parseFloat(v)).pipe(z.number().min(0)),
    price: z.string().transform((v) => parseInt(v)).pipe(z.number().min(0)),
    description: z.string().optional(),
});

type FormProps = z.infer<typeof schema>;

interface HarvestFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: HarvestProps | null;
    isLoading?: boolean;
}

export default function HarvestFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
}: HarvestFormModalProps) {
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
    } = useForm<FormProps>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    harvest_date: initialData.harvest_date.split("T")[0],
                    harvest_type: initialData.harvest_type,
                    weight: initialData.weight.toString() as any,
                    price: initialData.price.toString() as any,
                    description: initialData.description,
                });
            } else {
                reset({
                    harvest_date: new Date().toISOString().split("T")[0],
                    harvest_type: "",
                    weight: "" as any,
                    price: "" as any,
                    description: "",
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
                    {initialData ? "Edit Hasil Panen" : "Tambah Hasil Panen"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Tanggal</Label>
                        <Input
                            type="date"
                            error={!!errors.harvest_date}
                            hint={errors.harvest_date?.message}
                            {...register("harvest_date")}
                        />
                    </div>
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
                    <div>
                        <Label>Deskripsi</Label>
                        <TextArea
                            placeholder="Keterangan tambahan..."
                            {...register("description")}
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
