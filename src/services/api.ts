import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { APP_LOGIN, AUTH_REFRESH } from "../constants/authRoutesConstants";
import {
  API_BASE_URL,
  API_CONTENT_TYPE,
  API_TIMEOUT,
} from "../constants/authServiceConstants";
import {
  REFRESH_TOKEN_KEY,
  TOKEN_KEY,
  USER_KEY,
} from "../constants/authStorageConstants";
import type { LoggedUser } from "../models/auth.model";
import { ROL_LABELS, ROL_MAP } from "../models/auth.model";
import { store } from "../store";
import { login } from "../store/authSlice";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { "Content-Type": API_CONTENT_TYPE },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData || config.data == null) {
    delete config.headers["Content-Type"];
  }
  return config;
});

const cerrarSesion = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = APP_LOGIN;
};

const mapearUsuario = (usuario: {
  id_usuario: number;
  nombre: string;
  apelido: string;
  correo: string;
  rol: string;
  permisos: string[];
  primer_inicio_sesion: boolean;
}): LoggedUser | null => {
  const mappedRol = ROL_MAP[usuario.rol];
  if (!mappedRol) return null;
  return {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    apelido: usuario.apelido,
    correo: usuario.correo,
    rol: mappedRol,
    rolLabel: ROL_LABELS[mappedRol],
    permisos: usuario.permisos,
    primer_inicio_sesion: usuario.primer_inicio_sesion,
  };
};

let refreshEnCurso: Promise<string | null> | null = null;

export const solicitarNuevoAccessToken = async (): Promise<string | null> => {
  const refreshTokenGuardado = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshTokenGuardado) return null;

  try {
    const response = await axios.post<{
      data: { access_token: string; usuario: Record<string, unknown> };
    }>(`${API_BASE_URL}${AUTH_REFRESH}`, {
      refresh_token: refreshTokenGuardado,
    });
    const { access_token, usuario } = response.data.data;

    const user = mapearUsuario(usuario as Parameters<typeof mapearUsuario>[0]);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, access_token);
      store.dispatch(login({ user, token: access_token }));
    } else {
      localStorage.setItem(TOKEN_KEY, access_token);
    }
    return access_token;
  } catch {
    return null;
  }
};

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "ok" in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    const esRutaDeAuth =
      originalRequest?.url?.includes(AUTH_REFRESH) ||
      originalRequest?.url?.includes("/auth/login");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !esRutaDeAuth
    ) {
      originalRequest._retried = true;

      if (!refreshEnCurso) {
        refreshEnCurso = solicitarNuevoAccessToken().finally(() => {
          refreshEnCurso = null;
        });
      }

      const nuevoToken = await refreshEnCurso;
      if (nuevoToken) {
        originalRequest.headers.Authorization = `Bearer ${nuevoToken}`;
        return api(originalRequest);
      }

      cerrarSesion();
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      cerrarSesion();
    }

    return Promise.reject(error);
  },
);

export default api;
