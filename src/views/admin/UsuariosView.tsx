import { Plus } from "lucide-react";
import { useMemo } from "react";

import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/crud/ConfirmDialog";
import { PageHeader } from "../../components/crud/PageHeader";
import { useCrud } from "../../hooks/useCrud";
import { useCrudForm } from "../../hooks/useCrudForm";
import { usePermission } from "../../hooks/usePermissions";
import { PERM_USUARIOS_CREAR, PERM_USUARIOS_EDITAR, PERM_USUARIOS_ELIMINAR } from "../../constants/permissionsConstants";
import { usuarioService } from "../../services/usuario.service";
import { buildUsuarioSchema } from "../../validators/usuario.schema";
import { UsuariosTable } from "./components/UsuariosTable";
import { UsuariosForm } from "./components/UsuariosForm";

import type { UsuarioFormValues } from "../../validators/usuario.schema";

import type {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
} from "../../models/usuario.model";

const INITIAL_VALUES: UsuarioFormValues = {
  nombre: "",
  apelido: "",
  correo: "",
  id_rol: "",
  cedula: "",
};

const FIELD_MAPPING: Record<string, string> = {
  nombre: "nombre",
  apelido: "apelido",
  correo: "correo",
  id_rol: "id_rol",
  cedula: "cedula",
};

const PAGE_SIZE = 8;

export const UsuariosView = () => {
  const crud = useCrud<Usuario, UsuarioCreate, UsuarioUpdate>(usuarioService, {
    pageSize: PAGE_SIZE,
  });

  const puedeCrear = usePermission(PERM_USUARIOS_CREAR);
  const puedeEditar = usePermission(PERM_USUARIOS_EDITAR);
  const puedeEliminar = usePermission(PERM_USUARIOS_ELIMINAR);

  const usuarioSchema = useMemo(
    () => buildUsuarioSchema(crud.isEditing),
    [crud.isEditing],
  );

  const { formik, handleSubmit: handleFormSubmit } =
    useCrudForm<UsuarioFormValues>({
      isEditing: crud.isEditing,
      editingItem: crud.editingItem as unknown as Record<
        string,
        unknown
      > | null,
      validationSchema: usuarioSchema,
      initialValues: INITIAL_VALUES,
      fieldMapping: FIELD_MAPPING,
      onSubmit: async (values) => {
        if (crud.isEditing) {
          const updateData: UsuarioUpdate = {
            nombre: values.nombre,
            apelido: values.apelido,
            correo: values.correo,
            cedula: values.cedula?.trim() || undefined,
          };
          await crud.handleSubmit(updateData);
        } else {
          const createData: UsuarioCreate = {
            nombre: values.nombre,
            apelido: values.apelido,
            correo: values.correo,
            id_rol: Number(values.id_rol),
            cedula: values.cedula ?? "",
          };
          await crud.handleSubmit(createData);
        }
      },
    });

  const filteredItems = useMemo(() => {
    const q = crud.filters.query.toLowerCase().trim();
    if (!q) return crud.items;
    return crud.items.filter((u) =>
      `${u.nombre} ${u.apelido} ${u.correo} ${u.cedula ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [crud.items, crud.filters.query]);

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Administre los usuarios del sistema"
        action={
          puedeCrear ? (
            <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={crud.openCreateModal}>
              Nuevo Usuario
            </Button>
          ) : undefined
        }
      />

      <UsuariosTable
        items={filteredItems}
        page={crud.page}
        totalPages={crud.totalPages}
        total={filteredItems.length}
        query={crud.filters.query}
        pageSize={PAGE_SIZE}
        startIndex={(crud.page - 1) * PAGE_SIZE}
        onSearch={crud.handleSearch}
        onPageChange={crud.handlePageChange}
        puedeEditar={puedeEditar}
        puedeEliminar={puedeEliminar}
        onEdit={(usuario) => crud.openEditModal(usuario)}
        onDelete={(id) => crud.confirmDelete(id)}
      />

      <UsuariosForm
        open={crud.modalOpen}
        isEditing={crud.isEditing}
        onClose={crud.closeModal}
        formik={formik}
        onSubmit={handleFormSubmit}
        submitLoading={crud.submitLoading}
        error={crud.error}
      />

      <ConfirmDialog
        open={crud.deleteConfirmOpen}
        title="Eliminar Usuario"
        message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
        onConfirm={crud.handleDelete}
        onCancel={crud.cancelDelete}
        loading={crud.deleteLoading}
      />
    </div>
  );
};
