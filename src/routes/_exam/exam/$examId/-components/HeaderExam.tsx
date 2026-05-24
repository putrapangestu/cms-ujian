import type { ExamDataType } from '@/data/validations/exam_schema'
import { IconFileText } from '@tabler/icons-react'
import dayjs from 'dayjs'

type HeaderExamProps = {
  exam: any
}
export function HeaderExam({ exam }: HeaderExamProps) {
  return (
    <div
      className="card shadow-sm mb-4"
      style={{ backgroundColor: '#2c5f5f', color: 'white' }}
    >
      <div className="card-body">
        <div className="row align-items-start">
          <div className="col-md-4">
            <h4 className="mb-3 text-white">{exam?.title || 'N/A'}</h4>
            <div className="mb-2 text-white">
              <strong>Pelaksanaan:</strong>{' '}
              {dayjs(exam?.start_date).format('DD MMMM YYYY, HH:mm')}
            </div>
            <div className="mb-2 text-white">
              <strong>Waktu:</strong> {exam?.duration || 0} Menit
            </div>
          </div>
          <div className="col-md-8">
            <div
              className="card h-100"
              style={{ backgroundColor: '#FDFBEA', color: '#333' }}
            >
              <div className="card-body p-3">
                <h6 className="card-title fw-bold">Peraturan Selama Ujian</h6>
                <ol
                  className="small"
                  style={{ paddingLeft: '20px', marginBottom: '1rem' }}
                >
                  <li>
                    Tidak boleh melakukan tab / berpindah halaman pada saat
                    ujian sedang berlangsung.
                  </li>
                  <li>
                    Selama ujian tidak diperbolehkan menggunakan kalkulator,
                    ChatGPT, atau alat bantu AI lainnya dalam bentuk apapun.
                  </li>
                </ol>
                <p
                  className="small fst-italic mb-0"
                >
                  Selamat mengerjakan ujian dengan JUJUR & Amanah untuk mencapai
                  kemampuan terbaik Anda. Hasil baik akan segera terlihat
                  setelah usaha keras yang mengiringinya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}