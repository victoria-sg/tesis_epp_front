export const DETECTION_COLORS: Record<string, string> = {
  Hardhat: "#f97316",
  "NO-Hardhat": "#ef4444",
  "Safety Vest": "#22c55e",
  "NO-Safety Vest": "#ef4444",
  Mask: "#3b82f6",
  "NO-Mask": "#ef4444",
  Gloves: "#a855f7",
  Person: "#a855f7",
  "Safety Cone": "#eab308",
  machinery: "#6b7280",
  vehicle: "#14b8a6",
};

export const TRANSLATIONS: Record<string, string> = {
  Hardhat: "Casco",
  "NO-Hardhat": "Sin casco",
  "Safety Vest": "Chaleco",
  "NO-Safety Vest": "Sin chaleco",
  Mask: "Mascarilla",
  "NO-Mask": "Sin mascarilla",
  Gloves: "Guantes",
  Person: "Persona",
  "Safety Cone": "Cono",
  machinery: "Maquinaria",
  vehicle: "Vehiculo",
};

export function getColorForClass(className: string): string {
  return DETECTION_COLORS[className] || "#6b7280";
}

export function translateClass(className: string): string {
  return TRANSLATIONS[className] || className;
}
