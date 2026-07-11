import React from "react";

export interface TableHeader {
  key: string;
  title: string;
  render?: (row: any) => React.ReactNode;
  sortable?: boolean;
  columnClassName?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
  mobileRender?: (row: any) => React.ReactNode;
}

export interface TablePagination {
  current_page: number;
  per_page: number;
  total: number;
}

export interface BasicTableDataProps {
  title?: string;
  columns: TableHeader[];
  data: any[];
  isLoading?: boolean;
  useNumbering?: boolean;
  pagination?: TablePagination;
  onPageChange?: (page: number) => void;
  buttons?: React.ReactNode;
  onSearch?: (value: string) => void;
  searchValue?: string;
}
