import { useSelector } from "react-redux";
import type { RootState } from "../store";

export function usePermission(permiso: string): boolean {
  const { user } = useSelector((state: RootState) => state.auth);
  return user?.permisos.includes(permiso) ?? false;
}

export function useAnyPermission(...permisos: string[]): boolean {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return false;
  return permisos.some((p) => user.permisos.includes(p));
}

export function useAllPermissions(...permisos: string[]): boolean {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return false;
  return permisos.every((p) => user.permisos.includes(p));
}
