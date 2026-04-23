## ADDED Requirements

### Requirement: Proyecto Next.js inicializado con TypeScript estricto
El sistema SHALL ser inicializado con `create-next-app@latest` usando las flags: TypeScript, ESLint, App Router, `src/` directory, sin Tailwind (se agrega después). El `tsconfig.json` SHALL tener `"strict": true`.

#### Scenario: Build limpio en proyecto vacío
- **WHEN** se ejecuta `npm run build` en el proyecto recién inicializado
- **THEN** el build completa sin errores ni warnings de TypeScript

#### Scenario: TypeScript rechaza tipos incorrectos
- **WHEN** se escribe código con un tipo incorrecto (ej: asignar `number` a `string`)
- **THEN** el compilador emite un error antes de correr el build

### Requirement: ESLint configurado con reglas base
El proyecto SHALL tener ESLint configurado con `eslint-config-next`. SHALL existir un script `"lint"` en `package.json` que corra sin errores en el proyecto base.

#### Scenario: Lint pasa en proyecto base
- **WHEN** se ejecuta `npm run lint`
- **THEN** no se reportan errores ni warnings

### Requirement: Scripts de desarrollo disponibles
El `package.json` SHALL incluir los scripts: `dev`, `build`, `start`, `lint`.

#### Scenario: Servidor de desarrollo inicia
- **WHEN** se ejecuta `npm run dev`
- **THEN** el servidor inicia en `localhost:3000` sin errores en consola
