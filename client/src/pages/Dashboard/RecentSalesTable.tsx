import BasicTableData from "../../component/table/BasicTableData";
import type { TableHeader } from "../../component/table/types";
import type { RecentSaleItem } from "../../features/dashboard/api/dashboard.types";
import Badge from "../../component/ui/badge/Badge";
import ComponentCard from "../../component/common/ComponentCard";

interface RecentSalesTableProps {
    data: RecentSaleItem[] | undefined;
    isLoading: boolean;
}

export default function RecentSalesTable({ data, isLoading }: RecentSalesTableProps) {
    const columns: TableHeader[] = [
        {
            key: "customer",
            title: "Pelanggan",
            columnClassName: "w-1/4",
        },
        {
            key: "issued_at",
            title: "Tanggal",
            columnClassName: "w-1/6",
        },
        {
            key: "total_amount",
            title: "Total",
            render: (row) => `Rp ${row.total_amount.toLocaleString("id-ID")}`,
        },
        {
            key: "total_paid",
            title: "Dibayar",
            render: (row) => `Rp ${row.total_paid.toLocaleString("id-ID")}`,
        },
        {
            key: "remaining",
            title: "Sisa",
            render: (row) => {
                const remaining = row.total_amount - row.total_paid;
                return (
                    <span className={remaining > 0 ? "text-error-600" : "text-success-600"}>
                        Rp {remaining.toLocaleString("id-ID")}
                    </span>
                );
            },
        },
        {
            key: "status",
            title: "Status",
            render: (row) => (
                <Badge color={row.is_paid_off ? "success" : "warning"} size="sm">
                    {row.is_paid_off ? "Lunas" : "Belum Lunas"}
                </Badge>
            ),
        },
    ];

    return (
        <ComponentCard title="Penjualan Terbaru" desc="5 transaksi penjualan terakhir">
            <BasicTableData
                columns={columns}
                data={data ?? []}
                isLoading={isLoading}
                useNumbering={true}
            />
        </ComponentCard>
    );
}
