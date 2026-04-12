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
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    this.socket = io(apiUrl + namespace, {
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
