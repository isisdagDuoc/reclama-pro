## 1. Variables de entorno y configuración

- [x] 1.1 Agregar `NEXT_PUBLIC_APP_URL=http://localhost:3000` a `.env.local`
- [x] 1.2 Agregar `NEXT_PUBLIC_APP_URL=http://localhost:3000` a `.env.local.example` con comentario explicativo

## 2. Migración de sesión a Firebase Session Cookies

- [x] 2.1 Modificar `login()` en `src/lib/actions/auth.ts`: reemplazar `cookieStore.set('session', decodedToken.uid, ...)` por `admin.auth().createSessionCookie(idToken, { expiresIn: 604800000 })` y almacenar el JWT resultante
- [x] 2.2 Verificar que `logout()` elimina la cookie `session` correctamente (sin cambios necesarios en la lógica, solo validar que sigue funcionando)
- [x] 2.3 Verificar que el flujo de login existente funciona end-to-end con el nuevo formato de Session Cookie

## 3. Server Actions de registro y slug

- [x] 3.1 Agregar Server Action `registerEnterprise(idToken, { name, slug, email })` en `src/lib/actions/auth.ts`:
  - Verificar ID token con `admin.auth().verifyIdToken(idToken)`
  - Verificar unicidad del slug en Firestore (query `where('slug', '==', slug)`)
  - Ejecutar Firestore Transaction: crear `enterprises/{newId}` y `enterpriseUsers/{uid}`
  - Llamar `admin.auth().setCustomUserClaims(uid, { enterpriseId, role: 'admin' })`
  - Retornar `{ success: true }` o `{ error: string }`
- [x] 3.2 Agregar Server Action `checkSlugAvailability(slug): Promise<{ available: boolean, error?: boolean }>` en `src/lib/actions/auth.ts`:
  - Validar formato del slug antes de consultar Firestore
  - Query `where('slug', '==', slug), limit(1)` en colección `enterprises`
  - Retornar `{ available: boolean, error?: boolean }` (error=true en catch, no bloquea el submit)

## 4. Proxy — rutas de auth adicionales

- [x] 4.1 Agregar `/register`, `/forgot-password` y `/reset-password` al `config.matcher` en `src/proxy.ts`
- [x] 4.2 Extender la lógica del proxy para que estas tres rutas nuevas tengan el mismo comportamiento que `/login`: si hay sesión activa → redirect a `/dashboard`; si no hay sesión → dejar pasar

## 5. Página de login — mejoras

- [x] 5.1 Corregir wording en `src/app/(auth)/login/page.tsx`: cambiar "Accedé a tu panel de gestión" por "Accede a tu panel de gestión"
- [x] 5.2 Agregar validación client-side en `handleSubmit`: verificar email no vacío, formato de email, contraseña no vacía antes de llamar Firebase
- [x] 5.3 Mapear errores de Firebase Auth a mensajes en español: `auth/too-many-requests` → "Demasiados intentos fallidos...", error de red → "Error de conexión...", default → "Correo o contraseña incorrectos"
- [x] 5.4 Agregar link "¿No tienes cuenta? Regístrate" con `href="/register"` al final del formulario
- [x] 5.5 Agregar link "¿Olvidaste tu contraseña?" con `href="/forgot-password"` debajo del campo contraseña
- [x] 5.6 Agregar estilos para los links en `src/app/(auth)/login/page.module.css`

## 6. Página de registro

- [x] 6.1 Crear `src/app/(auth)/register/page.tsx` como Client Component con los campos: nombre empresa, slug, email, contraseña, confirmar contraseña
- [x] 6.2 Implementar función `sanitizeSlug(name: string): string` que convierte el nombre a slug URL-safe (NFD → ASCII, lowercase, no-alphanum → guión, colapsar guiones, max 40 chars)
- [x] 6.3 Implementar auto-generación del slug en el `onChange` del campo nombre (actualiza el campo slug usando `sanitizeSlug`)
- [x] 6.4 Implementar validación del slug en tiempo real: debounce 600ms en `onChange` del campo slug, llama `checkSlugAvailability()`, muestra estado (disponible / no disponible / verificando / error). Deshabilitar submit si no disponible o inválido.
- [x] 6.5 Implementar validación on blur en el campo "confirmar contraseña" (comparar con contraseña)
- [x] 6.6 Implementar validación client-side completa en `handleSubmit`: todos los campos obligatorios, formatos, límites de largo
- [x] 6.7 Implementar el flujo de dos pasos en `handleSubmit`:
  - `createUserWithEmailAndPassword(auth, email, password)` → credential
  - `credential.user.getIdToken()` → idToken
  - `registerEnterprise(idToken, { name, slug, email })` → si error, mostrar mensaje
  - Si éxito: `credential.user.getIdToken(true)` → fresh token
  - `login(freshToken)` → navega a `/dashboard`
- [x] 6.8 Implementar redirección para usuario ya autenticado: manejado por el proxy (`src/proxy.ts`) — si hay sesión activa redirige a `/dashboard` antes de renderizar la página
- [x] 6.9 Mapear todos los errores del Server Action a mensajes de UI según el catálogo de errores
- [x] 6.10 Crear `src/app/(auth)/register/page.module.css` con estilos consistentes con el login (misma paleta, card centrada, border-radius 8px)

## 7. Página "Olvidé mi contraseña"

- [x] 7.1 Crear `src/app/(auth)/forgot-password/page.tsx` como Client Component con campo email y botón "Enviar enlace"
- [x] 7.2 Implementar validación client-side: email no vacío, formato válido
- [x] 7.3 Implementar `handleSubmit`: llama `sendPasswordResetEmail(auth, email, { url: process.env.NEXT_PUBLIC_APP_URL + '/reset-password', handleCodeInApp: true })`
- [x] 7.4 Mostrar siempre el mismo mensaje de éxito tras el submit ("Si el correo está registrado..."), independientemente de si el email existe o no
- [x] 7.5 Manejar error de red/Firebase mostrando "Error de conexión. Verifica tu internet e intenta de nuevo"
- [x] 7.6 Crear `src/app/(auth)/forgot-password/page.module.css` con estilos consistentes

## 8. Página de restablecimiento de contraseña

- [x] 8.1 Crear `src/app/(auth)/reset-password/page.tsx` como Client Component que lee `oobCode` y `mode` de `useSearchParams()` (envuelto en `<Suspense>`)
- [x] 8.2 Si no hay `oobCode` en la URL, mostrar el estado de error "El enlace no es válido." con link a `/forgot-password`
- [x] 8.3 Implementar formulario con campos: nueva contraseña, confirmar contraseña
- [x] 8.4 Implementar validación on blur en "confirmar contraseña" (coincidencia)
- [x] 8.5 Implementar validación client-side en submit: contraseña no vacía, mínimo 6 chars, coincidencia
- [x] 8.6 Implementar `handleSubmit`: llama `confirmPasswordReset(auth, oobCode, newPassword)`
- [x] 8.7 Mostrar estado de éxito "Contraseña actualizada." con link a `/login`
- [x] 8.8 Mapear errores de Firebase: `auth/expired-action-code` y `auth/invalid-action-code` → "El enlace venció o ya fue usado."
- [x] 8.9 Crear `src/app/(auth)/reset-password/page.module.css` con estilos consistentes

## 9. Verificación final

- [x] 9.1 Verificar flujo completo de registro: formulario → Firebase Auth → Firestore → Custom Claims → sesión → dashboard ✓ confirmado por la usuaria
- [x] 9.2 Verificar que el login existente sigue funcionando con el nuevo formato de Session Cookie
- [ ] 9.3 Verificar flujo de "olvidé mi contraseña": submit → email recibido → link a `/reset-password` → nueva contraseña → login — **PENDIENTE**: requiere recibir el email de Firebase (no probado en esta sesión)
- [x] 9.4 Verificar que el proxy redirige correctamente usuarios autenticados desde `/register`, `/forgot-password` y `/reset-password` a `/dashboard`
- [ ] 9.5 Verificar mensajes de error en los tres formularios para los escenarios del catálogo — **PENDIENTE**: no se hizo testing sistemático de todos los escenarios de error
- [x] 9.6 Verificar wording en español neutro (tuteo) en toda la UI de auth ✓ revisado durante implementación
- [x] 9.7 Verificar TypeScript sin errores: `tsc --noEmit` ✓ pasó sin errores
