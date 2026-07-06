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
import type { Rol } from "../models/auth.model";
import { ROL_LABELS } from "../models/auth.model";
import { ForgotPasswordView } from "../views/ForgotPasswordView";
import { LoginView } from "../views/LoginView";
import { PhoneCameraView } from "../views/PhoneCameraView";
import { ResetPasswordView } from "../views/ResetPasswordView";
import { RoleSelectorView } from "../views/RoleSelectorView";
import { AppLayout } from "../views/admin/AppLayout";
import { ChangePasswordFirstView } from "../views/ChangePasswordFirstView";
import { CamarasView } from "../views/admin/CamarasView";
import { DashboardView } from "../views/admin/DashboardView";
import { ReportesView } from "../views/admin/ReporteView";
import { RolesView } from "../views/admin/RolesView";
import { TiposEPPView } from "../views/admin/TiposEPPView";
import { UsuariosView } from "../views/admin/UsuariosView";
import { ZonasView } from "../views/admin/ZonasView";
import { DeteccionView } from "../views/admin/DeteccionView";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  return <ForgotPasswordView onBackToLogin={() => navigate(APP_LOGIN)} />;
};

const AuthRoutes = () => {
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const navigate = useNavigate();

  if (!selectedRol) {
    return <RoleSelectorView onSelect={setSelectedRol} />;
  }

  return (
    <LoginView
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
      element: <ResetPasswordView />,
    },
    {
      path: APP_CAMBIAR_CONTRASENA,
      element: <ChangePasswordFirstView />,
    },
    {
      path: "/phone-camera/:camaraId",
      element: <PhoneCameraView />,
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
          element: <DashboardView />,
        },
        {
          path: APP_ROUTES.USUARIOS.replace("/", ""),
          element: <UsuariosView />,
        },
        {
          path: APP_ROUTES.ROLES.replace("/", ""),
          element: <RolesView />,
        },
        {
          path: APP_ROUTES.ZONAS.replace("/", ""),
          element: <ZonasView />,
        },
        {
          path: APP_ROUTES.CAMARAS.replace("/", ""),
          element: <CamarasView />,
        },
        {
          path: APP_ROUTES.TIPOS_EPP.replace("/", ""),
          element: <TiposEPPView />,
        },
        {
          path: APP_ROUTES.REPORTES.replace("/", ""),
          element: <ReportesView />,
        },
        {
          path: APP_ROUTES.DETECCION.replace("/", ""),
          element: <DeteccionView />,
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