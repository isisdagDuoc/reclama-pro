## ADDED Requirements

### Requirement: Estructura de carpetas según rol de ejecución
El proyecto SHALL tener la siguiente estructura bajo `src/`. Cada carpeta tiene un rol exclusivo y no puede ser violado mezclando imports server/client.

```
src/
  app/                        # Rutas de Next.js App Router
    (auth)/                   # Grupo de rutas públicas (login, register)
    (panel)/                  # Grupo de rutas protegidas del agente/admin
    [slug]/                   # Portal público del cliente
    layout.tsx
    page.tsx
  components/                 # Componentes React reutilizables ("use client" o RSC puros)
    ui/                       # Componentes base (botones, inputs, badges)
  lib/
    firebase/                 # Inicialización firebase-admin — SOLO SERVER
      admin.ts
    actions/                  # Server Actions — SOLO SERVER
    queries/                  # Funciones de lectura Firestore — SOLO SERVER
  types/                      # Interfaces TypeScript del dominio
    index.ts
  constants/                  # Constantes del dominio
    index.ts
```

#### Scenario: Carpetas server-only no importables desde cliente
- **WHEN** un archivo con `"use client"` intenta importar desde `lib/firebase/`, `lib/actions/` o `lib/queries/`
- **THEN** Next.js lanza un error de build indicando que código server fue importado en el cliente

#### Scenario: Estructura creada al inicializar
- **WHEN** el proyecto es inicializado
- **THEN** existen todas las carpetas listadas arriba, con al menos un archivo placeholder (`.gitkeep` o archivo real) en cada una

### Requirement: Grupos de rutas App Router correctamente separados
Las rutas del panel (`/panel`) y el portal público (`/:slug`) SHALL pertenecer a grupos distintos con layouts separados.

#### Scenario: Layout del panel no afecta portal del cliente
- **WHEN** el usuario navega a `/:slug`
- **THEN** no se aplica el layout de `(panel)/layout.tsx`
