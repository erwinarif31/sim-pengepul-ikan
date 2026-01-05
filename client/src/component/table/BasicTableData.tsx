import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ChevronLeftIcon, ChevronDownIcon } from "../../icons";

interface TableHeaderProps {
  key: string;
  title: string;
  render?: (row: any) => React.ReactNode;
  sortable?: boolean;
  columnClassName?: string;
}

interface TablePagination {
  current_page: number;
  per_page: number;
  total: number;
}

interface BasicTableDataProps {
  columns: TableHeaderProps[];
  data: any[];
  isLoading?: boolean;
  useNumbering?: boolean;
  pagination?: TablePagination;
  onPageChange?: (page: number) => void;
  buttons?: React.ReactNode;
}

const BasicTableData: React.FC<BasicTableDataProps> = ({
  columns,
  data,
  isLoading,
  useNumbering,
  pagination,
  onPageChange,
  buttons,
}) => {
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.per_page)
    : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5 flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Data 
        </h3>
        {buttons && <div className="flex gap-2">{buttons}</div>}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {useNumbering && (
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  #
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  isHeader
                  className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${col.columnClassName || ""
                    }`}
                >
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {isLoading ? (
              <TableRow>
                <TableCell
                  className="px-5 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-5 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {useNumbering && (
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {pagination
                        ? (pagination.current_page - 1) * pagination.per_page +
                        rowIndex +
                        1
                        : rowIndex + 1}
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className="px-5 py-4 text-gray-500 dark:text-gray-400"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-white/[0.05]">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            {(pagination.current_page - 1) * pagination.per_page + 1} to{" "}
            {Math.min(
              pagination.current_page * pagination.per_page,
              pagination.total,
            )}{" "}
            of {pagination.total} entries
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                onPageChange && onPageChange(pagination.current_page - 1)
              }
              disabled={pagination.current_page === 1}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-white/[0.05]"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={() =>
                onPageChange && onPageChange(pagination.current_page + 1)
              }
              disabled={pagination.current_page === totalPages}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-white/[0.05]"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicTableData;
