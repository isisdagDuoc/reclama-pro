# Modelo de Datos — Reclama Pro
> Versión MVP. Documento de referencia para implementación y agentes.

---

## Colección raíz: `enterprises`
Documento: `{enterpriseId}` (auto-generado por Firestore)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `name` | string | Nombre comercial de la empresa. |
| `slug` | string | Identificador para URL pública del cliente (ej: `techstore-chile`). |
| `plan` | string | Nivel de suscripción: `basic` · `pro` · `enterprise`. |
| `createdAt` | timestamp | Fecha de registro de la empresa. |
| `claimCounter` | number | Contador atómico para generación de `ticketNumber` secuencial. Inicia en `0`. |

---

## Subcolección: `enterprises/{enterpriseId}/users`
Empleados con acceso al panel administrativo. Creados vía Firebase Auth + registro en esta subcolección.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `name` | string | Nombre completo del usuario. |
| `email` | string | Correo electrónico (debe coincidir con Firebase Auth). |
| `role` | string | `admin` (control total) · `agent` (gestión de casos). |

---

## Subcolección: `enterprises/{enterpriseId}/claims`
Un documento por cada reclamo generado.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `ticketNumber` | string | Código legible secuencial por empresa (ej: `REQ-1024`). Generado via transacción sobre `claimCounter`. |
| `status` | string | `open` · `in_progress` · `resolved` · `closed` |
| `category` | string | Key de categoría fija (ver tabla de categorías más abajo). |
| `subject` | string | Motivo del reclamo (texto corto). |
| `description` | string | Detalle completo del reclamo (texto largo). |
| `customerName` | string | Nombre del cliente final. |
| `customerEmail` | string | Email del cliente para notificaciones futuras. |
| `accessToken` | string | Hash secreto para acceso sin login del cliente al portal público. |
| `rating` | number · null | Valoración del cliente: `1`–`5`. `null` hasta que el cliente la envíe. Solo editable una vez, post-resolución. |
| `createdAt` | timestamp | Fecha de creación del reclamo. |
| `updatedAt` | timestamp | Última modificación del estado. |

### Categorías fijas de reclamo

Estas categorías son constantes del sistema (hardcoded en el frontend/BFF). El modelo almacena solo la key en inglés.

| Key (almacenada) | Label para el usuario |
| :--- | :--- |
| `defective_product` | Producto defectuoso |
| `delivery_delay` | Retraso en entrega |
| `poor_service` | Mal servicio al cliente |
| `billing_error` | Error en cobro / facturación |
| `warranty` | Garantía |
| `other` | Otro |

---

## Subcolección: `enterprises/{enterpriseId}/claims/{claimId}/history`
Logs de auditoría y comunicación del reclamo.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `action` | string | Descripción del evento (ej: `"Estado cambiado a Resuelto"`, `"Agente respondió al cliente"`). |
| `authorId` | string | UID del usuario (agente) que realizó la acción. |
| `timestamp` | timestamp | Fecha y hora del evento. |

---

## Notas de implementación

### Ticket secuencial (BFF — Firestore Transaction)
```
1. Leer enterprise doc → obtener claimCounter actual
2. ticketNumber = `REQ-${claimCounter + 1}`
3. Escribir nuevo claim con ese ticketNumber
4. Actualizar enterprise.claimCounter += 1
Todo dentro de una transacción atómica para evitar duplicados.
```

### Rating — garantía de una sola valoración (Server Action)
```
1. Leer claim doc
2. Si rating !== null → rechazar (409 Conflict)
3. Si rating === null Y status === 'resolved' | 'closed' → actualizar
La protección está en el servidor, no en el cliente.
```

### Reportes — sin colecciones extra
Los reportes se generan en el BFF consultando `enterprises/{id}/claims` con filtros de fecha.
La agregación por `category` y por `createdAt` se realiza en JavaScript server-side.
El campo `rating` alimenta el KPI de satisfacción promedio.

---

## Fuera del MVP
- Notificaciones por email (campo `customerEmail` existe para v2)
- Adjuntos / fotos en reclamos
- Urgency / prioridad de reclamo
- Cuentas de cliente (acceso solo por `accessToken`)
- Super-admin view (gestión directa en Firebase Console)
- Exportar CSV
