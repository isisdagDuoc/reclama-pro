## ADDED Requirements

### Requirement: Layout del grupo auth sin sidebar
El sistema SHALL proveer un layout para el route group `(auth)` que NO incluya la sidebar del panel. El layout aplica un fondo `#f1f5f9` (slate-100) a toda la pantalla.

#### Scenario: Pantalla de login sin elementos del panel
- **WHEN** el usuario accede a `/login`
- **THEN** la pantalla muestra solo el formulario centrado, sin sidebar ni navegación del panel

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
- **THEN** el sistema muestra "El formato del correo no es válido"

#### Scenario: Contraseña vacía al submit
- **WHEN** el usuario hace submit con el campo contraseña vacío
- **THEN** el sistema muestra "Ingresa tu contraseña" y bloquea el submit

#### Scenario: Credenciales incorrectas
- **WHEN** el Server Action retorna error de autenticación
- **THEN** la página muestra "Correo o contraseña incorrectos" debajo del formulario sin limpiar los campos

#### Scenario: Demasiados intentos fallidos
- **WHEN** Firebase Auth retorna `auth/too-many-requests`
- **THEN** la página muestra "Demasiados intentos fallidos. Espera unos minutos antes de intentar de nuevo."

#### Scenario: Error de red
- **WHEN** ocurre un error de conexión al llamar Firebase Auth
- **THEN** la página muestra "Error de conexión. Verifica tu internet e intenta de nuevo."

#### Scenario: Login exitoso
- **WHEN** el Server Action confirma la sesión
- **THEN** el browser navega a `/dashboard` (via redirect del Server Action)

### Requirement: Página de registro de empresa
El sistema SHALL proveer una página en `(auth)/register` con el formulario de registro de empresa según el spec `enterprise-registration`. Ver ese spec para el detalle completo de campos, validaciones y mensajes de error.

#### Scenario: Render con sesión activa
- **WHEN** un usuario con cookie de sesión accede a `/register`
- **THEN** el proxy redirige a `/dashboard`

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

### Requirement: Wording en español neutro en toda la UI de auth
El sistema SHALL usar tuteo (forma "tú") en todos los textos de la interfaz de auth. Nunca voseo.

#### Scenario: Textos de la página de login
- **WHEN** la página de login renderiza
- **THEN** el subtítulo dice "Accede a tu panel de gestión", el link de registro dice "¿No tienes cuenta? Regístrate", y el link de recupero dice "¿Olvidaste tu contraseña?"

### Requirement: Estilos del flujo auth según paleta del panel
El sistema SHALL aplicar los colores definidos para el flujo panel/auth: fondo `#f1f5f9`, card en `#ffffff` con `border: 1px solid #e2e8f0` y `border-radius: 8px`, botón de submit en `#1d4ed8` (azul).

#### Scenario: Variables CSS en el layout de auth
- **WHEN** el layout de `(auth)` renderiza
- **THEN** las variables CSS de color están disponibles para los componentes hijos via CSS custom properties en `:root`
