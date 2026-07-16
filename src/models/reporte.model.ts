export interface AlertaReporte {
  id_alerta: number;
  fecha_hora_deteccion: string | null;
  segundos_transcurridos: number | null;
  estado_alerta: string | null;
  codigo_camara: string;
  nombre_zona: string;
  captura_frame: string | null;
  detalle_infraccion: string | null;
  comentario_resolucion: string | null;
  fecha_hora_resolucion: string | null;
  resuelto_por: string | null;
}

export interface ReporteTurnoResumen {
  fecha_inicio: string;
  fecha_fin: string;
  total_alertas: number;
  pendientes: number;
  resueltas: number;
  descartadas: number;
  cumplimiento: number;
}

export interface ReporteTurnoZona {
  zona: string;
  alertas: number;
}

export interface ReporteTurno {
  resumen: ReporteTurnoResumen;
  zonas: ReporteTurnoZona[];
  alertas: AlertaReporte[];
}

export interface ReporteTurnoEmitido extends ReporteTurno {
  id_reporte: number;
  fecha_emision: string;
  emitido_por: string;
}
