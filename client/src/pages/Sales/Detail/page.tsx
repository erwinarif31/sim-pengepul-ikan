import React from "react";
import PageMeta from "../../../component/common/PageMeta";
import PageBreadcrumb from "../../../component/common/PageBreadCrumb";
import SalesDetailTable from "./table";
import ProductionCostDetailTable from "../../ProductionCost/table";

const SalesDetailPage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Hasil Panen dan Pengeluaran"
                description=""
            />
            <PageBreadcrumb pageTitle="Hasil Panen dan Pengeluaran" />
            <div className="space-y-6">
                <SalesDetailTable />
            </div>
            <div className="space-y-3">
                <ProductionCostDetailTable />
            </div>
        </>
    );
};

export default SalesDetailPage;
