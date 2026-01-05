import PageMeta from "../../component/common/PageMeta";
import EcommerceMetrics from "../../component/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../component/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../component/ecommerce/MonthlyTarget";
import StatisticsChart from "../../component/ecommerce/StatisticsChart";

export default function Dashboard() {
    return (
        <>
            <PageMeta
                title="Dashboard"
                description=""
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-7">
                    <EcommerceMetrics />

                    <MonthlySalesChart />
                </div>

                <div className="col-span-12 xl:col-span-5">
                    <MonthlyTarget />
                </div>

                <div className="col-span-12">
                    <StatisticsChart />
                </div>
            </div>
        </>
    );
}
