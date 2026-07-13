import { AlertTriangle, Camera, CheckCircle, Clock, Smartphone, XCircle } from "lucide-react";
import { TransmisionCamaraTelefono } from "../../components/auth/TransmisionCamaraTelefono";
import { usePhoneCamera } from "../../controllers/usePhoneCamera";

export const CamaraTelefonoView = () => {
  const {
    vinculacionStatus,
    streamActive,
    camaraId,
    numericId,
    isAuthenticated,
    handleStreamChange,
  } = usePhoneCamera();

  if (vinculacionStatus === "canjeando") {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <span className="text-white text-sm animate-pulse">
          Vinculando dispositivo...
        </span>
      </div>
    );
  }

  if (vinculacionStatus === "pendiente") {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-6 px-8">
        <div className="w-20 h-20 rounded-full bg-blue-900/40 flex items-center justify-center">
          <Clock size={40} className="text-blue-400 animate-pulse" />
        </div>
        <div className="text-center max-w-xs">
          <p className="text-white text-base font-semibold mb-2">
            Esperando aprobación
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            El administrador recibió una solicitud de vinculación desde este
            dispositivo. Espera a que sea aprobada.
          </p>
        </div>
        <div className="flex items-center gap-2 text-zinc-600 text-xs">
          <Smartphone size={14} />
          <span>Dispositivo registrado</span>
        </div>
      </div>
    );
  }

  if (vinculacionStatus === "rechazado") {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-6 px-8">
        <div className="w-20 h-20 rounded-full bg-red-900/40 flex items-center justify-center">
          <XCircle size={40} className="text-red-400" />
        </div>
        <div className="text-center max-w-xs">
          <p className="text-white text-base font-semibold mb-2">
            Conexión rechazada
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            El administrador rechazó la solicitud de vinculación. Escanea un
            nuevo código QR para intentarlo de nuevo.
          </p>
        </div>
      </div>
    );
  }

  if (vinculacionStatus === "error") {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-6 px-8">
        <div className="w-20 h-20 rounded-full bg-red-900/40 flex items-center justify-center">
          <AlertTriangle size={40} className="text-red-400" />
        </div>
        <div className="text-center max-w-xs">
          <p className="text-white text-base font-semibold mb-2">
            Error de vinculación
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            El código de vinculación es inválido o ha expirado. Escanea un
            nuevo código QR.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {isAuthenticated && (
        <div className="bg-zinc-900/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between shrink-0 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Camera size={14} className="text-white" />
            </div>
            <div>
              <div className="text-white text-xs font-semibold">
                EPP Monitor
              </div>
              <div className="text-zinc-500 text-[9px] uppercase tracking-wider">
                Cámara #{camaraId}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {streamActive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-[10px] font-medium">
                  EN VIVO
                </span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="text-zinc-500 text-[10px] font-medium">
                  DETENIDO
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {isAuthenticated ? (
        <>
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <div className="w-full h-full">
              {!isNaN(numericId) ? (
                <TransmisionCamaraTelefono
                  camaraId={numericId}
                  label={`Cámara ${numericId}`}
                  className="w-full h-full rounded-none"
                  onStreamChange={handleStreamChange}
                />
              ) : (
                <div className="text-zinc-500 text-sm flex items-center justify-center h-full">
                  ID de cámara inválido
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between shrink-0 border-t border-zinc-800/50">
            <div className="flex items-center gap-1.5">
              {streamActive ? (
                <Camera size={12} className="text-green-500" />
              ) : (
                <Camera size={12} className="text-zinc-600" />
              )}
              <span className="text-zinc-500 text-[10px]">
                {streamActive ? "Transmitiendo" : "Sin transmisión"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm px-6 text-center">
          <p>
            Código de vinculación inválido o expirado. Escanea el código QR
            desde el panel de administración.
          </p>
        </div>
      )}
    </div>
  );
};
