"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ChevronDown, ChevronUp, Filter, Trash2, RefreshCw } from 'lucide-react';
import Pagination from "../Pagination";
import { useLocalStorage } from "@/hooks/utils/useLocalStorage";
import DataTableFilter from "./DataTableFilter";
import DataTableColumnToggle from "./DataTableColumnToggle";
import DataTableExport from "./DataTableExport";

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => string | number | boolean | null;
  cell?: (props: { row: T; value: string | number | boolean | null }) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  subtitle?: string;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  onDelete?: (selectedRows: T[]) => void;
  onExport?: (format: "csv" | "excel" | "pdf") => void;
  className?: string;
  id?: string;
}

/**
 * A flexible data table component with sorting, filtering, pagination, and column management
 */
export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
  title,
  subtitle,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onRowClick,
  isLoading = false,
  emptyState,
  actions,
  onRefresh,
  onDelete,
  onExport,
  className = "",
  id = "data-table",
}: DataTableProps<T>) {
  // State for table configuration
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState<{ id: string; desc: boolean } | null>(null);
  const [filters, setFilters] = useState<Record<string, string | number | boolean | null>>({});
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  
  // Persist visible columns in localStorage
  const storageKey = `${id}-visible-columns`;
  const [visibleColumns, setVisibleColumns] = useLocalStorage<string[]>(
    storageKey,
    columns.filter(col => !col.hidden).map(col => col.id)
  );

  // Filter columns based on visibility settings
  const displayColumns = useMemo(() => {
    return columns.filter(column => visibleColumns.includes(column.id));
  }, [columns, visibleColumns]);

  // Apply sorting and filtering to data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const column = columns.find(col => col.id === key);
        if (column) {
          result = result.filter(row => {
            const cellValue = column.accessorFn 
              ? column.accessorFn(row) 
              : column.accessorKey 
                ? String(row[column.accessorKey])
                : null;
            
            if (cellValue === null || cellValue === undefined) return false;
            
            // Handle different filter types
            if (typeof value === 'string') {
              return String(cellValue).toLowerCase().includes(value.toLowerCase());
            } else if (Array.isArray(value)) {
              return value.includes(cellValue);
            } else if (typeof value === 'object' && value !== null) {
              // Range filter
              const { min, max } = value as { min?: number; max?: number };
              if (min !== undefined && max !== undefined) {
                return Number(cellValue) >= min && Number(cellValue) <= max;
              } else if (min !== undefined) {
                return Number(cellValue) >= min;
              } else if (max !== undefined) {
                return Number(cellValue) <= max;
              }
            }
            
            return true;
          });
        }
      }
    });

    // Apply sorting
    if (sortBy) {
      const column = columns.find(col => col.id === sortBy.id);
      if (column) {
        result.sort((a, b) => {
          const aValue = column.accessorFn 
            ? column.accessorFn(a) 
            : column.accessorKey 
              ? String(a[column.accessorKey])
              : null;
          
          const bValue = column.accessorFn 
            ? column.accessorFn(b) 
            : column.accessorKey 
              ? String(b[column.accessorKey])
              : null;
          
          // Handle null/undefined values
          if (aValue === null || aValue === undefined) return sortBy.desc ? 1 : -1;
          if (bValue === null || bValue === undefined) return sortBy.desc ? -1 : 1;
          
          // Compare based on value type
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortBy.desc 
              ? bValue.localeCompare(aValue) 
              : aValue.localeCompare(bValue);
          }
          
          return sortBy.desc 
            ? Number(bValue) - Number(aValue) 
            : Number(aValue) - Number(bValue);
        });
      }
    }

    return result;
  }, [data, filters, sortBy, columns]);

  // Calculate pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return processedData.slice(start, end);
  }, [processedData, pagination, pageIndex, pageSize]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.ceil(processedData.length / pageSize);
  }, [processedData.length, pageSize, pagination]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setPageIndex(page - 1);
  }, []);

  // Handle sort change
  const handleSort = useCallback((columnId: string) => {
    setSortBy(prev => {
      if (prev?.id === columnId) {
        return prev.desc ? null : { id: columnId, desc: true };
      }
      return { id: columnId, desc: false };
    });
  }, []);

  // Handle row selection
  const handleSelectRow = useCallback((row: T, isSelected: boolean) => {
    setSelectedRows(prev => {
      if (isSelected) {
        return [...prev, row];
      } else {
        return prev.filter(r => r.id !== row.id);
      }
    });
  }, []);

  // Handle select all rows
  const handleSelectAllRows = useCallback((isSelected: boolean) => {
    setSelectedRows(isSelected ? paginatedData : []);
  }, [paginatedData]);

  // Reset pagination when filters change
  useEffect(() => {
    setPageIndex(0);
  }, [filters]);

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={displayColumns.length + 1} className="py-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <p className="mt-2 text-gray-500">Loading data...</p>
            </div>
          </td>
        </tr>
      );
    }

    if (emptyState) {
      return (
        <tr>
          <td colSpan={displayColumns.length + 1} className="py-10">
            {emptyState}
          </td>
        </tr>
      );
    }

    return (
      <tr>
        <td colSpan={displayColumns.length + 1} className="py-10 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Filter className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.keys(filters).length > 0
                ? "Try adjusting your filters or search terms."
                : "No data available."}
            </p>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => setFilters({})}
                className="mt-4 rounded-md bg-westernPurple px-3 py-2 text-sm font-medium text-white hover:bg-westernPurple-dark"
              >
                Clear filters
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={`overflow-hidden rounded-lg bg-white shadow ${className}`}>
      {/* Table header */}
      <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
        <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
          <div className="ml-4 mt-2">
            {title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className="ml-4 mt-2 flex-shrink-0 flex space-x-2">
            {/* Column visibility toggle */}
            <DataTableColumnToggle
              columns={columns}
              visibleColumns={visibleColumns}
              onToggleColumn={(columnId) => {
                setVisibleColumns(prev => 
                  prev.includes(columnId)
                    ? prev.filter(id => id !== columnId)
                    : [...prev, columnId]
                );
              }}
            />
            
            {/* Export options */}
            {onExport && (
              <DataTableExport onExport={onExport} />
            )}
            
            {/* Refresh button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-westernPurple focus:ring-offset-2"
              >
                <RefreshCw className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Refresh
              </button>
            )}
            
            {/* Delete selected */}
            {onDelete && selectedRows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onDelete(selectedRows);
                  setSelectedRows([]);
                }}
                className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Trash2 className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Delete {selectedRows.length}
              </button>
            )}
            
            {/* Custom actions */}
            {actions}
          </div>
        </div>
        
        {/* Filters */}
        <div className="mt-4">
          <DataTableFilter
            columns={columns.filter(col => col.filterable !== false)}
            filters={filters}
            onFilterChange={(columnId, value) => {
              setFilters(prev => ({
                ...prev,
                [columnId]: value
              }));
            }}
            onClearFilters={() => setFilters({})}
          />
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {/* Select all checkbox */}
              <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-westernPurple focus:ring-westernPurple"
                  checked={
                    paginatedData.length > 0 &&
                    selectedRows.length === paginatedData.length
                  }
                  onChange={(e) => handleSelectAllRows(e.target.checked)}
                />
              </th>
              
              {/* Column headers */}
              {displayColumns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 ${
                    column.sortable !== false ? 'cursor-pointer select-none' : ''
                  } ${column.headerClassName || ''}`}
                  onClick={() => {
                    if (column.sortable !== false) {
                      handleSort(column.id);
                    }
                  }}
                >
                  <div className="group inline-flex items-center">
                    {column.header}
                    {column.sortable !== false && (
                      <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-hover:bg-gray-200">
                        {sortBy?.id === column.id ? (
                          sortBy.desc ? (
                            <ChevronDown className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ChevronUp className="h-4 w-4" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100" aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {/* Row selection checkbox */}
                  <td className="relative w-12 px-6 sm:w-16 sm:px-8" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-westernPurple focus:ring-westernPurple"
                      checked={selectedRows.some(r => r.id === row.id)}
                      onChange={(e) => handleSelectRow(row, e.target.checked)}
                    />
                  </td>
                  
                  {/* Row cells */}
                  {displayColumns.map((column) => {
                    const value = column.accessorFn
                      ? column.accessorFn(row)
                      : column.accessorKey
                        ? String(row[column.accessorKey])
                        : null;
                    
                    return (
                      <td
                        key={column.id}
                        className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${column.className || ''}`}
                      >
                        {column.cell ? column.cell({ row, value }) : String(value)}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              renderEmptyState()
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {processedData.length > 0 ? pageIndex * pageSize + 1 : 0}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min((pageIndex + 1) * pageSize, processedData.length)}
                </span>{' '}
                of <span className="font-medium">{processedData.length}</span> results
              </p>
              
              {/* Page size selector */}
              <div className="ml-4">
                <select
                  className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm font-medium text-gray-700 focus:border-westernPurple focus:outline-none focus:ring-westernPurple"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageIndex(0);
                  }}
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Pagination
              currentPage={pageIndex + 1}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
} 