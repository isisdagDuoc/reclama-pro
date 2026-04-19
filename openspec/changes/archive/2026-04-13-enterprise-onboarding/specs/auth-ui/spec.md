## MODIFIED Requirements

### Requirement: Página de login con formulario centrado
El sistema SHALL proveer una página en `(auth)/login` con un formulario centrado verticalmente y horizontalmente. La página contiene: logo/nombre de la app, campo email, campo contraseña, botón de submit, link a `/register`, link a `/forgot-password`.

#### Scenario: Render inicial
- **WHEN** el usuario accede a `/login`
- **THEN** la página muestra un card centrado con campos email y contraseña habilitados, el botón de submit activo, un link "¿No tienes cuenta? Regístrate" y un link "¿Olvidaste tu contraseña?"

#### Scenario: Submit en progreso
- **WHEN** el usuario hace submit del formulario
- **THEN** el botón se deshabilita y muestra texto "Iniciando sesión..." para prevenir doble submit

#### Scenario: Email vacío al submit
- **WHEN** el usuario hace submit con el campo email vacío
- **THEN** el sistema muestra "Ingresa tu correo electrónico" y bloquea el submit

#### Scenario: Email con formato inválido al submit
- **WHEN** el usuario hace submit con un email de formato inválido
- **THEN** el sistema muestra "El formato no es válido (ejemplo: usuario@empresa.com)"

#### Scenario: Contraseña vacía al submit
- **WHEN** el usuario hace submit con el campo contraseña vacío
- **THEN** el sistema muestra "Ingresa tu contraseña" y bloquea el submit

#### Scenario: Credenciales incorrectas
- **WHEN** el Server Action retorna error de autenticación
- **THEN** la página muestra "Correo o contraseña incorrectos" debajo del formulario sin limpiar los campos

#### Scenario: Demasiados intentos fallidos
- **WHEN** Firebase Auth retorna `auth/too-many-requests`
- **THEN** la página muestra "Demasiados intentos fallidos. Recupera tu contraseña o intenta más tarde"

#### Scenario: Error de red
- **WHEN** ocurre un error de conexión al llamar Firebase Auth
- **THEN** la página muestra "Error de conexión. Verifica tu internet e intenta de nuevo"

#### Scenario: Login exitoso
- **WHEN** el Server Action confirma la sesión
- **THEN** el browser navega a `/dashboard` (via redirect del Server Action)

## ADDED Requirements

### Requirement: Página de registro de empresa
El sistema SHALL proveer una página en `(auth)/register` con el formulario de registro de empresa según el spec `enterprise-registration`. Ver ese spec para el detalle completo de campos, validaciones y mensajes de error.

#### Scenario: Render con sesión activa
- **WHEN** un usuario con cookie de sesión accede a `/register`
- **THEN** la página muestra el mensaje "Ya tienes una cuenta registrada." sin el formulario

#### Scenario: Submit exitoso
- **WHEN** el registro se completa correctamente
- **THEN** el browser navega a `/dashboard`

### Requirement: Página "Olvidé mi contraseña"
El sistema SHALL proveer una página en `(auth)/forgot-password` según el spec `password-recovery`. Ver ese spec para el detalle.

#### Scenario: Acceso a la página
- **WHEN** el usuario accede a `/forgot-password`
- **THEN** la página muestra el formulario con campo email y botón "Enviar enlace"

### Requirement: Página de restablecimiento de contraseña
El sistema SHALL proveer una página en `(auth)/reset-password` según el spec `password-recovery`. Ver ese spec para el detalle.

#### Scenario: Acceso con oobCode válido
- **WHEN** el usuario llega desde el link del email con `oobCode` en la URL
- **THEN** la página muestra el formulario de nueva contraseña

### Requirement: Wording en español neutro/chileno en toda la UI de auth
El sistema SHALL usar tuteo (forma "tú") en todos los textos de la interfaz de auth. Nunca voseo (forma "vos").

#### Scenario: Textos de la página de login
- **WHEN** la página de login renderiza
- **THEN** el subtítulo dice "Accede a tu panel de gestión" (no "Accedé"), el link de registro dice "¿No tienes cuenta? Regístrate", y el link de recupero dice "¿Olvidaste tu contraseña?"

#### Scenario: Textos de la página de registro
- **WHEN** la página de registro renderiza
- **THEN** todos los labels, placeholders y mensajes usan tuteo: "Ingresa", "tu empresa", "Regístrate", "Crea tu cuenta"
