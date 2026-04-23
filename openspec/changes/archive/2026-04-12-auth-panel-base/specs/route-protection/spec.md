## ADDED Requirements

### Requirement: Protección de rutas del panel
El sistema SHALL interceptar todos los requests a rutas bajo `(panel)` (paths que comienzan con `/dashboard`, `/claims`, `/reports`) y verificar la presencia de la cookie de sesión antes de permitir el acceso.

#### Scenario: Request con sesión válida
- **WHEN** un request llega a una ruta protegida con la cookie `session` presente
- **THEN** el middleware permite el request sin modificación

#### Scenario: Request sin sesión
- **WHEN** un request llega a una ruta protegida sin la cookie `session`
- **THEN** el middleware redirige a `/login` con código 307 (Temporary Redirect)

#### Scenario: Request a ruta pública
- **WHEN** un request llega a `/login` u otras rutas fuera del grupo `(panel)`
- **THEN** el middleware no interfiere (deja pasar el request)

### Requirement: Redirect a login con returnUrl
El sistema SHALL redirigir al usuario de vuelta a la ruta que intentaba acceder después de un login exitoso (cuando sea aplicable).

#### Scenario: Acceso denegado con returnUrl
- **WHEN** un usuario sin sesión intenta acceder a `/dashboard`
- **THEN** el middleware redirige a `/login` (sin returnUrl para MVP — simplificado)

### Requirement: Redirección desde login si ya autenticado
El sistema SHALL redirigir automáticamente a `/dashboard` si un usuario con sesión activa intenta acceder a `/login`.

#### Scenario: Usuario autenticado accede a login
- **WHEN** un usuario con cookie `session` válida hace GET a `/login`
- **THEN** el middleware redirige a `/dashboard`
