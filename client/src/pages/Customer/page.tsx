import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import CustomerTable from "./table";

export default function CustomerPage() {
    return (
        <>
            <PageMeta
                title="Catchery | Pelanggan"
                description="Master Data Pelanggan"
            />
            <PageBreadcrumb pageTitle="Pelanggan" />
            <CustomerTable />
        </>
    );
}
