## 1. Inicialización del proyecto

- [ ] 1.1 Ejecutar `npx create-next-app@latest reclama-pro` con flags: TypeScript, ESLint, App Router, directorio `src/`, sin Tailwind
- [ ] 1.2 Verificar que `tsconfig.json` tiene `"strict": true`
- [ ] 1.3 Verificar que `npm run build` y `npm run lint` pasan sin errores en el proyecto base
- [ ] 1.4 Agregar `firebase-admin` como dependencia: `npm install firebase-admin`

## 2. Estructura de carpetas

- [ ] 2.1 Crear carpetas bajo `src/`: `components/ui/`, `lib/firebase/`, `lib/actions/`, `lib/queries/`, `types/`, `constants/`
- [ ] 2.2 Crear grupos de rutas App Router: `src/app/(auth)/`, `src/app/(panel)/`, `src/app/[slug]/`
- [ ] 2.3 Agregar archivo placeholder `.gitkeep` en carpetas vacías (`lib/actions/`, `lib/queries/`, `components/ui/`)

## 3. Configuración de Firebase Admin

- [ ] 3.1 Crear `.env.local.example` con la variable `FIREBASE_SERVICE_ACCOUNT_JSON=` (valor vacío, con comentario explicando que debe contener el JSON completo del service account)
- [ ] 3.2 Verificar que `.env.local` está en `.gitignore` (agregar si no está)
- [ ] 3.3 Crear `src/lib/firebase/admin.ts` con el singleton `getFirebaseAdmin()` y la función helper `getDb()`
- [ ] 3.4 El singleton lee credenciales via `JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!)` y usa `cert(serviceAccount)` en `initializeApp`
- [ ] 3.5 El singleton debe manejar el caso de app ya inicializada (check `getApps().length` antes de llamar `initializeApp`)
- [ ] 3.6 Agregar validación: si `FIREBASE_SERVICE_ACCOUNT_JSON` no está definida, lanzar `Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable')`

## 4. Tipos y constantes del dominio

- [ ] 4.1 Crear `src/types/index.ts` con los type aliases: `ClaimStatus`, `ClaimCategory`
- [ ] 4.2 Agregar interfaces al mismo archivo: `Enterprise`, `EnterpriseUser`, `Claim`, `HistoryEntry`
- [ ] 4.3 Crear `src/constants/index.ts` con `CLAIM_CATEGORIES`, `CLAIM_STATUSES` y `CLAIM_ROLES` como `Record` tipado
- [ ] 4.4 Verificar que `npm run build` pasa sin errores de TypeScript después de crear los archivos

## 5. Validación final

- [ ] 5.1 Ejecutar `npm run lint` — debe pasar sin errores
- [ ] 5.2 Ejecutar `npm run build` — debe completar sin errores
- [ ] 5.3 Ejecutar `npm run dev` — servidor debe iniciar en `localhost:3000` sin errores en consola
- [ ] 5.4 Confirmar que `src/lib/firebase/admin.ts` no puede importarse desde un archivo con `"use client"` (verificar con un test manual o leyendo el código)
