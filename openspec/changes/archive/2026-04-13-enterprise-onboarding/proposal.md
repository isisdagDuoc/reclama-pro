## Why

Reclama Pro tiene login funcional pero no ofrece manera de que una Pyme se registre ni recupere su contraseña. Sin registro, cada empresa debe ser creada manualmente en Firebase Console. Sin recupero de contraseña, un olvido bloquea al usuario sin salida. Además, la cookie de sesión actual almacena el UID en texto plano — necesita migrarse a Firebase Session Cookies con Custom Claims para obtener `enterpriseId` y `role` directamente del token verificado, eliminando queries extra a Firestore en cada Server Action protegido.

## What Changes

- **Registro de empresa**: nueva ruta `(auth)/register` con formulario (nombre empresa, slug auto-generado/editable, email admin, contraseña, confirmar contraseña). El Server Action `registerEnterprise()` crea el usuario en Firebase Auth, el documento `enterprises/{id}` y `enterprises/{id}/users/{uid}` en Firestore, setea Custom Claims (`enterpriseId`, `role: 'admin'`) y establece sesión
- **Slug de empresa**: identificador URL-safe auto-generado del nombre, editable con validación en tiempo real (debounce 600ms) via Server Action `checkSlugAvailability()`. Inmutable post-registro
- **Recupero de contraseña**: ruta `(auth)/forgot-password` que envía email via Firebase Auth, y ruta `(auth)/reset-password` que recibe el `oobCode` de Firebase y permite establecer nueva contraseña
- **Migración de sesión**: `login()` cambia de almacenar UID a crear Firebase Session Cookie via `admin.auth().createSessionCookie()`. La verificación usa `verifySessionCookie()` en lugar de comparar strings
- **Custom Claims**: `registerEnterprise()` setea `enterpriseId` y `role` como claims del usuario. El cliente fuerza refresh del token (`getIdToken(true)`) tras el registro para obtener claims frescos antes de llamar `login()`
- **Proxy actualizado**: agregar `/register`, `/forgot-password` y `/reset-password` al matcher de rutas públicas
- **Login mejorado**: agregar links a `/register` y `/forgot-password`, mejorar mensajes de error con catálogo completo en español
- **Variable de entorno**: nueva `NEXT_PUBLIC_APP_URL` para `actionCodeSettings.url` de Firebase Auth

## Capabilities

### New Capabilities
- `enterprise-registration`: Flujo completo de registro de Pyme — formulario, Server Action `registerEnterprise()`, creación de documentos Firestore, seteo de Custom Claims, slug auto-generado con validación en tiempo real
- `password-recovery`: Flujo de "olvidé mi contraseña" (envío de email) y "restablecer contraseña" (formulario con `oobCode` de Firebase)
- `session-cookies`: Migración de cookie UID plana a Firebase Session Cookies con Custom Claims, incluyendo `createSessionCookie()` y `verifySessionCookie()`

### Modified Capabilities
- `session-auth`: `login()` cambia de guardar UID a crear Firebase Session Cookie. `logout()` debe revocar la session cookie. Nuevo Server Action `registerEnterprise()`
- `route-protection`: Proxy debe incluir `/register`, `/forgot-password` y `/reset-password` en el matcher de rutas públicas
- `auth-ui`: Login page agrega links a registro y recupero de contraseña. Se corrige wording de "Accedé" (voseo) a "Accede" (tuteo)

## Impact

- **Archivos nuevos**: `src/app/(auth)/register/page.tsx`, `register/page.module.css`, `src/app/(auth)/forgot-password/page.tsx`, `forgot-password/page.module.css`, `src/app/(auth)/reset-password/page.tsx`, `reset-password/page.module.css`
- **Archivos modificados**: `src/lib/actions/auth.ts`, `src/app/(auth)/login/page.tsx`, `src/proxy.ts`, `.env.local.example`
- **Dependencias externas**: ninguna nueva (usa `firebase-admin/auth` y `firebase/auth` ya instalados)
- **Breaking change en sesión**: la cookie `session` cambia de contener un UID string a contener un JWT de Firebase Session Cookie. Cualquier sesión activa previa quedará invalidada (aceptable en fase MVP sin usuarios reales)
- **Firestore**: escribe en colecciones `enterprises` y `enterprises/{id}/users` (ya definidas en modelo de datos)
- **Firebase Auth**: usa `setCustomUserClaims()`, `createSessionCookie()`, `verifySessionCookie()`, `sendPasswordResetEmail()`, `confirmPasswordReset()`
