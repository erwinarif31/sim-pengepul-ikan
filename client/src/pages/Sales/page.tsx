import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import SalesTable from "./table";

export default function SalesPage() {
    return (
        <>
            <PageMeta
                title="Catchery | Penjualan"
                description="Dashboard Catchery"
            />
            <PageBreadcrumb pageTitle="Penjualan" />
            <SalesTable />
        </>
    );
}
