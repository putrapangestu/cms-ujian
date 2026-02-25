import { IconClock, IconFileText } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/_exam/exam')({
  component: RouteComponent,
})

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    text: string;
  }[];
}

function RouteComponent() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState('10:00:00');

  // Sample question data
  const question: Question = {
    id: 13,
    text: 'Dalam pertemuan pertama TKR tanggal 12 November 1945, Jendral Soedirman terpilih menjadi Panglima Angkatan Perang. Jenderal Soedirman unggul dibanding Oerip Soemohardjo. Namun, sebagai bentuk hormatnya, Jenderal Soedirman menyerahkan jabatan tersebut kepada Oerip Soemohardjo. Selain tidak disetujui oleh peserta pertemuan, Oerip Soemohardjo juga tidak ingin menerima jabatan tersebut. Ia menyetujui Jenderal Soedirman sebagai pucuk pimpinan pasukan perang Indonesia sesuai hasil pertemuan tersebut. Ia berpendiriran bahwa keharmonisan kalangan tentara lebih utama dari jabatan yang diemban. Wujud sikap integritas kedua tokoh militer tersebut terlihat pada ....',
    options: [
      { label: 'A', text: 'Penghormatan terhadap jasa dan perjuangan yang dilakukan oleh kalangan senior.' },
      { label: 'B', text: 'Menghargai dan menjunjung tinggi hasil musyawarah sesuai mufakat.' },
      { label: 'C', text: 'Mengedepankan kepentingan bangsa dan negara dengan mendukung keharmonisan internal perangkat negara.' },
      { label: 'D', text: 'Mendukung pimpinan yang bijak dan kharismatik dalam organisasi perang.' },
      { label: 'E', text: 'Semangat kebersamaan dalam membangun bangsa dan tetap menjaga persatuan dan kesatuan bangsa.' },
    ],
  };

  const totalQuestions = 40;
  const answeredQuestions = Object.keys(answers).length;

  const handleAnswerSelect = (label: string) => {
    setSelectedAnswer(label);
    setAnswers({ ...answers, [currentQuestion]: label });
  };

  const handleNavigate = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
    setSelectedAnswer(answers[questionNumber] || null);
  };

  const getQuestionStatus = (num: number) => {
    if (num === currentQuestion) return 'active';
    if (answers[num]) return 'answered';
    return 'unanswered';
  };

  return (
    <>
      <style>{`
        .question-number-btn {
          aspect-ratio: 1/1;
          width: 38px;
          height: 38px;
          padding: 0;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border-radius: 6px;
        }
        
        .question-number-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .legend-number {
          width: 24px;
          height: 24px;
          padding: 0;
          font-size: 0.7rem;
          aspect-ratio: 1/1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .option-label {
          transition: all 0.2s ease;
        }

        .option-label:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .form-check-input {
          width: 1.2em;
          height: 1.2em;
          margin-top: 0.15em;
        }

        .form-check-input:checked {
          background-color: #ff6b35;
          border-color: #ff6b35;
        }
      `}</style>

      <div className="container py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="row g-4">
          {/* Left Section - Question */}
          <div className="col-lg-9 col-xl-9">
            {/* Header Card */}
            <div className="card shadow-sm mb-4" style={{ backgroundColor: '#2c5f5f', color: 'white' }}>
              <div className="card-body">
                <div className="row align-items-start">
                  <div className="col-md-9">
                    <h4 className="mb-3 text-white">Ujian Tengah Semester</h4>
                    <div className="mb-2 text-white">
                      <strong>Pelaksanaan:</strong> Senin 12 Desember 2026 10:00:00 WIB
                    </div>
                    <div className="mb-2 text-white">
                      <strong>Waktu:</strong> 60 Menit
                    </div>
                    <div className="text-white">
                      <strong>Kategori Soal:</strong>
                      <span className="badge bg-primary ms-2">STAN</span>
                      <span className="badge bg-warning text-dark ms-2">CPNS</span>
                      <span className="badge bg-success ms-2">TKD</span>
                    </div>
                  </div>
                  <div className="col-md-3 text-center">
                    <IconFileText size={60} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="card shadow-sm" style={{ backgroundColor: '#2c5f5f', color: 'white' }}>
              <div className="card-body p-4">
                <h5 className="mb-4 text-white">Soal Nomor {currentQuestion}</h5>
                
                <div className="mb-4">
                  <p className="mb-0 text-white" style={{ lineHeight: '1.8', textAlign: 'justify' }}>
                    {currentQuestion}. {question.text}
                  </p>
                </div>

                {/* Options */}
                <div className="d-grid gap-3">
                  {question.options.map((option) => (
                    <div key={option.label}>
                      <label
                        className={`option-label d-flex align-items-start p-3 rounded position-relative ${
                          selectedAnswer === option.label
                            ? 'bg-light text-dark'
                            : 'bg-white bg-opacity-10 text-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                        htmlFor={`option-${option.label}`}
                      >
                        <input
                          className="form-check-input mt-1 me-3 flex-shrink-0"
                          type="radio"
                          name="answer"
                          id={`option-${option.label}`}
                          checked={selectedAnswer === option.label}
                          onChange={() => handleAnswerSelect(option.label)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span className="flex-grow-1" style={{ cursor: 'pointer' }}>
                          <strong>{option.label}.</strong> {option.text}
                        </span>
                      </label>
                    </div>
                  ))}
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
                    <button className="btn btn-warning w-100">
                      Ragu - Ragu
                    </button>
                  </div>
                  <div className="col-4">
                    <button
                      className="btn btn-info w-100"
                      onClick={() => handleNavigate(Math.min(totalQuestions, currentQuestion + 1))}
                      disabled={currentQuestion === totalQuestions}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Info & Navigation */}
          <div className="col-lg-3 col-xl-3">
            {/* Student Info Card */}
            <div className="card shadow-sm mb-3" style={{ backgroundColor: '#ff6b35', color: 'white' }}>
              <div className="card-body p-3">
                <div className="mb-2">
                  <strong>Nama:</strong> RIZKY RIDHO PRATAMA
                </div>
                <div className="mb-2">
                  <strong>NIS:</strong> 455848332443
                </div>
                <div className="mb-0">
                  <strong>Kelas:</strong> CPNS
                </div>
              </div>
            </div>

            {/* Timer Card */}
            <div className="card shadow-sm mb-3" style={{ backgroundColor: '#fff', border: '2px solid #ff6b35' }}>
              <div className="card-body text-center py-2">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <IconClock size={20} color="#ff6b35" />
                  <h6 className="mb-0" style={{ color: '#ff6b35', fontSize: '0.95rem' }}>
                    Sisa Waktu: {timeRemaining}
                  </h6>
                </div>
              </div>
            </div>

            {/* Question Navigator */}
            <div className="card shadow-sm">
              <div className="card-header text-center fw-bold py-2" style={{ backgroundColor: '#2c5f5f', color: 'white', fontSize: '0.95rem' }}>
                Nomor Soal
              </div>
              <div className="card-body p-3">
                <div className="d-flex flex-wrap gap-2 justify-content-start">
                  {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
                    const status = getQuestionStatus(num);
                    let btnClass = 'btn-outline-secondary';
                    
                    if (status === 'active') {
                      btnClass = 'btn-warning';
                    } else if (status === 'answered') {
                      btnClass = 'btn-success';
                    }

                    return (
                      <button
                        key={num}
                        className={`btn ${btnClass} question-number-btn`}
                        onClick={() => handleNavigate(num)}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-3 pt-3 border-top">
                  <div className="row g-2" style={{ fontSize: '0.75rem' }}>
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <div className="btn btn-success btn-sm legend-number">1</div>
                        <span>Terjawab</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <div className="btn btn-outline-secondary btn-sm legend-number">2</div>
                        <span>Belum</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <div className="btn btn-dark btn-sm legend-number">3</div>
                        <span>Aktif</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <div className="btn btn-warning btn-sm legend-number">4</div>
                        <span>Ragu-ragu</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-3">
                  <button className="btn btn-danger w-100 py-2" style={{ fontSize: '0.9rem' }}>
                    Selesai & Submit ({answeredQuestions}/{totalQuestions})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}