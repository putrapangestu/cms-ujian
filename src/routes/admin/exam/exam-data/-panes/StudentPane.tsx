import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { EXAM } from '@/data/const/api_url'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiPaginatedResponse } from '@/data/types/api_response'
import type { UserExamDataType } from '@/data/validations/exam_schema'
import { IconSearch, IconDownload, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { getToken } from '@/lib/token-handler'
import { toaster, confirmAlert, deleteDataAlert } from '@/lib/toast'

export function StudentPane({ examId }: { examId: string }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data } = useQueryData<ApiPaginatedResponse<UserExamDataType>>(EXAM.USERS, {
    id: examId,
    page: page,
    per_page: 10,
    search: search,
  })

  const { trigger: deleteUserExam } = useMutationAction(
    EXAM.DELETE_USER,
    'delete',
    {
      refreshKey: EXAM.USERS,
      showMessage: false,
      onSuccess: () => {
        toaster('Peserta berhasil dihapus', 'success')
      },
    },
  )

  const { trigger: bulkDeleteTrigger } = useMutationAction(
    EXAM.DELETE_USER_BULK,
    'post',
    {
      refreshKey: EXAM.USERS,
      onSuccess: () => {
        setSelectedIds([])
      },
    },
  )

  const handleDeleteUserExam = (userExamId: string, userName: string) => {
    confirmAlert(
      'Hapus Peserta',
      async () => await deleteUserExam({ id: userExamId }),
      `Apakah Anda yakin ingin menghapus "${userName}" dari daftar peserta ujian? Semua jawaban akan dihapus.`,
      () => {},
    )
  }

  const handleBulkDelete = () => {
    deleteDataAlert(`${selectedIds.length} Peserta Terpilih`, () => {
      bulkDeleteTrigger({ user_exam_ids: selectedIds })
    })
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const baseUrl = import.meta.env.VITE_API_URL
      const token = getToken()
      
      const endpoint = EXAM.EXPORT_USERS.replace('{id}', examId)
      const url = new URL(`${baseUrl}${endpoint}`)
      if (search) url.searchParams.append('search', search)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Gagal mengekspor data peserta ujian')
      }

      // Check if response is JSON (error message) instead of Blob
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json()
        if (!json.success) throw new Error(json.message || 'Gagal mengekspor data')
        
        // Handle case where BE returns a download URL instead of blob
        if (json.data?.download_url) {
          window.open(json.data.download_url, '_blank')
          toaster('Export berhasil', 'success')
          return
        }
      }

      // Default: Handle as Blob
      const blob = await response.blob()
      
      // Get filename from Content-Disposition if available
      let filename = 'Data_Peserta_Ujian.xlsx'
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
      
      toaster('Berhasil mengunduh data peserta ujian', 'success')
    } catch (error: any) {
      console.error('Export error:', error)
      toaster(error.message || 'Terjadi kesalahan saat export data', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const columns: ColumnDef<UserExamDataType>[] = [
    {
      header: (
        <div className="form-check d-flex justify-content-center">
          <input
            className="form-check-input"
            type="checkbox"
            checked={data?.data && data.data.length > 0 && selectedIds.length === data.data.length}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds(data?.data?.map((s) => s.id as string) || [])
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
    { header: '#', cell: (_, i) => i + 1 },
    {
      header: 'Nama',
      cell: (v) => {
        return (
          <div>
            <h6 className="mb-0">{v.user?.name || '-'}</h6>
            {/* <span className="text-muted small">{v.user?.email || '-'}</span> */}
          </div>
        )
      },
    },
    { header: 'Sekolah', accessorKey: 'user.address' },
    {
      header: 'Grup',
      cell: (v) => (
        <span className="badge bg-info-subtle text-info px-3 py-2">
          {v.user?.group_name || '-'}
        </span>
      ),
    },
    {
      header: 'TWK',
      cell: (v) => <span className="fw-semibold">{v.score_twk ?? '-'}</span>,
    },
    {
      header: 'TIU',
      cell: (v) => <span className="fw-semibold">{v.score_tiu ?? '-'}</span>,
    },
    {
      header: 'TKP',
      cell: (v) => <span className="fw-semibold">{v.score_tkp ?? '-'}</span>,
    },
    {
      header: 'Total Skor',
      cell: (v) => (
        <span className="badge bg-success-subtle text-success px-3 py-2 fs-6">
          {v.total_score ?? '-'}
        </span>
      ),
    },
    {
      header: 'Kelulusan',
      cell: (v) => {
        if (v.is_passed === null || v.is_passed === undefined) return '-'
        return v.is_passed ? (
          <span className="badge bg-success">Lulus</span>
        ) : (
          <span className="badge bg-danger">Tidak Lulus</span>
        )
      },
    },
    {
      header: 'Status',
      cell: (v) => {
        const status = v.status || 'unknown'
        let badgeClass = 'bg-primary-subtle text-primary'
        if (status.toLowerCase() === 'selesai' || status.toLowerCase() === 'completed') badgeClass = 'bg-success-subtle text-success'
        else if (status.toLowerCase() === 'berlangsung' || status.toLowerCase() === 'in_progress') badgeClass = 'bg-warning-subtle text-warning'
        
        return (
          <span className={`badge ${badgeClass} px-3 py-2 text-capitalize`}>
            {status}
          </span>
        )
      },
    },
    {
      header: 'Aksi',
      cell: (v) => (
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleDeleteUserExam(v.id, v.user?.name || '')}
          title="Hapus peserta"
        >
          <IconTrash size={16} />
        </button>
      ),
    },
  ]
  return (
    <>
      <div className="card">
        <div className="border-bottom p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title fw-bolder">Master Siswa</h5>
              <p className="text-muted mb-0">Daftar siswa yang mengikuti ujian</p>
            </div>
            <div className="d-flex gap-2">
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
                className="btn btn-success"
                onClick={handleExport}
                disabled={isExporting || !data?.data?.length}
              >
                {isExporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Mengekspor...
                  </>
                ) : (
                  <>
                    <IconDownload size={18} className="me-2" />
                    Export Excel
                  </>
                )}
              </button>
            </div>
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
            data={data?.data || []}
            columns={columns}
            showPageSize={false}
            pageIndex={page || 1}
            rowCount={data?.pagination?.total_items || 0}
            onPageChange={setPage}
            manualPagination
          />
        </div>
      </div>
    </>
  )
}
