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
    const socketKey = import.meta.env.VITE_SOCKET_KEY || 'Wm9zN2pQeFh3c3RkR1lYcU1vRkR2a2x4V3N3b2xXb1h3eE1nPQ==';
    
    this.socket = io(socketUrl + namespace, {
      auth: { token },
      extraHeaders: {
        'x-socket-key': socketKey
      },
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
