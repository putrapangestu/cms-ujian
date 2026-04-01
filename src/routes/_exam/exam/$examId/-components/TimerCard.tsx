import { useState, useEffect } from "react";
import { IconClock } from "@tabler/icons-react";

interface TimerProps {
  initialMinutes: number; // Input dalam menit, misal: 10
}

export function TimerCard({ initialMinutes }: TimerProps) {
  // Konversi menit ke detik untuk state internal
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(initialMinutes * 60);
  }, [initialMinutes])

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  // Fungsi untuk menampilkan format MM:SS
  const formatDisplay = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    // PadStart memastikan angka selalu 2 digit (misal: 05:09)
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="card shadow-sm mb-3" style={{ backgroundColor: "#fff", border: "2px solid #ff6b35" }}>
      <div className="card-body text-center py-2">
        <div className="d-flex align-items-center justify-content-center gap-2">
          <IconClock 
            size={20} 
            color={seconds < 10 ? "#dc3545" : "#ff6b35"} // Berubah merah jika sisa < 10 detik
          />
          <h6 className="mb-0" style={{ color: "#ff6b35", fontSize: "0.95rem" }}>
            Sisa Waktu: {formatDisplay(seconds)}
          </h6>
        </div>
      </div>
    </div>
  );
}