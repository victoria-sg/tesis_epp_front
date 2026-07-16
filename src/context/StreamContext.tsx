import { createContext, useCallback, useEffect, useRef, useState } from "react";

import { useSocket } from "../hooks/useSocket";
import {
  SIO_EVENT_FRAME,
  SIO_EVENT_SUBSCRIBE_CAMARA,
  SIO_EVENT_UNSUBSCRIBE_CAMARA,
} from "../constants/socketEvents";

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
  const subscribersRef = useRef<Map<number, number>>(new Map());
  const sourcesRef = useRef<Map<number, "rtsp" | "view">>(new Map());
  const closeTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const lastFrameTime = useRef<Map<number, number>>(new Map());

  const { socket, online } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleFrame = (payload: { camara_id: number; frame: string }) => {
      if (!payload || !payload.frame?.startsWith("data:image")) return;
      const { camara_id, frame } = payload;
      lastFrameTime.current.set(camara_id, Date.now());
      setFrames((prev) => ({ ...prev, [camara_id]: frame }));
    };

    socket.on(SIO_EVENT_FRAME, handleFrame);
    return () => { socket.off(SIO_EVENT_FRAME, handleFrame); };
  }, [socket]);

  useEffect(() => {
    if (!socket || !online) return;
    subscribersRef.current.forEach((count, camaraId) => {
      if (count > 0) {
        socket.emit(SIO_EVENT_SUBSCRIBE_CAMARA, {
          camara_id: camaraId,
          source: sourcesRef.current.get(camaraId) ?? "rtsp",
        });
      }
    });
  }, [socket, online]);

  const subscribeCamera = useCallback(
    (camaraId: number, source: "rtsp" | "view") => {
      const pending = closeTimers.current.get(camaraId);
      if (pending) {
        clearTimeout(pending);
        closeTimers.current.delete(camaraId);
      }

      const count = subscribersRef.current.get(camaraId) ?? 0;
      subscribersRef.current.set(camaraId, count + 1);
      sourcesRef.current.set(camaraId, source);

      if (count === 0 && socket?.connected) {
        socket.emit(SIO_EVENT_SUBSCRIBE_CAMARA, { camara_id: camaraId, source });
      }
    },
    [socket],
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
          sourcesRef.current.delete(camaraId);
          lastFrameTime.current.delete(camaraId);
          setFrames((prev) => {
            const updated = { ...prev };
            delete updated[camaraId];
            return updated;
          });
        }
        closeTimers.current.delete(camaraId);
      }, 60_000);

      closeTimers.current.set(camaraId, timer);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      const ahora = Date.now();
      subscribersRef.current.forEach((count, camaraId) => {
        if (count <= 0) return;
        const ultimo = lastFrameTime.current.get(camaraId) ?? 0;
        if (ultimo > 0 && ahora - ultimo > 25_000) {
          lastFrameTime.current.delete(camaraId);
          if (socket.connected) {
            socket.emit(SIO_EVENT_UNSUBSCRIBE_CAMARA, { camara_id: camaraId });
            socket.emit(SIO_EVENT_SUBSCRIBE_CAMARA, {
              camara_id: camaraId,
              source: sourcesRef.current.get(camaraId) ?? "rtsp",
            });
          }
        }
      });
    }, 15_000);

    return () => clearInterval(interval);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        subscribersRef.current.forEach((count, camaraId) => {
          if (count > 0 && socket.connected) {
            socket.emit(SIO_EVENT_SUBSCRIBE_CAMARA, {
              camara_id: camaraId,
              source: sourcesRef.current.get(camaraId) ?? "rtsp",
            });
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [socket]);

  useEffect(() => {
    return () => {
      closeTimers.current.forEach((t) => clearTimeout(t));
      closeTimers.current.clear();
    };
  }, []);

  return (
    <StreamContext.Provider value={{ frames, subscribeCamera, unsubscribeCamera }}>
      {children}
    </StreamContext.Provider>
  );
};
