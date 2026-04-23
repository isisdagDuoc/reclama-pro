## ADDED Requirements

### Requirement: Singleton de SDK cliente de Firebase
El sistema SHALL proveer una función `getFirebaseApp()` en `src/lib/firebase/client.ts` que inicialice el SDK cliente de Firebase una única vez, usando un guard `getApps().length > 0` para prevenir múltiples instancias durante hot-reload de Next.js.

#### Scenario: Primera inicialización
- **WHEN** `getFirebaseApp()` es llamada por primera vez
- **THEN** el sistema inicializa la app de Firebase con las variables `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` y `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

#### Scenario: Llamadas subsecuentes
- **WHEN** `getFirebaseApp()` es llamada más de una vez (ej: hot-reload en desarrollo)
- **THEN** el sistema retorna la instancia existente sin llamar `initializeApp()` nuevamente

### Requirement: Variables de entorno públicas del SDK cliente
El sistema SHALL leer la configuración del SDK cliente exclusivamente desde variables de entorno prefijadas con `NEXT_PUBLIC_`, nunca desde valores hardcodeados.

#### Scenario: Variables presentes
- **WHEN** las variables `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` y `NEXT_PUBLIC_FIREBASE_PROJECT_ID` están definidas en el entorno
- **THEN** el SDK cliente se inicializa correctamente

#### Scenario: Variables ausentes
- **WHEN** alguna variable `NEXT_PUBLIC_FIREBASE_*` requerida no está definida
- **THEN** el sistema lanza un error explícito en tiempo de inicialización indicando cuál variable falta
