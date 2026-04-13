import type { QuestionDataType } from '@/data/validations/exam_schema'

type QuestionCardProps = {
  currentQuestion: number
  questions: QuestionDataType[] | undefined
  handleNavigate: (questionNumber: number) => void
  handleAnswerSelect: (label: string) => void
  selectedAnswer: string | null
  totalQuestions: number
  isDoubtful?: boolean
  onToggleDoubtful?: () => void
}
export default function QuestionCard({
  currentQuestion,
  questions,
  handleNavigate,
  handleAnswerSelect,
  selectedAnswer,
  totalQuestions,
  isDoubtful = false,
  onToggleDoubtful,
}: QuestionCardProps) {
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
                (questions && questions[currentQuestion - 1]?.question_text) ||
                '',
            }}
          ></p>
        </div>
        {/* Options */}
        <div className="d-grid gap-3">
          {questions && questions.length > 0
            ? questions[currentQuestion - 1]?.options.map((option) => (
                <div key={option.id}>
                  <label
                    className={`option-label d-flex align-items-start p-3 rounded position-relative ${
                      selectedAnswer === option.id
                        ? 'bg-light text-dark'
                        : 'bg-white bg-opacity-10 text-white'
                    }`}
                    style={{ cursor: 'pointer' }}
                    htmlFor={`option-${option.id}`} // TODO: Fix this
                  >
                    <input
                      className="form-check-input mt-1 me-3 flex-shrink-0"
                      type="radio"
                      name="answer"
                      id={`option-${option.id}`} // TODO: Fix this
                      checked={selectedAnswer === option.id}
                      onChange={() => handleAnswerSelect(option.id)}
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
              ))
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
            <button 
              className={`btn w-100 ${isDoubtful ? 'btn-outline-warning text-white' : 'btn-warning'}`}
              onClick={onToggleDoubtful}
            >
              {isDoubtful ? 'Batal Ragu' : 'Ragu - Ragu'}
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
