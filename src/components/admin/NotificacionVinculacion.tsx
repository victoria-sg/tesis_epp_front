import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Smartphone, X } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
import { SIO_EVENT_NUEVA_VINCULACION } from "../../constants/socketEvents";
import api from "../../services/api";

interface VinculacionPendiente {
  codigo: string;
  camara_id: number;
  ip: string;
}

export const NotificacionVinculacion = () => {
  const { socket } = useSocket();
  const [pendientes, setPendientes] = useState<VinculacionPendiente[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const procesar = useCallback(
    async (codigo: string, accion: "aprobar" | "rechazar") => {
      const endpoint =
        accion === "aprobar"
          ? "/auth/aprobar-vinculacion"
          : "/auth/rechazar-vinculacion";
      try {
        await api.post(endpoint, { codigo_vinculacion: codigo });
      } catch {}
      setPendientes((prev) => prev.filter((p) => p.codigo !== codigo));
      const t = timersRef.current.get(codigo);
      if (t) clearTimeout(t);
      timersRef.current.delete(codigo);
    },
    [],
  );

  useEffect(() => {
    if (!socket) return;
    const handler = (data: VinculacionPendiente) => {
      setPendientes((prev) => {
        if (prev.some((p) => p.codigo === data.codigo)) return prev;
        return [...prev, data];
      });
      const t = setTimeout(() => {
        setPendientes((prev) => prev.filter((p) => p.codigo !== data.codigo));
        timersRef.current.delete(data.codigo);
      }, 120_000);
      timersRef.current.set(data.codigo, t);
    };
    socket.on(SIO_EVENT_NUEVA_VINCULACION, handler);
    return () => {
      socket.off(SIO_EVENT_NUEVA_VINCULACION, handler);
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  if (pendientes.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
      {pendientes.map((p) => (
        <div
          key={p.codigo}
          className="bg-white border border-zinc-200 rounded-xl shadow-xl p-4 animate-in slide-in-from-right"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Nueva vinculación
                </p>
                <p className="text-xs text-zinc-500">Cámara #{p.camara_id}</p>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">{p.ip}</span>
          </div>
          <p className="text-xs text-zinc-600 mb-3">
            Un dispositivo quiere conectarse como cámara #{p.camara_id}.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => procesar(p.codigo, "aprobar")}
              className="flex-1 h-9 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors"
            >
              <Check size={14} /> Aceptar
            </button>
            <button
              onClick={() => procesar(p.codigo, "rechazar")}
              className="flex-1 h-9 rounded-lg bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-red-200 transition-colors"
            >
              <X size={14} /> Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
