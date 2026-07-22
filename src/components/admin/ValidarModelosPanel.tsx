import { ScanSearch, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ClaseDeteccion } from "../../models/claseDeteccion.model";
import { claseDeteccionService } from "../../services/claseDeteccion.service";
import { validarModelos, type ValidacionResult } from "../../services/deteccionService";

const MODEL_COLORS = [
  "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#d946ef", "#0ea5e9", "#eab308", "#a855f7",
  "#10b981", "#f43f5e", "#64748b",
];

export const ValidarModelosPanel = () => {
  const [clases, setClases] = useState<ClaseDeteccion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ValidacionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confianza, setConfianza] = useState(0.5);
  const [iou, setIou] = useState(0.45);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    claseDeteccionService.getAll().then((all) => {
      const personalizadas = all.filter((c) => c.origen === "personalizada");
      setClases(personalizadas);
      setSelectedIds(new Set(personalizadas.filter((c) => c.estado_entrenamiento === "listo").map((c) => c.id_clase_deteccion)));
    });
  }, []);

  const toggleId = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setResultado(null);
  };

  const handleValidate = async () => {
    if (!previewUrl || selectedIds.size === 0) return;
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
      const res = await validarModelos(base64, confianza, iou, Array.from(selectedIds));
      setResultado(res);
      drawOverlay(res, img.naturalWidth, img.naturalHeight);
    } catch (err) {
      console.error(err);
      alert("Error al validar los modelos");
    } finally {
      setLoading(false);
    }
  };

  const colorForClase = (id: number): string => {
    const idx = clases.findIndex((c) => c.id_clase_deteccion === id);
    return MODEL_COLORS[idx % MODEL_COLORS.length];
  };

  const drawOverlay = (res: ValidacionResult, w: number, h: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);

    for (const det of res.detecciones) {
      const [x1, y1, x2, y2] = det.bbox;
      const color = colorForClase(det.id_clase_deteccion);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, Math.min(w, h) / 300);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      const label = `${det.nombre_visible} ${(det.confianza * 100).toFixed(0)}%`;
      ctx.font = `bold ${Math.max(12, Math.min(w, h) / 50)}px sans-serif`;
      const textMetrics = ctx.measureText(label);
      const textH = Math.max(18, Math.min(w, h) / 40);
      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textH, textMetrics.width + 12, textH);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x1 + 6, y1 - 4);
    }
  };

  const listas = clases.filter((c) => c.estado_entrenamiento === "listo");
  const noListas = clases.filter((c) => c.estado_entrenamiento !== "listo");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1">
          <div className="bg-slate-100 rounded-lg p-4">
            <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
              Modelos entrenados
            </h3>
            {listas.length === 0 ? (
              <p className="text-xs text-slate-400">No hay modelos entrenados</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {listas.map((c) => (
                  <label key={c.id_clase_deteccion} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(c.id_clase_deteccion)}
                      onChange={() => toggleId(c.id_clase_deteccion)}
                      className="accent-violet-600"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorForClase(c.id_clase_deteccion) }}
                    />
                    <span className="truncate">{c.nombre_visible}</span>
                  </label>
                ))}
              </div>
            )}

            {noListas.length > 0 && (
              <>
                <h3 className="text-xs font-bold text-slate-400 mt-4 mb-2 uppercase tracking-wider">
                  No disponibles
                </h3>
                <div className="space-y-1">
                  {noListas.map((c) => (
                    <div key={c.id_clase_deteccion} className="flex items-center gap-2 py-1 px-2 text-sm text-slate-400">
                      <input type="checkbox" disabled className="accent-gray-300" />
                      <span className="truncate">{c.nombre_visible}</span>
                      <span className="text-[10px] ml-auto">{c.estado_entrenamiento}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-violet-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-violet-50/30"
          >
            <Upload size={28} className="text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-800">
              Subir imagen
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-3 bg-slate-100 rounded-lg p-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
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
              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
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
              onClick={handleValidate}
              disabled={!previewUrl || selectedIds.size === 0 || loading}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-purple-700 text-white rounded-md py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ScanSearch size={16} />
              {loading ? "Validando..." : "Validar modelos"}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {previewUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-black">
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
            <div className="h-64 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
              Selecciona una imagen para validar los modelos
            </div>
          )}

          {resultado && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">
                  Resultados por modelo
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {resultado.modelos_cargados.map((m) => {
                    const dets = resultado.detecciones.filter((d) => d.id_clase_deteccion === m.id_clase_deteccion);
                    return (
                      <div key={m.id_clase_deteccion} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorForClase(m.id_clase_deteccion) }} />
                        <span className="font-medium">{m.nombre_visible}</span>
                        <span className="text-slate-500 ml-auto">{dets.length} deteccion(es)</span>
                      </div>
                    );
                  })}
                  {resultado.modelos_fallidos.map((m) => (
                    <div key={m.id_clase_deteccion} className="flex items-center gap-2 text-sm text-red-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-300 flex-shrink-0" />
                      <span>{m.nombre_visible}</span>
                      <span className="text-[10px] ml-auto">Error: {m.razon}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                  Total: {resultado.total_detecciones} deteccion(es)
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">
                  Detalle de detecciones
                </h3>
                {resultado.detecciones.length === 0 ? (
                  <p className="text-xs text-slate-400">Sin detecciones</p>
                ) : (
                  <div className="overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-slate-500 border-b border-slate-200">
                          <th className="pb-2 font-medium">Modelo</th>
                          <th className="pb-2 font-medium">Clase</th>
                          <th className="pb-2 font-medium">Confianza</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.detecciones.map((d, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-1.5 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorForClase(d.id_clase_deteccion) }} />
                              {d.nombre_visible}
                            </td>
                            <td className="py-1.5 font-mono">{d.codigo_positivo}</td>
                            <td className="py-1.5">{(d.confianza * 100).toFixed(0)}%</td>
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
      </div>
    </div>
  );
};
