import React from "react";
import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import PurchaseTable from "./table";

const BagangHarvestPage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Pembelian"
                description=""
            />
            <PageBreadcrumb pageTitle="Pembelian" />
            <div className="space-y-6">
                <PurchaseTable />
            </div>
        </>
    );
};

export default BagangHarvestPage;
