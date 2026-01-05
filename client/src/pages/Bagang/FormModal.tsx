import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Label from "../../component/form/Label";
import Input from "../../component/form/input/InputField";
import Checkbox from "../../component/form/input/Checkbox";
import Select from "../../component/form/Select";
import { Modal } from "../../component/ui/modal";
import useWorkerQuery from "../../features/worker/hooks/useWorker";
import { BagangProps } from "../../features/bagang/api/bagang.type";

const schema = z.object({
    name: z.string().min(1, "Nama bagang wajib diisi"),
    is_active: z.boolean().default(true),
    worker_id: z.string().min(1, "Pekerja wajib dipilih"),
    worker_name: z.string().optional(),
    owner_id: z.string().min(1, "Pemilik wajib dipilih"),
    owner_name: z.string().optional(),
});

type FormProps = z.infer<typeof schema>;

interface BagangFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormProps) => void;
    initialData?: BagangProps | null;
    isLoading?: boolean;
}

export default function BagangFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
}: BagangFormModalProps) {
    const { data: workerResponse } = useWorkerQuery();
    const workers = useMemo(() => {
        return (
            workerResponse?.data?.data?.map((w) => ({
                value: w.id,
                label: w.name,
            })) || []
        );
    }, [workerResponse]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormProps>({
        resolver: zodResolver(schema),
        defaultValues: {
            is_active: true,
        },
    });

    const watchWorkerId = watch("worker_id");
    const watchOwnerId = watch("owner_id");

    // Sync selected names when IDs change
    useEffect(() => {
        const selectedWorker = workers.find((w) => w.value === watchWorkerId);
        if (selectedWorker) {
            setValue("worker_name", selectedWorker.label);
        }
    }, [watchWorkerId, workers, setValue]);

    useEffect(() => {
        const selectedOwner = workers.find((w) => w.value === watchOwnerId);
        if (selectedOwner) {
            setValue("owner_name", selectedOwner.label);
        }
    }, [watchOwnerId, workers, setValue]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    is_active: initialData.is_active,
                    worker_id: initialData.worker_id,
                    worker_name: initialData.worker_name,
                    owner_id: initialData.owner_id,
                    owner_name: initialData.owner_name,
                });
            } else {
                reset({
                    name: "",
                    is_active: true,
                    worker_id: "",
                    owner_id: "",
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
                    {initialData ? "Edit Bagang" : "Tambah Bagang"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Nama Bagang</Label>
                        <Input
                            type="text"
                            placeholder="Masukkan nama bagang"
                            error={!!errors.name}
                            hint={errors.name?.message}
                            {...register("name")}
                        />
                    </div>
                    <div>
                        <Label>Pekerja (Operator)</Label>
                        <Select
                            options={workers}
                            placeholder="Pilih Pekerja"
                            error={!!errors.worker_id}
                            hint={errors.worker_id?.message}
                            {...register("worker_id")}
                            onChange={(value) => setValue("worker_id", value as string)}
                            value={watch("worker_id")}
                        />
                    </div>
                    <div>
                        <Label>Pemilik</Label>
                        <Select
                            options={workers}
                            placeholder="Pilih Pemilik"
                            error={!!errors.owner_id}
                            hint={errors.owner_id?.message}
                            {...register("owner_id")}
                            onChange={(value) => setValue("owner_id", value as string)}
                            value={watch("owner_id")}
                        />
                    </div>
                    <div>
                        <Label>Status Aktif</Label>
                        <Checkbox
                            label="Aktif"
                            {...register("is_active")}
                            checked={watch("is_active")}
                            onChange={(e) => setValue("is_active", e.target.checked)}
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
