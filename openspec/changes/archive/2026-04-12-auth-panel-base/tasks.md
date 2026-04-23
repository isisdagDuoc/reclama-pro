## 1. Prerequisitos (Firebase Console — manual)

- [ ] 1.1 Habilitar proveedor Email/Password en Firebase Console → Authentication → Sign-in method
- [ ] 1.2 Crear usuario admin de prueba en Firebase Console → Authentication → Add user (email + contraseña)

## 2. Dependencias y variables de entorno

- [x] 2.1 Instalar SDK cliente: `npm install firebase`
- [ ] 2.2 Agregar a `.env.local`: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] 2.3 Agregar a `.env.local`: `SESSION_SECRET` (string random, mínimo 32 caracteres)
- [x] 2.4 Actualizar `.env.local.example` con las nuevas variables (sin valores reales)

## 3. SDK cliente de Firebase

- [x] 3.1 Crear `src/lib/firebase/client.ts` con función `getFirebaseApp()` con guard `getApps().length > 0`
- [x] 3.2 Exportar `getAuth` desde `client.ts` para uso en Client Components

## 4. Server Action de autenticación

- [x] 4.1 Crear `src/lib/actions/auth.ts` con `"use server"` al tope
- [x] 4.2 Implementar `login(idToken: string)`: verifica token con `admin.auth().verifyIdToken()`, setea cookie `session` HttpOnly con maxAge 7 días, redirige a `/dashboard`
- [x] 4.3 Implementar `logout()`: elimina cookie `session`, redirige a `/login`
- [x] 4.4 Manejar errores de `verifyIdToken` retornando mensaje genérico (no exponer detalles de Firebase)

## 5. Proxy de protección de rutas (antes middleware — renombrado en Next.js 16)

- [x] 5.1 Crear `src/proxy.ts` en la raíz de `src/` (Next.js 16 usa proxy.ts + export function proxy)
- [x] 5.2 Definir `matcher` para rutas protegidas: `/dashboard`, `/claims`, `/reports` y sus subrutas
- [x] 5.3 Lógica: si cookie `session` ausente en ruta protegida → redirect 307 a `/login`
- [x] 5.4 Lógica: si cookie `session` presente y ruta es `/login` → redirect a `/dashboard`

## 6. Route group (auth) — Login

- [x] 6.1 Crear `src/app/(auth)/layout.tsx` con variables CSS en `:root` (paleta auth) y fondo `--color-auth-bg`
- [x] 6.2 Crear `src/app/(auth)/layout.module.css` con estilos del layout
- [x] 6.3 Crear `src/app/(auth)/login/page.tsx` como Client Component (`"use client"`)
- [x] 6.4 Implementar formulario: campos email y contraseña, botón submit con estado loading/disabled
- [x] 6.5 En submit: llamar `signInWithEmailAndPassword()` del SDK cliente → obtener ID token → llamar Server Action `login(idToken)`
- [x] 6.6 Mostrar mensaje de error si el Server Action retorna error
- [x] 6.7 Crear `src/app/(auth)/login/page.module.css` con estilos del card centrado

## 7. Route group (panel) — Shell

- [x] 7.1 Crear `src/app/(panel)/layout.tsx` con variables CSS en `:root` (paleta panel) y estructura sidebar + main
- [x] 7.2 Crear `src/app/(panel)/layout.module.css` con grid/flex del layout (sidebar 220px fijo + main)
- [x] 7.3 Crear `src/components/ui/Sidebar.tsx` con: logo, links de navegación, avatar + botón logout
- [x] 7.4 Links de navegación: Dashboard (`/dashboard`), Reclamos (`/claims`), Reportes (`/reports`) — aplicar estilo activo con `usePathname()`
- [x] 7.5 Botón logout en sidebar llama al Server Action `logout`
- [x] 7.6 Crear `src/app/(panel)/dashboard/page.tsx` como Server Component con título "Dashboard" y contenido placeholder
- [x] 7.7 Crear `src/app/(panel)/dashboard/page.module.css`

## 8. Verificación final

- [x] 8.1 Flujo completo: acceder a `/dashboard` sin sesión → redirige a `/login`
- [x] 8.2 Flujo completo: login con credenciales correctas → redirige a `/dashboard` con panel visible
- [x] 8.3 Flujo completo: logout desde sidebar → redirige a `/login`
- [x] 8.4 Flujo completo: acceder a `/login` con sesión activa → redirige a `/dashboard`
- [x] 8.5 Verificar que `firebase-admin` no se importa en ningún archivo con `"use client"`
- [x] 8.6 Correr `npm run build` sin errores de TypeScript
