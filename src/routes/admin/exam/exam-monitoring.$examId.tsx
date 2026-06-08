import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useRef, memo } from 'react';
import { socketClient } from '@/lib/socket-client';
import { useQueryDataPersistent, useMutationAction } from '@/data/hooks/api/useGlobalFetch';
import { EXAM_MONITORING } from '@/data/const/api_url';
import type { ApiResponseType } from '@/data/types/api_response';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import {
  startMonitoringBuffer,
  stopMonitoringBuffer,
  queueParticipantUpdate,
  useMonitoringStore,
  type Participant,
  type CategoryScore,
} from '@/store/useMonitoringStore';

export const Route = createFileRoute('/admin/exam/exam-monitoring/$examId')({
  component: ExamMonitoringDetail,
});

// Threshold per kategori untuk color code
const SCORE_THRESHOLDS: Record<string, { min: number }> = {
  TWK: { min: 65 },
  TIU: { min: 85 },
  TKP: { min: 166 },
}

const TOTAL_THRESHOLD = 316 // 65 + 85 + 166

function getScoreColor(score: number | undefined, category: string): string {
  if (score === undefined || score === null) return ''
  
  const threshold = category === 'total' 
    ? TOTAL_THRESHOLD 
    : (SCORE_THRESHOLDS[category]?.min ?? 0)
  
  if (threshold === 0) return ''
  
  return score >= threshold 
    ? 'text-success bg-success-subtle' 
    : 'text-danger bg-danger-subtle'
}

function ExamMonitoringDetail() {
  const { examId } = Route.useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(true);
  const setParticipants = useMonitoringStore((state) => state.setParticipants);
  const setServerTime = useMonitoringStore((state) => state.setServerTime);
  
  // Ambil list semua ujian aktif untuk dropdown
  const { data: activeExams } = useQueryDataPersistent<
    ApiResponseType<'multi', { id: string; title: string }>
  >(EXAM_MONITORING.ACTIVE);

  // Ambil detail participants dari API
  const { data: monitoringData, isLoading, mutate } = useQueryDataPersistent<
    ApiResponseType<'multi', Participant>
  >(EXAM_MONITORING.DETAIL.replace('{id}', examId));

  // Ref untuk mutate agar bisa dipakai di socket effect tanpa trigger re-run
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;

  // M5: Listen global socket connection status events
  useEffect(() => {
    const handleConnected = () => setIsSocketConnected(true);
    const handleDisconnected = () => setIsSocketConnected(false);
    
    window.addEventListener('socket:connected', handleConnected);
    window.addEventListener('socket:disconnected', handleDisconnected);
    
    // Cek status awal
    const socket = socketClient.getSocket();
    setIsSocketConnected(socket?.connected ?? false);
    
    return () => {
      window.removeEventListener('socket:connected', handleConnected);
      window.removeEventListener('socket:disconnected', handleDisconnected);
    };
  }, []);

  // Socket effect — stabil, hanya re-run kalau examId berubah
  useEffect(() => {
    startMonitoringBuffer();

    const socket = socketClient.connect('');
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    // M5: Helper untuk join room
    const joinExamRoom = () => {
      socket.emit('join', { room: `exam:${examId}` });
    };

    joinExamRoom();

    // M5: Auto re-join room saat reconnect + refresh data
    const handleSocketConnected = () => {
      console.log('CMS Socket reconnected, re-joining room exam:' + examId);
      joinExamRoom();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        mutateRef.current();
      }, 2000);
    };

    window.addEventListener('socket:connected', handleSocketConnected);

    socket.on('exam:progress_update', (received: any) => {
      // Handle 2 format:
      //   - Direct emit: { id, update }
      //   - Via Laravel /emit: { channel, data: { id, update } }
      const payload = received.data || received;
      queueParticipantUpdate(payload.id, payload.update);
    });

    socket.on('exam:tick', (data: { serverTime: number }) => {
      setServerTime(data.serverTime);
    });

    // Auto-refresh ketika ada user baru join
    socket.on('user_connected', () => {
      mutateRef.current();
    });

    return () => {
      socket.off('exam:progress_update');
      socket.off('exam:tick');
      socket.off('user_connected');
      socket.emit('leave', { room: `exam:${examId}` });
      window.removeEventListener('socket:connected', handleSocketConnected);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      stopMonitoringBuffer();
    };
  }, [examId, setServerTime]);

  // Sync data dari API ke store — re-run setiap monitoringData berubah
  // Tapi TIDAK mengganggu socket listener
  useEffect(() => {
    if (monitoringData?.data && Array.isArray(monitoringData.data)) {
       const validParticipants = monitoringData.data.filter(p => p.id != null);
       setParticipants(validParticipants);
    } else {
       setParticipants([]);
    }
  }, [monitoringData, setParticipants]);

  // Periodic auto-refresh (tiap 15 detik) — safety net untuk user baru
  useEffect(() => {
    const interval = setInterval(() => mutate(), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newExamId = e.target.value;
    if (newExamId) {
      navigate({
        to: '/admin/exam/exam-monitoring/$examId',
        params: { examId: newExamId },
      });
    }
  };

  return (
    <div className="card">
      <div className="border-bottom p-4">
        <h5 className="card-title fw-bolder">Monitoring Ujian</h5>
        <p className="p-0">List informasi monitoring ujian</p>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
           <div>
             <select 
                className="form-select w-auto" 
                value={examId} 
                onChange={handleExamChange}
             >
               <option value="" disabled>Pilih Ujian...</option>
               {activeExams?.data?.map((exam) => (
                 <option key={exam.id} value={exam.id}>{exam.title}</option>
               ))}
               {activeExams?.data && !activeExams.data.some(e => e.id === examId) && (
                 <option value={examId}>Ujian {examId.substring(0, 8)}...</option>
               )}
             </select>
           </div>
           
           <div className="d-flex gap-2">
             <div className="input-group" style={{ width: '250px' }}>
               <input 
                 type="text" 
                 className="form-control" 
                 placeholder="Search" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <button className="btn btn-dark" type="button">
                 <IconSearch size={18} />
               </button>
             </div>
             <button 
               className="btn btn-dark" 
               type="button"
                onClick={() => mutate()}
               title="Refresh Data"
             >
               <IconRefresh size={18} />
             </button>
           </div>
        </div>

        {/* M5: Indikator koneksi terputus */}
        {!isSocketConnected && (
          <div className="alert alert-warning py-2 mb-3 d-flex align-items-center gap-2">
            <span className="spinner-border spinner-border-sm" role="status" />
            <small className="fw-semibold">Koneksi terputus. Menghubungkan kembali...</small>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-5">
             <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Memuat data peserta...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <MonitoringTable searchQuery={searchQuery} examId={examId} />
          </div>
        )}
      </div>
    </div>
  );
}

function MonitoringTable({ searchQuery, examId }: { searchQuery: string; examId: string }) {
  const participantsMap = useMonitoringStore((state) => state.participants);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1000;
  
  const participantIds = Object.keys(participantsMap).filter((id) => {
    if (!searchQuery) return true;
    const name = participantsMap[id]?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(participantIds.length / itemsPerPage);
  const paginatedIds = participantIds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <table className="table table-bordered table-hover table-striped align-middle text-center mb-0">
        <thead className="table-light">
          <tr>
            <th className="text-start" style={{ width: '50px' }}>No</th>
            <th className="text-start">Nama</th>
            <th>Menit</th>
            <th>TWK</th>
            <th>TKP</th>
            <th>TIU</th>
            <th>Total</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {paginatedIds.map((id, index) => (
            <MonitoringRow 
              key={id} 
              id={id} 
              index={(currentPage - 1) * itemsPerPage + index} 
              examId={examId}
            />
          ))}
          {participantIds.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-muted py-4">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} sampai {Math.min(currentPage * itemsPerPage, participantIds.length)} dari {participantIds.length} data
          </div>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, i, arr) => {
                const showEllipsis = i > 0 && page - arr[i - 1] > 1;
                return (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    {showEllipsis && <span className="page-link px-2">...</span>}
                    {!showEllipsis && (
                      <button className="page-link" onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    )}
                  </li>
                );
              })
            }
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

const MonitoringRow = memo(({ id, index, examId }: { id: string; index: number; examId: string }) => {
  const participant = useMonitoringStore((state) => state.participants[id]);
  const serverTime = useMonitoringStore((state) => state.serverTime);
  const changeFlags = useMonitoringStore((state) => state.changeFlags);
  const clearChangeFlag = useMonitoringStore((state) => state.clearChangeFlag);
  const lastSyncRef = useRef({ timeRemaining: 0, serverTime: Date.now() });
  const prevIndexRef = useRef<number | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [showScoreFlash, setShowScoreFlash] = useState(false);
  const [moveDirection, setMoveDirection] = useState<'up' | 'down' | null>(null);

  const flag = changeFlags[id];

  // Reset sync point setiap kali dapat update timeRemaining baru dari server
  useEffect(() => {
    if (participant) {
      lastSyncRef.current = {
        timeRemaining: participant.timeRemaining,
        serverTime,
      };
    }
  }, [participant?.timeRemaining]);

  // Animasi enter untuk row baru
  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Deteksi perubahan posisi dan trigger animasi
  useEffect(() => {
    if (prevIndexRef.current !== null && prevIndexRef.current !== index) {
      const direction = index > prevIndexRef.current ? 'down' : 'up';
      setMoveDirection(direction);
      
      // Clear animation setelah selesai
      const timer = setTimeout(() => {
        setMoveDirection(null);
      }, 500);
      return () => clearTimeout(timer);
    }
    prevIndexRef.current = index;
  }, [index]);

  // Animasi flash ketika score berubah
  useEffect(() => {
    if (flag?.scoreChanged) {
      setShowScoreFlash(true);
      const timer = setTimeout(() => {
        setShowScoreFlash(false);
        clearChangeFlag(id);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [flag?.scoreChanged, id, clearChangeFlag]);

  // Countdown smooth di antara heartbeat pakai serverTime (exam:tick tiap 1 detik)
  const elapsed = Math.max(0, Math.floor((serverTime - lastSyncRef.current.serverTime) / 1000));
  const displayTime = Math.max(0, (lastSyncRef.current.timeRemaining || 0) - elapsed);
  
  const { trigger: forceSubmit } = useMutationAction(EXAM_MONITORING.FORCE_SUBMIT, 'post', {
    refreshKey: EXAM_MONITORING.DETAIL.replace('{id}', examId),
  });

  const { trigger: resetExam } = useMutationAction(EXAM_MONITORING.RESET, 'post', {
    refreshKey: EXAM_MONITORING.DETAIL.replace('{id}', examId),
  });

  if (!participant) return null;

  const handleForceSubmit = () => {
    Swal.fire({
      title: 'Keluar Ujian',
      text: `Apakah Anda yakin ingin menghentikan paksa ujian untuk ${participant.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        forceSubmit({ user_exam_id: participant.user_exam_id });
      }
    });
  };

  const handleReset = () => {
    Swal.fire({
      title: 'Reset Ujian',
      text: `Apakah Anda yakin ingin mereset ujian untuk ${participant.name}? Semua jawaban akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Reset!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        resetExam({ user_exam_id: participant.user_exam_id });
      }
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0) return '00:00:00';
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const renderCategory = (cat?: CategoryScore, categoryCode?: string) => {
    if (!cat) return <div className="text-muted">-</div>;
    
    const colorClass = getScoreColor(cat.score, categoryCode || '');
    
    return (
       <div>
         <div className={`fw-bold ${colorClass}`}>
           {cat.score}
         </div>
         <div className="text-muted" style={{ fontSize: '0.8rem' }}>
           {cat.answered}/{cat.total}
         </div>
       </div>
    );
  };

  return (
    <tr 
      style={{ '--row-index': index } as React.CSSProperties}
      className={cn({
        'monitoring-row-enter': isNew,
        'monitoring-row-move-up': moveDirection === 'up',
        'monitoring-row-move-down': moveDirection === 'down',
      })}
    >
      <td className="text-start">{index + 1}.</td>
      <td className="text-start fw-bold">{participant.name}</td>
      <td>{formatTime(displayTime)}</td>
      <td>{renderCategory(participant.categories?.TWK, 'TWK')}</td>
      <td>{renderCategory(participant.categories?.TKP, 'TKP')}</td>
      <td>{renderCategory(participant.categories?.TIU, 'TIU')}</td>
      <td className={cn("fw-bold", getScoreColor(participant.totalScore, 'total'), { "score-flash": showScoreFlash })} style={{ fontSize: '1.1rem' }}>
        {participant.totalScore || 0}
      </td>
      <td className="d-flex gap-2">
        <button
          onClick={handleForceSubmit}
          className="btn btn-sm btn-danger"
          disabled={participant.status === 'finished'}
        >
          Keluar Ujian
        </button>

        <button
          className="btn btn-sm btn-success"
          onClick={handleReset}
          disabled={participant.status === 'in_progress'}
        >
          Reset Ujian
        </button>
      </td>
    </tr>
  );
});

MonitoringRow.displayName = 'MonitoringRow';
