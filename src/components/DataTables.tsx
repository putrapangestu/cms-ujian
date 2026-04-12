import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

// --- Tipe Definition ---

type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends React.ReactNode
          ? K // Stop jika value adalah primitive/ReactNode
          : `${K}` | `${K}.${Path<T[K]>}` // Lanjut recursive jika object
        : never
    }[keyof T]
  : never

export type ColumnDef<T> = {
  header: string
  accessorKey?: Path<T>
  cell?: (row: T, index: number) => React.ReactNode
  classNameHead?: string
  className?: string
  width?: string
}

type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T>[]
  pageSizeOptions?: number[]

  // Custom Action Slot (Search, Buttons, dll)
  actions?: React.ReactNode

  // --- Visibility Control (Baru) ---
  showPageSize?: boolean // Hide dropdown "Show Entries"
  showInfo?: boolean // Hide text "Showing 1 to 10..."
  showPagination?: boolean // Hide tombol Prev/Next

  // --- Props Hybrid Logic ---
  manualPagination?: boolean
  rowCount?: number
  pageIndex?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  isSub?: boolean
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

export const DataTable = <T,>({
  data,
  columns,
  pageSizeOptions = [10, 25, 50, 100],
  actions,

  // Default: Tampilkan semua
  showPageSize = true,
  showInfo = true,
  showPagination = true,

  manualPagination = false,
  rowCount = 0,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  onPageChange,
  onPageSizeChange,
  isSub = false,
}: DataTableProps<T>) => {
  // State Internal
  const [localPageIndex, setLocalPageIndex] = useState(1)
  const [localPageSize, setLocalPageSize] = useState(pageSizeOptions[0])

  // Normalisasi State
  const currentPage = manualPagination
    ? (controlledPageIndex ?? 1)
    : localPageIndex
  const pageSize = manualPagination
    ? (controlledPageSize ?? pageSizeOptions[0])
    : localPageSize

  // Logic Total Page & Data
  const totalItemCount = manualPagination ? rowCount : data.length
  const totalPages = Math.max(1, Math.ceil(totalItemCount / pageSize))

  const currentData = useMemo(() => {
    if (manualPagination) return data
    const start = (currentPage - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, currentPage, pageSize, manualPagination])

  // Handlers
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value)
    if (manualPagination && onPageSizeChange) {
      onPageSizeChange(newSize)
    } else {
      setLocalPageSize(newSize)
      setLocalPageIndex(1)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      if (manualPagination && onPageChange) {
        onPageChange(page)
      } else {
        setLocalPageIndex(page)
      }
    }
  }

  // Logic Pagination Group (Max 5 tombol)
  const paginationGroup = useMemo(() => {
    const maxButtons = 5
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    let start = currentPage - 2
    let end = currentPage + 2
    if (start <= 0) {
      start = 1
      end = maxButtons
    }
    if (end > totalPages) {
      end = totalPages
      start = totalPages - maxButtons + 1
    }
    const pages = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }, [currentPage, totalPages])

  return (
    <div className="w-100">
      {/* --- TOP SECTION --- */}
      {/* Hanya render container jika showPageSize true ATAU ada actions */}
      {(showPageSize || actions) && (
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-2 gap-2">
          {/* KIRI: Show Entries */}
          <div>
            {showPageSize && (
              <div className="d-flex align-items-center gap-2">
                <span>Tampilkan</span>
                <select
                  className="form-select form-select-sm bg-white mb-0"
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>entri</span>
              </div>
            )}
          </div>

          {/* KANAN: Custom Action Slot */}
          <div>{actions}</div>
        </div>
      )}

      {/* --- TABLE SECTION --- */}
      <div className="rounded overflow-hidden border">
        <div
          className="table-responsive"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <table
            className={`table m-0 align-middle ${isSub ? 'table-sm' : ''}`}
          >
            <thead className="">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`text-nowrap ${col.classNameHead} ${isSub ? 'bg-primary-subtle' : ''}`}
                    style={{ width: col.width }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={col.accessorKey ? col.className : ''}
                        style={col.accessorKey ? { width: col.width } : {}}
                      >
                        {col.cell ? (
                          col.cell(row, (currentPage - 1) * pageSize + rowIndex)
                        ) : col.accessorKey ? (
                          <div
                            className={col.className}
                            style={{ width: col.width }}
                          >
                            {(getNestedValue(
                              row,
                              col.accessorKey as string,
                            ) as ReactNode) ?? '-'}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  {/* @ts-ignore - td expects string or ReactNode, colSpan takes number */}
                  <td
                    colSpan={columns.length}
                    className="text-center text-muted py-4"
                    style={{ '--bs-table-bg-type': 'var(--bs-white)' }}
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      {/* Hanya render container jika showInfo true ATAU showPagination true */}
      {(showInfo || showPagination) && (
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-2 gap-2">
          {/* KIRI: Showing Info */}
          <div className="text-muted text-center text-sm-start">
            {showInfo && (
              <>
                Menampilkan{' '}
                {currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{' '}
                hingga{' '}
                {manualPagination
                  ? Math.min(currentPage * pageSize, totalItemCount)
                  : Math.min(currentPage * pageSize, data.length)}{' '}
                dari {totalItemCount} entri
              </>
            )}
          </div>

          {/* KANAN: Pagination */}
          {showPagination && (
            <nav>
              <ul className="pagination m-0">
                <li
                  className={clsx('page-item', currentPage === 1 && 'disabled')}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <IconChevronLeft size={18} />
                  </button>
                </li>

                {paginationGroup.map((page) => (
                  <li
                    key={page}
                    className={clsx(
                      'page-item',
                      currentPage === page && 'active',
                    )}
                  >
                    <button
                      className="page-link h-100 py-0"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li
                  className={clsx(
                    'page-item',
                    currentPage === totalPages && 'disabled',
                  )}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <IconChevronRight size={18} />
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}
