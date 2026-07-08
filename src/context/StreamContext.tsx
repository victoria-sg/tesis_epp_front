import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/* eslint-disable react-refresh/only-export-components */
import { TOKEN_KEY } from "../constants/authStorageConstants";

interface StreamFrame {
  [camaraId: number]: string;
}

export interface StreamContextType {
  frames: StreamFrame;
  subscribeCamera: (camaraId: number, source: "rtsp" | "view") => void;
  unsubscribeCamera: (camaraId: number) => void;
}

export const StreamContext = createContext<StreamContextType>({
  frames: {},
  subscribeCamera: () => {},
  unsubscribeCamera: () => {},
});

export const StreamProvider = ({ children }: { children: React.ReactNode }) => {
  const [frames, setFrames] = useState<StreamFrame>({});
  const wsRefs = useRef<Map<number, WebSocket>>(new Map());
  const subscribersRef = useRef<Map<number, number>>(new Map());
  const sourceRef = useRef<Map<number, "rtsp" | "view">>(new Map());
  const closeTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const lastFrameTime = useRef<Map<number, number>>(new Map());
  const openConnectionRef = useRef<typeof openConnection>(null!);

  const openConnection = useCallback((camaraId: number, source: "rtsp" | "view") => {
    const existing = wsRefs.current.get(camaraId);
    if (existing) {
      if (
        existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING
      ) {
        return;
      }
      wsRefs.current.delete(camaraId);
    }

    const token = localStorage.getItem(TOKEN_KEY) || "";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url =
      source === "view"
        ? `${protocol}//${host}/stream/view/${camaraId}?token=${token}`
        : `${protocol}//${host}/stream/${camaraId}?token=${token}`;

    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      if (typeof event.data === "string" && event.data.startsWith("data:image")) {
        lastFrameTime.current.set(camaraId, Date.now());
        setFrames((prev) => ({ ...prev, [camaraId]: event.data }));
      }
    };

    ws.onclose = (event) => {
      wsRefs.current.delete(camaraId);
      if (
        event.code !== 1000 &&
        (subscribersRef.current.get(camaraId) ?? 0) > 0
      ) {
        setTimeout(
          () => openConnectionRef.current(camaraId, sourceRef.current.get(camaraId) ?? "rtsp"),
          3000,
        );
      }
    };

    ws.onerror = () => ws.close();

    wsRefs.current.set(camaraId, ws);
    sourceRef.current.set(camaraId, source);
    lastFrameTime.current.set(camaraId, Date.now());
  }, []);

  useEffect(() => {
    openConnectionRef.current = openConnection;
  });

  const subscribeCamera = useCallback(
    (camaraId: number, source: "rtsp" | "view") => {
      const pending = closeTimers.current.get(camaraId);
      if (pending) {
        clearTimeout(pending);
        closeTimers.current.delete(camaraId);
      }
      const count = subscribersRef.current.get(camaraId) ?? 0;
      subscribersRef.current.set(camaraId, count + 1);
      openConnection(camaraId, source);
    },
    [openConnection],
  );

  const unsubscribeCamera = useCallback((camaraId: number) => {
    const current = subscribersRef.current.get(camaraId) ?? 0;
    const next = Math.max(0, current - 1);
    subscribersRef.current.set(camaraId, next);

    if (next <= 0) {
      const existing = closeTimers.current.get(camaraId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        if ((subscribersRef.current.get(camaraId) ?? 0) <= 0) {
          subscribersRef.current.delete(camaraId);
          const ws = wsRefs.current.get(camaraId);
          if (ws) {
            ws.close(1000);
            wsRefs.current.delete(camaraId);
          }
          lastFrameTime.current.delete(camaraId);
          setFrames((prev) => {
            const next = { ...prev };
            delete next[camaraId];
            return next;
          });
        }
        closeTimers.current.delete(camaraId);
      }, 60_000);

      closeTimers.current.set(camaraId, timer);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        subscribersRef.current.forEach((count, camaraId) => {
          if (count > 0) {
            const source = sourceRef.current.get(camaraId) ?? "rtsp";
            const ws = wsRefs.current.get(camaraId);
            if (ws && ws.readyState !== WebSocket.OPEN) {
              try { ws.close(); } catch { /* noop */ }
              wsRefs.current.delete(camaraId);
            }
            openConnectionRef.current(camaraId, source);
          }
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [openConnection]);

  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = Date.now();
      subscribersRef.current.forEach((count, camaraId) => {
        if (count <= 0) return;
        const ultimo = lastFrameTime.current.get(camaraId) ?? 0;
        if (ultimo > 0 && ahora - ultimo > 20_000) {
          const source = sourceRef.current.get(camaraId) ?? "rtsp";
          const ws = wsRefs.current.get(camaraId);
          if (ws) {
            try { ws.close(); } catch { /* noop */ }
            wsRefs.current.delete(camaraId);
          }
          openConnectionRef.current(camaraId, source);
        }
      });
    }, 10_000);

    return () => clearInterval(interval);
  }, [openConnection]);

  useEffect(() => {
    const timers = closeTimers.current;
    const sockets = wsRefs.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      sockets.forEach((ws) => ws.close(1000));
      sockets.clear();
    };
  }, []);

  return (
    <StreamContext.Provider value={{ frames, subscribeCamera, unsubscribeCamera }}>
      {children}
    </StreamContext.Provider>
  );
};