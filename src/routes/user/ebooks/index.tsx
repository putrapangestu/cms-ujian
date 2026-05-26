import { EBOOK, QUESTION_CATEGORY } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType, ApiResponseType } from '@/data/types/api_response'
import type { EbookDataType } from '@/data/validations/ebook_schema'
import { getToken } from '@/lib/token-handler'
import { toaster } from '@/lib/toast'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconSearch, IconDownload, IconEye } from '@tabler/icons-react'

export const Route = createFileRoute('/user/ebooks/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const urlParams = new URLSearchParams(window.location.search)
  const categoryCodeFromUrl = urlParams.get('category') || ''

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<{ url: string, name: string, type: string } | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data: categoriesData } = useQueryData<
    ApiResponsePaginationType<{ id: string; name: string; code: string }>
  >(QUESTION_CATEGORY.GET, { limit: 999999, page: 1 })

  const optCategories = useMemo(
    () =>
      categoriesData?.data?.data?.map((cat: any) => ({
        value: cat.id,
        label: `${cat.name} (${cat.code})`,
        code: cat.code,
      })) || [],
    [categoriesData],
  )

  // Sync category filter from URL param
  useEffect(() => {
    if (categoryCodeFromUrl && optCategories.length > 0) {
      const found = optCategories.find(
        (c) => c.code.toLowerCase() === categoryCodeFromUrl.toLowerCase(),
      )
      if (found) {
        setCategoryFilter(found.value)
      }
    } else if (!categoryCodeFromUrl) {
      setCategoryFilter('')
    }
  }, [categoryCodeFromUrl, optCategories])

  const queryParams: Record<string, any> = {
    page,
    per_page: 12,
    search,
  }
  if (categoryFilter) {
    queryParams.question_category_id = categoryFilter
  }

  const { data } = useQueryData<ApiResponsePaginationType<EbookDataType>>(
    EBOOK.GET,
    queryParams,
  )

  const handleAction = async (ebook: EbookDataType, action: 'download' | 'preview') => {
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
        throw new Error('Gagal mengakses ebook')
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json()
        if (!json.success) throw new Error(json.message || 'Gagal mengakses ebook')
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

      const fileUrl = window.URL.createObjectURL(blob)

      if (action === 'download') {
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = fileUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          window.URL.revokeObjectURL(fileUrl)
          document.body.removeChild(a)
        }, 100)
        toaster('Berhasil mengunduh ebook', 'success')
      } else {
        const extension = filename.split('.').pop()?.toLowerCase()
        if (['pdf'].includes(extension || '')) {
          setPreviewData({ url: fileUrl, name: filename, type: 'pdf' })
          $('#preview-ebook-modal').modal('show')
        } else {
          // Fallback to download for non-previewable types
          toaster('Format file tidak didukung untuk preview, file akan diunduh', 'info')
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = fileUrl
          a.download = filename
          document.body.appendChild(a)
          a.click()
          setTimeout(() => {
            window.URL.revokeObjectURL(fileUrl)
            document.body.removeChild(a)
          }, 100)
        }
      }

    } catch (error: any) {
      console.error(`${action} error:`, error)
      toaster(error.message || `Terjadi kesalahan saat ${action}`, 'error')
    } finally {
      setIsDownloading(null)
    }
  }

  const closePreview = () => {
    $('#preview-ebook-modal').modal('hide')
    if (previewData) {
      window.URL.revokeObjectURL(previewData.url)
      setPreviewData(null)
    }
  }

  const totalPages = (data?.data as any)?.pagination?.last_page || 1

  return (
    <div className="container-fluid py-4">
      {/* Header & Search */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">Materi & Ebook</h4>
          <p className="text-muted mb-0">Daftar materi pembelajaran yang dapat Anda unduh</p>
        </div>
        <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
          <DebouncedInput
            value={search}
            onChange={(v) => { setSearch(String(v)); setPage(1) }}
            className="form-control bg-white"
            placeholder="Cari materi..."
          />
          <button className="btn btn-primary" type="button">
            <IconSearch size={18} />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm ${!categoryFilter ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => {
            setCategoryFilter('')
            setPage(1)
            navigate({ to: '/user/ebooks' })
          }}
        >
          Semua
        </button>
        {optCategories.map((cat) => (
          <button
            key={cat.value}
            className={`btn btn-sm ${categoryFilter === cat.value ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => {
              setCategoryFilter(cat.value)
              setPage(1)
              navigate({ to: '/user/ebooks', search: { category: cat.code.toLowerCase() } })
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="row g-4">
        {(!(data?.data as any)?.items || (data?.data as any).items.length === 0) ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="ti ti-book-off text-muted" style={{ fontSize: '64px' }}></i>
                <h5 className="mt-3 text-muted">Belum ada materi</h5>
                <p className="text-muted mb-0">Materi atau ebook belum ditambahkan oleh admin.</p>
              </div>
            </div>
          </div>
        ) : (
          (data?.data as any)?.items?.map((ebook: EbookDataType) => (
            <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={ebook.id}>
              <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 text-primary rounded p-3 me-3">
                        <i className="ti ti-book fs-3"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="card-title fw-semibold mb-1 line-clamp-2" title={ebook.name}>
                          {ebook.name}
                        </h6>
                        {(ebook as any).category && (
                          <span className="badge bg-success-subtle text-success">
                            {(ebook as any).category.name} ({(ebook as any).category.code})
                          </span>
                        )}
                      </div>
                    </div>
                  
                  <div className="mt-auto pt-3 border-top d-flex gap-2">
                    <button 
                      className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleAction(ebook, 'preview')}
                      disabled={isDownloading === String(ebook.id)}
                    >
                      {isDownloading === String(ebook.id) ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <IconEye size={18} />
                      )}
                      Preview
                    </button>
                    <button 
                      className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                      onClick={() => handleAction(ebook, 'download')}
                      disabled={isDownloading === String(ebook.id)}
                      title="Download"
                    >
                      <IconDownload size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav aria-label="Page navigation">
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>
                  Sebelumnya
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  Selanjutnya
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Preview Modal */}
      <div className="modal fade" id="preview-ebook-modal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content" style={{ height: '90vh' }}>
            <div className="modal-header">
              <h5 className="modal-title text-truncate">{previewData?.name || 'Preview Ebook'}</h5>
              <button type="button" className="btn-close" onClick={closePreview} aria-label="Close"></button>
            </div>
            <div className="modal-body p-0">
              {previewData?.type === 'pdf' ? (
                <iframe src={previewData.url} width="100%" height="100%" style={{ border: 'none' }} title="Preview PDF"></iframe>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <p className="text-muted">Preview tidak tersedia untuk format ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
