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
    participantsList.forEach((p) => {
      participantsMap[p.id] = p;
    });
    set({ participants: participantsMap });
  },
  updateParticipantsBatch: (updates) =>
    set((state) => {
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
