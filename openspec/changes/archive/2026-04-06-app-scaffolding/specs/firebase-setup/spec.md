## ADDED Requirements

### Requirement: firebase-admin inicializado como singleton
El sistema SHALL exportar una función `getFirebaseAdmin()` desde `src/lib/firebase/admin.ts` que retorna una instancia única de la app Firebase. Si la app ya fue inicializada, SHALL retornar la instancia existente sin llamar a `initializeApp` nuevamente.

#### Scenario: Sin error de instancia duplicada en hot-reload
- **WHEN** Next.js hace hot-reload en modo desarrollo (múltiples llamadas a `initializeApp`)
- **THEN** no se lanza el error `"Firebase: Firebase App named '[DEFAULT]' already exists"`

#### Scenario: Función retorna instancia válida
- **WHEN** se llama a `getFirebaseAdmin()`
- **THEN** retorna un objeto `App` con el que se puede obtener una instancia de Firestore via `getFirestore(app)`

### Requirement: Credenciales via variable de entorno JSON (compatible con Vercel)
Las credenciales del service account de Firebase SHALL leerse de una única variable de entorno `FIREBASE_SERVICE_ACCOUNT_JSON` que contiene el JSON completo del service account. Este enfoque evita el bug de Vercel donde el `private_key` (que contiene saltos de línea `\n`) se escapa incorrectamente al configurarse como variable individual.

El proyecto SHALL incluir `.env.local.example` con la variable requerida (sin valor). El archivo `.env.local` SHALL estar en `.gitignore`.

```
# .env.local.example
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

Implementación en `admin.ts`:
```typescript
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
initializeApp({ credential: cert(serviceAccount) });
```

En Vercel: Settings → Environment Variables → agregar `FIREBASE_SERVICE_ACCOUNT_JSON` con el contenido completo del archivo `serviceAccountKey.json` descargado desde Firebase Console.

#### Scenario: Error claro si falta la variable de entorno
- **WHEN** `FIREBASE_SERVICE_ACCOUNT_JSON` no está definida al iniciar el servidor
- **THEN** la aplicación lanza `Error: Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable` antes de intentar conectar a Firebase

#### Scenario: Credenciales funcionan en Vercel sin modificar el private_key
- **WHEN** la variable `FIREBASE_SERVICE_ACCOUNT_JSON` se configura en el dashboard de Vercel con el JSON completo
- **THEN** Firebase Admin inicializa correctamente sin errores de parsing de credenciales

#### Scenario: .env.local no está en el repositorio
- **WHEN** se revisa el historial de git
- **THEN** el archivo `.env.local` no aparece en ningún commit

### Requirement: Función helper para obtener Firestore
SHALL existir una función `getDb()` exportada desde `src/lib/firebase/admin.ts` que retorna la instancia de `Firestore` lista para usar.

#### Scenario: getDb() retorna instancia de Firestore
- **WHEN** se llama a `getDb()` desde un Server Component o Server Action
- **THEN** retorna una instancia `Firestore` con la que se puede hacer queries a las colecciones
