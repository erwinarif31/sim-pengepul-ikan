import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import WorkerTable from "./table";

export default function WorkerPage() {
    return (
        <>
            <PageMeta
                title="Catchery | Pekerja/Pemilik"
                description="Dashboard Catchery"
            />
            <PageBreadcrumb pageTitle="Pekerja/Pemilik" />
            <WorkerTable />
        </>
    );
}
