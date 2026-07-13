import { useEffect, useRef, useState } from "react";
import { useStreamContext } from "../context/useStreamContext";

interface UseVideoStreamOptions {
  camaraId: number;
  source?: "rtsp" | "fallback" | "view";
  
  readonly?: boolean;
}

export const useVideoStream = ({
  camaraId,
  source = "rtsp",
  readonly = false,
}: UseVideoStreamOptions) => {
  const { frames, subscribeCamera, unsubscribeCamera } = useStreamContext();

  const currentFrame = frames[camaraId] ?? null;
  const lastFrameRef = useRef(0);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    if (readonly) return;
    subscribeCamera(camaraId, source === "view" ? "view" : "rtsp");
    return () => {
      unsubscribeCamera(camaraId);
    };
  }, [camaraId, source, readonly, subscribeCamera, unsubscribeCamera]);

  useEffect(() => {
    if (currentFrame) {
      console.log(`[VIDEOSTREAM] frame recibido camara=${camaraId} ts=${Date.now()}`);
      lastFrameRef.current = Date.now();
      setStreamActive(true);
    }
  }, [currentFrame, camaraId]);

  useEffect(() => {
    if (!currentFrame) return;
    const id = setInterval(() => {
      const diff = Date.now() - lastFrameRef.current;
      if (diff > 8000) {
        console.log(`[VIDEOSTREAM] sin frame >8s camara=${camaraId} diff=${diff}ms`);
        setStreamActive(false);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [currentFrame, camaraId]);

  const status = !currentFrame ? "connecting" : streamActive ? "connected" : "disconnected";

  console.log(`[VIDEOSTREAM] camara=${camaraId} status=${status} has_frame=${!!currentFrame} streamActive=${streamActive}`);

  return { currentFrame, status };
};
