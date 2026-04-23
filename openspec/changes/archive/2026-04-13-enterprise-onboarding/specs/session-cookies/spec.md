## ADDED Requirements

### Requirement: Firebase Session Cookie como mecanismo de sesión
El sistema SHALL usar Firebase Session Cookies (JWT firmado por Firebase Admin) como valor de la cookie `session`, reemplazando el UID en texto plano. La cookie se crea con `admin.auth().createSessionCookie(idToken, { expiresIn })` y se verifica con `admin.auth().verifySessionCookie(cookie, true)`.

#### Scenario: Creación de Session Cookie en login exitoso
- **WHEN** `login(idToken)` recibe un ID token válido
- **THEN** el sistema llama `admin.auth().createSessionCookie(idToken, { expiresIn: 604800000 })` (7 días en ms) y almacena el JWT resultante en la cookie `session` HttpOnly

#### Scenario: Verificación de Session Cookie en Server Actions del panel
- **WHEN** un Server Action protegido lee la cookie `session`
- **THEN** llama `admin.auth().verifySessionCookie(sessionValue, true)` para obtener el decoded token con Custom Claims (`enterpriseId`, `role`)

#### Scenario: Session Cookie vencida
- **WHEN** `verifySessionCookie` recibe una cookie cuyo JWT está vencido
- **THEN** lanza un error que el Server Action captura y trata como sesión inválida

### Requirement: Custom Claims en el token del usuario registrado
El sistema SHALL setear Custom Claims `{ enterpriseId: string, role: 'admin' }` en el usuario de Firebase Auth inmediatamente después de crear los documentos de empresa en Firestore durante el registro, usando `admin.auth().setCustomUserClaims(uid, claims)`.

#### Scenario: Claims disponibles en la Session Cookie post-registro
- **WHEN** el cliente fuerza el refresco del ID token con `getIdToken(true)` después de que el Server Action setea los Custom Claims
- **THEN** el nuevo ID token contiene los claims `enterpriseId` y `role`, y la Session Cookie creada con ese token fresco incluye esos claims

#### Scenario: Acceso a enterpriseId sin query adicional a Firestore
- **WHEN** un Server Action del panel verifica la Session Cookie
- **THEN** el decoded token incluye `enterpriseId` en los claims, sin necesidad de una query adicional a `enterpriseUsers/{uid}`
