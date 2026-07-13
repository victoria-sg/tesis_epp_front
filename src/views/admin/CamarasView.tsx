import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "../../components/ui/Button";
import { DialogoQRCamara } from "../../components/auth/DialogoQRCamara";
import { ConfirmDialog } from "../../components/crud/ConfirmDialog";
import { PageHeader } from "../../components/crud/PageHeader";
import { useCrud } from "../../hooks/useCrud";
import { useCrudForm } from "../../hooks/useCrudForm";
import { usePermission } from "../../hooks/usePermissions";
import { PERM_CAMARAS_CREAR, PERM_CAMARAS_EDITAR, PERM_CAMARAS_ELIMINAR } from "../../constants/permissionsConstants";
import { camaraService } from "../../services/camara.service";
import { zonaService } from "../../services/zona.service";
import { camaraSchema } from "../../validators/camara.schema";

import type { CamaraFormValues } from "../../validators/camara.schema";
import type { Camara, CamaraCreate, CamaraUpdate } from "../../models/camara.model";
import type { Zona } from "../../models/zona.model";

import { CamarasForm } from "./components/CamarasForm";
import { CamarasTable } from "./components/CamarasTable";

const INITIAL_VALUES: CamaraFormValues = {
  id_zona: 0,
  codigo_camara: "",
  tipo_fuente: "hikvision",
  ip_direccion: "",
  puerto: 554,
  usuario_rtsp: "",
  password_rtsp: "",
};

const FIELD_MAPPING: Record<string, string> = {
  id_zona: "id_zona",
  codigo_camara: "codigo_camara",
  tipo_fuente: "tipo_fuente",
  ip_direccion: "ip_direccion",
  puerto: "puerto",
  usuario_rtsp: "usuario_rtsp",
  password_rtsp: "password_rtsp",
};

const PAGE_SIZE = 10;

export const CamarasView = () => {
  const crud = useCrud<Camara, CamaraCreate, CamaraUpdate>(camaraService, {
    pageSize: PAGE_SIZE,
  });

  const puedeCrear = usePermission(PERM_CAMARAS_CREAR);
  const puedeEditar = usePermission(PERM_CAMARAS_EDITAR);
  const puedeEliminar = usePermission(PERM_CAMARAS_ELIMINAR);

  const [qrCamara, setQrCamara] = useState<Camara | null>(null);
  const [zonas, setZonas] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    zonaService.getAll().then((data) =>
      setZonas(data.map((z: Zona) => ({ value: z.id_zona, label: z.nombre_zona })))
    ).catch(() => {});
  }, []);

  const { formik, handleSubmit: handleFormSubmit } =
    useCrudForm<CamaraFormValues>({
      isEditing: crud.isEditing,
      editingItem: crud.editingItem as unknown as Record<string, unknown> | null,
      validationSchema: camaraSchema,
      initialValues: INITIAL_VALUES,
      fieldMapping: FIELD_MAPPING,
      onSubmit: async (values) => {
        if (crud.isEditing && crud.editingItem) {
          const data: CamaraUpdate = {
            ...values,
            ip_direccion: values.ip_direccion || null,
            puerto: values.puerto || null,
            usuario_rtsp: values.usuario_rtsp || null,
            password_rtsp: values.password_rtsp || null,
          };
          await crud.handleSubmit(data, crud.editingItem.id_camara);
        } else {
          const data: CamaraCreate = {
            ...values,
            ip_direccion: values.ip_direccion || null,
            puerto: values.puerto || null,
            usuario_rtsp: values.usuario_rtsp || null,
            password_rtsp: values.password_rtsp || null,
          };
          await crud.handleSubmit(data);
        }
      },
    });

  const filteredItems = useMemo(() => {
    const q = crud.filters.query.toLowerCase().trim();
    if (!q) return crud.items;
    return crud.items.filter((c) =>
      `${c.codigo_camara} ${c.ip_direccion ?? ""} ${c.puerto ?? ""} ${c.zona_nombre ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [crud.items, crud.filters.query]);

  return (
    <div>
      <PageHeader
        title="Cámaras"
        subtitle="Administre las cámaras del sistema"
        action={
          puedeCrear ? (
            <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={crud.openCreateModal}>
              Nueva Cámara
            </Button>
          ) : undefined
        }
      />

      <CamarasTable
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
        onEdit={crud.openEditModal}
        onDelete={(id) => crud.confirmDelete(id)}
        onQrClick={(c) => setQrCamara(c)}
      />

      <CamarasForm
        open={crud.modalOpen}
        isEditing={crud.isEditing}
        onClose={crud.closeModal}
        formik={formik}
        onSubmit={handleFormSubmit}
        submitLoading={crud.submitLoading}
        error={crud.error}
        zonas={zonas}
      />

      {qrCamara && (
        <DialogoQRCamara
          open={qrCamara !== null}
          onClose={() => setQrCamara(null)}
          camaraId={qrCamara.id_camara}
          codigoCamara={qrCamara.codigo_camara}
        />
      )}

      <ConfirmDialog
        open={crud.deleteConfirmOpen}
        title="Eliminar Cámara"
        message="¿Estás seguro de eliminar esta cámara? Esta acción no se puede deshacer."
        onConfirm={crud.handleDelete}
        onCancel={crud.cancelDelete}
        loading={crud.deleteLoading}
      />
    </div>
  );
};
