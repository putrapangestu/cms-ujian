import { IconClock } from '@tabler/icons-react'

interface TimerProps {
  seconds: number // Input dalam detik
}

export function TimerCard({ seconds }: TimerProps) {
  // Fungsi untuk menampilkan format MM:SS
  const formatDisplay = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div
      className="card shadow-sm mb-3"
      style={{ backgroundColor: '#fff', border: '2px solid #ff6b35' }}
    >
      <div className="card-body text-center py-2">
        <div className="d-flex align-items-center justify-content-center gap-2">
          <IconClock
            size={20}
            color={seconds < 10 ? '#dc3545' : '#ff6b35'} // Berubah merah jika sisa < 10 detik
          />
          <h6
            className="mb-0"
            style={{ color: '#ff6b35', fontSize: '0.95rem' }}
          >
            Sisa Waktu: {formatDisplay(seconds)}
          </h6>
        </div>
      </div>
    </div>
  )
}
