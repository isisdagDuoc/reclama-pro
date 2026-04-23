## Context

Reclama Pro tiene login funcionando con un patrón mínimo: el cliente llama `signInWithEmailAndPassword()`, obtiene un ID token, lo envía al Server Action `login()` que guarda el UID en una cookie HttpOnly, y el proxy verifica que la cookie exista.

Este diseño tiene dos problemas que esta feature resuelve:

1. **Sin registro**: las empresas deben crearse manualmente en Firebase Console. No es viable para el producto.
2. **Cookie de UID sin claims**: la cookie `session` contiene solo el UID en texto plano. Para identificar a qué empresa pertenece un usuario en Server Actions del panel, habría que hacer una query extra a Firestore (`enterpriseUsers/{uid}`). Migrar ahora a Firebase Session Cookies (JWT firmado por Firebase Admin) permite extraer `enterpriseId` y `role` directamente del token verificado, sin costo adicional de Firestore.

Stack relevante: Next.js 16.2.2 App Router (proxy.ts, no middleware.ts), Firebase Auth, firebase-admin, Cloud Firestore, CSS Modules.

---

## Goals / Non-Goals

**Goals:**
- Registro completo de Pyme: formulario → Firebase Auth → Firestore → Custom Claims → sesión
- Slug URL-safe único, auto-generado del nombre de empresa, editable, validado en tiempo real
- Recupero de contraseña con Firebase Auth (email enviado por Firebase, landing en ruta propia)
- Migrar `login()` a Firebase Session Cookies con Custom Claims (`enterpriseId`, `role`)
- Mensajes de error completos y en español neutro/chileno (tuteo) en todas las pantallas de auth

**Non-Goals:**
- Verificación de email al registrarse (MVP: acceso inmediato tras registro)
- Registro de agentes (los agentes son creados por el admin desde el panel, fuera de scope)
- Cambio de slug post-registro (inmutable para preservar URLs de clientes)
- Email de reset con dominio propio (`@reclamapro.com`) — requiere servicio externo, no es MVP
- Rate limiting custom en `checkSlugAvailability()` — Firebase Auth tiene rate limiting nativo suficiente para MVP

---

## Decisions

### 1. Firebase Session Cookies en lugar de UID plano

**Decisión**: `login()` crea una Firebase Session Cookie con `admin.auth().createSessionCookie(idToken, { expiresIn })` en lugar de guardar `decodedToken.uid`.

**Alternativa descartada**: guardar el UID plano (estado actual). El UID no contiene claims, fuerza una query Firestore adicional en cada Server Action del panel para obtener `enterpriseId`.

**Por qué Session Cookies**: el JWT firmado por Firebase Admin puede verificarse con `verifySessionCookie(cookie, true)` retornando el decoded token completo con Custom Claims. Elimina la query extra. Además es el mecanismo oficial de Firebase para sesiones server-side de larga duración (hasta 14 días), más robusto que un UID en texto plano.

**Trade-off aceptado**: sesiones activas previas quedan invalidadas (el formato cambia de UID string a JWT). Aceptable en fase MVP sin usuarios reales.

---

### 2. Custom Claims seteados en `registerEnterprise()`, no en `login()`

**Decisión**: el Server Action `registerEnterprise()` llama `admin.auth().setCustomUserClaims(uid, { enterpriseId, role: 'admin' })` después de crear los documentos en Firestore. Luego retorna una señal al cliente para que fuerce refresh del token (`getIdToken(true)`) antes de llamar `login()`.

**Flujo completo del registro**:
```
[Cliente]  createUserWithEmailAndPassword(email, password)  → credential
[Cliente]  credential.user.getIdToken()                     → idToken inicial (sin claims)
[SA]       registerEnterprise(idToken, { name, slug, email })
             verifyIdToken(idToken)                         → uid
             checkSlug único en Firestore
             Firestore Transaction:
               createEnterprise({ name, slug, plan: 'basic', claimCounter: 0 })
               createEnterpriseUser(uid, { enterpriseId, role: 'admin', email, name })
             setCustomUserClaims(uid, { enterpriseId, role: 'admin' })
             return { success: true }                        ← NO redirect aún
[Cliente]  credential.user.getIdToken(true)                 → idToken fresco (CON claims)
[SA]       login(freshIdToken)                              → createSessionCookie → redirect /dashboard
```

**Alternativa descartada**: hacer el seteo de claims dentro de `login()`. Imposible — `login()` no sabe si es un registro nuevo o un login normal, y no tiene acceso al `enterpriseId` a crear.

**Por qué dos pasos en el cliente**: los Custom Claims se setean en el backend pero el ID token del cliente no se actualiza automáticamente. Firebase requiere `getIdToken(true)` para forzar el refresco desde sus servidores. Sin este paso, la Session Cookie no contendría los claims recién seteados.

---

### 3. Slug: auto-generado + editable + validación en tiempo real

**Decisión**: el slug se auto-genera del nombre de empresa al tipear (sanitización: NFD → ASCII, lowercase, no-alphanum → guión, colapsar guiones, trim, max 40 chars). El campo es editable. Validación de disponibilidad via Server Action `checkSlugAvailability(slug)` con debounce 600ms en el cliente.

**Por qué Server Action y no Route Handler**: consistente con el patrón BFF del proyecto. Las queries a Firestore solo ocurren en el servidor.

**Sanitización**:
```
"Ñoño & Cía. 123" → normalize NFD → strip diacritics → "Nono & Cia. 123"
                   → lowercase → "nono & cia. 123"
                   → replace /[^a-z0-9]+/g with '-' → "nono-cia-123"
                   → trim hyphens → "nono-cia-123"
                   → slice 0..40
```

**Inmutabilidad post-registro**: el slug es la URL pública que la empresa comparte con sus clientes (`/{slug}?token=...`). Cambiarlo haría inválidos todos los links ya distribuidos.

---

### 4. Recupero de contraseña: Firebase envía el email, la app maneja el landing

**Decisión**: `sendPasswordResetEmail(auth, email, { url: NEXT_PUBLIC_APP_URL + '/reset-password', handleCodeInApp: true })`. Firebase envía el email (gratis, en plan Spark). El link lleva a `(auth)/reset-password` que parsea `?oobCode=...&mode=resetPassword` y llama `confirmPasswordReset(auth, oobCode, newPassword)`.

**Alternativa A descartada**: landing en pantalla hosteada de Firebase (`firebaseapp.com`). Sin branding propio, experiencia inconsistente.

**Alternativa C descartada**: generar el link con Admin SDK + servicio de email externo (Resend, SendGrid). Complejidad y costo innecesarios para MVP.

**Variable de entorno**: `NEXT_PUBLIC_APP_URL=http://localhost:3000` en dev. Se actualiza a la URL de Vercel cuando se despliega. El dominio debe estar en Firebase Console → Authentication → Authorized domains.

**Seguridad en "olvidé mi contraseña"**: la respuesta al usuario es siempre la misma ("Si el correo está registrado...") sin importar si el email existe o no. Previene enumeración de usuarios.

---

### 5. Proxy: `/register`, `/forgot-password`, `/reset-password` son rutas públicas

**Decisión**: estas rutas NO se agregan al `config.matcher` del proxy. Las rutas en el matcher son las que el proxy inspecciona; si no están listadas, Next.js las sirve directamente sin pasar por el proxy.

El proxy ya tiene el patrón correcto: las rutas protegidas están explícitamente en el matcher. Las rutas de auth (`/login`, ya presente) son casos especiales que el proxy maneja. Para las rutas nuevas de auth, el mismo patrón de `/login` aplica: verificar si hay sesión activa y, de ser así, redirigir a `/dashboard`.

**Página `/register` para usuarios ya autenticados**: si el Server Component detecta cookie de sesión activa, renderiza un estado informativo ("Ya tienes una cuenta registrada. Inicia sesión para acceder a tu panel") en lugar del formulario. Manejo en la página, no en el proxy, para dar UI contextual.

---

## Risks / Trade-offs

**[Riesgo] Invalidación de sesiones activas al migrar a Session Cookies**
→ Mitigación: MVP sin usuarios reales. El cambio de formato de cookie (UID → JWT) es un breaking change aceptable ahora; en producción requeriría un período de transición.

**[Riesgo] `getIdToken(true)` puede fallar si el cliente está offline o Firebase tiene latencia**
→ Mitigación: el cliente maneja el error y muestra "Error al completar el registro. Intenta de nuevo" con opción de reintentar. El usuario ya fue creado en Firebase Auth y Firestore; si el login falla, puede intentar el flujo normal de login.

**[Riesgo] Race condition en el slug: dos empresas eligen el mismo slug simultáneamente**
→ Mitigación: `checkSlugAvailability()` es solo preventiva. La escritura final en `registerEnterprise()` verifica unicidad dentro de una Firestore Transaction. Si hay colisión en el momento de escritura, el Server Action retorna error y el usuario debe elegir otro slug.

**[Riesgo] `oobCode` de reset de contraseña vencido o ya usado**
→ Mitigación: `confirmPasswordReset()` lanza `auth/expired-action-code` o `auth/invalid-action-code`. La ruta `/reset-password` captura estos errores y muestra "El enlace venció o ya fue usado. [Solicitar uno nuevo]" con link a `/forgot-password`.

**[Riesgo] El dominio de Vercel aún no está configurado en Firebase Console**
→ Mitigación: el flujo de reset de contraseña funciona en localhost con `NEXT_PUBLIC_APP_URL=http://localhost:3000`. La configuración del dominio de producción es un paso de deploy documentado, no un bloqueante de desarrollo.

---

## Migration Plan

1. **Código**: implementar los cambios de esta feature (ver tasks.md)
2. **Variables de entorno**: agregar `NEXT_PUBLIC_APP_URL=http://localhost:3000` a `.env.local`
3. **Firebase Console**: agregar `localhost` a Authorized Domains (ya suele estar por defecto) y personalizar el template de email de reset de contraseña (asunto y cuerpo en español)
4. **Deploy a Vercel**: agregar `NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app` en Vercel Environment Variables, agregar el dominio de Vercel en Firebase Console → Authentication → Authorized Domains

**Rollback**: revertir los cambios en `auth.ts` y `proxy.ts`. Los usuarios con la nueva Session Cookie quedarán sin sesión (tendrán que hacer login de nuevo).

---

## Open Questions

_Ninguna. Todas las decisiones técnicas relevantes están resueltas._
