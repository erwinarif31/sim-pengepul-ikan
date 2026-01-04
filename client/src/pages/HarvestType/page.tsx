import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import HarvestTypeTable from "./table";

export default function HarvestTypePage() {
    return (
        <>
            <PageMeta
                title="Catchery | Jenis Ikan"
                description="Dashboard Catchery"
            />
            <PageBreadcrumb pageTitle="Jenis Ikan" />
            <HarvestTypeTable />
        </>
    );
}
