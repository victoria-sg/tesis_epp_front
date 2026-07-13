import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_CAMBIAR_CONTRASENA, APP_LOGIN } from "../constants/authRoutesConstants";
import { REFRESH_TOKEN_KEY } from "../constants/authStorageConstants";
import type { RootState } from "../store";
import { logout } from "../store/authSlice";
import { solicitarNuevoAccessToken } from "../services/api";

export const useAuthGuard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(
    !!localStorage.getItem(REFRESH_TOKEN_KEY),
  );

  useEffect(() => {
    if (!checkingAuth) return;
    solicitarNuevoAccessToken().then((nuevoToken) => {
      if (!nuevoToken) {
        dispatch(logout());
      }
      setCheckingAuth(false);
    });
  }, [checkingAuth, dispatch]);

  useEffect(() => {
    if (checkingAuth) return;
    if (!user) navigate(APP_LOGIN, { replace: true });
    else if (user.primer_inicio_sesion)
      navigate(APP_CAMBIAR_CONTRASENA, { replace: true });
  }, [user, navigate, checkingAuth]);

  return {
    checkingAuth,
  };
};
