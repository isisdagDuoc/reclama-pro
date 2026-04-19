## Why

El proyecto no tiene ninguna capa de autenticación ni UI. Para que una pyme pueda usar Reclama Pro necesita poder iniciar sesión y acceder a un panel interno. Esta feature establece la base de auth sobre la que se construirán todas las features del panel.

## What Changes

- Instalar `firebase` (SDK cliente) — actualmente solo existe `firebase-admin`
- Agregar configuración del SDK cliente con variables `NEXT_PUBLIC_*`
- Implementar login con email/contraseña via Firebase Auth
- Crear Server Action que verifica el ID token y establece una cookie de sesión HttpOnly
- Agregar middleware de Next.js que protege las rutas del grupo `(panel)`
- Crear los route groups `(auth)` y `(panel)` con sus layouts
- Página de login funcional con formulario
- Dashboard dummy (sin datos reales) como primera vista del panel

## Capabilities

### New Capabilities

- `firebase-client-config`: Inicialización del SDK cliente de Firebase con variables de entorno públicas (`NEXT_PUBLIC_*`). Singleton que previene múltiples instancias en hot-reload.
- `session-auth`: Flujo completo de autenticación: login en el cliente con Firebase Auth → obtención de ID token → verificación server-side con firebase-admin → cookie de sesión HttpOnly. Incluye logout.
- `route-protection`: Middleware de Next.js que intercepta requests a rutas `(panel)` y redirige a `/login` si no hay cookie de sesión válida.
- `auth-ui`: Pantallas del grupo `(auth)`: layout sin sidebar + página de login. Estilos según paleta definida en CLAUDE.md (fondo `#f1f5f9`, card centrada).
- `panel-shell`: Estructura base del grupo `(panel)`: layout con sidebar fija de 220px (`#1d4ed8`) + dashboard dummy como primera ruta.

### Modified Capabilities

## Impact

- **Nuevas dependencias**: `firebase` (SDK cliente)
- **Nuevas variables de entorno**: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `SESSION_SECRET`
- **Nuevos archivos de configuración**: `src/lib/firebase/client.ts`
- **Nuevo middleware**: `src/middleware.ts` — afecta todos los requests de la app
- **Nuevas rutas**: `/login`, `/dashboard`
- **Sin impacto** en: `src/lib/firebase/admin.ts`, `src/types/index.ts`, `src/constants/index.ts`
