## Context

Reclama Pro es un CRM multi-tenant para Pymes chilenas, construido sobre Next.js 15 App Router con patrón BFF (Backend for Frontend). El backend no es un servicio separado: son las Route Handlers y Server Actions de Next.js, que usan `firebase-admin` en el servidor para comunicarse con Cloud Firestore. El cliente nunca toca Firebase directamente.

El proyecto parte desde cero. No hay código previo ni migraciones que considerar.

## Goals / Non-Goals

**Goals:**
- Inicializar el proyecto con `create-next-app` + TypeScript estricto
- Establecer la convención de carpetas para toda la vida del proyecto
- Configurar `firebase-admin` con un singleton seguro (una sola instancia)
- Tipar el modelo de datos Firestore completo en TypeScript
- Definir constantes del dominio reutilizables en toda la app

**Non-Goals:**
- Implementar autenticación (feature separada)
- Crear páginas o componentes de UI
- Conectar a Firebase con datos reales de producción
- Configurar CI/CD o entornos de staging

## Decisions

### D1 — Next.js 15 App Router (no Pages Router)
El proyecto usa exclusivamente App Router. Razón: Server Components y Server Actions permiten implementar el BFF sin una capa API adicional. Pages Router descartado porque requeriría `/api/` routes para todo, duplicando trabajo.

### D2 — Estructura de carpetas: por rol de ejecución, no por feature
```
src/
  app/              # Rutas Next.js (App Router)
  components/       # Componentes React (client)
  lib/
    firebase/       # Inicialización firebase-admin (server only)
    actions/        # Server Actions (server only)
    queries/        # Funciones de lectura Firestore (server only)
  types/            # Interfaces TypeScript del dominio
  constants/        # Constantes del dominio (categorías, estados, roles)
```
Alternativa descartada: estructura por feature (`/claims/`, `/auth/`). Genera ambigüedad sobre dónde va cada archivo cuando features se solapan.

### D3 — Singleton de Firebase Admin con lazy initialization
```typescript
// lib/firebase/admin.ts
let app: App;
export function getFirebaseAdmin(): App {
  if (!app) app = initializeApp({ credential: cert(serviceAccount) });
  return app;
}
```
Razón: Next.js en desarrollo hace hot-reload y sin singleton se crean múltiples instancias de Firebase, lanzando el error `"Firebase app already exists"`.

### D4 — Variables de entorno via `.env.local`, nunca hardcodeadas
Las credenciales de Firebase (serviceAccountKey) se pasan como variables de entorno. El archivo `.env.local` va en `.gitignore`. Se provee `.env.local.example` con los nombres de las variables sin valores.

### D5 — Tipos TypeScript alineados 1:1 con Firestore
Cada colección tiene su interfaz. Los IDs de Firestore se representan como `string`. Los `Timestamp` de Firestore se mapean a `FirebaseFirestore.Timestamp` en el servidor y a `string` (ISO) cuando se serializan al cliente.

## Risks / Trade-offs

- **Credenciales en desarrollo** → El dev debe crear su propio proyecto Firebase y descargar el service account. Mitigación: documentar en README con pasos exactos.
- **Strict TypeScript puede rechazar código válido** → En casos edge usar `as` con comentario explicativo. No deshabilitar `strict` en `tsconfig.json`.
- **`firebase-admin` importado en Client Component** → Next.js lanzará error de bundle. Mitigación: todos los archivos de `lib/firebase/`, `lib/actions/` y `lib/queries/` tienen `"use server"` o son importados solo desde Server Components. Nunca importar desde archivos con `"use client"`.
