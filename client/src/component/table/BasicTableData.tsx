import { ReactNode, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import type {
    BasicTableDataProps as BasicTableDataPropsType,
    TableHeader as TableHeaderType,
} from "./types";
import {
    type TableSortedColumn,
    useTableSorting,
} from "../../hooks/useTableSorting";

type BasicTableDataProps = BasicTableDataPropsType & {
    title?: string;
    buttons?: ReactNode;
};

// --- Main Component (Orchestrator) ---
const BasicTableData = (
    {
        columns,
        data,
        isLoading,
        useNumbering,
        pagination,
        onPageChange,
        title,
        buttons,
    }: BasicTableDataProps,
) => {
    const { sortedColumn, handleSortColumn } = useTableSorting();

    const sortedData = useMemo(() => {
        if (sortedColumn.key) {
            const sorted = [...data].sort((a, b) => {
                const aValue = a[sortedColumn.key];
                const bValue = b[sortedColumn.key];

                if (aValue < bValue) {
                    return sortedColumn.order === "asc" ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortedColumn.order === "asc" ? 1 : -1;
                }
                return 0;
            });
            return sorted;
        }
        return data;
    }, [data, sortedColumn]);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <BasicTableData.Root title={title} buttons={buttons}>
                <BasicTableData.Header
                    columns={columns}
                    handleSortColumn={handleSortColumn}
                    sortedColumn={sortedColumn}
                    useNumbering={useNumbering}
                />
                <BasicTableData.Body
                    columns={columns}
                    data={sortedData}
                    isLoading={isLoading}
                    useNumbering={useNumbering}
                    pagination={pagination}
                />
            </BasicTableData.Root>
            {/* Pagination will be rendered outside the table's scrolling container */}
            <BasicTableData.Pagination
                pagination={pagination}
                onPageChange={onPageChange}
            />
        </div>
    );
};

// --- Sub-Components ---

interface RootProps {
    children: React.ReactNode;
    title?: string;
    buttons?: React.ReactNode;
}

BasicTableData.Root = ({ children, title, buttons }: RootProps) => (
    <>
        {(title || buttons) && (
            <div className="px-4 py-3 sm:px-6 flex justify-between items-center border-b border-gray-100 dark:border-white/[0.05]">
                <h3 className="font-semibold text-gray-900 text-theme-xl dark:text-white">
                    {title}
                </h3>
                {buttons && (
                    <div className="flex items-center gap-2">{buttons}</div>
                )}
            </div>
        )}
        <div className="max-w-full overflow-x-auto">
            <Table>{children}</Table>
        </div>
    </>
);

interface HeaderProps {
    columns: TableHeaderType[];
    handleSortColumn: (column: TableHeaderType) => void;
    sortedColumn: TableSortedColumn;
    useNumbering?: boolean;
}

BasicTableData.Header = (
    { columns, handleSortColumn, sortedColumn, useNumbering }: HeaderProps,
) => (
    <TableHeader className="border-y border-gray-100 dark:border-white/[0.05]">
        <TableRow>
            {useNumbering && (
                <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-md dark:text-gray-400 w-12"
                >
                    No
                </TableCell>
            )}
            {columns.map((col) => (
                <TableCell
                    key={col.key}
                    isHeader
                    className={`px-4 py-3 font-medium text-gray-500 sm:px-6 text-center text-theme-md dark:text-gray-400 ${col.columnClassName}`}
                    onClick={() => handleSortColumn(col)}
                    style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                    {col.title}
                    {col.sortable && sortedColumn.key === col.key && (
                        <span className="ml-2">
                            {sortedColumn.order === "asc" ? "▲" : "▼"}
                        </span>
                    )}
                </TableCell>
            ))}
        </TableRow>
    </TableHeader>
);

interface BodyProps {
    columns: TableHeaderType[];
    data: Array<Record<string, any>>;
    isLoading?: boolean;
    useNumbering?: boolean;
    pagination?: BasicTableDataPropsType["pagination"];
}

BasicTableData.Body = (
    { columns, data, isLoading, useNumbering, pagination }: BodyProps,
) => {
    if (isLoading) {
        return (
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell
                            colSpan={columns.length + (useNumbering ? 1 : 0)}
                            className="px-4 py-5 sm:px-6"
                        >
                            <div className="w-full h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse">
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );
    }

    if (data.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell
                        colSpan={columns.length + (useNumbering ? 1 : 0)}
                        className="px-4 py-10 text-center sm:px-6"
                    >
                        Data belum tersedia
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    return (
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((row, index) => (
                <TableRow key={row.id || index}>
                    {useNumbering && pagination && (
                        <TableCell className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-md dark:text-white/90">
                            {(pagination.current_page - 1) *
                                pagination.per_page + index + 1}
                        </TableCell>
                    )}
                    {columns.map((col) => (
                        <TableCell
                            key={col.key}
                            className={`px-4 py-3 text-gray-800 sm:px-6 text-center text-theme-md dark:text-gray-400 ${col.className}`}
                        >
                            {col.render ? col.render(row) : row[col.key]}
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    );
};

interface PaginationProps {
    pagination?: BasicTableDataPropsType["pagination"];
    onPageChange?: BasicTableDataPropsType["onPageChange"];
}

BasicTableData.Pagination = ({ pagination, onPageChange }: PaginationProps) => {
    if (!pagination || pagination.total <= pagination.per_page) return null;

    const totalPages = Math.ceil(pagination.total / pagination.per_page);

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-gray-100 dark:border-white/[0.05]">
            <div className="text-sm text-gray-700 dark:text-gray-400">
                Page{" "}
                <span className="font-medium">{pagination.current_page}</span>
                {" "}
                of <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange?.(pagination.current_page - 1)}
                    disabled={pagination.current_page <= 1}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange?.(pagination.current_page + 1)}
                    disabled={pagination.current_page >= totalPages}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default BasicTableData;
