import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconEdit, IconPlus, IconSearch, IconTrash, IconEye, IconDownload, IconUpload } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Icon } from 'lucide-react'
import { useState } from 'react'
import StudentModalCreate from './-components/student-modal-create'
import ImportStudentExcelModal from './-components/import-student-excel-modal'
import type { StudentDataType } from '@/data/validations/student_schema'
import {
  useMutationAction,
  useQueryData,
} from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import { STUDENT, STUDENT_GROUP } from '@/data/const/api_url'
import { deleteDataAlert, toaster } from '@/lib/toast'
import type { StudentGroupDataType } from '@/data/validations/student_schema'
import { getToken } from '@/lib/token-handler'

export const Route = createFileRoute('/admin/master/student-master')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<StudentDataType>()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [isExporting, setIsExporting] = useState(false)

  const { trigger: deleteTrigger } = useMutationAction(
    STUDENT.DELETE,
    'delete',
    { refreshKey: STUDENT.GET },
  )

  const { trigger: bulkDeleteTrigger } = useMutationAction(
    STUDENT.BULK_DELETE,
    'post',
    { refreshKey: STUDENT.GET },
  )

  const { data: studentGroupData } = useQueryData<
    ApiResponsePaginationType<StudentGroupDataType>
  >(STUDENT_GROUP.GET, { per_page: 1000 })

  const { data } = useQueryData<ApiResponsePaginationType<StudentDataType>>(
    STUDENT.GET,
    { per_page: 10, page: page, search: search, group_id: groupId || undefined },
  )

  const columns: ColumnDef<StudentDataType>[] = [
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
            <h6>{v.name}</h6>
            <span className="text-muted">{v.email}</span>
          </div>
        )
      },
    },
    {
      header: 'Password',
      cell: (v) => (
        <span className="text-truncate w-100 d-block">{v?.birth_date?.replaceAll('-', '')}</span>
      ),
    },
    { header: 'Asal Sekolah', accessorKey: 'address' },
    {
      header: 'Grup',
      cell: (v) => {
        const groupName = (v as any).group?.name
        return (
          <span className="badge bg-info-subtle text-info px-3 py-2">
            {groupName || '-'}
          </span>
        )
      },
    },
    { header: 'Status', accessorKey: 'status' },
    {
      header: 'Aksi',
      cell: (v) => (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-md rounded-1 btn-info text-white"
            onClick={() => navigate({ to: `/admin/master/student-detail/${v.id}` })}
            title="Lihat Detail Siswa"
          >
            <IconEye size={18} />
          </button>
          <button
            type="button"
            className="btn btn-md rounded-1 btn-warning"
            onClick={() => clickOpenModalHandle(v)}
          >
            <IconEdit size={18} />
          </button>
          <button
            type="button"
            className="btn btn-md rounded-1 btn-danger"
            onClick={() => deleteHandle(v)}
          >
            <IconTrash size={18} />
          </button>
        </div>
      ),
    },
  ]

  const deleteHandle = (student: StudentDataType) => {
    deleteDataAlert(student.name, () => deleteTrigger({ id: student.id }))
  }

  const handleBulkDelete = () => {
    deleteDataAlert(`${selectedIds.length} Siswa Terpilih`, () => {
      bulkDeleteTrigger({ student_ids: selectedIds }).then(() => {
        setSelectedIds([])
      })
    })
  }

  const clickOpenModalHandle = (student?: StudentDataType) => {
    setIsEdit(student ? true : false)
    setCurrent(student)
    $('#student-modal-create').modal('show')
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const baseUrl = import.meta.env.VITE_API_URL
      const token = getToken()

      const url = new URL(`${baseUrl}${STUDENT.EXPORT}`)
      if (search) url.searchParams.append('search', search)
      if (groupId) url.searchParams.append('group_id', groupId)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Gagal mengekspor data siswa')
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
      let filename = 'Data_Siswa.xlsx'
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

      toaster('Berhasil mengunduh data siswa', 'success')
    } catch (error: any) {
      console.error('Export error:', error)
      toaster(error.message || 'Terjadi kesalahan saat export data', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <StudentModalCreate isEdit={isEdit} student={current} />
      <ImportStudentExcelModal />
      <div className="card">
        <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title fw-bolder">Master Siswa</h5>
            <p>List informasi siswa</p>
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
              <IconPlus size={18} /> Tambah Siswa
            </button>
            <button
              type="button"
              className="btn btn-warning d-flex align-items-center gap-1"
              onClick={() => {
                ; (window as any).$('#import-student-excel-modal').modal('show')
              }}
            >
              <IconUpload size={18} /> Import Siswa
            </button>
            <button
              type="button"
              className="btn btn-success d-flex align-items-center gap-1"
              onClick={handleExport}
              disabled={isExporting}
            >
              <IconDownload size={18} /> {isExporting ? 'Mengekspor...' : 'Export Excel'}
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

            <div className="input-group input-group-sm w-auto">
              <select
                className="form-select bg-white"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              >
                <option value="">Semua Grup</option>
                {studentGroupData?.data?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
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
