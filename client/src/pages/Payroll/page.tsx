import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import PayrollTable from "./table";

export default function PayrollPage() {
    return (
        <>
            <PageMeta
                title="Catchery | Penggajian"
                description="Halaman Penggajian"
            />
            <PageBreadcrumb pageTitle="Penggajian" />
            <PayrollTable />
        </>
    );
}
