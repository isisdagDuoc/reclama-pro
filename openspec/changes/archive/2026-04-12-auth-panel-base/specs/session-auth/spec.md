## ADDED Requirements

### Requirement: Login con email y contraseña
El sistema SHALL autenticar usuarios via Firebase Auth con email/contraseña. El flujo ocurre en dos pasos: autenticación en el cliente (SDK Firebase) seguida de verificación server-side y establecimiento de cookie de sesión.

#### Scenario: Credenciales correctas
- **WHEN** un usuario envía email y contraseña válidos al Server Action `login`
- **THEN** el sistema verifica el ID token con `firebase-admin`, setea una cookie `session` HttpOnly con `maxAge` de 7 días, y redirige a `/dashboard`

#### Scenario: Credenciales incorrectas
- **WHEN** Firebase Auth rechaza las credenciales (email inexistente o contraseña incorrecta)
- **THEN** el sistema retorna un error genérico al formulario sin exponer detalles de Firebase

#### Scenario: ID token inválido o expirado
- **WHEN** el Server Action recibe un ID token que `firebase-admin` no puede verificar
- **THEN** el sistema retorna un error genérico sin redirect

### Requirement: Cookie de sesión HttpOnly
El sistema SHALL persistir la sesión como una cookie `session` con los atributos `httpOnly: true`, `secure: true` (en producción), `sameSite: 'lax'` y `maxAge` de 7 días (604800 segundos).

#### Scenario: Cookie establecida correctamente
- **WHEN** el login es exitoso
- **THEN** la respuesta incluye un header `Set-Cookie` con la cookie `session` y los atributos de seguridad requeridos

#### Scenario: Cookie no accesible desde JavaScript
- **WHEN** código cliente intenta leer `document.cookie`
- **THEN** la cookie `session` no está presente (httpOnly la oculta del browser)

### Requirement: Logout
El sistema SHALL proveer un Server Action `logout` que elimina la cookie de sesión y redirige a `/login`.

#### Scenario: Logout exitoso
- **WHEN** el usuario ejecuta la acción de logout
- **THEN** el sistema elimina la cookie `session` y redirige a `/login`
