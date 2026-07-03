# EPP Monitor - Frontend

Aplicacion web para el monitoreo de Equipos de Proteccion Personal (EPP) en una planta de reciclaje. Panel de control en tiempo real con deteccion de incumplimientos, gestion de alertas, analytics y administracion de tablas maestras/parametricas via CRUD.

---

## Tecnologias Utilizadas

| Tecnologia           | Version  | Proposito                                |
| -------------------- | -------- | ---------------------------------------- |
| **React**            | ^19.2.6  | Libreria de interfaz de usuario          |
| **TypeScript**       | ~6.0.2   | Tipado estatico                          |
| **Vite**             | ^8.0.12  | Bundler y dev server                     |
| **Tailwind CSS**     | ^4.3.0   | Estilos utilitarios                      |
| **Redux Toolkit**    | ^2.12.0  | Estado global (autenticacion)            |
| **React Redux**      | ^9.3.0   | Conexion React <-> Redux                 |
| **React Router DOM** | ^7.17.0  | Enrutamiento SPA                         |
| **Formik**           | ^2.4.9   | Manejo de formularios                    |
| **Yup**              | ^1.7.1   | Validacion de esquemas                   |
| **Axios**            | ^1.17.0  | Cliente HTTP                             |
| **Lucide React**     | ^1.17.0  | Iconografia                              |

---

## Estructura del Proyecto

```
front/
  index.html                          # Entry point HTML
  vite.config.ts                      # Configuracion de Vite + Tailwind
  package.json
  pnpm-lock.yaml
  .env                                # Variables de entorno (no versionado)
  public/
    favicon.svg
    icons.svg
  src/
    main.tsx                          # Punto de entrada React + Providers
    index.css                         # Tailwind v4 + tema
    components/
      ui/                             # Componentes base
        button.tsx
        input.tsx
      figma/
        ImageWithFallback.tsx
      crud/                           # Componentes reutilizables CRUD
        PageHeader.tsx
        CustomTable.tsx
        CustomPagination.tsx
        CustomInput.tsx
        CustomSelect.tsx
        CustomModal.tsx
        StatusBadge.tsx
        SearchBar.tsx
        ActionButtons.tsx
        ConfirmDialog.tsx
      CameraQRDialog.tsx
      DashboardCharts.tsx
      DeteccionOverlay.tsx
      PhoneCameraFeed.tsx
      VideoStream.tsx
    constants/
      authRoutesConstants.ts
      apiRoutesConstants.ts
      authServiceConstants.ts
      authStorageConstants.ts
    context/
      StreamContext.tsx
    controllers/
      useLogin.ts
      useForgotPassword.ts
      useResetPassword.ts
      useRoleSelector.ts
      useReportes.ts
    hooks/
      useCrud.ts
      useCrudForm.ts
      useVideoStream.ts
    models/
      auth.model.ts
      usuario.model.ts
      rol.model.ts
      zona.model.ts
      camara.model.ts
      tipo.model.ts
      sirena.model.ts
      reporte.model.ts
    services/
      api.ts
      auth.service.ts
      crud.service.ts
      usuario.service.ts
      rol.service.ts
      zona.service.ts
      camara.service.ts
      tipo.service.ts
      sirena.service.ts
      alerta.service.ts
      deteccion.services.ts
      reporte.service.ts
    store/
      index.ts
      authSlice.ts
    validators/
      login.schema.ts
      forgotPassword.schema.ts
      resetPassword.schema.ts
      password.rules.ts
      usuario.schema.ts
      rol.schema.ts
      zona.schema.ts
      camara.schema.ts
      tipo.schema.ts
      sirena.schema.ts
    views/
      LoginView.tsx
      ForgotPasswordView.tsx
      ResetPasswordView.tsx
      RoleSelectorView.tsx
      PhoneCameraView.tsx
      admin/
        AppLayout.tsx
        DashboardView.tsx
        ReporteView.tsx
        UsuariosView.tsx
        RolesView.tsx
        ZonasView.tsx
        CamarasView.tsx
        TiposEPPView.tsx
        SirenasView.tsx
    router/
      AppRouter.tsx
```

---

## Instalacion

### Requisitos

- **Node.js** >= 20
- **pnpm** >= 8 (recomendado)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd front

# 2. Instalar dependencias
pnpm install

# 3. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env segun sea necesario
# VITE_API_BASE_URL=http://127.0.0.1:8000

# 4. Iniciar servidor de desarrollo
pnpm dev
```

### Comandos disponibles

| Comando      | Descripcion                                     |
| ------------ | ----------------------------------------------- |
| pnpm dev     | Inicia servidor de desarrollo con HMR           |
| pnpm build   | Compila TypeScript + Vite build para produccion |
| pnpm preview | Previsualiza el build de produccion localmente  |
| pnpm lint    | Ejecuta ESLint                                  |

---

## Arquitectura

### Capas del Frontend

| Capa         | Carpeta        | Responsabilidad                               |
| ------------ | -------------- | --------------------------------------------- |
| Model        | models/        | Interfaces TypeScript y datos estaticos       |
| View         | views/         | Componentes de presentacion                   |
| Controller   | controllers/   | Hooks con logica de negocio (Formik, API)     |
| Hook         | hooks/         | Hooks genericos reutilizables (CRUD)          |
| Service      | services/      | Comunicacion HTTP con el backend              |
| Store        | store/         | Estado global con Redux Toolkit               |
| Validator    | validators/    | Esquemas Yup para validacion de formularios   |
| Component    | components/    | Componentes de UI reutilizables               |
| Constants    | constants/     | Constantes centralizadas                      |

### Flujo de datos (Autenticacion)

View -> Controller (useLogin) -> Service (auth.service) -> API (Axios) -> Backend
<- Response -> Redux Store -> Router (/dashboard)

### Flujo de datos (CRUD)

View -> Hook (useCrud) -> Service -> API (Axios) -> Backend
<- Response -> Componentes crud/ (CustomTable, Pagination, etc.)

---

## Flujo de Autenticacion

1. /login -> RoleSelector -> LoginView -> POST /auth/login
2. Backend responde con token + usuario
3. Redux loginAction + localStorage
4. Router navega a /dashboard

### Credenciales de prueba

admin@epp.com / admin123 (Rol: Administrador)

---

## Rutas de la Aplicacion

| Ruta                    | Acceso    | Descripcion                      |
| ----------------------- | --------- | -------------------------------- |
| /login                  | Publico   | Inicio de sesion                 |
| /forgot-password        | Publico   | Solicitar recuperacion           |
| /reset-password         | Publico   | Restablecer contrasena           |
| /                       | Protegido | Redirige a /dashboard            |
| /dashboard              | Protegido | Dashboard con KPIs               |
| /admin/usuarios         | Protegido | CRUD Usuarios                    |
| /admin/roles            | Protegido | CRUD Roles                       |
| /admin/zonas            | Protegido | CRUD Zonas                       |
| /admin/camaras          | Protegido | CRUD Camaras                     |
| /admin/tipos-epp        | Protegido | CRUD Tipos de EPP                |
| /admin/sirenas          | Protegido | CRUD Sirenas                     |
| /admin/reportes         | Protegido | Reportes y exportacion           |

---

## Layout (AppLayout)

Basado en el diseno de Figma. Sidebar con logo EPP MONITOR, badge del rol, navegacion contextual segun el rol (admin: todos los CRUDs), indicador de sesion, usuario al pie y boton de cerrar sesion. Header con buscador e indicador "Sistema en linea".
