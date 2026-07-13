import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "../constants/authServiceConstants";
import { TOKEN_KEY } from "../constants/authStorageConstants";
import { SIO_NAMESPACE_ALERTAS } from "../constants/socketEvents";

const SIO_URL = API_BASE_URL;

interface SocketContextType {
  online: boolean;
  socket: Socket | null;
  alertasSocket: Socket | null;
  socketError: string | null;
  reconectar: () => void;
}

export const SocketContext = createContext<SocketContextType>({
  online: false,
  socket: null,
  alertasSocket: null,
  socketError: null,
  reconectar: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [online, setOnline] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [alertasSocket, setAlertasSocket] = useState<Socket | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const lastTokenRef = useRef(localStorage.getItem(TOKEN_KEY) || "");

  const conectar = useCallback(() => {
    socketRef.current?.disconnect();
    const token = localStorage.getItem(TOKEN_KEY) || "";

    const s = io(SIO_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: Infinity,
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      setOnline(true);
      setSocketError(null);
    });
    s.on("disconnect", () => setOnline(false));
    s.on("connect_error", (err) => {
      setSocketError(err.message);
      setOnline(false);
    });

    socketRef.current = s;
    setSocket(s);

    const as = io(`${SIO_URL}${SIO_NAMESPACE_ALERTAS}`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: Infinity,
      transports: ["websocket", "polling"],
    });

    as.on("connect_error", () => {});
    setAlertasSocket(as);
  }, []);

  useEffect(() => {
    conectar();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setOnline(false);
    };
  }, [conectar]);

  useEffect(() => {
    const id = setInterval(() => {
      const current = localStorage.getItem(TOKEN_KEY) || "";
      if (current !== lastTokenRef.current) {
        lastTokenRef.current = current;
        conectar();
      }
    }, 2000);
    return () => clearInterval(id);
  }, [conectar]);

  const reconectar = useCallback(() => {
    conectar();
  }, [conectar]);

  const value = useMemo(
    () => ({ online, socket, alertasSocket, socketError, reconectar }),
    [online, socket, alertasSocket, socketError, reconectar],
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
