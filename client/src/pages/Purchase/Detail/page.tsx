import { useState } from "react";
import BasicTableData from "../../../component/table/BasicTableData";
import type { TableHeader } from "../../../component/table/types";
import useHarvestsQuery from "../../../features/harvest/hooks/useHarvestsQuery";
import useProductionCostsQuery from "../../../features/production-cost/hooks/useProductionCostsQuery";
import useBagangDetailQuery from "../../../features/bagang/hooks/useBagangDetailQuery";
import { useParams, Link, Navigate } from "react-router-dom";
import Button from "../../../component/ui/button/Button";
import { ChevronLeftIcon, PencilIcon, TrashBinIcon } from "../../../icons";
import useCreateHarvestMutation from "../../../features/harvest/hooks/useCreateHarvestMutation";
import useUpdateHarvestMutation from "../../../features/harvest/hooks/useUpdateHarvestMutation";
import useDeleteHarvestMutation from "../../../features/harvest/hooks/useDeleteHarvestMutation";
import useCreateProductionCostMutation from "../../../features/production-cost/hooks/useCreateProductionCostMutation";
import useUpdateProductionCostMutation from "../../../features/production-cost/hooks/useUpdateProductionCostMutation";
import useDeleteProductionCostMutation from "../../../features/production-cost/hooks/useDeleteProductionCostMutation";
import HarvestFormModal from "./HarvestFormModal";
import ProductionCostFormModal from "./ProductionCostFormModal";
import { HarvestProps } from "../../../features/harvest/api/harvest.type";
import { ProductionCostProps } from "../../../features/production-cost/api/production-cost.type";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import useGetAllSeasons from "../../../features/season/hooks/useGetAllSeasons";

const DetailSalesPage = () => {
    const { id } = useParams<{ id: string }>();
    const bagangId = id || "";
    const [activeTab, setActiveTab] = useState<"harvest" | "cost">("harvest");
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>();
    const { user } = useAuth();
    const { data: seasonResponse } = useGetAllSeasons();
    const seasons = seasonResponse?.data || [];
    const activeSeasonId = seasons.find((season) => !season.end_date)?.id.toString() ?? "all";
    const effectiveSeasonId = selectedSeasonId ?? activeSeasonId;
    const isAllSeasons = effectiveSeasonId === "all";

    const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
    const [editingHarvest, setEditingHarvest] = useState<HarvestProps | null>(null);

    const [isCostModalOpen, setIsCostModalOpen] = useState(false);
    const [editingCost, setEditingCost] = useState<ProductionCostProps | null>(null);

    const { data: harvestResponse, isLoading: isLoadingHarvests } =
        useHarvestsQuery(bagangId);
    const { data: costResponse, isLoading: isLoadingCosts } =
        useProductionCostsQuery(bagangId);
    const {
        data: bagangResponse,
        isLoading: isLoadingBagang,
        isError: isBagangError,
    } = useBagangDetailQuery(bagangId);

    const bagang = bagangResponse?.data?.data;

    const { mutate: createHarvest, isPending: isCreatingHarvest } =
        useCreateHarvestMutation();
    const { mutate: updateHarvest, isPending: isUpdatingHarvest } =
        useUpdateHarvestMutation();
    const { mutate: deleteHarvest } = useDeleteHarvestMutation();

    const { mutate: createCost, isPending: isCreatingCost } =
        useCreateProductionCostMutation();
    const { mutate: updateCost, isPending: isUpdatingCost } =
        useUpdateProductionCostMutation();
    const { mutate: deleteCost } = useDeleteProductionCostMutation();

    const handleCreateHarvest = (data: any) => {
        createHarvest(
            { ...data, bagang_id: bagangId },
            {
                onSuccess: () => {
                    setIsHarvestModalOpen(false);
                    setSelectedSeasonId(undefined);
                    toast.success("Panen ditambahkan");
                },
                onError: () => {
                    toast.error("Gagal menambahkan");
                },
            },
        );
    };

    const handleUpdateHarvest = (data: any) => {
        if (editingHarvest) {
            updateHarvest(
                { id: editingHarvest.id, data },
                {
                    onSuccess: () => {
                        setIsHarvestModalOpen(false);
                        toast.success("Panen diubah");
                    },
                    onError: () => {
                        toast.error("Gagal mengubah");
                    },
                },
            );
        }
    };

    const handleDeleteHarvest = (id: string) => {
        if (confirm("Apakah anda yakin ingin menghapus data panen ini?")) {
            deleteHarvest(id, {
                onSuccess: () => toast.success("Panen dihapus"),
                onError: () => toast.error("Gagal menghapus"),
            });
        }
    };

    const handleCreateCost = (data: any) => {
        createCost(
            { ...data, bagang_id: bagangId },
            {
                onSuccess: () => {
                    setIsCostModalOpen(false);
                    setSelectedSeasonId(undefined);
                    toast.success("Pengeluaran ditambahkan");
                },
                onError: () => toast.error("Gagal menambahkan"),
            },
        );
    };

    const handleUpdateCost = (data: any) => {
        if (editingCost) {
            updateCost(
                { id: editingCost.id, data },
                {
                    onSuccess: () => {
                        setIsCostModalOpen(false);
                        toast.success("Pengeluaran diubah");
                    },
                    onError: () => toast.error("Gagal mengubah"),
                },
            );
        }
    };

    const handleDeleteCost = (id: string) => {
        if (confirm("Apakah anda yakin ingin menghapus data pengeluaran ini?")) {
            deleteCost(id, {
                onSuccess: () => toast.success("Pengeluaran dihapus"),
                onError: () => toast.error("Gagal menghapus"),
            });
        }
    };

    const openCreateHarvestModal = () => {
        setEditingHarvest(null);
        setIsHarvestModalOpen(true);
    };

    const openEditHarvestModal = (harvest: HarvestProps) => {
        setEditingHarvest(harvest);
        setIsHarvestModalOpen(true);
    };

    const openCreateCostModal = () => {
        setEditingCost(null);
        setIsCostModalOpen(true);
    };

    const openEditCostModal = (cost: ProductionCostProps) => {
        setEditingCost(cost);
        setIsCostModalOpen(true);
    };

    const canMutateHarvest = user?.role === "ADMIN" || user?.role === "OWNER";
    const canMutateCost = (cost: ProductionCostProps) =>
        user?.role === "ADMIN" ||
        (user?.role === "OWNER" &&
            cost.created_by === user.worker_id &&
            (cost.creator_role === "owner" || cost.creator_role === "both"));

    const seasonLabel = (id: number) => {
        const season = seasons.find((item) => item.id === id);
        return season
            ? `${season.start_date.slice(0, 10)}${season.end_date ? ` - ${season.end_date.slice(0, 10)}` : " (Aktif)"}`
            : `Musim ${id}`;
    };

    const harvestColumns: TableHeader[] = [
        ...(isAllSeasons
            ? [{
                key: "harvests_season",
                title: "Musim",
                render: (row: HarvestProps) => seasonLabel(row.harvests_season),
            }]
            : []),
        {
            key: "harvest_date",
            title: "Tanggal",
            render: (row) => new Date(row.harvest_date).toLocaleDateString("id-ID"),
        },
        { key: "weight", title: "Berat (kg)" },
        {
            key: "price",
            title: "Harga",
            render: (row) => `Rp ${row.price.toLocaleString("id-ID")}`,
        },
        {
            key: "total",
            title: "Total",
            hideOnMobile: true,
            render: (row) =>
                `Rp ${(row.weight * row.price).toLocaleString("id-ID")}`,
        },
        { key: "harvest_type", title: "Jenis Ikan" },
        {
            key: "description",
            title: "Deskripsi",
            hideOnMobile: true,
            render: (row) => (
                <div className="max-w-[200px] whitespace-normal break-words">
                    {row.description || "-"}
                </div>
            ),
        },
        ...(canMutateHarvest ? [{
            key: "actions",
            title: "Aksi",
            hideOnMobile: true,
            render: (row: HarvestProps) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openEditHarvestModal(row)}
                        aria-label={`Edit panen ${row.id}`}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <PencilIcon className="size-5" />
                    </button>
                    <button
                        onClick={() => handleDeleteHarvest(row.id)}
                        aria-label={`Hapus panen ${row.id}`}
                        className="text-red-500 hover:text-red-700"
                    >
                        <TrashBinIcon className="size-5" />
                    </button>
                </div>
            ),
            mobileRender: (row: HarvestProps) => (
                <>
                    <button
                        onClick={() => openEditHarvestModal(row)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDeleteHarvest(row.id)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg"
                    >
                        Hapus
                    </button>
                </>
            ),
        }] : []),
    ];

    const costColumns: TableHeader[] = [
        ...(isAllSeasons
            ? [{
                key: "production_costs_season",
                title: "Musim",
                render: (row: ProductionCostProps) => seasonLabel(row.production_costs_season),
            }]
            : []),
        {
            key: "created_at",
            title: "Tanggal",
            render: (row) => new Date(row.created_at).toLocaleDateString("id-ID"),
        },
        { key: "production_costs_type", title: "Jenis Pengeluaran" },
        {
            key: "creator_role",
            title: "Dilakukan oleh",
            render: (row) => {
                let role = "-";
                if (row.creator_role === "owner") role = "Pemilik";
                else if (row.creator_role === "worker") role = "Pekerja";
                else if (row.creator_role === "both") role = "Umum";
                
                return row.created_by_name ? `${role} - ${row.created_by_name}` : role;
            },
        },
        {
            key: "price",
            title: "Harga",
            render: (row) => `Rp ${row.price.toLocaleString("id-ID")}`,
        },
        {
            key: "actions",
            title: "Aksi",
            hideOnMobile: true,
            render: (row) => canMutateCost(row) ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => openEditCostModal(row)}
                        aria-label={`Edit pengeluaran ${row.id}`}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <PencilIcon className="size-5" />
                    </button>
                    <button
                        onClick={() => handleDeleteCost(row.id)}
                        aria-label={`Hapus pengeluaran ${row.id}`}
                        className="text-red-500 hover:text-red-700"
                    >
                        <TrashBinIcon className="size-5" />
                    </button>
                </div>
            ) : null,
            mobileRender: (row) => canMutateCost(row) ? (
                <>
                    <button
                        onClick={() => openEditCostModal(row)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDeleteCost(row.id)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg"
                    >
                        Hapus
                    </button>
                </>
            ) : null,
        },
    ];

    if (isLoadingBagang) return <p role="status">Memuat...</p>;
    if (isBagangError) return <Navigate to="/pembelian" replace />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Detail Pembelian
                </h1>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {user?.role !== "WORKER" && (activeTab === "harvest" ? (
                        <Button
                            size="sm"
                            variant="primary"
                            fullWidth
                            onClick={openCreateHarvestModal}
                        >
                            Tambah Panen
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="primary"
                            fullWidth
                            onClick={openCreateCostModal}
                        >
                            Tambah Pengeluaran
                        </Button>
                    ))}
                    <Link to="/pembelian">
                        <Button variant="outline" size="sm" fullWidth>
                            <ChevronLeftIcon className="w-5 h-5" />
                            Kembali
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <label htmlFor="purchase-season" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filter musim
                </label>
                <select
                    id="purchase-season"
                    value={effectiveSeasonId}
                    onChange={(event) => setSelectedSeasonId(event.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                    <option value="all">Semua Musim</option>
                    {seasons.map((season) => (
                        <option key={season.id} value={season.id}>
                            {seasonLabel(season.id)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("harvest")}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "harvest"
                                ? "border-brand-500 text-brand-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Hasil Panen
                    </button>
                    <button
                        onClick={() => setActiveTab("cost")}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "cost"
                                ? "border-brand-500 text-brand-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Pengeluaran
                    </button>
                </nav>
            </div>

            {activeTab === "harvest" ? (
                <>
                    <BasicTableData
                        columns={harvestColumns}
                        data={(harvestResponse?.data?.data || []).filter(
                            (harvest) => isAllSeasons || harvest.harvests_season === Number(effectiveSeasonId),
                        )}
                        isLoading={isLoadingHarvests}
                        useNumbering
                    />
                    <HarvestFormModal
                        isOpen={isHarvestModalOpen}
                        onClose={() => setIsHarvestModalOpen(false)}
                        onSubmit={editingHarvest ? handleUpdateHarvest : handleCreateHarvest}
                        initialData={editingHarvest}
                        isLoading={isCreatingHarvest || isUpdatingHarvest}
                    />
                </>
            ) : (
                <>
                    <BasicTableData
                        columns={costColumns}
                        data={(costResponse?.data?.data || []).filter(
                            (cost) => isAllSeasons || cost.production_costs_season === Number(effectiveSeasonId),
                        )}
                        isLoading={isLoadingCosts}
                        useNumbering
                    />
                    <ProductionCostFormModal
                        isOpen={isCostModalOpen}
                        onClose={() => setIsCostModalOpen(false)}
                        onSubmit={editingCost ? handleUpdateCost : handleCreateCost}
                        initialData={editingCost}
                        isLoading={isCreatingCost || isUpdatingCost}
                        bagang={bagang}
                    />
                </>
            )}
        </div>
    );
};

export default DetailSalesPage;