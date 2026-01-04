import PageMeta from "../../component/common/PageMeta";
import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import SeasonTable from "./table";

export default function SeasonPage() {
    return (
        <>
            <PageMeta
                title="Musim"
                description=""
            />
            <PageBreadcrumb pageTitle="Data Bagang" />
            <div className="space-y-6">
                <SeasonTable />
            </div>
        </>
    );
}
