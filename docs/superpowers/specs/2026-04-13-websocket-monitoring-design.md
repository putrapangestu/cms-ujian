# WebSocket Monitoring Architecture Design
**Date**: 2026-04-13
**Topic**: Real-time Exam Monitoring & Remote Control via WebSockets

## 1. Overview
The `cms-ujian` (admin dashboard) needs to monitor exam participants in real-time. Key features include live progress updates, remote commands (force submit, kick, pause), and synchronized server time. 
Given the scale of 100-1000 concurrent participants, a direct state update per socket event would cause severe UI lag. This design proposes a **Throttled Batch Update** approach using Socket.io and Zustand.

## 2. Architecture & Data Flow
- **Singleton Socket Client**: A single `Socket` instance is created at `src/lib/socket-client.ts`. It connects once upon authentication and stays alive across route navigations.
- **Local Memory Buffer**: Instead of dispatching directly to React state or Zustand, incoming progress events (`exam:progress_update`) are written to a plain JavaScript `Map` or `Record` object acting as a buffer.
- **Throttled Dispatcher**: A recurring timer (`setInterval` at 1000ms) or a throttled function reads the buffer. If there are pending updates, it pushes them to the Zustand store in one batched update and clears the buffer.
- **Zustand Store**: `src/store/useMonitoringStore.ts` stores the list of participants and their current statuses.

## 3. UI Optimization (Frontend Mastery Principles)
- **Granular Subscriptions**: The Participant Table (`MonitoringTable`) maps over the student IDs. Each `MonitoringRow` component subscribes only to its specific student data using a Zustand selector (e.g., `useMonitoringStore(state => state.participants[id])`).
- **Render Minimization**: Due to the 1-second batching, the maximum render frequency of the table is 1 FPS, keeping the browser thread unblocked even under high server load. React `memo` is used for the row components to prevent re-rendering rows that did not receive updates in the latest batch.

## 4. Remote Control (Admin -> Participant)
- **Action Triggers**: When an admin triggers a command (e.g., "Force Submit"), the CMS will emit a socket event:
  `socket.emit('admin:force_submit', { participantId: 123, examId: 456 })`
  (Alternatively, this can be done via a REST API endpoint if server architecture requires HTTP validation first, but Socket.io `emit` is preferred for consistency in real-time modules).
- **Feedback Loop**: The server processes the command and broadcasts the updated status back to the admin via the standard `exam:progress_update` event, closing the loop.

## 5. Time Synchronization
- **Server Tick**: The server emits a periodic `exam:tick` event containing the absolute server timestamp (e.g., `serverTime: 1713000000000`).
- **Store Sync**: The Zustand store saves this `serverTime`.
- **Timer Components**: All client-side countdowns use `endTime - serverTime` instead of `Date.now()`. This prevents participants or admins from seeing incorrect times due to local OS clock discrepancies.

## 6. Implementation Checklist
1. Create `src/lib/socket-client.ts` with singleton pattern.
2. Create `src/store/useMonitoringStore.ts` with buffer and throttling logic.
3. Update or create the `MonitoringTable` and `MonitoringRow` components to consume the Zustand store with selectors and `memo`.
4. Implement the Remote Control actions (Force Submit, Kick) in the UI, connected to the socket emit methods.
5. Integrate the `serverTime` state into existing or new Timer components.
