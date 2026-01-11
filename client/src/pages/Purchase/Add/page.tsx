import React from "react";
import PageBreadcrumb from "../../../component/common/PageBreadCrumb";
import PageMeta from "../../../component/common/PageMeta";
import ExampleFormOne from "../../../component/form/example-form/ExampleFormOne";
import HasilPanenForm from "./form";

const BagangHarvestCreatePage: React.FC = () => {

    return (
        <>
            <PageMeta
                title="Tambah Hasil Panen Bagang"
                description=""
            />
            <PageBreadcrumb pageTitle="Tambah Hasil Panen Bagang" />
            <div className="space-y-6">
                <HasilPanenForm />
            </div>
        </>
    );
};

export default BagangHarvestCreatePage;
