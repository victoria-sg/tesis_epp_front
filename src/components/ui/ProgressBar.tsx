import { Clock } from "lucide-react";
import type { ProgressInfo, TimeInfo } from "../../models/training.model";

interface Props {
  progreso: ProgressInfo;
  tiempos?: TimeInfo;
  variant?: "labeling" | "training";
  compact?: boolean;
}

const variantColors: Record<string, { bar: string; bg: string; text: string }> = {
  labeling: { bar: "bg-blue-500", bg: "bg-blue-100", text: "text-blue-700" },
  training: { bar: "bg-amber-500", bg: "bg-amber-100", text: "text-amber-700" },
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export const ProgressBar = ({ progreso, tiempos, variant = "training", compact = false }: Props) => {
  const colors = variantColors[variant];
  const pct = Math.min(progreso.porcentaje, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-[120px]" title={`${progreso.detalle}${tiempos ? ` · ${formatTime(tiempos.transcurrido_seg)} transcurrido` : ""}`}>
        <div className={`h-1.5 flex-1 rounded-full ${colors.bg} overflow-hidden`}>
          <div
            className={`h-full rounded-full ${colors.bar} transition-all duration-300 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-[10px] font-medium whitespace-nowrap ${colors.text}`}>
          {pct}%
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className={`h-2.5 w-full rounded-full ${colors.bg} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-300 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className={`font-medium ${colors.text}`}>
          {progreso.detalle} · {pct}%
        </span>
        {tiempos && (
          <span className="inline-flex items-center gap-1 text-gray-500">
            <Clock size={11} />
            {formatTime(tiempos.transcurrido_seg)} · ≈ {formatTime(tiempos.estimado_restante_seg)} restante
          </span>
        )}
      </div>
    </div>
  );
};
