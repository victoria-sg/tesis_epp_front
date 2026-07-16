import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, Check, RefreshCw, Square } from "lucide-react";
import { capturarIncidencia } from "../../services/alerta.service";
import { SIO_EVENT_SEND_FRAME } from "../../constants/socketEvents";
import { useSocket } from "../../hooks/useSocket";

interface PhoneCameraFeedProps {
  camaraId?: number;
  label?: string;
  className?: string;
  onStreamChange?: (active: boolean) => void;
}

export const TransmisionCamaraTelefono = ({
  camaraId,
  label = "Teléfono",
  className = "",
  onStreamChange,
}: PhoneCameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isActiveRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [capturando, setCapturando] = useState(false);
  const [capturaExito, setCapturaExito] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { socket, online, socketError, reconectar } = useSocket();

  const capturarFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !ctxRef.current) return;
    if (camaraId === undefined) return;

    setCapturando(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame_base64 = canvas.toDataURL("image/jpeg", 0.9);

      await capturarIncidencia({
        id_camara: camaraId,
        frame_base64,
        descripcion: "Incidencia capturada manualmente desde teléfono",
      });

      setCapturaExito(true);
      setTimeout(() => setCapturaExito(false), 3000);
    } catch {
      setError("No se pudo guardar la captura. Intenta de nuevo.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setCapturando(false);
    }
  }, [camaraId]);

  const startStreaming = useCallback(async () => {
    setError(null);
    setWsStatus("connecting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Este navegador no soporta acceso a cámara.");
      }

      const isLandscape = window.innerWidth > window.innerHeight;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: isLandscape ? 1280 : 720 },
          height: { ideal: isLandscape ? 720 : 1280 },
          facingMode: "environment",
        },
        audio: false,
      });

      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;

      if (!socket?.connected) {
        throw new Error("No se pudo conectar al servidor");
      }
      setWsStatus("connected");

      const video = videoRef.current!;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvasRef.current = canvas;
      ctxRef.current = ctx;

      let enviando = false;

      const captureFrame = () => {
        if (!socket.connected) return;
        if (enviando) return;

        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        canvas.width = Math.round(vw / 2);
        canvas.height = Math.round(vh / 2);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        enviando = true;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                socket.emit(SIO_EVENT_SEND_FRAME, { camara_id: camaraId, frame: reader.result });
                enviando = false;
              };
              reader.readAsDataURL(blob);
            } else {
              enviando = false;
            }
          },
          "image/jpeg",
          0.5,
        );
      };

      captureTimerRef.current = setInterval(captureFrame, 250);
      isActiveRef.current = true;
      setIsActive(true);
      onStreamChange?.(true);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      setWsStatus("disconnected");
    }
  }, [socket, onStreamChange, camaraId]);

  const stopStreaming = useCallback(() => {
    isActiveRef.current = false;
    if (captureTimerRef.current) { clearInterval(captureTimerRef.current); captureTimerRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    canvasRef.current = null;
    ctxRef.current = null;
    setIsActive(false);
    setWsStatus("disconnected");
    setError(null);
    onStreamChange?.(false);
  }, [onStreamChange]);

  useEffect(() => {
    return () => {
      if (isActiveRef.current) stopStreaming();
    };
  }, [stopStreaming]);

  const needsSocket = !isActive && !online;
  const showReconnect = needsSocket && socketError;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${className}`}
      style={{ touchAction: "none" }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {!isActive && !error && !showReconnect && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-gray-400 gap-6 px-6 pb-24">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
            <Camera size={32} className="text-gray-500" />
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-semibold mb-1">Cámara lista para transmitir</p>
            <p className="text-gray-500 text-xs">Presiona el botón de abajo para iniciar</p>
          </div>
        </div>
      )}

      {showReconnect && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 gap-4 px-8">
          <AlertTriangle size={28} className="text-yellow-400" />
          <p className="text-white text-sm font-semibold text-center">
            Sin conexión al servidor
          </p>
          <p className="text-zinc-400 text-xs text-center leading-relaxed max-w-xs">
            {socketError}
          </p>
          <button
            onClick={reconectar}
            className="flex items-center gap-2 mt-2 h-10 px-5 rounded-full bg-blue-600 text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            <RefreshCw size={16} />
            Reintentar conexión
          </button>
        </div>
      )}

      {needsSocket && !socketError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95">
          <div className="flex flex-col items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-zinc-400 text-sm">Conectando al servidor...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-x-4 top-16 text-white text-sm px-4 py-3 rounded-lg bg-red-600/90 leading-relaxed flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {capturaExito && (
        <div className="absolute inset-x-4 top-16 text-white text-sm px-4 py-3 rounded-lg bg-green-600/90 leading-relaxed text-center flex items-center justify-center gap-2">
          <Check size={16} /> Incidencia registrada correctamente
        </div>
      )}

      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${
          wsStatus === "connected" && isActive ? "bg-green-500 animate-pulse"
          : wsStatus === "connecting" ? "bg-yellow-500"
          : online ? "bg-green-500"
          : "bg-gray-500"
        }`} />
        <span className="text-white text-[11px] font-medium bg-black/50 px-2 py-0.5 rounded">
          {label}
        </span>
        {!online && !isActive && (
          <span className="text-yellow-400 text-[10px] font-medium bg-black/50 px-2 py-0.5 rounded ml-1">
            sin servidor
          </span>
        )}
      </div>

      <div
        className="absolute left-0 right-0 flex items-center justify-center gap-5"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 64px)" }}
      >
        {isActive ? (
          <>
            <button
              onClick={capturarFrame}
              disabled={capturando || camaraId === undefined}
              className="w-14 h-14 rounded-full bg-yellow-500/90 disabled:bg-gray-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              title="Capturar incidencia"
            >
              {capturando
                ? <span className="text-[10px] font-bold">...</span>
                : <AlertTriangle size={24} />
              }
            </button>
            <button
              onClick={stopStreaming}
              className="w-12 h-12 rounded-full bg-red-600/70 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Square size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={startStreaming}
            disabled={wsStatus === "connecting" || !online}
            className="w-16 h-16 rounded-full bg-blue-600/90 disabled:bg-gray-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            {wsStatus === "connecting"
              ? <span className="text-[10px] font-bold">...</span>
              : <Camera size={32} />
            }
          </button>
        )}
      </div>

      {isActive && (
        <div
          className="absolute left-0 right-0 flex justify-center gap-12"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 36px)" }}
        >
          <span className="text-[9px] text-yellow-400/70">Incidencia</span>
          <span className="text-[9px] text-red-400/70">Detener</span>
        </div>
      )}
    </div>
  );
};
