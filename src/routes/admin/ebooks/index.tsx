import { DataTable } from '@/components/DataTables'
import type { ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconEdit, IconPlus, IconSearch, IconTrash, IconDownload, IconFileText } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import EbookModalCreate from './-components/ebook-modal-create'
import type { EbookDataType } from '@/data/validations/ebook_schema'
import {
  useMutationAction,
  useQueryData,
} from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import { EBOOK } from '@/data/const/api_url'
import { deleteDataAlert, toaster } from '@/lib/toast'
import { getToken } from '@/lib/token-handler'

export const Route = createFileRoute('/admin/ebooks/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<EbookDataType>()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDownloading, setIsDownloading] = useState<string | null>(null)

  const { trigger: deleteTrigger } = useMutationAction(
    EBOOK.DELETE,
    'delete',
    { refreshKey: EBOOK.GET },
  )

  const { trigger: bulkDeleteTrigger } = useMutationAction(
    EBOOK.BULK_DELETE,
    'post',
    { refreshKey: EBOOK.GET },
  )

  const { data } = useQueryData<ApiResponsePaginationType<EbookDataType>>(
    EBOOK.GET,
    { per_page: 10, page: page, search: search },
  )

  const columns: ColumnDef<EbookDataType>[] = [
    {
      header: (
        <div className="form-check d-flex justify-content-center">
          <input
            className="form-check-input"
            type="checkbox"
            checked={(data?.data as any)?.items && (data?.data as any).items.length > 0 && selectedIds.length === (data?.data as any).items.length}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds((data?.data as any)?.items?.map((s: EbookDataType) => s.id as string) || [])
              } else {
                setSelectedIds([])
              }
            }}
          />
        </div>
      ),
      cell: (v) => (
        <div className="form-check d-flex justify-content-center">
          <input
            className="form-check-input"
            type="checkbox"
            checked={selectedIds.includes(v.id as string)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds((prev) => [...prev, v.id as string])
              } else {
                setSelectedIds((prev) => prev.filter((id) => id !== v.id))
              }
            }}
          />
        </div>
      ),
      width: '5%',
    },
    { header: '#', cell: (_, i) => (page - 1) * 10 + i + 1, width: '5%' },
    {
      header: 'Nama',
      accessorKey: 'name',
    },
    {
      header: 'File',
      cell: (v) => {
        return (
          <div className="d-flex align-items-center justify-content-center" title={v.file_path || 'Tidak ada file'}>
            {v.file_path ? <IconFileText size={24} className="text-primary" /> : <span className="text-muted">-</span>}
          </div>
        )
      },
    },
    {
      header: 'Aksi',
      cell: (v) => (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-md rounded-1 btn-success text-white"
            onClick={() => handleDownload(v)}
            title="Download Ebook"
            disabled={isDownloading === String(v.id)}
          >
            <IconDownload size={18} />
          </button>
          <button
            type="button"
            className="btn btn-md rounded-1 btn-warning"
            onClick={() => clickOpenModalHandle(v)}
            title="Edit Ebook"
          >
            <IconEdit size={18} />
          </button>
          <button
            type="button"
            className="btn btn-md rounded-1 btn-danger"
            onClick={() => deleteHandle(v)}
            title="Hapus Ebook"
          >
            <IconTrash size={18} />
          </button>
        </div>
      ),
    },
  ]

  const deleteHandle = (ebook: EbookDataType) => {
    deleteDataAlert(ebook.name, () => deleteTrigger({ id: ebook.id }))
  }

  const handleBulkDelete = () => {
    deleteDataAlert(`${selectedIds.length} Ebook Terpilih`, () => {
      bulkDeleteTrigger({ ids: selectedIds }).then(() => {
        setSelectedIds([])
      })
    })
  }

  const clickOpenModalHandle = (ebook?: EbookDataType) => {
    setIsEdit(ebook ? true : false)
    setCurrent(ebook)
    $('#ebook-modal-create').modal('show')
  }

  const handleDownload = async (ebook: EbookDataType) => {
    try {
      setIsDownloading(String(ebook.id))
      const baseUrl = import.meta.env.VITE_API_URL
      const token = getToken()

      const response = await fetch(`${baseUrl}/ebooks/${ebook.id}/download`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Gagal mengunduh ebook')
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json()
        if (!json.success) throw new Error(json.message || 'Gagal mengunduh ebook')
      }

      const blob = await response.blob()

      let filename = `${ebook.name}.pdf`
      const disposition = response.headers.get('content-disposition')
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        const matches = filenameRegex.exec(disposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '')
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      toaster('Berhasil mengunduh ebook', 'success')
    } catch (error: any) {
      console.error('Download error:', error)
      toaster(error.message || 'Terjadi kesalahan saat mengunduh', 'error')
    } finally {
      setIsDownloading(null)
    }
  }

  return (
    <>
      <EbookModalCreate isEdit={isEdit} ebook={current} />
      <div className="card">
        <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title fw-bolder">Materi / Ebook</h5>
            <p>List informasi materi dan ebook</p>
          </div>
          <div className="d-flex justify-content-start gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="btn btn-danger d-flex align-items-center gap-1"
                onClick={handleBulkDelete}
              >
                <IconTrash size={18} /> Hapus Terpilih ({selectedIds.length})
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-1"
              onClick={() => clickOpenModalHandle()}
            >
              <IconPlus size={18} /> Tambah Ebook
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <div className="input-group input-group-sm w-auto">
              <DebouncedInput
                value={search}
                onChange={(v) => setSearch(String(v))}
                className="form-control bg-white"
                placeholder="cari..."
              />
              <button type="button" className="btn btn-primary py-2">
                <IconSearch size={18} />
              </button>
            </div>
          </div>
          <DataTable
            data={(data?.data as any)?.items || []}
            columns={columns}
            showPageSize={false}
            pageIndex={page || 1}
            rowCount={(data?.data as any)?.pagination?.total || 0}
            onPageChange={setPage}
            manualPagination
          />
        </div>
      </div>
    </>
  )
}
