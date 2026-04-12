# WebSocket Monitoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real-time exam monitoring for admins using Socket.io and Zustand with throttled batch updates.

**Architecture:** We use a singleton Socket.io client to listen for participant progress updates. To prevent React UI freezing, incoming updates are buffered and flushed to a Zustand store every 1 second. The monitoring table components will subscribe to specific rows using Zustand selectors to minimize re-renders.

**Tech Stack:** React, TanStack Router, Zustand, Socket.io-client, Vite

---

### Task 1: Setup Singleton Socket Client

**Files:**
- Create: `src/lib/socket-client.ts`

- [ ] **Step 1: Implement the Socket Client**

```typescript
import { io, Socket } from 'socket.io-client';
import { getCookie } from './token-handler'; // Assuming you have a token handler

class SocketClient {
  private socket: Socket | null = null;
  private static instance: SocketClient;

  private constructor() {}

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  public connect(namespace: string = '/admin') {
    if (this.socket?.connected) return this.socket;

    const token = getCookie('token');
    
    this.socket = io(import.meta.env.VITE_API_URL + namespace, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketClient = SocketClient.getInstance();
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/socket-client.ts
git commit -m "feat: setup singleton socket.io client"
```

### Task 2: Create Throttled Zustand Store

**Files:**
- Create: `src/store/useMonitoringStore.ts`

- [ ] **Step 1: Implement the Zustand Store with Buffering**

```typescript
import { create } from 'zustand';

export type ParticipantStatus = 'online' | 'offline' | 'finished' | 'paused';

export interface Participant {
  id: string;
  name: string;
  progress: number; // percentage or answered count
  status: ParticipantStatus;
  timeRemaining: number;
}

interface MonitoringState {
  serverTime: number;
  participants: Record<string, Participant>;
  setServerTime: (time: number) => void;
  setParticipants: (participants: Participant[]) => void;
  updateParticipantsBatch: (updates: Record<string, Partial<Participant>>) => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  serverTime: Date.now(),
  participants: {},
  setServerTime: (time) => set({ serverTime: time }),
  setParticipants: (participantsList) => {
    const participantsMap: Record<string, Participant> = {};
    participantsList.forEach(p => {
      participantsMap[p.id] = p;
    });
    set({ participants: participantsMap });
  },
  updateParticipantsBatch: (updates) => set((state) => {
    const newParticipants = { ...state.participants };
    let hasChanges = false;
    
    for (const id in updates) {
      if (newParticipants[id]) {
        newParticipants[id] = { ...newParticipants[id], ...updates[id] };
        hasChanges = true;
      }
    }
    
    return hasChanges ? { participants: newParticipants } : state;
  }),
}));

// Buffer for incoming socket updates
let updateBuffer: Record<string, Partial<Participant>> = {};
let flushInterval: ReturnType<typeof setInterval> | null = null;

export const startMonitoringBuffer = () => {
  if (flushInterval) return;
  flushInterval = setInterval(() => {
    if (Object.keys(updateBuffer).length > 0) {
      useMonitoringStore.getState().updateParticipantsBatch(updateBuffer);
      updateBuffer = {}; // clear buffer
    }
  }, 1000); // Flush every 1 second
};

export const stopMonitoringBuffer = () => {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
};

export const queueParticipantUpdate = (id: string, update: Partial<Participant>) => {
  updateBuffer[id] = { ...updateBuffer[id], ...update };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/store/useMonitoringStore.ts
git commit -m "feat: create throttled monitoring zustand store"
```

### Task 3: Create Exam Monitoring Details Route

**Files:**
- Create: `src/routes/admin/exam/exam-monitoring.$examId.tsx`

- [ ] **Step 1: Create the basic layout for specific exam monitoring**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { socketClient } from '@/lib/socket-client';
import { startMonitoringBuffer, stopMonitoringBuffer, queueParticipantUpdate, useMonitoringStore } from '@/store/useMonitoringStore';

export const Route = createFileRoute('/admin/exam/exam-monitoring/$examId')({
  component: ExamMonitoringDetail,
});

function ExamMonitoringDetail() {
  const { examId } = Route.useParams();
  const setParticipants = useMonitoringStore(state => state.setParticipants);
  const setServerTime = useMonitoringStore(state => state.setServerTime);

  useEffect(() => {
    // 1. Fetch initial data (mocked for now, should be REST API)
    setParticipants([
      { id: '1', name: 'Student A', progress: 0, status: 'offline', timeRemaining: 3600 },
      { id: '2', name: 'Student B', progress: 50, status: 'online', timeRemaining: 1800 },
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
      <div className="card-header">
        <h5 className="card-title">Live Monitoring - Exam {examId}</h5>
      </div>
      <div className="card-body">
        <MonitoringTable />
      </div>
    </div>
  );
}

function MonitoringTable() {
  const participantsMap = useMonitoringStore(state => state.participants);
  const participantIds = Object.keys(participantsMap);

  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Time Remaining</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {participantIds.map(id => (
          <MonitoringRow key={id} id={id} />
        ))}
      </tbody>
    </table>
  );
}

// Separate component for granular rendering
function MonitoringRow({ id }: { id: string }) {
  const participant = useMonitoringStore(state => state.participants[id]);
  
  if (!participant) return null;

  const handleForceSubmit = () => {
    const socket = socketClient.getSocket();
    if (socket) {
      socket.emit('admin:force_submit', { participantId: id });
    }
  };

  return (
    <tr>
      <td>{participant.name}</td>
      <td>
        <span className={`badge bg-${participant.status === 'online' ? 'success' : 'secondary'}`}>
          {participant.status}
        </span>
      </td>
      <td>{participant.progress}%</td>
      <td>{Math.floor(participant.timeRemaining / 60)} mins</td>
      <td>
        <button onClick={handleForceSubmit} className="btn btn-sm btn-danger">
          Force Submit
        </button>
      </td>
    </tr>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/admin/exam/exam-monitoring.\$examId.tsx
git commit -m "feat: create live monitoring page with optimized granular rendering"
```

### Task 4: Link from Exam List to Details

**Files:**
- Modify: `src/routes/admin/exam/exam-monitoring.tsx`

- [ ] **Step 1: Add Link to the details button**

Modify `src/routes/admin/exam/exam-monitoring.tsx` to add `Link` wrapping the "Detail" button.

*Note: Since the mock data doesn't have an ID, we'll add an ID to the mock data and use it in the Link.*

```tsx
import { Link } from '@tanstack/react-router'
// ... existing imports ...

type StudentGroupDataType = {
  id: string // ADD ID
  name: string
  date: string
  startTime: string
  endTime: string
  status: string
}

function RouteComponent() {
  // ...
  const data: StudentGroupDataType[] = [
    {
      id: 'exam-1', // ADD ID
      name: 'Ujian CPNS Batch 1',
      // ...
    }
  ]

  const columns: ColumnDef<StudentGroupDataType>[] = [
    // ...
    {
      header: 'Aksi',
      cell: (v) => (
        <div className="d-flex align-items-center gap-2">
          <Link
            to={`/admin/exam/exam-monitoring/${v.row.original.id}`}
            className="btn btn-md px-3 rounded-1 btn-primary d-flex gap-2 align-items-center"
          >
            <IconEye size={18} /> Detail
          </Link>
        </div>
      ),
    },
  ]
  // ...
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/admin/exam/exam-monitoring.tsx
git commit -m "feat: link monitoring list to detail page"
```
