# Reclama Pro — Directrices del Proyecto

## Qué es esto

CRM multi-tenant para Pymes. Permite que empresas gestionen reclamos de sus clientes. Cada empresa tiene su propio espacio aislado de datos. Los clientes acceden a sus reclamos mediante un link con token, sin necesidad de crear cuenta.

---

## Stack

- **Framework**: Next.js App Router — Pages Router descartado definitivamente. Server Components + Server Actions implementan el BFF sin capa API adicional.
- **Base de datos**: Cloud Firestore con modelo de subcolecciones jerárquicas
- **Auth**: Firebase Auth con Custom Claims para roles tenant-aware
- **Backend**: Patrón BFF — las Server Actions y Route Handlers de Next.js son el backend. No hay servidor separado ni Express.
- **SDK servidor**: `firebase-admin` — toda comunicación con Firestore ocurre en el servidor
- **Estado cliente**: SWR con `refreshInterval` (15–30s es el sweet spot para un CRM — balancea reactividad y costo de lecturas)
- **Estilos**: CSS Modules (Tailwind no instalado en scaffolding inicial — se agrega en feature de UI)
- **Deploy**: Vercel

Versiones exactas: ver `package.json`.

---

## Arquitectura de carpetas

```
src/
├── app/                        # Rutas Next.js (App Router)
│   ├── (auth)/                 # Grupo: rutas públicas — login, register. Layout propio.
│   ├── (panel)/                # Grupo: rutas protegidas — panel de admins y agentes. Layout propio.
│   └── [slug]/                 # Portal público del cliente — acceso por token sin login. Layout propio.
│
├── components/
│   └── ui/                     # Componentes base reutilizables: botones, inputs, badges (client-side)
│
├── lib/
│   ├── firebase/
│   │   └── admin.ts            # Singleton getFirebaseAdmin() y getDb() — SERVER ONLY
│   ├── actions/                # Server Actions — mutaciones: crear, actualizar, cerrar reclamos
│   └── queries/                # Funciones de lectura Firestore — SERVER ONLY
│
├── types/
│   └── index.ts                # Interfaces TypeScript del dominio (alineadas 1:1 con Firestore)
│
└── constants/
    └── index.ts                # CLAIM_CATEGORIES, CLAIM_STATUSES, CLAIM_ROLES
```

### Decisión de estructura: por rol de ejecución, no por feature

Alternativa descartada: estructura por feature (`/claims/`, `/auth/`). Se descartó porque genera ambigüedad cuando las features se solapan — no queda claro si una query de claims va en `/claims/queries/` o en `/queries/claims/`.

| Carpeta | Corre en | Puede importar Firebase |
|---|---|---|
| `lib/firebase/`, `lib/actions/`, `lib/queries/` | Servidor | Sí |
| `components/`, archivos con `"use client"` | Cliente | **No** |

### Layouts aislados por route group

Cada grupo tiene su propio `layout.tsx`. El layout de `(panel)` no aplica en `[slug]` y viceversa. Esto es intencional — el portal del cliente y el panel interno son aplicaciones visualmente distintas.

---

## Modelo de datos Firestore

Estructura de subcolecciones — cada empresa tiene datos completamente aislados:

```
enterprises/{enterpriseId}
  └── claims/{claimId}
        └── history/{entryId}
```

### Tipos principales (`src/types/index.ts`)

- `Enterprise` — tenant raíz, tiene `slug`, `plan` y `claimCounter`
- `EnterpriseUser` — usuario interno con `role: 'admin' | 'agent'`
- `Claim` — reclamo con `ticketNumber`, `status`, `accessToken` para el portal del cliente
- `HistoryEntry` — log de acciones sobre un reclamo
- `ClaimStatus` — `'open' | 'in_progress' | 'resolved' | 'closed'`
- `ClaimCategory` — `'defective_product' | 'delivery_delay' | 'poor_service' | 'billing_error' | 'warranty' | 'other'`

---

## Reglas críticas

### 1. Singleton de Firebase Admin
`getFirebaseAdmin()` en `src/lib/firebase/admin.ts` es el único punto de inicialización. **Nunca** llamar `initializeApp()` directamente en otro archivo. Razón: Next.js hace hot-reload en desarrollo y múltiples instancias rompen con `"Firebase app already exists"`.

### 2. firebase-admin es SERVER ONLY
Ningún archivo con `"use client"` puede importar desde `lib/firebase/`, `lib/actions/` o `lib/queries/`. Next.js lanzará error de bundle si esto ocurre.

### 3. Credenciales via `FIREBASE_SERVICE_ACCOUNT_JSON` — JSON completo, no variables individuales
La variable de entorno contiene el JSON completo del service account (no campos separados). Razón crítica: Vercel escapa incorrectamente el `\n` del `private_key` cuando se configura como variable individual, rompiendo la autenticación silenciosamente en producción. Con el JSON completo esto no ocurre.

En Vercel: Settings → Environment Variables → pegar el contenido íntegro del `serviceAccountKey.json`.

`.env.local` está en `.gitignore`. Existe `.env.local.example` como referencia. Nunca hardcodear credenciales.

### 4. TypeScript strict — sin excepciones
`"strict": true` en `tsconfig.json` no se toca. En casos edge usar `as` con comentario explicativo. No deshabilitar reglas de ESLint para silenciar errores de tipo.

### 5. Isolación multi-tenant en el BFF
Al verificar un token de Firebase Auth, los Custom Claims contienen el `enterpriseId`. Toda consulta a Firestore **debe** estar scoped bajo `enterprises/{enterpriseId}/...`. El agente A nunca puede leer datos del agente B.

### 6. Portal del cliente sin auth
El cliente accede vía `[slug]` + `accessToken` en la URL. La validación ocurre en el BFF comparando el token contra el documento en Firestore. No usa Firebase Auth.

---

## Convenciones de código

- **Server Actions**: archivos en `lib/actions/`, con `"use server"` al tope, nombrados en camelCase (`createClaim`, `updateClaimStatus`)
- **Queries**: funciones puras de lectura en `lib/queries/`, reciben `db: Firestore` como parámetro explícito — **no llaman `getDb()` internamente**. Razón: facilita testing y deja claro que son funciones puras sin side effects de inicialización.
- **Timestamps**: `FirebaseFirestore.Timestamp` en el servidor. Al serializar al cliente, convertir a ISO string. **Nunca pasar un `Timestamp` directamente a un Client Component** — React no puede serializar objetos Firestore.
- **IDs de Firestore**: siempre `string`, nunca `number`
- **Constantes de dominio**: usar `CLAIM_CATEGORIES[category]` y `CLAIM_STATUSES[status]` de `src/constants/index.ts` para mostrar labels en UI. Nunca strings literales en español inline.
- **Tipos union del dominio**: `ClaimStatus` y `ClaimCategory` son los tipos canónicos. No crear strings ad-hoc para status — TypeScript rechazará valores inválidos en compilación.

---

## Diseño y Sistema de Estilos

### Dos aplicaciones visualmente distintas

El proyecto tiene dos flujos con paletas y layouts completamente separados. No comparten layout ni colores primarios. Esto es intencional y debe mantenerse.

| Flujo | Route group | Color primario | Target |
|---|---|---|---|
| Panel Admin/Pyme | `(panel)/` + `(auth)/` | Azul `#1d4ed8` | Desktop — admins y agentes |
| Portal Cliente | `[slug]/` | Verde `#15803d` | Desktop y mobile — cliente final |

**La app es principalmente para desktop.** El panel admin usa sidebar fija de 220px. El portal del cliente es una card centrada con max-width de 680px (funciona en ambos).

---

### Paleta — Panel Admin/Pyme

```css
--color-sidebar:     #1d4ed8;  /* blue-700   — sidebar de navegación */
--color-cta:         #059669;  /* emerald-600 — botones de acción primaria (guardar, crear) */
--color-auth-bg:     #1e293b;  /* slate-800  — header en pantallas de auth */
--color-text:        #0f172a;  /* slate-900  — texto primario */
--color-text-muted:  #64748b;  /* slate-500  — texto secundario, labels, metadata */
--color-surface:     #f8fafc;  /* slate-50   — fondo del panel */
--color-card:        #ffffff;  /* blanco     — fondo de cards y tablas */
--color-border:      #e2e8f0;  /* slate-200  — bordes de cards, inputs, separadores */
```

### Paleta — Portal Cliente `[slug]/`

```css
--color-nav:     #15803d;  /* green-700 — navbar con nombre de la empresa */
--color-cta:     #16a34a;  /* green-600 — botón "Enviar comentario" */
--color-rating:  #b45309;  /* amber-700 — botón "Enviar valoración" */
--color-surface: #f8fafc;  /* slate-50  — fondo exterior */
--color-card:    #ffffff;  /* blanco    — card del reclamo */
```

### Estados de reclamo — compartidos por ambos flujos

Nunca usar colores inline para estados. Siempre derivar de `ClaimStatus`.

| Estado | `ClaimStatus` | Fondo | Texto |
|---|---|---|---|
| Abierto | `open` | `#dbeafe` blue-100 | `#1e40af` blue-800 |
| En proceso | `in_progress` | `#fef3c7` amber-100 | `#92400e` amber-800 |
| Resuelto | `resolved` | `#d1fae5` emerald-100 | `#065f46` emerald-800 |
| Cerrado | `closed` | `#fee2e2` red-100 | `#991b1b` red-800 |

---

### Layout del Panel Admin/Pyme

```
┌─────────────────────────────────────────────────┐
│  Sidebar (220px fijo)  │  Main content           │
│  ─────────────────────  │  ─────────────────────  │
│  Logo + nombre app     │  Page title + actions   │
│                        │                         │
│  ○ Dashboard           │  Stats / tabla / form   │
│  ● Reclamos (activo)   │                         │
│  ○ Reportes            │                         │
│                        │                         │
│  ── (bottom) ──────    │                         │
│  Avatar + nombre user  │                         │
└─────────────────────────────────────────────────┘
```

- La sidebar es `#1d4ed8` con links en `rgba(255,255,255,.65)` y el activo en `rgba(255,255,255,.15)`
- Las pantallas de `(auth)/` no tienen sidebar — formulario centrado sobre fondo `#f1f5f9`

### Pantallas del Panel Admin/Pyme

1. **Login** `(auth)/login` — card centrada, sin sidebar. Logo, email, contraseña, botón azul.
2. **Dashboard** `(panel)/dashboard` — 4 stat cards (total, abiertos, en proceso, rating promedio) + tabla de reclamos recientes.
3. **Gestión de reclamos** `(panel)/claims` — tabla completa con filtros de estado como tabs/pills y buscador. Botón "Nuevo reclamo".
4. **Crear reclamo** `(panel)/claims/new` — formulario en dos columnas. El agente ingresa nombre/email del cliente, categoría, descripción. El sistema genera el ticket y el `accessToken`.
5. **Detalle de reclamo** `(panel)/claims/[id]` — layout de dos columnas: izquierda (descripción + historial + campo de respuesta), derecha (sidebar con estado, datos del cliente, link del cliente).
6. **Reportes** `(panel)/reports` — 3 stat cards (total, resueltos, rating) + tabla por categoría. Exportar CSV.

---

### Cambio de estado — transiciones contextuales

**No usar un `<select>` con todos los estados.** En el detalle de un reclamo, mostrar solo los pasos siguientes válidos como botones de acción explícitos.

Flujo de estados permitido:
```
open → in_progress → resolved
                   → closed
resolved → closed
```

Botones según estado actual:

| Estado actual | Botones disponibles |
|---|---|
| `open` | "▶ Iniciar proceso" → `in_progress` |
| `in_progress` | "✓ Marcar como resuelto" → `resolved` &nbsp;/&nbsp; "✕ Cerrar sin resolver" → `closed` |
| `resolved` | "✕ Cerrar" → `closed` |
| `closed` | — (sin acciones de estado) |

Razón: un dropdown permite saltar estados accidentalmente y no comunica intención. Los botones contextuales son acciones deliberadas que reflejan el flujo real de trabajo.

---

### Portal Cliente `[slug]/`

**Una sola pantalla.** El cliente recibe un link único por reclamo — `/{enterpriseSlug}?token={accessToken}`. No hay lista de reclamos, no hay login, no hay navegación. Cada token da acceso a un único reclamo.

La pantalla tiene dos variantes según el estado del reclamo:

**Reclamo activo** (`open` / `in_progress`):
- Navbar verde con nombre de la empresa + número de ticket
- Card centrada (max-width 680px): ticket ID, título, estado badge, descripción, historial de comunicación, campo para agregar comentario

**Reclamo resuelto/cerrado** (`resolved` / `closed`):
- Igual que activo + sección de valoración al final
- Rating 1–5 estrellas + botón ámbar "Enviar valoración"
- La sección de valoración **solo aparece** cuando `status === 'resolved' || status === 'closed'`
- Solo se puede valorar una vez: `rating` pasa de `null` a un número. Una vez enviado, el campo desaparece.

**Lo que el cliente NO puede hacer:**
- Crear nuevos reclamos (solo el agente desde el panel)
- Ver otros reclamos (un token = un reclamo)
- Autenticarse con Firebase Auth

---

### Convenciones de componentes UI

- **CSS Modules** — un archivo `.module.css` por componente. Sin Tailwind (no instalado).
- **Variables CSS** — definir los tokens de color en `:root` dentro del `layout.tsx` de cada route group. Nunca hardcodear hex en componentes hoja.
- **Tipografía** — `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Sin Google Fonts.
- **Border radius** — cards: `8px`. Botones e inputs: `6px`. Badges (status pills): `9999px`.
- **Sombras** — cards flotantes (modales, portal cliente): `0 2px 16px rgba(0,0,0,.1)`. Cards dentro del panel: solo `border: 1px solid var(--color-border)`, sin sombra.
- **Referencia visual**: `preview-colores.html` en el escritorio muestra todas las pantallas con los colores y layouts definitivos. Consultarlo ante cualquier duda antes de crear componentes.

---

## Lo que NO está implementado aún

Esta lista se actualiza a medida que avanza el proyecto:

- [ ] Autenticación (Firebase Auth + Custom Claims)
- [ ] UI de cualquier tipo (cero componentes hasta ahora)
- [ ] Server Actions de mutación
- [ ] Queries de Firestore
- [ ] Portal del cliente (`[slug]`)
- [ ] Panel interno (`(panel)`)
- [ ] CI/CD / entornos staging
