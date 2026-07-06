import { create } from 'zustand';

export type ParticipantStatus = 'online' | 'offline' | 'finished' | 'paused';

export interface CategoryScore {
  score: number;
  answered: number;
  total: number;
}

export interface Participant {
  id: string;
  user_exam_id: string;
  name: string;
  progress: number; // percentage or answered count
  status: ParticipantStatus;
  timeRemaining: number;
  categories?: {
    TWK?: CategoryScore;
    TKP?: CategoryScore;
    TIU?: CategoryScore;
  };
  totalScore?: number;
}

interface MonitoringState {
  serverTime: number;
  participants: Record<string, Participant>;
  changeFlags: Record<string, { scoreChanged: boolean; statusChanged: boolean; timeChanged: boolean }>;
  userIdToStudentId: Record<string, string>;
  setServerTime: (time: number) => void;
  setParticipants: (participants: Participant[]) => void;
  setUserIdToStudentId: (mapping: Record<string, string>) => void;
  updateParticipantsBatch: (updates: Record<string, Partial<Participant>>) => void;
  clearChangeFlag: (id: string) => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  serverTime: Date.now(),
  participants: {},
  changeFlags: {},
  userIdToStudentId: {},
  setServerTime: (time) => set({ serverTime: time }),
  setUserIdToStudentId: (mapping) => set({ userIdToStudentId: mapping }),
  setParticipants: (participantsList) => {
    const participantsMap: Record<string, Participant> = {};
    participantsList.forEach((p) => {
      participantsMap[p.id] = p;
    });
    set({ participants: participantsMap });
  },
  updateParticipantsBatch: (updates) =>
    set((state) => {
      const newParticipants = { ...state.participants };
      const newChangeFlags = { ...state.changeFlags };
      let hasChanges = false;

      for (const id in updates) {
        const normalizedId = state.userIdToStudentId[id] || id;
        const prev = newParticipants[normalizedId];
        const update = updates[id];
        
        if (prev) {
          // DETEKSI: partial update (hanya time+status dari heartbeat) vs full update (dari batch sync)
          const isPartialUpdate = 
            update.categories === undefined && 
            update.totalScore === undefined;
          
          // Deteksi perubahan SEBELUM merge
          const scoreChanged = update.totalScore !== undefined && update.totalScore !== prev.totalScore;
          const statusChanged = update.status !== undefined && update.status !== prev.status;
          const timeChanged = update.timeRemaining !== undefined && update.timeRemaining !== prev.timeRemaining;
          
          if (isPartialUpdate && prev.categories) {
            // Partial update (heartbeat): hanya update time & status
            // PERTAHANKAN categories & totalScore dari data sebelumnya
            const { categories, totalScore, ...restUpdate } = update;
            newParticipants[normalizedId] = { ...prev, ...restUpdate };
          } else {
            // Full update (batch sync / API refresh): update semua
            newParticipants[normalizedId] = { ...prev, ...update };
          }
          
          if (scoreChanged || statusChanged || timeChanged) {
            newChangeFlags[normalizedId] = { scoreChanged, statusChanged, timeChanged };
          }
          hasChanges = true;
        } else {
          // Participant baru
          const { ...rest } = updates[id];
          newParticipants[normalizedId] = {
            id: normalizedId,
            user_exam_id: rest.user_exam_id || '',
            name: rest.name || 'Loading...',
            progress: 0,
            status: 'online',
            timeRemaining: 0,
            ...rest,
          } as Participant;
          hasChanges = true;
        }
      }

      return hasChanges 
        ? { participants: newParticipants, changeFlags: newChangeFlags }
        : state;
    }),
  clearChangeFlag: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.changeFlags;
      return { changeFlags: rest };
    }),
}));

// Normalize user_id → student_id for socket updates
export const normalizeParticipantId = (id: string): string => {
  const state = useMonitoringStore.getState();
  return state.userIdToStudentId[id] || id;
};

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
  updateBuffer = {}; // Clear buffer agar data antar ujian tidak tercampur
};

export const queueParticipantUpdate = (id: string, update: Partial<Participant>) => {
  const normalizedId = normalizeParticipantId(id);
  updateBuffer[normalizedId] = { ...updateBuffer[normalizedId], ...update };
};
