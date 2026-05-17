import type { QuestionDataType } from '@/data/validations/exam_schema'

type QuestionCardProps = {
  currentQuestion: number
  questions: QuestionDataType[] | undefined
  handleNavigate: (questionNumber: number) => void
  handleAnswerSelect: (label: string) => void
  selectedAnswer: string | null
  totalQuestions: number
  // isDoubtful?: boolean
  // onToggleDoubtful?: () => void
}
export default function QuestionCard({
  currentQuestion,
  questions,
  handleNavigate,
  handleAnswerSelect,
  selectedAnswer,
  totalQuestions,
  // isDoubtful = false,
  // onToggleDoubtful,
}: QuestionCardProps) {
  const question = questions?.[currentQuestion - 1]
  const qType = (question as any)?.type || (question as any)?.question_type || 'single_choice'

  let selectedOptions: string[] = []
  if (qType === 'multiple_choice' && selectedAnswer) {
    if (typeof selectedAnswer === 'string' && selectedAnswer.startsWith('[')) {
      try {
        selectedOptions = JSON.parse(selectedAnswer).map(String)
      } catch (e) {
        // fallback
      }
    } else if (Array.isArray(selectedAnswer)) {
      selectedOptions = selectedAnswer.map(String)
    } else if (typeof selectedAnswer === 'string') {
      selectedOptions = selectedAnswer.split(',').filter(Boolean).map(String)
    }
  } else if (selectedAnswer) {
    selectedOptions = [String(selectedAnswer)]
  }

  const onOptionChange = (optionId: string | number) => {
    const optIdStr = String(optionId)
    if (qType === 'multiple_choice') {
      let newSelected = [...selectedOptions]
      if (newSelected.includes(optIdStr)) {
        newSelected = newSelected.filter((id) => id !== optIdStr)
      } else {
        newSelected.push(optIdStr)
      }
      handleAnswerSelect(JSON.stringify(newSelected))
    } else {
      handleAnswerSelect(optIdStr)
    }
  }

  return (
    <div
      className="card shadow-sm"
      style={{ backgroundColor: '#2c5f5f', color: 'white' }}
    >
      <div className="card-body p-4">
        <h5 className="mb-4 text-white">Soal Nomor {currentQuestion}</h5>

        <div className="mb-4">
          <p
            className="mb-0 text-white"
            style={{ lineHeight: '1.8', textAlign: 'justify' }}
            dangerouslySetInnerHTML={{
              __html:
                question?.question_text || '',
            }}
          ></p>
        </div>
        {/* Options */}
        <div className="d-grid gap-3">
          {qType === 'essay' ? (
            <textarea
              className="form-control"
              rows={6}
              placeholder="Ketik jawaban Anda di sini..."
              value={selectedAnswer || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
            ></textarea>
          ) : question && question.options && question.options.length > 0
            ? question.options.map((option: any) => {
                const isSelected = selectedOptions.includes(String(option.id))
                return (
                <div key={option.id}>
                  <label
                    className={`option-label d-flex align-items-start p-3 rounded position-relative ${
                        isSelected
                        ? 'bg-light text-dark'
                        : 'bg-white bg-opacity-10 text-white'
                    }`}
                    style={{ cursor: 'pointer' }}
                      htmlFor={`option-${option.id}`}
                  >
                    <input
                      className="form-check-input mt-1 me-3 flex-shrink-0"
                        type={qType === 'multiple_choice' ? 'checkbox' : 'radio'}
                        name={`answer-${currentQuestion}`}
                        id={`option-${option.id}`}
                        checked={isSelected}
                        onChange={() => onOptionChange(option.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span
                      style={{ cursor: 'pointer' }}
                      dangerouslySetInnerHTML={{
                        __html: option.option_text || '',
                      }}
                    ></span>
                  </label>
                </div>
                )
              })
            : null}
        </div>

        {/* Navigation Buttons */}
        <div className="row g-2 mt-4">
          <div className="col-4">
            <button
              className="btn btn-light w-100"
              onClick={() => handleNavigate(Math.max(1, currentQuestion - 1))}
              disabled={currentQuestion === 1}
            >
              Kembali
            </button>
          </div>
          <div className="col-4">
            {/* <button 
              className={`btn w-100 ${isDoubtful ? 'btn-outline-warning text-white' : 'btn-warning'}`}
              onClick={onToggleDoubtful}
            >
              {isDoubtful ? 'Batal Ragu' : 'Ragu - Ragu'}
            </button> */}
            <button 
              className="btn btn-warning w-100 text-white"
              onClick={() => {
                if (qType === 'multiple_choice') {
                  handleAnswerSelect('[]')
                } else {
                  handleAnswerSelect('')
                }
              }}
            >
              Hapus Jawaban
            </button>
          </div>
          <div className="col-4">
            <button
              className="btn btn-info w-100"
              onClick={() =>
                handleNavigate(Math.min(totalQuestions, currentQuestion + 1))
              }
              disabled={currentQuestion === totalQuestions}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
