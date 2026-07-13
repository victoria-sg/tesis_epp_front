import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "../constants/authServiceConstants";
import { TOKEN_KEY } from "../constants/authStorageConstants";
import { SIO_NAMESPACE_ALERTAS } from "../constants/socketEvents";

const SIO_URL = API_BASE_URL;

class SocketClientService {
  private socket: Socket | null = null;
  private alertasSocket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return this.socket;

    const token = localStorage.getItem(TOKEN_KEY) || "";
    this.socket = io(SIO_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: Infinity,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
    });

    return this.socket;
  }

  connectAlertas() {
    if (this.alertasSocket?.connected) return this.alertasSocket;

    const token = localStorage.getItem(TOKEN_KEY) || "";
    this.alertasSocket = io(`${SIO_URL}${SIO_NAMESPACE_ALERTAS}`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: Infinity,
      transports: ["websocket", "polling"],
    });

    this.alertasSocket.on("connect_error", (err) => {
      console.error("Socket.IO /alertas connection error:", err.message);
    });

    return this.alertasSocket;
  }

  getSocket(): Socket | null {
    return this.socket ?? null;
  }

  getAlertasSocket(): Socket | null {
    return this.alertasSocket ?? null;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.alertasSocket) {
      this.alertasSocket.disconnect();
      this.alertasSocket = null;
    }
  }
}

export const socketClient = new SocketClientService();
