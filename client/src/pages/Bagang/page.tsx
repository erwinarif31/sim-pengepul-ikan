import PageMeta from "../../component/common/PageMeta";
import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import BagangTable from "./table";

export default function BagangPage() {
    return (
        <>
            <PageMeta
                title="Bagang"
                description=""
            />
            <PageBreadcrumb pageTitle="Data Bagang" />
            <div className="space-y-6">
                <BagangTable />
            </div>
        </>
    );
}
