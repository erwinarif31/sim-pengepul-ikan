import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Label from "../../../component/form/Label";
import Input from "../../../component/form/input/InputField";
import { Modal } from "../../../component/ui/modal";

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    maxAmount: number;
    initialData?: any;
}

export default function AddPaymentModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    maxAmount,
    initialData,
}: AddPaymentModalProps) {
    const schema = useMemo(
        () =>
            z.object({
                amount: z
                    .string()
                    .transform((v) => parseInt(v))
                    .pipe(
                        z
                            .number()
                            .min(1, "Jumlah minimal Rp 1")
                            .max(
                                maxAmount,
                                `Jumlah tidak boleh melebihi sisa tagihan (Rp ${maxAmount.toLocaleString(
                                    "id-ID",
                                )})`,
                            ),
                    ),
            }),
        [maxAmount],
    );

    type FormInput = z.input<typeof schema>;
    type FormProps = z.output<typeof schema>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormInput, unknown, FormProps>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({ amount: initialData.amount.toString() });
            } else {
                reset({ amount: "" });
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
                    {initialData ? "Edit Pembayaran" : "Tambah Pembayaran"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Jumlah Pembayaran (Rp)</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            error={!!errors.amount}
                            hint={errors.amount?.message}
                            {...register("amount")}
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
                            {isLoading ? "Simpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
