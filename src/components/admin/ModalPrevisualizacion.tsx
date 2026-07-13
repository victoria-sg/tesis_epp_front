import { X } from "lucide-react";

interface ImagePreviewModalProps {
  src: string;
  onClose: () => void;
}

export const ModalPrevisualizacion = ({ src, onClose }: ImagePreviewModalProps) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = "captura-incidencia.jpg";
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1 text-sm"
        >
          <X size={16} /> Cerrar
        </button>
        <img
          src={src}
          alt="Captura de incidencia"
          className="w-full rounded-lg shadow-2xl"
        />
        <div className="mt-3 text-center">
          <button
            onClick={handleDownload}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Descargar imagen
          </button>
        </div>
      </div>
    </div>
  );
};
