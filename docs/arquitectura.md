# Arquitectura — Reclama Pro

## Descripción general

Reclama Pro es un CRM multi-tenant para Pymes chilenas. Permite que empresas gestionen reclamos de sus clientes desde un panel privado, mientras los clientes acceden al estado de su caso mediante un link único sin necesidad de crear una cuenta.

El sistema tiene **dos aplicaciones en un mismo repositorio**, con layouts, paletas de color y experiencias de usuario completamente distintas:

| Aplicación | Ruta | Usuarios |
|---|---|---|
| Panel Admin / Pyme | `/dashboard`, `/claims`, `/reports` | Administradores y agentes de la empresa |
| Portal del cliente | `/{slug}?token=...` | Cliente final que ingresó el reclamo |

---

## Stack

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | Next.js 16.2 App Router | Server Components + Server Actions como BFF sin servidor separado |
| Lenguaje | TypeScript (strict) | Tipado fuerte en todo el dominio |
| Base de datos | Cloud Firestore | Modelo de subcolecciones jerárquicas, escalable por empresa |
| SDK servidor | `firebase-admin` | Solo corre en el servidor — nunca en el browser |
| Autenticación | Firebase Auth | Custom Claims para roles y tenant ID |
| Deploy | Vercel | Integración nativa con Next.js |

---

## Patrón BFF (Backend for Frontend)

El servidor de Next.js actúa como intermediario entre el navegador y Firebase. El browser **nunca** se conecta directamente a Firestore.

```
Browser
  │
  ├── GET /claims          →  Server Component  →  lib/queries/  →  Firestore
  ├── POST (form submit)   →  Server Action     →  lib/actions/  →  Firestore
  └── Cookie de sesión     →  proxy.ts          →  Firebase Auth (verifica JWT)
```

**Ventajas de este patrón:**
- Las credenciales de Firebase Admin nunca llegan al cliente
- La lógica de negocio (validaciones, autorización por tenant) vive en el servidor
- Un agente no puede manipular el cliente para ver datos de otra empresa

---

## Estructura de carpetas

```
src/
├── app/                          # Rutas Next.js (App Router)
│   ├── (auth)/                   # Login, registro, recuperar contraseña — sin sidebar
│   ├── (panel)/                  # Panel protegido — dashboard, claims, reports
│   │   ├── dashboard/
│   │   ├── claims/
│   │   │   ├── [id]/             # Detalle de reclamo
│   │   │   └── new/              # Crear reclamo
│   │   └── reports/
│   ├── [slug]/                   # Portal público del cliente
│   ├── not-found.tsx             # Página 404 global
│   └── layout.tsx                # Layout raíz
│
├── components/
│   └── ui/                       # Componentes reutilizables (Client Components)
│
├── lib/
│   ├── firebase/
│   │   ├── admin.ts              # Singleton getFirebaseAdmin() — SERVER ONLY
│   │   └── client.ts             # Singleton getFirebaseApp() — browser SDK
│   ├── auth/
│   │   └── session.ts            # getSessionUser() y getSessionUserOrNull()
│   ├── actions/                  # Server Actions — mutaciones (crear, actualizar, cerrar)
│   └── queries/                  # Funciones de lectura Firestore — SERVER ONLY
│
├── types/
│   └── index.ts                  # Interfaces TypeScript alineadas 1:1 con Firestore
│
└── constants/
    └── index.ts                  # CLAIM_STATUSES, CLAIM_CATEGORIES, CLAIM_ROLES
```

**Regla de importación:**

| Carpeta | Ejecuta en | Puede importar firebase-admin |
|---|---|---|
| `lib/firebase/admin.ts`, `lib/actions/`, `lib/queries/` | Servidor | Sí |
| `components/`, archivos con `"use client"` | Browser | **No** |

---

## Autenticación y sesión

El sistema usa **Firebase Auth + Session Cookies HttpOnly** (no localStorage). El flujo completo:

```
1. Login page  →  signInWithEmailAndPassword()          [browser, Firebase Client SDK]
2.             →  credential.user.getIdToken()           [browser]
3.             →  Server Action login(idToken)            [servidor]
4.             →  admin.auth().verifyIdToken(idToken)     [servidor]
5.             →  admin.auth().createSessionCookie(...)   [servidor]
6.             →  Set-Cookie: session (HttpOnly, 7 días)  [respuesta HTTP]
7. Cada request →  proxy.ts verifica la cookie            [servidor]
8.             →  verifySessionCookie() → enterpriseId + role
```

Las sesiones sin `enterpriseId` en sus Custom Claims son rechazadas y redirigidas a `/login`.

---

## Aislación multi-tenant

Cada empresa tiene sus datos completamente aislados bajo `enterprises/{enterpriseId}`. Al verificar la sesión, el `enterpriseId` se extrae del JWT — no viene del cliente. Toda query a Firestore usa ese ID del servidor:

```typescript
// lib/auth/session.ts — el enterpriseId viene del JWT verificado, no del request
const { enterpriseId } = await getSessionUser()

// lib/queries/claims.ts — toda query está scopeada al tenant
db.collection('enterprises').doc(enterpriseId).collection('claims')
```

Un agente no puede ver datos de otra empresa aunque manipule las URLs.

---

## Portal del cliente (sin autenticación)

El cliente accede a su reclamo mediante un link único: `/{slug}?token={accessToken}`. El `accessToken` es un UUID generado al crear el reclamo. La validación ocurre en el BFF comparando el token de la URL contra el documento en Firestore — sin Firebase Auth.

---

## Actualización en tiempo real

Ambas vistas (portal del cliente y panel de detalle de reclamo) incluyen un componente `<AutoRefresh />` que llama `router.refresh()` cada 20 segundos. Esto fuerza un re-render de los Server Components con datos frescos de Firestore, sin convertir las páginas en Client Components ni crear Route Handlers adicionales.

Cuando un agente responde, se revalidan ambos paths (`/claims/[id]` y el portal `/[slug]`) para que la contraparte vea el mensaje en el próximo ciclo de refresh.
