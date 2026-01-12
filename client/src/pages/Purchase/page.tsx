import React from "react";
import PageBreadcrumb from "../../component/common/PageBreadCrumb";
import PageMeta from "../../component/common/PageMeta";
import { useParams } from "react-router-dom";
import PurchaseTable from "./table";

const BagangHarvestPage: React.FC = () => {
    const { id } = useParams();

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
