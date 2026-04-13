import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, memo } from 'react';
import { socketClient } from '@/lib/socket-client';
import { useQueryDataPersistent } from '@/data/hooks/api/useGlobalFetch';
import { EXAM_MONITORING } from '@/data/const/api_url';
import type { ApiResponseType } from '@/data/types/api_response';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
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

function ExamMonitoringDetail() {
  const { examId } = Route.useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const setParticipants = useMonitoringStore((state) => state.setParticipants);
  const setServerTime = useMonitoringStore((state) => state.setServerTime);
  
  // Ambil list semua ujian aktif untuk dropdown
  const { data: activeExams } = useQueryDataPersistent<
    ApiResponseType<'multi', { id: string; title: string }>
  >(EXAM_MONITORING.ACTIVE);

  // Ambil detail participants dari API (karena struktur dari BE rupanya adalah array of participants langsung di 'data')
  const { data: monitoringData, isLoading, refetch } = useQueryDataPersistent<
    ApiResponseType<'multi', Participant>
  >(EXAM_MONITORING.DETAIL.replace('{id}', examId));

  useEffect(() => {
    // 1. Fetch initial data from API
    // Jika data.data adalah array (format: { status: "...", data: [ { id: ..., name: ... } ] })
    if (monitoringData?.data && Array.isArray(monitoringData.data)) {
       // Filter jika id = null agar tidak error di store
       const validParticipants = monitoringData.data.filter(p => p.id != null);
       setParticipants(validParticipants);
    } else {
       // Clear old participants if loading new ones
       setParticipants([]);
    }

    // 2. Start Buffer
    startMonitoringBuffer();

    // 3. Connect Socket
    const socket = socketClient.connect('');

    // Join exam room
    socket.emit('join_exam_monitor', { examId });

    socket.on('exam:progress_update', (data: { id: string; update: any }) => {
      queueParticipantUpdate(data.id, data.update);
    });

    socket.on('exam:tick', (data: { serverTime: number }) => {
      setServerTime(data.serverTime);
    });

    return () => {
      socket.off('exam:progress_update');
      socket.off('exam:tick');
      socket.emit('leave_exam_monitor', { examId });
      stopMonitoringBuffer();
      // Keep socket alive for other pages, just remove listeners
    };
  }, [examId, setParticipants, setServerTime, monitoringData]);

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
        {/* Top Controls: Dropdown and Search */}
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
               {/* Jika ujian yang di-visit tidak ada di daftar, tetap tampilkan option-nya agar dropdown tidak kosong */}
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
               onClick={() => refetch()}
               title="Refresh Data"
             >
               <IconRefresh size={18} />
             </button>
           </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
             <div className="spinner-border text-primary" role="status">
               <span className="visually-hidden">Loading...</span>
             </div>
             <p className="mt-2">Memuat data peserta...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <MonitoringTable searchQuery={searchQuery} />
          </div>
        )}
      </div>
    </div>
  );
}

function MonitoringTable({ searchQuery }: { searchQuery: string }) {
  const participantsMap = useMonitoringStore((state) => state.participants);
  
  // Filter participants based on search query
  const participantIds = Object.keys(participantsMap).filter((id) => {
    if (!searchQuery) return true;
    const name = participantsMap[id]?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <table className="table table-bordered table-hover table-striped align-middle text-center">
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
        {participantIds.map((id, index) => (
          <MonitoringRow key={id} id={id} index={index} />
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
  );
}

const MonitoringRow = memo(({ id, index }: { id: string; index: number }) => {
  const participant = useMonitoringStore((state) => state.participants[id]);
  
  if (!participant) return null;

  const handleForceSubmit = () => {
    if (window.confirm(`Force submit ujian untuk ${participant.name}?`)) {
      socketClient.getSocket()?.emit('admin_action', {
        action: 'force_submit',
        participantId: participant.id,
      });
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0) return '00:00:00';
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const renderCategory = (cat?: CategoryScore) => {
    if (!cat) return <div className="text-muted">-</div>;
    return (
       <div>
         <div className="fw-bold">{cat.score}</div>
         <div className="text-muted" style={{ fontSize: '0.8rem' }}>
           {cat.answered}/{cat.total}
         </div>
       </div>
    );
  };

  return (
    <tr>
      <td className="text-start">{index + 1}.</td>
      <td className="text-start fw-bold">{participant.name}</td>
      <td>{formatTime(participant.timeRemaining)}</td>
      <td>{renderCategory(participant.categories?.TWK)}</td>
      <td>{renderCategory(participant.categories?.TKP)}</td>
      <td>{renderCategory(participant.categories?.TIU)}</td>
      <td className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
        {participant.totalScore || 0}
      </td>
      <td>
        <button
          onClick={handleForceSubmit}
          className="btn btn-sm btn-danger"
          disabled={participant.status === 'finished'}
        >
          Force Submit
        </button>
      </td>
    </tr>
  );
});

MonitoringRow.displayName = 'MonitoringRow';
