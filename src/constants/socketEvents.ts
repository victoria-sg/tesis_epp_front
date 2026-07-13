export const SIO_EVENT_FRAME = "frame" as const;
export const SIO_EVENT_SUBSCRIBE_CAMARA = "subscribe:camara" as const;
export const SIO_EVENT_UNSUBSCRIBE_CAMARA = "unsubscribe:camara" as const;
export const SIO_EVENT_NUEVA_ALERTA = "nueva-alerta" as const;
export const SIO_EVENT_SEND_FRAME = "send:frame" as const;
export const SIO_EVENT_DETECCION_FRAME = "deteccion:frame" as const;
export const SIO_EVENT_DETECCION_RESULT = "deteccion:result" as const;

export const SIO_NAMESPACE_ALERTAS = "/alertas" as const;
export const SIO_NAMESPACE_VINCULACION = "/vinculacion" as const;

export const SIO_EVENT_NUEVA_VINCULACION = "nueva-vinculacion" as const;
export const SIO_EVENT_VINCULACION_APROBADA = "vinculacion:aprobada" as const;
export const SIO_EVENT_VINCULACION_RECHAZADA = "vinculacion:rechazada" as const;
