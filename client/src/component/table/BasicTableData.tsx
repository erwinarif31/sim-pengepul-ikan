import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import Input from "../form/input/InputField";
import { BasicTableDataProps } from "./types";

const BasicTableData: React.FC<BasicTableDataProps> = ({
  columns,
  data,
  isLoading,
  useNumbering,
  pagination,
  onPageChange,
  buttons,
  onSearch,
  searchValue,
  title = "Data",
}) => {
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.per_page)
    : 0;

  const visibleColumns = columns.filter((col) => !col.hideOnMobile);

  const renderMobileCards = () => (
    <div className="sm:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
      {isLoading ? (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          Memuat...
        </div>
      ) : data.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          Data tidak ditemukan
        </div>
      ) : (
        data.map((row, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3 space-y-2">
            {useNumbering && (
              <span className="text-xs font-medium text-gray-400">
                {pagination
                  ? (pagination.current_page - 1) * pagination.per_page +
                    rowIndex +
                    1
                  : rowIndex + 1}
              </span>
            )}
            {visibleColumns.map((col) => (
              <div key={col.key} className="flex justify-between gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
                  {col.mobileLabel || col.title}
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90 text-right">
                  {col.mobileRender
                    ? col.mobileRender(row)
                    : col.render
                      ? col.render(row)
                      : (row[col.key] ?? "-")}
                </span>
              </div>
            ))}
            {/* Hidden columns rendered at bottom for actions */}
            {columns
              .filter((col) => col.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="flex gap-2 pt-2">
                  {col.mobileRender
                    ? col.mobileRender(row)
                    : col.render && col.render(row)}
                </div>
              ))}
          </div>
        ))
      )}
    </div>
  );

  const renderDesktopTable = () => (
    <div className="hidden sm:block overflow-x-auto">
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
                className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${col.columnClassName || ""}`}
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
                colSpan={columns.length + (useNumbering ? 1 : 0)}
              >
                Memuat...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                className="px-5 py-4 text-center text-gray-500 dark:text-gray-400"
                colSpan={columns.length + (useNumbering ? 1 : 0)}
              >
                Data tidak ditemukan
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
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header: stacks on mobile, row on sm+ */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {onSearch && (
            <div className="w-full sm:w-64">
              <Input
                placeholder="Cari..."
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                className="!h-10"
              />
            </div>
          )}
          {buttons && (
            <div className="flex gap-2 w-full sm:w-auto">{buttons}</div>
          )}
        </div>
      </div>
      {renderMobileCards()}
      {renderDesktopTable()}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center px-4 py-4 sm:px-6 border-t border-gray-100 dark:border-white/[0.05]">
          <span className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
            Menampilkan{" "}
            {(pagination.current_page - 1) * pagination.per_page + 1} sampai{" "}
            {Math.min(
              pagination.current_page * pagination.per_page,
              pagination.total,
            )}{" "}
            dari {pagination.total} data
          </span>
          <div className="flex gap-2 justify-center sm:justify-end">
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
