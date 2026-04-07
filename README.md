# Reclama Pro

Plataforma web multi-tenant para la gestión de tickets de reclamos orientada a Pymes chilenas. Permite a las empresas centralizar y dar trazabilidad a los requerimientos de sus clientes de forma eficiente.

---

## Índice

- [Descripción](#descripción)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Especificación técnica](#especificación-técnica)
- [Modelo de datos](#modelo-de-datos)
- [Comenzar a desarrollar →](./GETTING_STARTED.md)

---

## Descripción

Reclama Pro es un CRM que conecta a los clientes finales con las empresas a través de un portal de reclamos público. Los agentes y administradores gestionan los casos desde un panel privado con trazabilidad completa del estado de cada ticket.

**Funcionalidades clave del MVP:**
- Portal público por empresa (URL con slug único)
- Panel administrativo con roles: `admin` y `agent`
- Ciclo de vida de reclamos: `open → in_progress → resolved → closed`
- Numeración secuencial de tickets por empresa (`REQ-1`, `REQ-2`, …)
- Historial de auditoría por reclamo
- Valoración del cliente post-resolución (1–5)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (strict) |
| Base de datos | Cloud Firestore |
| SDK servidor | firebase-admin |
| Autenticación | Firebase Auth |
| Data fetching | SWR |
| Deploy | Vercel |
| Linting | ESLint |

---

## Arquitectura

El proyecto sigue el patrón **BFF (Backend for Frontend)**. El servidor de Next.js actúa como intermediario entre el cliente y Firebase — el navegador nunca se conecta directamente a Firestore.

```
Browser
  │
  ├── Server Components  ──▶  lib/queries/   ──▶  Firestore
  ├── Server Actions     ──▶  lib/actions/   ──▶  Firestore
  └── Route Handlers     ──▶  lib/firebase/  ──▶  Firebase Auth
```

**Estructura de carpetas:**

```
src/
├── app/
│   ├── (auth)/        # Rutas de login / registro
│   ├── (panel)/       # Panel administrativo (protegido)
│   └── [slug]/        # Portal público del cliente
├── components/
│   └── ui/            # Componentes React reutilizables
├── lib/
│   ├── firebase/      # Singleton firebase-admin (solo servidor)
│   ├── actions/       # Server Actions (escrituras a Firestore)
│   └── queries/       # Funciones de lectura Firestore
├── types/             # Interfaces TypeScript del dominio
└── constants/         # Categorías, estados y roles del sistema
```

---

## Especificación técnica

### Singleton de Firebase Admin

`firebase-admin` se inicializa una sola vez mediante un singleton con lazy initialization. Esto evita el error `"Firebase App already exists"` durante los hot-reloads de Next.js en desarrollo.

```typescript
// src/lib/firebase/admin.ts
export function getFirebaseAdmin(): App { ... }
export function getDb(): Firestore { ... }
```

> **Regla crítica:** nunca importar `lib/firebase/admin.ts` desde un archivo con `"use client"`. Expone credenciales y rompe el build.

### Credenciales (compatible con Vercel)

Las credenciales de Firebase se pasan como un único JSON en la variable de entorno `FIREBASE_SERVICE_ACCOUNT_JSON`. Este enfoque evita el bug de Vercel donde el `private_key` (que contiene `\n`) se escapa incorrectamente al configurar variables individuales.

### Tickets secuenciales

La numeración `REQ-N` se genera mediante una **Firestore Transaction** sobre el campo `claimCounter` del documento de empresa. Garantiza unicidad sin duplicados bajo carga concurrente.

### Actualización de estado (SWR)

El estado de los reclamos se revalida mediante SWR. Al mutar un reclamo desde un Server Action, SWR actualiza la UI sin recargar la página, manteniendo toda la lógica en el servidor.

### Seguridad multi-tenant

El BFF inyecta automáticamente el `enterpriseId` de la sesión en cada consulta a Firestore. Un agente de la Empresa A nunca puede acceder a datos de la Empresa B, incluso manipulando el cliente.

---

## Modelo de datos

Firestore — estructura de colecciones:

```
enterprises/
└── {enterpriseId}/
    ├── name, slug, plan, createdAt, claimCounter
    ├── users/
    │   └── {userId}  →  name, email, role
    └── claims/
        └── {claimId}  →  ticketNumber, status, category, subject,
                          description, customerName, customerEmail,
                          accessToken, rating, createdAt, updatedAt
            └── history/
                └── {entryId}  →  action, authorId, timestamp
```

**Estados de un reclamo:**

```
open  ──▶  in_progress  ──▶  resolved  ──▶  closed
```

**Categorías disponibles:** `defective_product` · `delivery_delay` · `poor_service` · `billing_error` · `warranty` · `other`

---

## Equipo

| Usuario | Rol |
|---------|-----|
| [@isisdagduoc](https://github.com/isisdagduoc) | Autora |
| [@GisDuoc](https://github.com/GisDuoc) | Autor |
| [@Marcelocarrascoduoc](https://github.com/Marcelocarrascoduoc) | Autor |

---

## Comenzar a desarrollar

Consulta la **[Guía de inicio](./GETTING_STARTED.md)** para configurar el entorno local paso a paso.
