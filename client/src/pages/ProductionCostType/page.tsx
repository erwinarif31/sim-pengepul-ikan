import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import ProductionCostTypeTable from "./table";

export default function ProductionCostTypePage() {
    return (
        <>
            <PageMeta
                title="Catchery | Jenis Pengeluaran"
                description="Dashboard Catchery"
            />
            <PageBreadcrumb pageTitle="Jenis Pengeluaran" />
            <ProductionCostTypeTable />
        </>
    );
}
