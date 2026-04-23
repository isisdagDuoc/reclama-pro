## MODIFIED Requirements

### Requirement: Login con email y contraseña
El sistema SHALL autenticar usuarios via Firebase Auth con email/contraseña. El flujo ocurre en dos pasos: autenticación en el cliente (SDK Firebase) seguida de verificación server-side y establecimiento de Firebase Session Cookie. El valor almacenado en la cookie `session` es un JWT de Firebase Session Cookie (no el UID).

#### Scenario: Credenciales correctas
- **WHEN** un usuario envía email y contraseña válidos al Server Action `login`
- **THEN** el sistema verifica el ID token con `admin.auth().verifyIdToken()`, crea una Firebase Session Cookie con `admin.auth().createSessionCookie(idToken, { expiresIn: 604800000 })`, setea la cookie `session` HttpOnly con ese JWT, y redirige a `/dashboard`

#### Scenario: Credenciales incorrectas
- **WHEN** Firebase Auth rechaza las credenciales (email inexistente o contraseña incorrecta)
- **THEN** el sistema retorna un error genérico al formulario sin exponer detalles de Firebase

#### Scenario: ID token inválido o expirado
- **WHEN** el Server Action recibe un ID token que `firebase-admin` no puede verificar
- **THEN** el sistema retorna un error genérico sin redirect

## MODIFIED Requirements

### Requirement: Cookie de sesión HttpOnly
El sistema SHALL persistir la sesión como una cookie `session` con los atributos `httpOnly: true`, `secure: true` (en producción), `sameSite: 'lax'` y `maxAge` de 7 días. El valor de la cookie es un JWT de Firebase Session Cookie (no un UID en texto plano).

#### Scenario: Cookie establecida correctamente
- **WHEN** el login es exitoso
- **THEN** la respuesta incluye un header `Set-Cookie` con la cookie `session` conteniendo el JWT de la Firebase Session Cookie y los atributos de seguridad requeridos

#### Scenario: Cookie no accesible desde JavaScript
- **WHEN** código cliente intenta leer `document.cookie`
- **THEN** la cookie `session` no está presente (httpOnly la oculta del browser)

## ADDED Requirements

### Requirement: Server Action registerEnterprise
El sistema SHALL proveer un Server Action `registerEnterprise(idToken, data)` que crea la empresa y el usuario administrador. Ver spec `enterprise-registration` para el detalle completo del flujo y validaciones.

#### Scenario: Registro exitoso retorna señal al cliente
- **WHEN** el Server Action completa la creación de empresa, usuario y Custom Claims exitosamente
- **THEN** retorna `{ success: true }` para que el cliente pueda forzar el refresh del token antes de llamar `login()`

### Requirement: Server Action checkSlugAvailability
El sistema SHALL proveer un Server Action `checkSlugAvailability(slug): Promise<{ available: boolean }>` para validación en tiempo real del slug. Ver spec `enterprise-registration` para el detalle.

#### Scenario: Slug disponible
- **WHEN** se llama con un slug que no existe en `enterprises`
- **THEN** retorna `{ available: true }`
