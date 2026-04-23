## ADDED Requirements

### Requirement: Protección de rutas del panel
El sistema SHALL interceptar todos los requests a rutas bajo `(panel)` (paths que comienzan con `/dashboard`, `/claims`, `/reports`) y verificar la presencia de la cookie de sesión antes de permitir el acceso.

#### Scenario: Request con sesión válida
- **WHEN** un request llega a una ruta protegida con la cookie `session` presente
- **THEN** el middleware permite el request sin modificación

#### Scenario: Request sin sesión
- **WHEN** un request llega a una ruta protegida sin la cookie `session`
- **THEN** el middleware redirige a `/login` con código 307 (Temporary Redirect)

#### Scenario: Request a ruta pública de auth
- **WHEN** un request llega a `/login`, `/register`, `/forgot-password` o `/reset-password` sin cookie de sesión
- **THEN** el middleware no interfiere (deja pasar el request)

### Requirement: Redirección desde login si ya autenticado
El sistema SHALL redirigir automáticamente a `/dashboard` si un usuario con sesión activa intenta acceder a `/login`.

#### Scenario: Usuario autenticado accede a login
- **WHEN** un usuario con cookie `session` válida hace GET a `/login`
- **THEN** el middleware redirige a `/dashboard`

### Requirement: Rutas de auth adicionales en el matcher
El sistema SHALL incluir `/register`, `/forgot-password` y `/reset-password` en el `config.matcher` del proxy, con el mismo comportamiento que `/login`: si hay sesión activa, redirigir a `/dashboard`.

#### Scenario: Usuario autenticado accede a /register
- **WHEN** un usuario con cookie `session` válida hace GET a `/register`
- **THEN** el middleware redirige a `/dashboard`

#### Scenario: Usuario autenticado accede a /forgot-password
- **WHEN** un usuario con cookie `session` válida hace GET a `/forgot-password`
- **THEN** el middleware redirige a `/dashboard`

#### Scenario: Usuario autenticado accede a /reset-password
- **WHEN** un usuario con cookie `session` válida hace GET a `/reset-password`
- **THEN** el middleware redirige a `/dashboard`

#### Scenario: Usuario sin sesión accede a rutas de auth
- **WHEN** un usuario sin cookie `session` accede a `/register`, `/forgot-password` o `/reset-password`
- **THEN** el middleware permite el request sin modificación
