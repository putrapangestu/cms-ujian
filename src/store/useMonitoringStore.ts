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
  setServerTime: (time: number) => void;
  setParticipants: (participants: Participant[]) => void;
  updateParticipantsBatch: (updates: Record<string, Partial<Participant>>) => void;
  clearChangeFlag: (id: string) => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  serverTime: Date.now(),
  participants: {},
  changeFlags: {},
  setServerTime: (time) => set({ serverTime: time }),
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
        const prev = newParticipants[id];
        const update = updates[id];
        
        if (prev) {
          // Deteksi perubahan
          const scoreChanged = update.totalScore !== undefined && update.totalScore !== prev.totalScore;
          const statusChanged = update.status !== undefined && update.status !== prev.status;
          const timeChanged = update.timeRemaining !== undefined && update.timeRemaining !== prev.timeRemaining;
          
          if (scoreChanged || statusChanged || timeChanged) {
            newChangeFlags[id] = { scoreChanged, statusChanged, timeChanged };
          }
          
          newParticipants[id] = { ...prev, ...update };
          hasChanges = true;
        } else {
          // Participant baru
          newParticipants[id] = {
            id,
            user_exam_id: updates[id].user_exam_id || '',
            name: updates[id].name || 'Loading...',
            progress: 0,
            status: 'online',
            timeRemaining: 0,
            ...updates[id],
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
