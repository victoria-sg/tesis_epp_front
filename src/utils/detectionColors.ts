import api from "../services/api";

interface ClassInfo {
  tipo: string;
  color: number[];
  color_hex: string;
  etiqueta: string;
  descripcion_infraccion: string | null;
}

let classData: Record<string, ClassInfo> | null = null;

export async function fetchClassInfo(): Promise<void> {
  if (classData) return;
  try {
    const data = await api.get<{
      classes?: Record<string, ClassInfo>;
    }>("/deteccion/clases");
    if (data.data?.classes) {
      classData = data.data.classes;
    }
  } catch (e) {
    console.error("[Detection] Error fetching class info:", e);
  }
}

export function getColorForClass(className: string): string {
  if (classData?.[className]?.color_hex) {
    return classData[className].color_hex;
  }
  return "#6b7280";
}

export function translateClass(className: string): string {
  if (classData?.[className]?.etiqueta) {
    return classData[className].etiqueta;
  }
  return className;
}

export function isInfraccion(className: string): boolean {
  return classData?.[className]?.tipo === "negativo";
}
