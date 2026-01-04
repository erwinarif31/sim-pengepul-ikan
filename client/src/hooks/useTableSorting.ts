import { useState } from "react";
import type { TableHeader } from "../component/table/types";

export interface TableSortedColumn {
    key: string;
    order: "asc" | "desc";
}

export const useTableSorting = (initialSortKey: string = "") => {
    const [sortedColumn, setSortedColumn] = useState<TableSortedColumn>({
        key: initialSortKey,
        order: "asc",
    });

    const handleSortColumn = (column: TableHeader) => {
        if (!column.sortable) return;

        setSortedColumn((current) => {
            // If clicking a new column, sort ascending.
            if (current.key !== column.key) {
                return { key: column.key, order: "asc" };
            }
            // If clicking the same column, toggle the order.
            return {
                key: column.key,
                order: current.order === "asc" ? "desc" : "asc",
            };
        });
    };

    return { sortedColumn, handleSortColumn };
};
