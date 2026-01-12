import { useParams, Link } from "react-router-dom";
import BasicTableData from "../../../component/table/BasicTableData";
import { TableHeader } from "../../../component/table/types";
import useBagangQuery from "../../../features/bagang/hooks/useBagangQuery";
import useWorkerDetail from "../../../features/worker/hooks/useWorkerDetail";
import Button from "../../../component/ui/button/Button";
import { ChevronLeftIcon, EyeIcon } from "../../../icons";

const DetailWorkerPage = () => {
    const { id } = useParams<{ id: string }>();
    const workerId = id || "";

    const { data: workerResponse } = useWorkerDetail(workerId);
    const worker = workerResponse?.data?.data;

    // Bagang as Worker
    const { data: bagangAsWorkerResponse, isLoading: isLoadingAsWorker } =
        useBagangQuery({ params: { worker_id: workerId } });
    
    // Bagang as Owner
    const { data: bagangAsOwnerResponse, isLoading: isLoadingAsOwner } =
        useBagangQuery({ params: { owner_id: workerId } });

    const columns: TableHeader[] = [
        {
            key: "name",
            title: "Nama Bagang",
            columnClassName: "w-1/3",
        },
        {
            key: "is_active",
            title: "Status",
            columnClassName: "w-1/6",
            render: (row) => (
                <span
                    className={`px-2 py-1 rounded text-xs text-white ${row.is_active ? "bg-green-500" : "bg-red-500"
                        }`}
                >
                    {row.is_active ? "Aktif" : "Tidak Aktif"}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Detail",
            render: (row) => (
                <div className="flex justify-center">
                    <Link
                        to={`/pembelian/${row.id}`}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <EyeIcon className="size-5" />
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Detail {worker?.name || "Pekerja/Pemilik"}
                </h1>
                <Link to="/pekerja">
                    <Button variant="outline" size="sm">
                        <ChevronLeftIcon className="w-5 h-5" />
                        Kembali
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Bagang sebagai Pekerja
                </h2>
                <BasicTableData
                    columns={columns}
                    data={bagangAsWorkerResponse?.data?.data || []}
                    isLoading={isLoadingAsWorker}
                    useNumbering
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Bagang sebagai Pemilik
                </h2>
                <BasicTableData
                    columns={columns}
                    data={bagangAsOwnerResponse?.data?.data || []}
                    isLoading={isLoadingAsOwner}
                    useNumbering
                />
            </div>
        </div>
    );
};

export default DetailWorkerPage;
