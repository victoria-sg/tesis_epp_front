import { useRef, useState, useEffect, useCallback } from "react";
import { Upload, Play, Pause, Scan, AlertTriangle, CheckCircle2, XCircle, User, RotateCcw } from "lucide-react";
import { getColorForClass, translateClass } from "../../utils/detectionColors";
import { useSocket } from "../../hooks/useSocket";
import {
  SIO_EVENT_DETECCION_FRAME,
  SIO_EVENT_DETECCION_RESULT,
} from "../../constants/socketEvents";

interface DeteccionWsItem {
  clase: string;
  confianza: number;
  caja: number[];
  color: number[];
}

interface TrabajadorWs {
  id: number;
  casco: string;
  vestimenta_de_seguridad: string;
  mascarilla: string;
  guantes: string;
  botas: string;
  orejera: string;
  gafas_protectoras: string;
  bbox: number[];
  [key: string]: unknown;
}

interface WsResult {
  ok: boolean;
  data?: {
    detecciones: DeteccionWsItem[];
    trabajadores: TrabajadorWs[];
    infraccion: boolean;
    personas_detectadas: number;
  };
  msg?: string;
}

export const CargadorDeteccionVideo = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confianza, setConfianza] = useState(0.5);
  const [iou, setIou] = useState(0.45);
  const [fps, setFps] = useState(5);
  const [frameSkip, setFrameSkip] = useState(2);
  const [lastResult, setLastResult] = useState<WsResult["data"] | null>(null);
  const [totalStats, setTotalStats] = useState({ personas: 0, eppOk: 0, alertas: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  const drawPreviewOverlay = (detecciones: DeteccionWsItem[]) => {
    const canvas = previewCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const det of detecciones) {
      const [x1, y1, x2, y2] = det.caja;
      const color = getColorForClass(det.clase);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, Math.min(canvas.width, canvas.height) / 300);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      const label = `${translateClass(det.clase)} ${(det.confianza * 100).toFixed(0)}%`;
      ctx.font = `bold ${Math.max(12, Math.min(canvas.width, canvas.height) / 50)}px sans-serif`;
      const textMetrics = ctx.measureText(label);
      const textH = Math.max(18, Math.min(canvas.width, canvas.height) / 40);
      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textH, textMetrics.width + 12, textH);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x1 + 6, y1 - 4);
    }
  };

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleResult = (msg: WsResult) => {
      if (msg.ok && msg.data) {
        setLastResult(msg.data);
        setTotalStats((prev) => ({
          personas: Math.max(prev.personas, msg.data!.personas_detectadas),
          eppOk: prev.eppOk + msg.data!.detecciones.filter((d) => !d.clase.startsWith("NO-") && d.clase !== "Persona").length,
          alertas: prev.alertas + msg.data!.detecciones.filter((d) => d.clase.startsWith("NO-")).length,
        }));
        drawPreviewOverlay(msg.data.detecciones);
      }
      setLoading(false);
    };

    socket.on(SIO_EVENT_DETECCION_RESULT, handleResult);
    return () => { socket.off(SIO_EVENT_DETECCION_RESULT, handleResult); };
  }, [socket]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setPlaying(false);
    setProgress(0);
    setLastResult(null);
    setTotalStats({ personas: 0, eppOk: 0, alertas: 0 });
    frameCountRef.current = 0;
  };

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!video || !hiddenCanvas || !socket?.connected) return;

    const now = performance.now();
    const interval = 1000 / fps;
    if (now - lastFrameTimeRef.current < interval) return;
    lastFrameTimeRef.current = now;

    frameCountRef.current += 1;
    if (frameCountRef.current % frameSkip !== 0) return;

    hiddenCanvas.width = video.videoWidth || 640;
    hiddenCanvas.height = video.videoHeight || 480;
    const ctx = hiddenCanvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
    const base64 = hiddenCanvas.toDataURL("image/jpeg", 0.85);

    setLoading(true);
    socket.emit(SIO_EVENT_DETECCION_FRAME, { frame: base64, confianza, iou });
  }, [socket, confianza, iou, fps, frameSkip]);

  const loopRef = useRef<() => void>(null!);
  const loop = useCallback(() => {
    if (!playing) return;
    processFrame();
    animationRef.current = requestAnimationFrame(loopRef.current);
  }, [playing, processFrame]);

  useEffect(() => {
    loopRef.current = loop;
  });

  useEffect(() => {
    if (playing) {
      videoRef.current?.play();
      animationRef.current = requestAnimationFrame(loop);
    } else {
      videoRef.current?.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [playing, loop]);

  const togglePlay = () => {
    if (!videoUrl) return;
    setPlaying((p) => !p);
  };

  const handleReset = () => {
    setPlaying(false);
    setVideoUrl(null);
    setLastResult(null);
    setTotalStats({ personas: 0, eppOk: 0, alertas: 0 });
    setProgress(0);
    frameCountRef.current = 0;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleVideoEnded = () => {
    setPlaying(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {!videoUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#d4d4d4] hover:border-violet-400 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#fafafa] hover:bg-violet-50/30"
            >
              <Upload size={32} className="text-[#9b9b9b] mb-3" />
              <p className="text-sm font-medium text-[#1a1a1a]">Haz clic para subir un video</p>
              <p className="text-xs text-[#9b9b9b] mt-1">MP4, WEBM • Máx. 100 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-[#e5e5e5] bg-black aspect-video">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleVideoTimeUpdate}
                  onEnded={handleVideoEnded}
                  playsInline
                  muted
                />
                <canvas
                  ref={previewCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
                {loading && (
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md animate-pulse">
                    Procesando...
                  </div>
                )}
              </div>
              <div className="w-full bg-[#e5e5e5] rounded-full h-1.5">
                <div
                  className="bg-violet-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="h-9 w-9 rounded-md bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors"
                >
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={handleReset}
                  className="h-9 w-9 rounded-md border border-[#d4d4d4] text-[#6b6b6b] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                  title="Reiniciar"
                >
                  <RotateCcw size={14} />
                </button>
                <span className="text-xs text-[#6b6b6b] ml-1">
                  {playing ? "En reproducción" : "Pausado"}
                </span>
              </div>
            </div>
          )}

          <canvas ref={hiddenCanvasRef} className="hidden" />
        </div>

        <div className="space-y-4">
          <div className="bg-[#f5f5f5] rounded-lg p-4 space-y-4">
            <h4 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">Parámetros</h4>
            <div>
              <div className="flex justify-between text-xs font-medium text-[#6b6b6b] mb-1">
                <span>Confianza mínima</span>
                <span>{confianza.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.95}
                step={0.05}
                value={confianza}
                onChange={(e) => setConfianza(parseFloat(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-[#6b6b6b] mb-1">
                <span>IoU máximo</span>
                <span>{iou.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={iou}
                onChange={(e) => setIou(parseFloat(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-[#6b6b6b] mb-1">
                <span>FPS de envío</span>
                <span>{fps}</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-[#6b6b6b] mb-1">
                <span>Frame skip</span>
                <span>{frameSkip}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={frameSkip}
                onChange={(e) => setFrameSkip(parseInt(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e5e5] p-4">
            <h4 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider mb-3">Estadísticas acumuladas</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Máx. personas</span>
                <span className="font-semibold text-violet-700">{totalStats.personas}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">EPP correcto</span>
                <span className="font-semibold text-green-600">{totalStats.eppOk}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Alertas</span>
                <span className="font-semibold text-red-500">{totalStats.alertas}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lastResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-[#e5e5e5] p-4">
            <h3 className="text-sm font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <Scan size={16} className="text-violet-500" />
              Último frame analizado
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#f5f5f5] rounded-md p-3 text-center">
                <div className="text-xl font-bold text-violet-700">{lastResult.personas_detectadas}</div>
                <div className="text-xs text-[#6b6b6b]">Personas</div>
              </div>
              <div className="bg-[#f5f5f5] rounded-md p-3 text-center">
                <div className="text-xl font-bold text-green-600">
                  {lastResult.detecciones.filter((d) => !d.clase.startsWith("NO-") && d.clase !== "Persona").length}
                </div>
                <div className="text-xs text-[#6b6b6b]">EPP correcto</div>
              </div>
              <div className="bg-[#f5f5f5] rounded-md p-3 text-center">
                <div className="text-xl font-bold text-red-500">
                  {lastResult.detecciones.filter((d) => d.clase.startsWith("NO-")).length}
                </div>
                <div className="text-xs text-[#6b6b6b]">Alertas</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e5e5] p-4">
            <h3 className="text-sm font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              Cumplimiento por trabajador
            </h3>
            {lastResult.trabajadores.length === 0 ? (
              <p className="text-xs text-[#9b9b9b]">No se detectaron trabajadores en el último frame</p>
            ) : (
              <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[#6b6b6b] border-b border-[#e5e5e5]">
                          <th className="pb-2 font-medium">#</th>
                          <th className="pb-2 font-medium">Casco</th>
                          <th className="pb-2 font-medium">Vestimenta</th>
                          <th className="pb-2 font-medium">Mascarilla</th>
                          <th className="pb-2 font-medium">Guantes</th>
                          <th className="pb-2 font-medium">Botas</th>
                          <th className="pb-2 font-medium">Orejera</th>
                          <th className="pb-2 font-medium">Gafas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lastResult.trabajadores.map((t) => (
                          <tr key={t.id} className="border-b border-[#f0f0f0]">
                            <td className="py-2 font-semibold">{t.id}</td>
                            <td className="py-2">
                              <StatusBadge status={t.casco} />
                            </td>
                            <td className="py-2">
                              <StatusBadge status={t.vestimenta_de_seguridad} />
                            </td>
                            <td className="py-2">
                              <StatusBadge status={t.mascarilla} />
                            </td>
                            <td className="py-2">
                              <StatusBadge status={t.guantes} />
                            </td>
                            <td className="py-2">
                              <StatusBadge status={t.botas} />
                            </td>
                            <td className="py-2">
                              <StatusBadge status={t.orejera} />
                            </td>
                            <td className="py-2">
                              <StatusBadge status={t.gafas_protectoras} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function StatusBadge({ status }: { status: string }) {
  if (status === "OK")
    return (
      <span className="inline-flex items-center gap-1 text-green-600 font-medium">
        <CheckCircle2 size={12} /> OK
      </span>
    );
  if (status === "Falta")
    return (
      <span className="inline-flex items-center gap-1 text-red-500 font-medium">
        <XCircle size={12} /> Falta
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[#9b9b9b] font-medium">
      <AlertTriangle size={12} /> No detectado
    </span>
  );
}
