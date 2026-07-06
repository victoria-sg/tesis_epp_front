import { Camera, Eye, EyeOff, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PhoneCameraFeed } from "../components/PhoneCameraFeed";
import { AUTH_LOGIN } from "../constants/authRoutesConstants";
import { TOKEN_KEY } from "../constants/authStorageConstants";
import api from "../services/api";

export const PhoneCameraView = () => {
  const { camaraId } = useParams<{ camaraId: string }>();
  const [searchParams] = useSearchParams();
  const [streamActive, setStreamActive] = useState(false);
  const tokenProcessed = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const numericId = useMemo(() => (camaraId ? Number(camaraId) : NaN), [camaraId]);
  const isAuthenticated = !!token;

  useEffect(() => {
    if (tokenProcessed.current) return;
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      tokenProcessed.current = true;
      localStorage.setItem(TOKEN_KEY, tokenFromUrl);
      setToken(tokenFromUrl);
      window.location.href = `/phone-camera/${camaraId}`;
      return;
    }
    setIsReady(true);
  }, [searchParams, camaraId]);

  const handleStreamChange = useCallback((active: boolean) => {
    setStreamActive(active);
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const response = await api.post(AUTH_LOGIN, {
        correo: loginEmail,
        contrasena: loginPassword,
      });
      const { access_token } = response.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      setToken(access_token);
    } catch {
      setLoginError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoginLoading(false);
    }
  }, [loginEmail, loginPassword]);

  if (!isReady && searchParams.get("token")) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <span className="text-white text-sm animate-pulse">Autenticando...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">

      
      {isAuthenticated && (
        <div className="bg-zinc-900/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between shrink-0 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Camera size={14} className="text-white" />
            </div>
            <div>
              <div className="text-white text-xs font-semibold">EPP Monitor</div>
              <div className="text-zinc-500 text-[9px] uppercase tracking-wider">
                Cámara #{camaraId}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {streamActive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-[10px] font-medium">EN VIVO</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="text-zinc-500 text-[10px] font-medium">DETENIDO</span>
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
                <PhoneCameraFeed
                  deviceId={`phone_${numericId}`}
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
                <Wifi size={12} className="text-green-500" />
              ) : (
                <WifiOff size={12} className="text-zinc-600" />
              )}
              <span className="text-zinc-500 text-[10px]">
                {streamActive ? "Transmitiendo" : "Sin transmisión"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <Smartphone size={48} className="mx-auto text-zinc-500 mb-4" />
              <p className="text-white text-base font-semibold mb-2">
                Usa tu teléfono como cámara de seguridad
              </p>
              <p className="text-zinc-500 text-xs mb-6 leading-relaxed">
                Escanea el código QR desde el panel de administración, o inicia sesión con tu cuenta.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block mb-1 text-[12px] text-zinc-400 font-semibold">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="tucorreo@empresa.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-[12px] text-zinc-400 font-semibold">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="text-[12px] text-red-400 text-center">{loginError}</div>
              )}

              <button
                type="submit"
                disabled={loginLoading || !loginEmail || !loginPassword}
                className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/30"
              >
                {loginLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};