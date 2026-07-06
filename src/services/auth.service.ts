import {
  AUTH_CAMBIAR_PASSWORD_PRIMER_INICIO,
  AUTH_LOGIN,
  AUTH_RESTABLECER_PASSWORD,
  AUTH_SOLICITAR_RECUPERACION,
} from "../constants/authRoutesConstants";
import { TOKEN_KEY, USER_KEY } from "../constants/authStorageConstants";
import type {
  CambiarPasswordPrimerInicioRequest,
  LoginRequest,
  LoginResponse,
  MensajeResponse,
  RestablecerPasswordRequest,
  SolicitarRecuperacionRequest,
} from "../models/auth.model";
import api from "./api";

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

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};