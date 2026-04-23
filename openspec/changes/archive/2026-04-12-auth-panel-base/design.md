## Context

El proyecto no tiene autenticación ni UI. `firebase-admin` ya está instalado y funcional para el BFF. `firebase` (SDK cliente) no está instalado. Firebase Auth aún no está habilitado en la consola del proyecto.

La app sigue el patrón BFF: Server Components + Server Actions son el backend. No hay API REST separada. El estado de sesión debe ser accesible desde el middleware de Next.js (edge runtime) para proteger rutas server-side.

## Goals / Non-Goals

**Goals:**
- Login funcional con email/contraseña via Firebase Auth
- Sesión persistida como cookie HttpOnly verificable desde el middleware
- Rutas del grupo `(panel)` protegidas: sin sesión → redirect a `/login`
- Shell visual del panel (sidebar + layout) con dashboard dummy
- Pantalla de login con estilos según paleta definida en CLAUDE.md

**Non-Goals:**
- Custom Claims / multi-tenant enforcement (siguiente feature)
- Registro de usuarios (se crean manualmente en Firebase Console)
- Forgot password / reset de contraseña
- Google Sign-In u otros proveedores OAuth
- Contenido real en el dashboard (datos de Firestore)

## Decisions

### 1. Sesión como cookie HttpOnly, no localStorage

**Decisión**: El Server Action de login recibe el ID token de Firebase, lo verifica con `firebase-admin`, y setea una cookie HttpOnly con el UID del usuario.

**Alternativa descartada**: Sesión solo en el cliente (Firebase Auth state en localStorage). El middleware de Next.js corre en el edge y no tiene acceso a localStorage. Sin cookie, no se pueden proteger rutas server-side sin un roundtrip extra al cliente.

**Alternativa descartada**: Firebase Session Cookies (método oficial de Firebase). Requiere llamar a `auth.createSessionCookie()` que genera JWTs largos (~1KB). Para MVP la cookie simple con UID + verificación es suficiente y más simple de implementar y depurar.

**Implementación**:
```
[Browser] signInWithEmailAndPassword() → idToken
    → Server Action login(idToken)
        → admin.auth().verifyIdToken(idToken)
        → cookies().set('session', uid, { httpOnly: true, secure: true, sameSite: 'lax' })
    ← redirect('/dashboard')
```

### 2. Middleware verifica cookie, no revalida contra Firebase

**Decisión**: El middleware lee la cookie `session` y, si existe, deja pasar. No llama a Firebase en cada request.

**Razón**: El middleware corre en el edge en cada request. Llamar a `firebase-admin` en el edge es costoso y complejo (firebase-admin no está optimizado para edge runtime). La cookie ya fue verificada al momento del login.

**Trade-off aceptado**: Si un usuario es deshabilitado en Firebase, su cookie sigue siendo válida hasta que expire. Para MVP esto es aceptable — se resuelve en features posteriores con revalidación periódica.

### 3. Singleton del SDK cliente en `src/lib/firebase/client.ts`

**Decisión**: Mismo patrón que `admin.ts` — función `getFirebaseApp()` con guard `getApps().length`.

**Razón**: Next.js hace hot-reload en desarrollo. Sin el guard, cada reload crea una nueva instancia y Firebase lanza "Firebase app already exists".

### 4. Variables de entorno: `NEXT_PUBLIC_*` para el SDK cliente

**Decisión**: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.

**Razón**: Estas variables son seguras de exponer al browser (son la configuración pública del proyecto Firebase, no credenciales de admin). El `firebase-admin` usa `FIREBASE_SERVICE_ACCOUNT_JSON` (privada, sin prefijo NEXT_PUBLIC_).

### 5. CSS Modules con variables CSS en el layout de cada route group

**Decisión**: Definir tokens de color como variables CSS en `:root` dentro del `layout.tsx` de `(auth)` y `(panel)`. Componentes hoja usan `var(--color-*)`.

**Razón**: CLAUDE.md lo establece explícitamente. Tailwind no está instalado. Evita hardcodear hex en múltiples componentes.

## Risks / Trade-offs

- **[Risk] Cookie no expira automáticamente** → Mitigation: setear `maxAge` de 7 días en la cookie. El usuario puede hacer logout explícito.
- **[Risk] `firebase-admin` en Server Action del login podría fallar si `FIREBASE_SERVICE_ACCOUNT_JSON` no está bien configurado** → Mitigation: el error se propaga al formulario de login como mensaje genérico. No exponer detalles del error al cliente.
- **[Risk] El middleware no distingue entre "no hay sesión" y "sesión inválida"** → Mitigation: para MVP ambos casos hacen redirect a `/login`. Suficiente.
