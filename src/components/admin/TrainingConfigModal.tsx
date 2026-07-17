import { Check, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "../ui/Button";
import { CustomModal } from "../crud/CustomModal";

import {
  OVERRIDE_LABELS,
  PRESET_INFOS,
  type TrainingOverrides,
  type TrainingPreset,
  type TrainingRequest,
} from "../../models/training.model";
import { claseDeteccionService } from "../../services/claseDeteccion.service";

interface Props {
  open: boolean;
  onClose: () => void;
  idClase: number;
  onStartTraining: (request: TrainingRequest) => void;
  loading?: boolean;
}

export const TrainingConfigModal = ({ open, onClose, idClase, onStartTraining, loading }: Props) => {
  const [selectedPreset, setSelectedPreset] = useState<TrainingPreset>("balanceado");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [overrides, setOverrides] = useState<TrainingOverrides>({});
  const [estimatedTime, setEstimatedTime] = useState<{ estimado_segundos: number; fuente: string } | null>(null);
  const [estimating, setEstimating] = useState(false);

  const PRESETS = Object.values(PRESET_INFOS);

  const fetchEstimate = useCallback(async (preset: TrainingPreset) => {
    setEstimating(true);
    try {
      const res = await claseDeteccionService.getEstimatedTime(idClase, "entrenamiento", preset, 30);
      setEstimatedTime(res);
    } catch {
      setEstimatedTime(null);
    } finally {
      setEstimating(false);
    }
  }, [idClase]);

  useEffect(() => {
    if (open) {
      setSelectedPreset("balanceado");
      setShowAdvanced(false);
      setOverrides({});
      setEstimatedTime(null);
      fetchEstimate("balanceado");
    }
  }, [open, fetchEstimate]);

  const handlePresetChange = (preset: TrainingPreset) => {
    setSelectedPreset(preset);
    setOverrides({});
    fetchEstimate(preset);
  };

  const handleOverrideChange = (key: string, value: string | number | boolean) => {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const handleStart = () => {
    const request: TrainingRequest = { preset: selectedPreset };
    const hasOverrides = Object.keys(overrides).length > 0;
    if (hasOverrides) {
      request.overrides = overrides;
    }
    onStartTraining(request);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)} segundos`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} seg`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <CustomModal open={open} onClose={onClose} title="Configurar entrenamiento" maxWidth="max-w-2xl">
      <div className="space-y-5">
        <div>
          <p className="mb-3 text-xs font-semibold text-gray-600">Selecciona un preset de entrenamiento:</p>
          <div className="grid grid-cols-3 gap-3">
            {PRESETS.map((p) => {
              const isSelected = selectedPreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePresetChange(p.key)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                      <Check size={12} className="text-white" />
                    </span>
                  )}
                  <div className="mb-2"><p.icon size={28} className="text-blue-600" /></div>
                  <div className={`mb-0.5 text-sm font-bold ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                    {p.label}
                  </div>
                  <div className="mb-2 text-[10px] leading-tight text-gray-500">{p.description}</div>
                  <div className="mb-1 space-y-0.5 text-[10px] text-gray-400">
                    {Object.entries(p.params).map(([key, val]) => (
                      <div key={key}>
                        {OVERRIDE_LABELS[key] ?? key}: <span className="font-medium text-gray-600">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {p.badge}
                  </div>
                  <div className="mt-1 text-[9px] text-gray-400 italic">{p.tip}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <Settings2 size={14} />
            Ajustes avanzados
          </span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 p-3">
            {(["epochs", "batch", "imgsz", "patience", "workers", "lr0"] as const).map((key) => (
              <label key={key} className="block text-xs font-medium text-gray-700">
                {OVERRIDE_LABELS[key]}
                <input
                  type={key === "lr0" ? "number" : "number"}
                  step={key === "lr0" ? "0.001" : "1"}
                  min={1}
                  className="mt-0.5 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                  placeholder={String(PRESET_INFOS[selectedPreset].params[key] ?? "")}
                  value={(overrides as Record<string, unknown>)[key] as string ?? ""}
                  onChange={(e) => handleOverrideChange(key, key === "lr0" ? parseFloat(e.target.value) : parseInt(e.target.value, 10))}
                />
              </label>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="text-xs text-blue-700">
            <span className="font-semibold">Tiempo estimado:</span>{" "}
            {estimating ? "Calculando..." : estimatedTime ? (
              <>{formatTime(estimatedTime.estimado_segundos)} ({estimatedTime.fuente})</>
            ) : "No disponible"}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleStart}
          >
            Iniciar entrenamiento
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};
