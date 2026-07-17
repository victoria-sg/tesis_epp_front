import { Plus, ScanSearch, Sparkles, BookOpen, RotateCcw, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ActionButtons } from "../../components/crud/ActionButtons";
import { ConfirmDialog } from "../../components/crud/ConfirmDialog";
import { CustomModal } from "../../components/crud/CustomModal";
import { PageHeader } from "../../components/crud/PageHeader";
import { Button } from "../../components/ui/Button";
import { TrainingConfigModal } from "../../components/admin/TrainingConfigModal";
import { LabelPromptModal } from "../../components/admin/LabelPromptModal";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { usePermission } from "../../hooks/usePermissions";
import { useSocket } from "../../hooks/useSocket";
import { SIO_EVENT_ENTRENAMIENTO_STATUS } from "../../constants/socketEvents";
import type { ClaseDeteccion, ClaseDeteccionCreate } from "../../models/claseDeteccion.model";
import type { ProgressInfo, TimeInfo, TrainingRequest, TrainingStatusEvent } from "../../models/training.model";
import { claseDeteccionService } from "../../services/claseDeteccion.service";
import { PERM_CLASES_DETECCION_EDITAR, PERM_CLASES_DETECCION_ELIMINAR } from "../../constants/permissionsConstants";

const initialForm: ClaseDeteccionCreate = {
  nombre_visible: "",
  codigo_positivo: "",
  codigo_negativo: "",
  tiene_negativo: false,
  activa: true,
};

const statusLabel: Record<string, string> = {
  pendiente: "Pendiente",
  autoetiquetando: "Autoetiquetando...",
  autoetiquetado: "Autoetiquetado",
  entrenando: "Entrenando...",
  listo: "Listo",
  error: "Error",
};

const statusColor: Record<string, string> = {
  pendiente: "bg-gray-100 text-gray-600",
  autoetiquetando: "bg-yellow-50 text-yellow-700",
  autoetiquetado: "bg-blue-50 text-blue-700",
  entrenando: "bg-yellow-50 text-yellow-700",
  listo: "bg-emerald-50 text-emerald-700",
  error: "bg-red-50 text-red-700",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown; msg?: string } } }).response;
    if (response?.data?.msg) return response.data.msg;
    if (typeof response?.data?.detail === "string") return response.data.detail;
    if (Array.isArray(response?.data?.detail)) {
      return response.data.detail
        .map((item) => item?.msg ?? JSON.stringify(item))
        .join("; ");
    }
  }
  return fallback;
};

interface ProgressState {
  progreso: ProgressInfo;
  tiempos?: TimeInfo;
  operacion: "autoetiquetado" | "entrenamiento";
}

export const ClasesDeteccionView = () => {
  const [items, setItems] = useState<ClaseDeteccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ClaseDeteccionCreate>(initialForm);
  const [positiveFiles, setPositiveFiles] = useState<File[]>([]);
  const [negativeFiles, setNegativeFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, string | null>>({});
  const [progressMap, setProgressMap] = useState<Record<number, ProgressState | null>>({});

  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [trainingTargetId, setTrainingTargetId] = useState<number | null>(null);
  const [trainingStarting, setTrainingStarting] = useState(false);

  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [labelTargetId, setLabelTargetId] = useState<number | null>(null);
  const [labelStarting, setLabelStarting] = useState(false);

  const puedeEditar = usePermission(PERM_CLASES_DETECCION_EDITAR);
  const puedeEliminar = usePermission(PERM_CLASES_DETECCION_ELIMINAR);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { socket } = useSocket();

  const confirmDelete = useCallback((id: number) => {
    setDeleteError(null);
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteConfirmOpen(false);
    setDeletingId(null);
    setDeleteError(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (deletingId === null) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await claseDeteccionService.remove(deletingId);
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      loadData();
    } catch (error) {
      setDeleteError(getErrorMessage(error, "No se pudo eliminar la clase."));
    } finally {
      setDeleteLoading(false);
    }
  }, [deletingId]);

  const loadData = () => {
    setLoading(true);
    claseDeteccionService
      .getAll()
      .then(setItems)
      .catch(() => setMessage("No se pudieron cargar las clases."))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: TrainingStatusEvent) => {
      if (data.progreso && data.estado === "en_curso") {
        setProgressMap((prev) => ({
          ...prev,
          [data.id_clase_deteccion]: {
            progreso: data.progreso,
            tiempos: data.tiempos,
            operacion: data.operacion,
          },
        }));
      }
      if (data.estado === "completado" || data.estado === "error") {
        setProgressMap((prev) => ({
          ...prev,
          [data.id_clase_deteccion]: null,
        }));
        loadData();
      }
    };
    socket.on(SIO_EVENT_ENTRENAMIENTO_STATUS, handler);
    return () => { socket.off(SIO_EVENT_ENTRENAMIENTO_STATUS, handler); };
  }, [socket]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    const source = Array.isArray(items) ? items : [];
    return source.filter((item) =>
      `${item.nombre_visible} ${item.codigo_positivo} ${item.codigo_negativo ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  const closeModal = () => {
    setModalOpen(false);
    setForm(initialForm);
    setPositiveFiles([]);
    setNegativeFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (!positiveFiles.length) {
        setMessage("Selecciona al menos una imagen positiva.");
        return;
      }
      if (form.tiene_negativo && !negativeFiles.length) {
        setMessage("Selecciona al menos una imagen negativa.");
        return;
      }
      const created = await claseDeteccionService.create({
        ...form,
        codigo_negativo: form.tiene_negativo ? form.codigo_negativo : null,
      });
      if (positiveFiles.length) {
        await claseDeteccionService.uploadImages(
          created.id_clase_deteccion,
          "positivo",
          positiveFiles,
        );
      }
      if (form.tiene_negativo && negativeFiles.length) {
        await claseDeteccionService.uploadImages(
          created.id_clase_deteccion,
          "negativo",
          negativeFiles,
        );
      }
      setMessage(`Clase creada con ${positiveFiles.length} imagen(es). Ahora puedes etiquetarla.`);
      closeModal();
      loadData();
    } catch (error) {
      setMessage(getErrorMessage(error, "No se pudo crear la clase."));
    } finally {
      setSaving(false);
    }
  };

  const handleAutoLabelClick = (id: number) => {
    setLabelTargetId(id);
    setLabelModalOpen(true);
  };

  const handleStartLabeling = async (promptPositivo: string | null, promptNegativo: string | null) => {
    if (labelTargetId === null) return;
    setLabelStarting(true);
    setMessage(null);
    setLabelModalOpen(false);
    try {
      const prompts: Record<string, string> = {};
      if (promptPositivo !== null) prompts.prompt_positivo = promptPositivo;
      if (promptNegativo !== null) prompts.prompt_negativo = promptNegativo;
      await claseDeteccionService.autoLabelWithPrompt(labelTargetId, Object.keys(prompts).length ? prompts : undefined);
      setMessage(`Autoetiquetado iniciado.`);
      loadData();
    } catch (error) {
      setMessage(getErrorMessage(error, "Error al iniciar autoetiquetado."));
    } finally {
      setLabelStarting(false);
      setLabelTargetId(null);
    }
  };

  const handleTrainClick = (id: number) => {
    setTrainingTargetId(id);
    setTrainingModalOpen(true);
  };

  const handleStartTraining = async (request: TrainingRequest) => {
    if (trainingTargetId === null) return;
    setTrainingStarting(true);
    setMessage(null);
    setTrainingModalOpen(false);
    try {
      await claseDeteccionService.train(trainingTargetId, request);
      setMessage(`Entrenamiento iniciado con preset "${request.preset}".`);
      loadData();
    } catch (error) {
      setMessage(getErrorMessage(error, "Error al iniciar entrenamiento."));
    } finally {
      setTrainingStarting(false);
      setTrainingTargetId(null);
    }
  };

  const isPendingAction = (id: number, action: string) => actionLoading[id] === action;

  const getProgressState = (id: number) => progressMap[id] ?? null;

  return (
    <div>
      <PageHeader
        title="Clases"
        subtitle="Clases detectables del modelo principal y modelos especializados"
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setModalOpen(true)}
          >
            Nueva clase
          </Button>
        }
      />

      {message && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {message}
        </div>
      )}

      <div className="rounded-lg border border-[#e5e5e5] bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-[#ececec] px-5 py-4">
          <div>
            <div className="text-table-title">
              Clases detectables <span className="text-table-count">· {Array.isArray(filtered) ? filtered.length : 0}</span>
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              Las clases del modelo principal son solo lectura.
            </div>
          </div>
          <input
            className="w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clase..."
          />
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-500">
            Cargando...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Positiva</th>
                  <th className="px-4 py-3">Negativa</th>
                  <th className="px-4 py-3">Fuente</th>
                  <th className="px-4 py-3">Etiquetado</th>
                  <th className="px-4 py-3">Entrenado</th>
                  <th className="px-4 py-3">Activa</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filtered) ? filtered : []).map((item) => {
                  const ps = getProgressState(item.id_clase_deteccion);
                  return (
                    <tr key={item.id_clase_deteccion} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium">
                        <span className="inline-flex items-center gap-2">
                          <ScanSearch size={14} />
                          {item.nombre_visible}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{item.codigo_positivo}</td>
                      <td className="px-4 py-3 font-mono text-xs">{item.codigo_negativo ?? "-"}</td>
                      <td className="px-4 py-3">
                        {item.origen === "personalizada" ? "Modelo especializado" : "Modelo principal"}
                      </td>
                      <td className="px-4 py-3">
                        {ps?.operacion === "autoetiquetado" ? (
                          <ProgressBar progreso={ps.progreso} tiempos={ps.tiempos} variant="labeling" compact />
                        ) : (
                          <span className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${
                            (["autoetiquetado", "entrenando", "listo"].includes(item.estado_entrenamiento)) ? "bg-emerald-50 text-emerald-700" :
                            item.estado_entrenamiento === "autoetiquetando" ? "bg-yellow-50 text-yellow-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            {item.estado_entrenamiento === "autoetiquetando" ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Loader2 size={12} className="animate-spin" />
                                En proceso
                              </span>
                            ) : ["autoetiquetado", "entrenando", "listo"].includes(item.estado_entrenamiento) ? "Si" : "No"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {ps?.operacion === "entrenamiento" ? (
                          <ProgressBar progreso={ps.progreso} tiempos={ps.tiempos} variant="training" compact />
                        ) : (
                          <span className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${
                            item.estado_entrenamiento === "listo" ? "bg-emerald-50 text-emerald-700" :
                            item.estado_entrenamiento === "entrenando" ? "bg-yellow-50 text-yellow-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            {item.estado_entrenamiento === "entrenando" ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Loader2 size={12} className="animate-spin" />
                                En proceso
                              </span>
                            ) : item.estado_entrenamiento === "listo" ? "Si" : "No"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{item.activa ? "Si" : "No"}</td>
                      <td className="px-4 py-3">
                        {!item.solo_lectura && (
                          <div className="flex items-center justify-center gap-1.5">
                            {item.estado_entrenamiento === "pendiente" && puedeEditar && (
                              <button
                                className="inline-flex h-7 items-center gap-1 rounded-md border border-[#d4d4d4] px-2 text-xs hover:border-[#2563eb] hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                                onClick={() => handleAutoLabelClick(item.id_clase_deteccion)}
                                disabled={isPendingAction(item.id_clase_deteccion, "etiquetando")}
                                title="Autoetiquetar imagenes con Florence-2"
                              >
                                {isPendingAction(item.id_clase_deteccion, "etiquetando") ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Sparkles size={12} />
                                )}
                                Etiquetar
                              </button>
                            )}
                            {item.estado_entrenamiento === "autoetiquetado" && puedeEditar && (
                              <button
                                className="inline-flex h-7 items-center gap-1 rounded-md border border-[#d4d4d4] px-2 text-xs hover:border-[#2563eb] hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                                onClick={() => handleTrainClick(item.id_clase_deteccion)}
                                disabled={trainingStarting && trainingTargetId === item.id_clase_deteccion}
                                title="Entrenar modelo YOLO"
                              >
                                {trainingStarting && trainingTargetId === item.id_clase_deteccion ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <BookOpen size={12} />
                                )}
                                Entrenar
                              </button>
                            )}
                            {(item.estado_entrenamiento === "error" || item.estado_entrenamiento === "listo") && puedeEditar && (
                              <>
                                <button
                                  className="inline-flex h-7 items-center gap-1 rounded-md border border-[#d4d4d4] px-2 text-xs hover:border-[#2563eb] hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                                  onClick={() => handleAutoLabelClick(item.id_clase_deteccion)}
                                  disabled={isPendingAction(item.id_clase_deteccion, "etiquetando")}
                                  title="Re-etiquetar imagenes"
                                >
                                  {isPendingAction(item.id_clase_deteccion, "etiquetando") ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <RotateCcw size={12} />
                                  )}
                                  Etiquetar
                                </button>
                                <button
                                  className="inline-flex h-7 items-center gap-1 rounded-md border border-[#d4d4d4] px-2 text-xs hover:border-[#2563eb] hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                                  onClick={() => handleTrainClick(item.id_clase_deteccion)}
                                  disabled={trainingStarting && trainingTargetId === item.id_clase_deteccion}
                                  title="(Re)entrenar modelo"
                                >
                                  {trainingStarting && trainingTargetId === item.id_clase_deteccion ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <BookOpen size={12} />
                                  )}
                                  Entrenar
                                </button>
                              </>
                            )}
                            {(item.estado_entrenamiento === "autoetiquetando" || item.estado_entrenamiento === "entrenando") && !ps && (
                              <span className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs text-gray-400">
                                <Loader2 size={12} className="animate-spin" />
                                En curso
                              </span>
                            )}
                            {ps && (
                              <div className="w-28">
                                <ProgressBar progreso={ps.progreso} tiempos={ps.tiempos} variant={ps.operacion === "autoetiquetado" ? "labeling" : "training"} compact />
                              </div>
                            )}
                            <ActionButtons
                              onEdit={puedeEditar ? () => {} : undefined}
                              onDelete={puedeEliminar ? () => confirmDelete(item.id_clase_deteccion) : undefined}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {labelTargetId !== null && (
        <LabelPromptModal
          open={labelModalOpen}
          onClose={() => { setLabelModalOpen(false); setLabelTargetId(null); }}
          idClase={labelTargetId}
          nombreClase={items.find((i) => i.id_clase_deteccion === labelTargetId)?.nombre_visible ?? ""}
          codigoPositivo={items.find((i) => i.id_clase_deteccion === labelTargetId)?.codigo_positivo ?? ""}
          codigoNegativo={items.find((i) => i.id_clase_deteccion === labelTargetId)?.codigo_negativo ?? null}
          tieneNegativo={items.find((i) => i.id_clase_deteccion === labelTargetId)?.tiene_negativo ?? false}
          promptPositivoInicial={items.find((i) => i.id_clase_deteccion === labelTargetId)?.prompt_positivo ?? null}
          promptNegativoInicial={items.find((i) => i.id_clase_deteccion === labelTargetId)?.prompt_negativo ?? null}
          onStartLabeling={handleStartLabeling}
          loading={labelStarting}
        />
      )}

      <TrainingConfigModal
        open={trainingModalOpen}
        onClose={() => { setTrainingModalOpen(false); setTrainingTargetId(null); }}
        idClase={trainingTargetId ?? 0}
        onStartTraining={handleStartTraining}
        loading={trainingStarting}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Eliminar Clase"
        message="¿Estás seguro de eliminar esta clase? Se eliminarán las imágenes y el modelo asociado. Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={cancelDelete}
        loading={deleteLoading}
        error={deleteError}
      />

      <CustomModal open={modalOpen} onClose={closeModal} title="Nueva clase">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold text-gray-800">
            Nombre
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.nombre_visible}
              onChange={(e) => setForm({ ...form, nombre_visible: e.target.value })}
              placeholder="Ej. Celular en mano"
              required
            />
          </label>

          <label className="block text-xs font-semibold text-gray-800">
            Codigo de clase positiva
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.codigo_positivo}
              onChange={(e) => setForm({ ...form, codigo_positivo: e.target.value })}
              placeholder="Ej. CELULAR_EN_MANO"
              required
            />
          </label>

          <label className="block text-xs font-semibold text-gray-800">
            Imagenes positivas
            <input
              className="mt-1 w-full text-xs"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPositiveFiles(Array.from(e.target.files ?? []))}
              required
            />
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-800">
            <input
              type="checkbox"
              checked={form.tiene_negativo}
              onChange={(e) => setForm({ ...form, tiene_negativo: e.target.checked })}
            />
            Tiene clase negativa
          </label>

          {form.tiene_negativo && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-3">
              <label className="block text-xs font-semibold text-gray-800">
                Codigo de clase negativa
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.codigo_negativo ?? ""}
                  onChange={(e) => setForm({ ...form, codigo_negativo: e.target.value })}
                  placeholder="Ej. SIN_CASCO"
                  required={form.tiene_negativo}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-800">
                Imagenes negativas
                <input
                  className="mt-1 w-full text-xs"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNegativeFiles(Array.from(e.target.files ?? []))}
                  required={form.tiene_negativo}
                />
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar
            </Button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};
