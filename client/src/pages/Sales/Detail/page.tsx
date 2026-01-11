import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import BasicTableData from "../../../component/table/BasicTableData";
import Button from "../../../component/ui/button/Button";
import { ChevronLeftIcon, PencilIcon, TrashBinIcon } from "../../../icons";
import useSalesDetailQuery from "../../../features/sales/hooks/useSalesDetailQuery";
import useAddSalesItemMutation from "../../../features/sales/hooks/useAddSalesItemMutation";
import useUpdateSalesItemMutation from "../../../features/sales/hooks/useUpdateSalesItemMutation";
import useDeleteSalesItemMutation from "../../../features/sales/hooks/useDeleteSalesItemMutation";
import useAddPaymentMutation from "../../../features/sales/hooks/useAddPaymentMutation";
import useUpdatePaymentMutation from "../../../features/sales/hooks/useUpdatePaymentMutation";
import useDeletePaymentMutation from "../../../features/sales/hooks/useDeletePaymentMutation";
import AddItemModal from "./AddItemModal";
import AddPaymentModal from "./AddPaymentModal";
import type { TableHeader } from "../../../component/table/types";
import toast from "react-hot-toast";

const DetailSalesPage = () => {
    const { id } = useParams<{ id: string }>();
    const salesId = id || "";

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [editingPayment, setEditingPayment] = useState<any | null>(null);

    const { data: response, isLoading } = useSalesDetailQuery(salesId);
    const salesData = response?.data?.data;

    const { mutate: addItem, isPending: isAddingItem } = useAddSalesItemMutation();
    const { mutate: updateItem, isPending: isUpdatingItem } = useUpdateSalesItemMutation();
    const { mutate: deleteItem } = useDeleteSalesItemMutation();

    const { mutate: addPayment, isPending: isAddingPayment } = useAddPaymentMutation();
    const { mutate: updatePayment, isPending: isUpdatingPayment } = useUpdatePaymentMutation();
    const { mutate: deletePayment } = useDeletePaymentMutation();

    const handleItemSubmit = (data: any) => {
        if (editingItem) {
            updateItem({ id: editingItem.id, data }, {
                onSuccess: () => {
                    setIsItemModalOpen(false);
                    toast.success("Item diubah");
                },
                onError: () => {
                    toast.error("Gagal mengubah");
                },
            });
        } else {
            addItem({ id: salesId, data }, {
                onSuccess: () => {
                    setIsItemModalOpen(false);
                    toast.success("Item ditambahkan");
                },
                onError: () => {
                    toast.error("Gagal menambahkan");
                },
            });
        }
    };

    const handleDeleteItem = (id: number) => {
        if (confirm("Hapus item ini?")) {
            deleteItem(id, {
                onSuccess: () => toast.success("Item dihapus"),
                onError: () => toast.error("Gagal menghapus"),
            });
        }
    };

    const handlePaymentSubmit = (data: any) => {
        if (editingPayment) {
            updatePayment({ id: editingPayment.id, data }, {
                onSuccess: () => {
                    setIsPaymentModalOpen(false);
                    toast.success("Pembayaran diubah");
                },
                onError: () => {
                    toast.error("Gagal mengubah");
                },
            });
        } else {
            addPayment({ id: salesId, data }, {
                onSuccess: () => {
                    setIsPaymentModalOpen(false);
                    toast.success("Pembayaran ditambahkan");
                },
                onError: () => {
                    toast.error("Gagal menambahkan");
                },
            });
        }
    };

    const handleDeletePayment = (id: number) => {
        if (confirm("Hapus pembayaran ini?")) {
            deletePayment(id, {
                onSuccess: () => toast.success("Pembayaran dihapus"),
                onError: () => toast.error("Gagal menghapus"),
            });
        }
    };

    const openAddItem = () => { setEditingItem(null); setIsItemModalOpen(true); };
    const openEditItem = (item: any) => { setEditingItem(item); setIsItemModalOpen(true); };

    const openAddPayment = () => { setEditingPayment(null); setIsPaymentModalOpen(true); };
    const openEditPayment = (payment: any) => { setEditingPayment(payment); setIsPaymentModalOpen(true); };

    const itemColumns: TableHeader[] = [
        { key: "harvest_types", title: "Jenis Ikan" },
        { key: "weight", title: "Berat (kg)" },
        { key: "price", title: "Harga", render: (row) => `Rp ${row.price.toLocaleString("id-ID")}` },
        { key: "subtotal", title: "Subtotal", render: (row) => `Rp ${row.subtotal.toLocaleString("id-ID")}` },
        {
            key: "actions", title: "Aksi", render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => openEditItem(row)} className="text-blue-500"><PencilIcon className="size-4" /></button>
                    <button onClick={() => handleDeleteItem(row.id)} className="text-red-500"><TrashBinIcon className="size-4" /></button>
                </div>
            )
        }
    ];

    const paymentColumns: TableHeader[] = [
        { key: "paid_at", title: "Tanggal", render: (row) => new Date(row.paid_at).toLocaleDateString("id-ID") },
        { key: "amount", title: "Jumlah", render: (row) => `Rp ${row.amount.toLocaleString("id-ID")}` },
        {
            key: "actions", title: "Aksi", render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => openEditPayment(row)} className="text-blue-500"><PencilIcon className="size-4" /></button>
                    <button onClick={() => handleDeletePayment(row.id)} className="text-red-500"><TrashBinIcon className="size-4" /></button>
                </div>
            )
        }
    ];

    if (isLoading) return <div>Loading...</div>;
    if (!salesData) return <div>Data not found</div>;

    const remaining = (salesData.total_amount || 0) - (salesData.total_paid || 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Detail Penjualan #{salesData.id}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${salesData.is_paid_off ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {salesData.is_paid_off ? "LUNAS" : "BELUM LUNAS"}
                    </span>
                </div>
                <Link to="/penjualan"><Button variant="outline" size="sm"><ChevronLeftIcon className="w-5 h-5" />Kembali</Button></Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="text-lg font-semibold">{salesData.customer}</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm text-gray-500">Total Tagihan</p>
                    <p className="text-lg font-semibold">Rp {salesData.total_amount?.toLocaleString("id-ID") || 0}</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm text-gray-500">Sisa Tagihan</p>
                    <p className="text-lg font-semibold text-red-500">Rp {remaining.toLocaleString("id-ID")}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Rincian Barang</h2>
                    <Button size="sm" onClick={openAddItem}>Tambah Barang</Button>
                </div>
                <BasicTableData columns={itemColumns} data={salesData.sales_details || []} useNumbering />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Riwayat Pembayaran</h2>
                    <Button size="sm" onClick={openAddPayment}>Tambah Pembayaran</Button>
                </div>
                <BasicTableData columns={paymentColumns} data={salesData.transaction_details || []} useNumbering />
            </div>

            <AddItemModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onSubmit={handleItemSubmit} isLoading={isAddingItem || isUpdatingItem} initialData={editingItem} />
            <AddPaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSubmit={handlePaymentSubmit} isLoading={isAddingPayment || isUpdatingPayment} maxAmount={remaining + (editingPayment ? editingPayment.amount : 0)} initialData={editingPayment} />
        </div>
    );
};

export default DetailSalesPage;
