## Why

Reclama Pro parte desde cero. Antes de construir cualquier feature se necesita una base sólida: proyecto Next.js inicializado con la arquitectura de carpetas correcta, Firebase Admin SDK configurado y el modelo de datos definido como tipos TypeScript. Sin esto, cada feature siguiente tendría que asumir convenciones en lugar de seguirlas.

## What Changes

- Inicialización del proyecto Next.js 15 con App Router y TypeScript estricto
- Estructura de carpetas que separa BFF (server), cliente y dominio
- Instalación y configuración de `firebase-admin` con variables de entorno
- Definición de tipos TypeScript que reflejan el modelo de datos de Firestore
- Constantes del dominio: categorías de reclamo, estados, roles
- Configuración base de ESLint con reglas del proyecto

## Capabilities

### New Capabilities
- `project-setup`: Inicialización de Next.js 15, TypeScript, ESLint y estructura base del repositorio
- `folder-architecture`: Convención de carpetas para App Router + BFF pattern (server/client/domain separation)
- `firebase-setup`: Instalación de `firebase-admin`, singleton de inicialización, variables de entorno y tipos de conexión
- `data-model-types`: Tipos TypeScript e interfaces que mapean las colecciones Firestore (`Enterprise`, `ClaimUser`, `Claim`, `HistoryEntry`) y constantes del dominio (`CLAIM_CATEGORIES`, `CLAIM_STATUSES`)

### Modified Capabilities
<!-- No hay specs previas — proyecto nuevo -->

## Impact

- **Archivos nuevos**: `package.json`, `tsconfig.json`, `.eslintrc`, `next.config.ts`, estructura de carpetas completa, `lib/firebase/admin.ts`, `types/index.ts`, `constants/index.ts`
- **Dependencias externas**: `firebase-admin`, `next@15`, `typescript`, `eslint`
- **Sin breaking changes** — base verde, nada existente se modifica
