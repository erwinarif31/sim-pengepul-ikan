import type { ReactNode } from 'react';

// Defines a single column header
export interface TableHeader {
    key: string; // Corresponds to a key in your data object
    title: ReactNode; // What to display in the header
    sortable?: boolean; // Is this column sortable?
    className?: string; // Custom classes for the <td> cells in this column
    columnClassName?: string; // Custom classes for the <th> header cell
    render?: (row: Record<string, any>) => ReactNode; // Custom render function for the cell
}

// Defines the props for the main table component
export interface BasicTableDataProps {
    columns: TableHeader[];
    data: Array<Record<string, any>>;
    isLoading?: boolean;
    useNumbering?: boolean;
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
    };
    onPageChange?: (newPage: number) => void;
}
