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
          <div className="col-md-9">
            <h4 className="mb-3 text-white">{exam?.title || 'N/A'}</h4>
            <div className="mb-2 text-white">
              <strong>Pelaksanaan:</strong>{' '}
              {dayjs(exam?.start_date).format('DD MMMM YYYY, HH:mm')}
            </div>
            <div className="mb-2 text-white">
              <strong>Waktu:</strong> {exam?.duration || 0} Menit
            </div>
          </div>
          <div className="col-md-3 text-center">
            <IconFileText size={60} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
