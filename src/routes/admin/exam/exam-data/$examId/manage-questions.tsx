import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { EXAM, QUESTION, STUDENT, STUDENT_GROUP } from '@/data/const/api_url'
import { useQueryData, useMutationAction } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType, ApiResponseType } from '@/data/types/api_response'
import type { ExamDataType, ExamQuestionRollType } from '@/data/validations/exam_schema'
import type { QuestionDataType } from '@/data/validations/question_schema'
import type { StudentDataType, StudentGroupDataType, StudentGroupRollType } from '@/data/validations/student_schema'
import { IconTrash, IconSearch } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronsRight, ChevronsLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { da } from 'zod/v4/locales'

export const Route = createFileRoute(
  '/admin/exam/exam-data/$examId/manage-questions',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { examId } = Route.useParams()
  const studentGroupId = '019c8eac-b8e6-72c6-97b5-3eccfea8e0c9'

  // --- STATE MANAGEMENT ---
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  // State untuk menampung sementara siswa yang dicentang di tabel kiri (Keranjang)
  const [checkedLeft, setCheckedLeft] = useState<QuestionDataType[]>([])
  
  // State untuk data permanen di tabel kanan (List Terpilih)
  const [rightData, setRightData] = useState<QuestionDataType[]>([])
  
  // State untuk menampung ID yang dicentang di tabel kanan (untuk dihapus/dibalikkan)
  const [checkedRightIds, setCheckedRightIds] = useState<string[]>([])

  // --- DATA FETCHING ---
  const { data, isLoading } = useQueryData<ApiResponsePaginationType<QuestionDataType>>(QUESTION.GET, { 
    page, 
    search,
    per_page: 10 // Sesuaikan dengan limit backend Anda
  })
  const { data: currentData, isLoading: currentIsLoading } = useQueryData<ApiResponsePaginationType<StudentDataType>>(EXAM.QUESTIONS, { 
    id: examId,
    page: 1, 
    per_page: 99999,
    exam_id: examId,
    search
  })
  const { data: exam } = useQueryData<ApiResponseType<'single', ExamDataType>>(EXAM.GET_BY_ID, { id: examId })

  const currentPageData = data?.data || []

  useEffect(() => {
    if (currentData?.data) {
      setRightData(currentData?.data)
    }
  }, [currentData])

  // --- LOGIC: SELECT ALL (DI LUAR TABEL) ---
  
  // Cek apakah semua item di halaman saat ini sudah ada di checkedLeft
  const isAllCurrentPageChecked = currentPageData.length > 0 && 
    currentPageData.every((question) => checkedLeft.some((s) => s.id === question.id))

  const handleTogglePageLeft = (isChecked: boolean) => {
    if (isChecked) {
      setCheckedLeft((prev) => {
        const existingIds = new Set(prev.map((s) => s.id))
        const toAdd = currentPageData.filter((s) => !existingIds.has(s.id))
        return [...prev, ...toAdd]
      })
    } else {
      const currentPageIds = new Set(currentPageData.map((s) => s.id))
      setCheckedLeft((prev) => prev.filter((s) => !currentPageIds.has(s.id)))
    }
  }

  const isAllRightChecked = rightData.length > 0 && checkedRightIds.length === rightData.length

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
    setRightData((prev) => prev.filter((s) => !checkedRightIds.includes(s.id)))
    setCheckedRightIds([]) // Reset centang kanan setelah dihapus
  }

  // --- DEFINISI KOLOM ---
  const leftColumns: ColumnDef<QuestionDataType>[] = [
    {
      header: 'Pilih',
      cell: (v: any) => (
        <input 
          type="checkbox" 
          className="form-check-input shadow-none"
          checked={checkedLeft.some((s) => s.id === v.id)}
          onChange={(e) => {
            if (e.target.checked) setCheckedLeft(prev => [...prev, v])
            else setCheckedLeft(prev => prev.filter(s => s.id !== v.id))
          }}
        />
      )
    },
    { 
      header: '#', 
      cell: (_, i) => (page - 1) * 10 + i + 1 
    },
    { 
      header: 'Nama Siswa', 
      cell: (v: any) => (
        <div>
          <h6 className="mb-0" dangerouslySetInnerHTML={{ __html: v.question_text }}></h6>
        </div>
      )
    },
    {header: 'Jenis Soal', cell: (v: any) => v.question_type},
    {header: 'Skor', cell: (v: any) => v.score},
  ]

  const rightColumns: ColumnDef<QuestionDataType>[] = [
    {
      header: 'Pilih',
      cell: (v: any) => (
        <input 
          type="checkbox" 
          className="form-check-input shadow-none"
          checked={checkedRightIds.includes(v.id)}
          onChange={(e) => {
            if (e.target.checked) setCheckedRightIds(prev => [...prev, v.id])
            else setCheckedRightIds(prev => prev.filter(id => id !== v.id))
          }}
        />
      )
    },
    { header: '#', cell: (_, i) => i + 1 },
    { 
      header: 'Nama Siswa', 
      cell: (v: any) => (
        <div>
          <h6 className="mb-0" dangerouslySetInnerHTML={{ __html: v.question_text }}></h6>
        </div>
      )
    },
    {header: 'Jenis Soal', cell: (v: any) => v.question_type},
    {header: 'Skor', cell: (v: any) => v.score},
    { 
      header: 'Aksi', 
      cell: (v: any) => (
        <button 
          className="btn btn-sm text-danger p-0" 
          onClick={() => setRightData(p => p.filter(s => s.id !== v.id))}
        >
          <IconTrash size={18}/>
        </button>
      ) 
    }
  ]
  
  const { trigger: rollMultipleTrigger, isMutating: isMutatingRollMultiple } = useMutationAction(EXAM.ROLL_QUESTIONS.replace('{id}', examId), 'post', { refreshKey: EXAM.GET })

  const handleRollMultiple = () => {
    const dataToSubmit: ExamQuestionRollType = {
      question_banks: rightData.map(v => v.id)
    }
    rollMultipleTrigger(dataToSubmit)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0 fw-bolder">{`Kelola Soal: ${exam?.data?.title || "..."}`}</h5>
          <small className="text-muted">Pilih soal dari daftar kiri untuk dimasukkan ke ujian</small>
        </div>
        <button className='btn bg-light text-dark' onClick={() => navigate({ to: '..' })}>Kembali</button>
      </div>
      
      <div className="card-body">
        <div className="row g-4">
          
          <div className="col-md-12">
            <div className="d-flex flex-column gap-3 mb-3">
              <div className='input-group input-group-sm'>
                <DebouncedInput value={search} onChange={(v) => setSearch(String(v))} className='form-control' placeholder='Cari nama atau email...' />
                <span className="input-group-text bg-white"><IconSearch size={16}/></span>
              </div>
              
              <div className="form-check d-flex align-items-center gap-2 border rounded p-2 bg-light">
                <input 
                  type="checkbox" 
                  id="selAllLeft"
                  className="form-check-input ms-1 shadow-none"
                  checked={isAllCurrentPageChecked}
                  onChange={(e) => handleTogglePageLeft(e.target.checked)}
                />
                <label htmlFor="selAllLeft" className="form-check-label small fw-bold cursor-pointer">
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
          <div className="col-md-12 d-flex flex-row gap-3 align-items-center justify-content-center">
            <button 
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              onClick={handleMoveRight}
              disabled={checkedLeft.length === 0}
            >
              <span>Tambah</span>
              <ChevronsRight size={20} />
              {checkedLeft.length > 0 && <span className="badge bg-white text-primary">{checkedLeft.length}</span>}
            </button>
            
            <button 
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              onClick={handleMoveLeft}
              disabled={checkedRightIds.length === 0}
            >
              <ChevronsLeft size={20} />
              <span>Hapus</span>
            </button>
          </div>

          {/* TABEL KANAN: SISWA TERPILIH */}
          <div className="col-md-12">
            <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Siswa Terpilih</span>
                  <span className="badge bg-success rounded-pill">{rightData.length} Total</span>
               </div>
               <div className="form-check d-flex align-items-center gap-2 border rounded p-2 bg-light">
                <input 
                  type="checkbox" 
                  id="selAllRight"
                  className="form-check-input ms-1 shadow-none"
                  checked={isAllRightChecked}
                  onChange={(e) => handleToggleAllRight(e.target.checked)}
                />
                <label htmlFor="selAllRight" className="form-check-label small fw-bold cursor-pointer">
                  Pilih Semua Terpilih
                </label>
              </div>
            </div>

            <DataTable
              data={rightData}
              columns={rightColumns}
              showPageSize={false}
            />

            <button disabled={isMutatingRollMultiple} className="btn btn-success w-100 mt-4 fw-bold py-2 shadow-sm" onClick={handleRollMultiple}>
                Simpan Pilihan Soal
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}