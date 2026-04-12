import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { socketClient } from '@/lib/socket-client';
import {
  startMonitoringBuffer,
  stopMonitoringBuffer,
  queueParticipantUpdate,
  useMonitoringStore,
} from '@/store/useMonitoringStore';

export const Route = createFileRoute('/admin/exam/exam-monitoring/$examId')({
  component: ExamMonitoringDetail,
});

function ExamMonitoringDetail() {
  const { examId } = Route.useParams();
  const setParticipants = useMonitoringStore((state) => state.setParticipants);
  const setServerTime = useMonitoringStore((state) => state.setServerTime);

  useEffect(() => {
    // 1. Fetch initial data (mocked for now, should be REST API)
    setParticipants([
      { id: '1', name: 'Peserta A', progress: 0, status: 'offline', timeRemaining: 3600 },
      { id: '2', name: 'Peserta B', progress: 50, status: 'online', timeRemaining: 1800 },
      { id: '3', name: 'Peserta C', progress: 100, status: 'finished', timeRemaining: 0 },
    ]);

    // 2. Start Buffer
    startMonitoringBuffer();

    // 3. Connect Socket
    const socket = socketClient.connect('/admin');

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
  }, [examId, setParticipants, setServerTime]);

  return (
    <div className="card">
      <div className="border-bottom p-4">
        <h5 className="card-title fw-bolder">Live Monitoring - Ujian {examId}</h5>
        <p className="p-0">Monitoring peserta secara real-time</p>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <MonitoringTable />
        </div>
      </div>
    </div>
  );
}

function MonitoringTable() {
  const participantsMap = useMonitoringStore((state) => state.participants);
  const participantIds = Object.keys(participantsMap);

  return (
    <table className="table table-bordered table-hover table-striped align-middle">
      <thead className="table-light">
        <tr>
          <th>Nama</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Sisa Waktu</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {participantIds.map((id) => (
          <MonitoringRow key={id} id={id} />
        ))}
        {participantIds.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center text-muted py-3">
              Tidak ada peserta.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// Separate component for granular rendering
function MonitoringRow({ id }: { id: string }) {
  const participant = useMonitoringStore((state) => state.participants[id]);

  if (!participant) return null;

  const handleForceSubmit = () => {
    if (confirm(`Anda yakin ingin Force Submit untuk ${participant.name}?`)) {
      const socket = socketClient.getSocket();
      if (socket) {
        socket.emit('admin:force_submit', { participantId: id });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'secondary';
      case 'finished':
        return 'primary';
      case 'paused':
        return 'warning';
      default:
        return 'light';
    }
  };

  return (
    <tr>
      <td className="fw-semibold">{participant.name}</td>
      <td>
        <span className={`badge bg-${getStatusBadge(participant.status)}`}>
          {participant.status.toUpperCase()}
        </span>
      </td>
      <td>
        <div className="d-flex align-items-center gap-2">
          <div className="progress w-100" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: `${participant.progress}%` }}
              aria-valuenow={participant.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
          <span className="small">{participant.progress}%</span>
        </div>
      </td>
      <td>{Math.floor(participant.timeRemaining / 60)} Menit</td>
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
}
