import { io, Socket } from 'socket.io-client';
import { getToken } from './token-handler';

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

    const token = getToken();
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://socket-ujian.hummatech.com';
    const socketKey = import.meta.env.VITE_SOCKET_KEY || '';
    
    this.socket = io(socketUrl + namespace, {
      auth: { 
        token: token,
        key: socketKey
      },
      query: {
        key: socketKey
      },
      extraHeaders: {
        'x-socket-key': socketKey
      },
      // M3: Tambah polling sebagai fallback jika WebSocket gagal
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
      reconnectionAttempts: Infinity,
      randomizationFactor: 0.5,
    });

    // M3: Global event listeners untuk reconnect handling
    this.socket.on('connect', () => {
      console.log('CMS Socket connected:', this.socket?.id);
      window.dispatchEvent(new CustomEvent('socket:connected', { 
        detail: { id: this.socket?.id } 
      }));
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('CMS Socket disconnected:', reason);
      window.dispatchEvent(new CustomEvent('socket:disconnected', { 
        detail: { reason } 
      }));
    });

    this.socket.on('connect_error', (err) => {
      console.error('CMS Socket connection error:', err.message);
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
