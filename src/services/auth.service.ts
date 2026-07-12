import {
  AUTH_CAMBIAR_PASSWORD_PRIMER_INICIO,
  AUTH_LOGIN,
  AUTH_REFRESH,
  AUTH_RESTABLECER_PASSWORD,
  AUTH_SOLICITAR_RECUPERACION,
} from "../constants/authRoutesConstants";
import {
  API_BASE_URL,
} from "../constants/authServiceConstants";
import { TOKEN_KEY, USER_KEY } from "../constants/authStorageConstants";
import type {
  CambiarPasswordPrimerInicioRequest,
  LoginRequest,
  LoginResponse,
  MensajeResponse,
  RefreshTokenResponse,
  RestablecerPasswordRequest,
  SolicitarRecuperacionRequest,
} from "../models/auth.model";
import api from "./api";
import axios from "axios";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(AUTH_LOGIN, data);
  return response.data;
};

export const solicitarRecuperacion = async (
  data: SolicitarRecuperacionRequest,
): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>(
    AUTH_SOLICITAR_RECUPERACION,
    data,
  );
  return response.data;
};

export const restablecerPassword = async (
  data: RestablecerPasswordRequest,
): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>(
    AUTH_RESTABLECER_PASSWORD,
    data,
  );
  return response.data;
};

export const cambiarPasswordPrimerInicio = async (
  data: CambiarPasswordPrimerInicioRequest,
): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>(
    AUTH_CAMBIAR_PASSWORD_PRIMER_INICIO,
    data,
  );
  return response.data;
};

export const refreshToken = async (
  refresh_token: string,
): Promise<RefreshTokenResponse | null> => {
  try {
    const response = await axios.post<{
      data: RefreshTokenResponse;
    }>(`${API_BASE_URL}${AUTH_REFRESH}`, { refresh_token });
    return response.data.data;
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};