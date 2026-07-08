import {
  AlertTriangle,
  CheckCircle2,
  Scan,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  analizarImagen,
  type DeteccionResult,
} from "../services/deteccionService";
import { getColorForClass, translateClass } from "../utils/detectionColors";

export const ImageDetectionUploader = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultado, setResultado] = useState<DeteccionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confianza, setConfianza] = useState(0.5);
  const [iou, setIou] = useState(0.45);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResultado(null);
  };

  const handleAnalyze = async () => {
    if (!previewUrl) return;
    setLoading(true);
    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => (img.onload = resolve));
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL("image/jpeg", 0.9);
      const res = await analizarImagen(base64, confianza, iou);
      setResultado(res);
      drawOverlay(res, img.naturalWidth, img.naturalHeight);
    } catch (err) {
      console.error(err);
      alert("Error al analizar la imagen");
    } finally {
      setLoading(false);
    }
  };

  const drawOverlay = (res: DeteccionResult, w: number, h: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);

    // Dibujar detecciones
    for (const det of res.detecciones) {
      const [x1, y1, x2, y2] = det.caja;
      const color = getColorForClass(det.clase);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, Math.min(w, h) / 300);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      const label = `${translateClass(det.clase)} ${(det.confianza * 100).toFixed(0)}%`;
      ctx.font = `bold ${Math.max(12, Math.min(w, h) / 50)}px sans-serif`;
      const textMetrics = ctx.measureText(label);
      const textH = Math.max(18, Math.min(w, h) / 40);
      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textH, textMetrics.width + 12, textH);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x1 + 6, y1 - 4);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#d4d4d4] hover:border-violet-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#fafafa] hover:bg-violet-50/30"
          >
            <Upload size={32} className="text-[#9b9b9b] mb-3" />
            <p className="text-sm font-medium text-[#1a1a1a]">
              Haz clic para subir una imagen
            </p>
            <p className="text-xs text-[#9b9b9b] mt-1">JPG, PNG • Máx. 10 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-3 bg-[#f5f5f5] rounded-lg p-4">
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
            <button
              onClick={handleAnalyze}
              disabled={!previewUrl || loading}
              className="w-full flex items-center justify-center gap-2bg-linear-to-r from-violet-500 to-violet-700 text-white rounded-md py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Scan size={16} />
              {loading ? "Analizando..." : "Analizar imagen"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {previewUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-[#e5e5e5] bg-black">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-[500px] object-contain"
              />
              {resultado && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ objectFit: "contain" }}
                />
              )}
            </div>
          ) : (
            <div className="h-64 rounded-lg border border-[#e5e5e5] bg-[#fafafa] flex items-center justify-center text-[#9b9b9b] text-sm">
              La imagen seleccionada aparecerá aquí
            </div>
          )}
        </div>
      </div>

      {resultado && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-[#e5e5e5] p-4">
            <h3 className="text-sm font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Resumen de detecciones
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#f5f5f5] rounded-md p-3 text-center">
                <div className="text-xl font-bold text-violet-700">
                  {resultado.personas_detectadas}
                </div>
                <div className="text-xs text-[#6b6b6b]">Personas</div>
              </div>
              <div className="bg-[#f5f5f5] rounded-md p-3 text-center">
                <div className="text-xl font-bold text-green-600">
                  {
                    resultado.detecciones.filter(
                      (d) =>
                        ![
                          "NO-Hardhat",
                          "NO-Safety Vest",
                          "NO-Mask",
                          "Person",
                        ].includes(d.clase),
                    ).length
                  }
                </div>
                <div className="text-xs text-[#6b6b6b]">EPP correcto</div>
              </div>
              <div className="bg-[#f5f5f5] rounded-md p-3 text-center">
                <div className="text-xl font-bold text-red-500">
                  {
                    resultado.detecciones.filter((d) =>
                      ["NO-Hardhat", "NO-Safety Vest", "NO-Mask"].includes(
                        d.clase,
                      ),
                    ).length
                  }
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
            {resultado.trabajadores.length === 0 ? (
              <p className="text-xs text-[#9b9b9b]">
                No se detectaron trabajadores
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[#6b6b6b] border-b border-[#e5e5e5]">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">Casco</th>
                      <th className="pb-2 font-medium">Chaleco</th>
                      <th className="pb-2 font-medium">Mascarilla</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.trabajadores.map((t) => (
                      <tr key={t.id} className="border-b border-[#f0f0f0]">
                        <td className="py-2 font-semibold">{t.id}</td>
                        <td className="py-2">
                          <StatusBadge status={t.casco} />
                        </td>
                        <td className="py-2">
                          <StatusBadge status={t.chaleco} />
                        </td>
                        <td className="py-2">
                          <StatusBadge status={t.mascarilla} />
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
