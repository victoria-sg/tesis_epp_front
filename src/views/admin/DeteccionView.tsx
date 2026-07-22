import { FlaskConical, Image, Scan, Video } from "lucide-react";
import { useState } from "react";
import { CargadorDeteccionImagen } from "../../components/admin/CargadorDeteccionImagen";
import { CargadorDeteccionVideo } from "../../components/admin/CargadorDeteccionVideo";
import { ValidarModelosPanel } from "../../components/admin/ValidarModelosPanel";

type Tab = "imagen" | "video" | "validar";

export const DeteccionView = () => {
  const [activeTab, setActiveTab] = useState<Tab>("imagen");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
          <Scan className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Detección</h1>
          <p className="text-sm text-gray-500">
            Prueba el modelo de detección con imágenes o videos de manera
            temporal
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("imagen")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "imagen"
                ? "border-violet-500 text-violet-700 bg-violet-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-slate-100"
            }`}
          >
            <Image size={16} />
            Imagen
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "video"
                ? "border-violet-500 text-violet-700 bg-violet-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-slate-100"
            }`}
          >
            <Video size={16} />
            Video
          </button>
          <button
            onClick={() => setActiveTab("validar")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "validar"
                ? "border-violet-500 text-violet-700 bg-violet-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-slate-100"
            }`}
          >
            <FlaskConical size={16} />
            Validar Modelos
          </button>
        </div>

        <div className="p-6">
          {activeTab === "imagen" && <CargadorDeteccionImagen />}
          {activeTab === "video" && <CargadorDeteccionVideo />}
          {activeTab === "validar" && <ValidarModelosPanel />}
        </div>
      </div>
    </div>
  );
};
