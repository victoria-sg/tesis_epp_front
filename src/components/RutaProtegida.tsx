import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { APP_LOGIN, APP_DASHBOARD } from "../constants/authRoutesConstants";
import type { RootState } from "../store";

interface Props {
  permiso: string;
  children: ReactNode;
}

export const RutaProtegida = ({ permiso, children }: Props) => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return <Navigate to={APP_LOGIN} replace />;
  if (!user.permisos.includes(permiso)) return <Navigate to={APP_DASHBOARD} replace />;
  return <>{children}</>;
};
