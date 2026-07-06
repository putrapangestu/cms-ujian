import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { STUDENT, STUDENT_GROUP } from '@/data/const/api_url'
import {
  useMutationAction,
  useQueryData,
} from '@/data/hooks/api/useGlobalFetch'
import type {
  ApiResponsePaginationType,
  ApiResponseType,
} from '@/data/types/api_response'
import type {
  StudentDataType,
  StudentGroupDataType,
  StudentGroupRollType,
} from '@/data/validations/student_schema'
import { toaster } from '@/lib/toast'
import { IconSearch, IconTrash, IconEye } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute(
  '/admin/master/students/$studentGroupId/manage',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { studentGroupId } = Route.useParams()

  // --- STATE MANAGEMENT ---
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // State untuk menampung sementara siswa yang dicentang di tabel kiri (Keranjang)
  const [checkedLeft, setCheckedLeft] = useState<StudentDataType[]>([])

  // State untuk data permanen di tabel kanan (List Terpilih)
  const [rightData, setRightData] = useState<StudentDataType[]>([])

  // State untuk menampung ID yang dicentang di tabel kanan (untuk dihapus/dibalikkan)
  const [checkedRightIds, setCheckedRightIds] = useState<string[]>([])

  // --- DATA FETCHING ---
  const { data, isLoading } = useQueryData<
    ApiResponsePaginationType<StudentDataType>
  >(STUDENT.GET, {
    page,
    search,
    per_page: 10, // Sesuaikan dengan limit backend Anda
  })

  const { data: studentGroup } = useQueryData<
    ApiResponseType<'single', StudentGroupDataType & { students: StudentDataType[] }>
  >(STUDENT_GROUP.GET_BY_ID, { id: studentGroupId })

  const currentPageData = data?.data?.data || []

  useEffect(() => {
    if (studentGroup?.data?.students) {
      setRightData(studentGroup.data.students)
    }
  }, [studentGroup])

  // --- LOGIC: SELECT ALL (DI LUAR TABEL) ---

  // Cek apakah semua item di halaman saat ini sudah ada di checkedLeft
  const isAllCurrentPageChecked =
    currentPageData.length > 0 &&
    currentPageData
      .filter((s) => !rightDataIds.has(s.id))
      .every((student) => checkedLeft.some((s) => s.id === student.id))

  const handleTogglePageLeft = (isChecked: boolean) => {
    if (isChecked) {
      setCheckedLeft((prev) => {
        const existingIds = new Set(prev.map((s) => s.id))
        const toAdd = currentPageData.filter(
          (s) => !existingIds.has(s.id) && !rightDataIds.has(s.id),
        )
        return [...prev, ...toAdd]
      })
    } else {
      const currentPageIds = new Set(currentPageData.map((s) => s.id))
      setCheckedLeft((prev) => prev.filter((s) => !currentPageIds.has(s.id)))
    }
  }

  const isAllRightChecked =
    rightData.length > 0 && checkedRightIds.length === rightData.length

  const handleToggleAllRight = (isChecked: boolean) => {
    if (isChecked) {
      setCheckedRightIds(rightData.map((s) => s.id))
    } else {
      setCheckedRightIds([])
    }
  }

  // --- LOGIC: PINDAH DATA ---
  const handleMoveRight = () => {
    setRightData((prev) => {
      const existingIds = new Set(prev.map((s) => s.id))
      const newStudents = checkedLeft.filter((s) => !existingIds.has(s.id))
      return [...prev, ...newStudents]
    })
    setCheckedLeft([]) // Reset centang kiri setelah pindah
  }

  const handleMoveLeft = () => {
    const idsToRemove = new Set(checkedRightIds)
    setRightData((prev) => prev.filter((s) => !idsToRemove.has(s.id)))
    setCheckedRightIds([]) // Reset centang kanan setelah dihapus
  }

  const rightDataIds = new Set(rightData.map((s) => s.id))

  // --- DEFINISI KOLOM ---
  const leftColumns: ColumnDef<StudentDataType>[] = [
    {
      header: 'Pilih',
      cell: (v: any) => {
        const isDisabled = rightDataIds.has(v.id)

        if (isDisabled) {
          return <span className="badge bg-success">Sudah Dipilih</span>
        }

        const isChecked = checkedLeft.some((s) => s.id === v.id)
        return (
          <input
            type="checkbox"
            className="form-check-input shadow-none"
            checked={isChecked}
            onChange={(e) => {
              if (e.target.checked) setCheckedLeft((prev) => [...prev, v])
              else setCheckedLeft((prev) => prev.filter((s) => s.id !== v.id))
            }}
          />
        )
      },
    },
    {
      header: '#',
      cell: (_, i) => (page - 1) * 10 + i + 1,
    },
    {
      header: 'Nama Siswa',
      cell: (v: any) => (
        <div>
          <h6 className="mb-0">{v.name}</h6>
          <small className="text-muted">{v.email}</small>
        </div>
      ),
    },
    { header: 'Asal Sekolah', accessorKey: 'address' },
  ]

  const rightColumns: ColumnDef<StudentDataType>[] = [
    {
      header: 'Pilih',
      cell: (v: any) => (
        <input
          type="checkbox"
          className="form-check-input shadow-none"
          checked={checkedRightIds.includes(v.id)}
          onChange={(e) => {
            if (e.target.checked) setCheckedRightIds((prev) => [...prev, v.id])
            else setCheckedRightIds((prev) => prev.filter((id) => id !== v.id))
          }}
        />
      ),
    },
    { header: '#', cell: (_, i) => i + 1 },
    { header: 'Nama', accessorKey: 'name' },
    {
      header: 'Aksi',
      cell: (v: any) => (
        <button
          type="button"
          className="btn btn-sm text-danger p-0"
          onClick={() => {
            setRightData((p) => p.filter((s) => s.id !== v.id))
            setCheckedRightIds((p) => p.filter((id) => id !== v.id))
          }}
        >
          <IconTrash size={18} />
        </button>
      ),
    },
  ]

  const { trigger: rollMultipleTrigger, isMutating: isMutatingRollMultiple } =
    useMutationAction(STUDENT_GROUP.ROLL_MULTIPLE, 'post', {
      refreshKey: STUDENT_GROUP.GET_BY_ID,
      onSuccess: () => {
        setRightData([])
        setCheckedRightIds([])
        toaster('Anggota grup berhasil disimpan', 'success')
        navigate({ to: '..' })
      },
    })

  const handleRollMultiple = () => {
    if (rightData.length === 0) {
      toaster('Pilih murid yang sudah ada terlebih dahulu', 'error')
      return
    }
    const dataToSubmit: StudentGroupRollType = {
      rolls: rightData.map((v) => ({
        student_id: v.id,
        new_group_id: studentGroupId,
      })),
    }
    rollMultipleTrigger(dataToSubmit)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0 fw-bolder">{`Kelola Anggota: ${studentGroup?.data?.name || '...'}`}</h5>
          <small className="text-muted">
            Pilih siswa dari daftar kiri untuk dimasukkan ke grup
          </small>
        </div>
        <button
          type="button"
          className="btn bg-light text-dark"
          onClick={() => navigate({ to: '..' })}
        >
          Kembali
        </button>
      </div>

      <div className="card-body">
        <div className="row g-4">
          {/* TABEL KIRI: DATABASE SISWA */}
          <div className="col-md-5">
            <div className="d-flex flex-column gap-3 mb-3">
              <div className="input-group input-group-sm">
                <DebouncedInput
                  value={search}
                  onChange={(v) => setSearch(String(v))}
                  className="form-control"
                  placeholder="Cari nama atau email..."
                />
                <span className="input-group-text bg-white">
                  <IconSearch size={16} />
                </span>
              </div>

              <div className="form-check d-flex align-items-center gap-2 border rounded p-2 bg-light">
                <input
                  type="checkbox"
                  id="selAllLeft"
                  className="form-check-input ms-1 shadow-none"
                  checked={isAllCurrentPageChecked}
                  onChange={(e) => handleTogglePageLeft(e.target.checked)}
                />
                <label
                  htmlFor="selAllLeft"
                  className="form-check-label small fw-bold cursor-pointer"
                >
                  Pilih Semua di Halaman {page}
                </label>
              </div>
            </div>

            <DataTable
              data={data?.data || []}
              columns={leftColumns}
              showPageSize={false}
              pageIndex={page}
              rowCount={data?.pagination?.total_items || 0}
              onPageChange={setPage}
              manualPagination
              isLoading={isLoading}
            />
          </div>

          {/* TOMBOL AKSI (TENGAH) */}
          <div className="col-md-2 d-flex flex-column gap-3 align-items-center justify-content-center">
            <button
              type="button"
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              onClick={handleMoveRight}
              disabled={checkedLeft.length === 0}
            >
              <span>Tambah</span>
              <ChevronsRight size={20} />
              {checkedLeft.length > 0 && (
                <span className="badge bg-white text-primary">
                  {checkedLeft.length}
                </span>
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              onClick={handleMoveLeft}
              disabled={checkedRightIds.length === 0}
            >
              <ChevronsLeft size={20} />
              <span>Hapus</span>
            </button>
          </div>

          {/* TABEL KANAN: SISWA TERPILIH */}
          <div className="col-md-5">
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Siswa Terpilih</span>
                <span className="badge bg-success rounded-pill">
                  {rightData.length} Total
                </span>
              </div>
              <div className="form-check d-flex align-items-center gap-2 border rounded p-2 bg-light">
                <input
                  type="checkbox"
                  id="selAllRight"
                  className="form-check-input ms-1 shadow-none"
                  checked={isAllRightChecked}
                  onChange={(e) => handleToggleAllRight(e.target.checked)}
                />
                <label
                  htmlFor="selAllRight"
                  className="form-check-label small fw-bold cursor-pointer"
                >
                  Pilih Semua Terpilih
                </label>
              </div>
            </div>

            <DataTable
              data={rightData}
              columns={rightColumns}
              showPageSize={false}
            />

            <button
              type="button"
              disabled={isMutatingRollMultiple}
              className="btn btn-success w-100 mt-4 fw-bold py-2 shadow-sm"
              onClick={handleRollMultiple}
            >
              Simpan Anggota Grup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}