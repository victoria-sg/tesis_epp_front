import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { TOKEN_KEY } from "../constants/authStorageConstants";
import { API_BASE_URL } from "../constants/authServiceConstants";
import {
  SIO_NAMESPACE_VINCULACION,
  SIO_EVENT_VINCULACION_APROBADA,
  SIO_EVENT_VINCULACION_RECHAZADA,
} from "../constants/socketEvents";

type VinculacionStatus = "idle" | "canjeando" | "pendiente" | "aprobado" | "rechazado" | "error";

export const usePhoneCamera = () => {
  const { camaraId } = useParams<{ camaraId: string }>();
  const [searchParams] = useSearchParams();

  const [streamActive, setStreamActive] = useState(false);
  const [vinculacionStatus, setVinculacionStatus] = useState<VinculacionStatus>("idle");
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const numericId = useMemo(
    () => (camaraId ? Number(camaraId) : NaN),
    [camaraId],
  );
  const isAuthenticated = !!token;

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    setVinculacionStatus("canjeando");
    fetch("/auth/canjear-vinculacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo_vinculacion: code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) {
          setVinculacionStatus("error");
          return;
        }
        const { status, access_token } = data.data;

        if (status === "aprobado" && access_token) {
          localStorage.setItem(TOKEN_KEY, access_token);
          setToken(access_token);
          setVinculacionStatus("aprobado");
          window.location.href = `/phone-camera/${camaraId}`;
          return;
        }

        if (status === "rechazado") {
          setVinculacionStatus("rechazado");
          return;
        }

        if (status === "pendiente") {
          setVinculacionStatus("pendiente");
          const s = io(`${API_BASE_URL}${SIO_NAMESPACE_VINCULACION}`, {
            auth: { codigo: code },
            reconnection: true,
            reconnectionDelay: 3000,
            reconnectionAttempts: 10,
            transports: ["websocket", "polling"],
          });
          s.on(SIO_EVENT_VINCULACION_APROBADA, (msg: { access_token: string }) => {
            if (msg.access_token) {
              localStorage.setItem(TOKEN_KEY, msg.access_token);
              setToken(msg.access_token);
              s.disconnect();
              setVinculacionStatus("aprobado");
              window.location.href = `/phone-camera/${camaraId}`;
            }
          });
          s.on(SIO_EVENT_VINCULACION_RECHAZADA, () => {
            s.disconnect();
            setVinculacionStatus("rechazado");
          });
          s.on("connect_error", () => {});
          return () => s.disconnect();
        }
      })
      .catch(() => {
        setVinculacionStatus("error");
      });
  }, [searchParams, camaraId]);

  const handleStreamChange = useCallback((active: boolean) => {
    setStreamActive(active);
  }, []);

  return {
    vinculacionStatus,
    streamActive,
    camaraId,
    token,
    numericId,
    isAuthenticated,
    handleStreamChange,
  };
};
