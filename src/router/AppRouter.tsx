import { useState } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { APP_ROUTES } from "../constants/apiRoutesConstants";
import {
  APP_CAMBIAR_CONTRASENA,
  APP_DASHBOARD,
  APP_LOGIN,
  APP_RESET_PASSWORD,
  APP_RESET_PASSWORD_CONFIRM,
  APP_ROOT,
} from "../constants/authRoutesConstants";
import { RutaProtegida } from "../components/RutaProtegida";
import {
  PERM_DASHBOARD_VER, PERM_USUARIOS_VER, PERM_ROLES_VER,
  PERM_ZONAS_VER, PERM_CAMARAS_VER, PERM_TIPOS_EPP_VER,
  PERM_REPORTES_VER, PERM_DETECCION_VER,
} from "../constants/permissionsConstants";
import type { Rol } from "../models/auth.model";
import { ROL_LABELS } from "../models/auth.model";
import { CambiarPasswordPrimerInicioView } from "../views/auth/CambiarPasswordPrimerInicioView";
import { CamaraTelefonoView } from "../views/auth/CamaraTelefonoView";
import { InicioSesionView } from "../views/auth/InicioSesionView";
import { OlvidePasswordView } from "../views/auth/OlvidePasswordView";
import { RestablecerPasswordView } from "../views/auth/RestablecerPasswordView";
import { SelectorRolView } from "../views/auth/SelectorRolView";
import { CamarasView } from "../views/admin/CamarasView";
import { DashboardView } from "../views/admin/DashboardView";
import { ReportesView } from "../views/admin/ReporteView";
import { RolesView } from "../views/admin/RolesView";
import { TiposEPPView } from "../views/admin/TiposEPPView";
import { UsuariosView } from "../views/admin/UsuariosView";
import { ZonasView } from "../views/admin/ZonasView";
import { DeteccionView } from "../views/admin/DeteccionView";
import { AppLayout } from "../views/admin/AppLayout";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  return <OlvidePasswordView onBackToLogin={() => navigate(APP_LOGIN)} />;
};

const AuthRoutes = () => {
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const navigate = useNavigate();

  if (!selectedRol) {
    return <SelectorRolView onSelect={setSelectedRol} />;
  }

  return (
    <InicioSesionView
      selectedRol={selectedRol}
      selectedRolLabel={ROL_LABELS[selectedRol]}
      onGoToReset={() => navigate(APP_RESET_PASSWORD)}
      onChangeRole={() => setSelectedRol(null)}
    />
  );
};

export const AppRouter = () => {
  const router = createBrowserRouter([
    {
      path: APP_LOGIN,
      element: <AuthRoutes />,
    },
    {
      path: APP_RESET_PASSWORD,
      element: <ForgotPasswordPage />,
    },
    {
      path: APP_RESET_PASSWORD_CONFIRM,
      element: <RestablecerPasswordView />,
    },
    {
      path: APP_CAMBIAR_CONTRASENA,
      element: <CambiarPasswordPrimerInicioView />,
    },
    {
      path: "/phone-camera/:camaraId",
      element: <CamaraTelefonoView />,
    },

    {
      path: APP_ROOT,
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <Navigate to={APP_DASHBOARD} replace />,
        },
        {
          path: APP_DASHBOARD.replace("/", ""),
          element: <RutaProtegida permiso={PERM_DASHBOARD_VER}><DashboardView /></RutaProtegida>,
        },
        {
          path: APP_ROUTES.USUARIOS.replace("/", ""),
          element: <RutaProtegida permiso={PERM_USUARIOS_VER}><UsuariosView /></RutaProtegida>,
        },
        {
          path: APP_ROUTES.ROLES.replace("/", ""),
          element: <RutaProtegida permiso={PERM_ROLES_VER}><RolesView /></RutaProtegida>,
        },
        {
          path: APP_ROUTES.ZONAS.replace("/", ""),
          element: <RutaProtegida permiso={PERM_ZONAS_VER}><ZonasView /></RutaProtegida>,
        },
        {
          path: APP_ROUTES.CAMARAS.replace("/", ""),
          element: <RutaProtegida permiso={PERM_CAMARAS_VER}><CamarasView /></RutaProtegida>,
        },
        {
          path: APP_ROUTES.TIPOS_EPP.replace("/", ""),
          element: <RutaProtegida permiso={PERM_TIPOS_EPP_VER}><TiposEPPView /></RutaProtegida>,
        },
        {
          path: APP_ROUTES.REPORTES.replace("/", ""),
          element: <RutaProtegida permiso={PERM_REPORTES_VER}><ReportesView /></RutaProtegida>,
        },
        {
          path: APP_ROUTES.DETECCION.replace("/", ""),
          element: <RutaProtegida permiso={PERM_DETECCION_VER}><DeteccionView /></RutaProtegida>,
        },
      ],
    },

    {
      path: "*",
      element: <Navigate to={APP_LOGIN} replace />,
    },
  ]);

  return <RouterProvider router={router} />;
};