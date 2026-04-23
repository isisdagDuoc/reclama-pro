## ADDED Requirements

### Requirement: Formulario de registro de empresa
El sistema SHALL proveer una página en `(auth)/register` con un formulario de registro para nuevas empresas. Campos: nombre de empresa (max 80 chars), slug (auto-generado, editable, max 40 chars), email del administrador (max 255 chars), contraseña (min 6, max 128 chars), confirmar contraseña.

#### Scenario: Render inicial
- **WHEN** un usuario sin sesión accede a `/register`
- **THEN** la página muestra el formulario con el campo slug vacío y los demás campos habilitados

#### Scenario: Auto-generación del slug al tipear el nombre
- **WHEN** el usuario escribe en el campo "nombre de empresa"
- **THEN** el campo slug se actualiza automáticamente con el nombre sanitizado (lowercase, sin acentos, espacios→guiones, solo a-z0-9-, max 40 chars)

#### Scenario: Slug editable por el usuario
- **WHEN** el usuario modifica manualmente el campo slug
- **THEN** la auto-generación desde el nombre se detiene y se respeta el valor ingresado por el usuario

### Requirement: Validación del formulario de registro
El sistema SHALL validar todos los campos del formulario tanto en el cliente (UX) como en el Server Action (seguridad). Validación de coincidencia de contraseñas en on blur y disponibilidad de slug con debounce 600ms.

#### Scenario: Nombre de empresa vacío al submit
- **WHEN** el usuario hace submit con el campo nombre vacío
- **THEN** el sistema muestra "Ingresa el nombre de tu empresa." y bloquea el submit

#### Scenario: Nombre de empresa demasiado corto
- **WHEN** el usuario ingresa un nombre con menos de 2 caracteres
- **THEN** el sistema muestra "El nombre debe tener al menos 2 caracteres."

#### Scenario: Email con formato inválido
- **WHEN** el usuario ingresa un email que no cumple el formato estándar
- **THEN** el sistema muestra "El formato del correo no es válido (ejemplo: usuario@empresa.com)."

#### Scenario: Contraseña demasiado corta
- **WHEN** el usuario ingresa una contraseña con menos de 6 caracteres
- **THEN** el sistema muestra "La contraseña debe tener al menos 6 caracteres."

#### Scenario: Contraseñas no coinciden (on blur)
- **WHEN** el usuario sale del campo "confirmar contraseña" y los valores no coinciden
- **THEN** el sistema muestra "Las contraseñas no coinciden." inmediatamente

#### Scenario: Slug con formato inválido
- **WHEN** el usuario ingresa caracteres no permitidos en el slug
- **THEN** el sistema muestra "Solo letras minúsculas, números y guiones (ej: mi-empresa)." y deshabilita el submit

#### Scenario: Slug disponible (validación en tiempo real)
- **WHEN** el usuario termina de escribir el slug (debounce 600ms) y el slug es único en Firestore
- **THEN** el sistema muestra un indicador "Disponible" en verde

#### Scenario: Slug ya en uso (validación en tiempo real)
- **WHEN** el usuario termina de escribir el slug (debounce 600ms) y el slug ya existe en Firestore
- **THEN** el sistema muestra "Este identificador ya está en uso. Prueba con otro." y deshabilita el submit

#### Scenario: Error al verificar slug
- **WHEN** la consulta de disponibilidad falla (error de red o Firestore)
- **THEN** el sistema muestra "No se pudo verificar disponibilidad — se comprobará al crear la cuenta." y permite el submit

### Requirement: Server Action registerEnterprise
El sistema SHALL proveer un Server Action `registerEnterprise(idToken, { name, slug, email })` que crea la empresa y el usuario administrador en Firestore, setea Custom Claims y retorna señal para forzar refresh del token en el cliente.

#### Scenario: Registro exitoso
- **WHEN** el Server Action recibe un idToken válido y datos de empresa válidos con slug único
- **THEN** crea `enterprises/{newId}` con `{ name, slug, plan: 'basic', claimCounter: 0, createdAt }`, crea `enterpriseUsers/{uid}` con `{ role: 'admin', email, name, enterpriseId }`, setea Custom Claims `{ enterpriseId, role: 'admin' }`, y retorna `{ success: true }`

#### Scenario: Registro con slug ya tomado (race condition)
- **WHEN** el Server Action verifica el slug dentro de la Firestore Transaction y ya existe
- **THEN** la transacción falla y el Server Action retorna `{ error: 'slug_taken' }`

#### Scenario: Email ya registrado en Firebase Auth
- **WHEN** el usuario con ese email ya tiene cuenta en Firebase Auth
- **THEN** el Server Action retorna `{ error: 'email_already_exists' }`

#### Scenario: Creación atómica en Firestore
- **WHEN** el Server Action crea la empresa y el usuario administrador
- **THEN** ambas escrituras ocurren dentro de una Firestore Transaction

### Requirement: Flujo de registro con refresh de token
El sistema SHALL, después de que `registerEnterprise()` retorna `{ success: true }`, forzar el refresco del ID token con `getIdToken(true)` para obtener las Custom Claims recién seteadas, y luego llamar al Server Action `login()` con el token fresco.

#### Scenario: Flujo completo de registro exitoso
- **WHEN** `registerEnterprise()` retorna éxito
- **THEN** el cliente llama `credential.user.getIdToken(true)` para obtener token fresco con Custom Claims, luego llama `login(freshToken)`, y el browser navega a `/dashboard`

### Requirement: Server Action checkSlugAvailability
El sistema SHALL proveer un Server Action `checkSlugAvailability(slug): Promise<{ available: boolean, error?: boolean }>` que consulta Firestore para verificar si el slug está disponible.

#### Scenario: Slug disponible
- **WHEN** se llama con un slug que no existe en `enterprises`
- **THEN** retorna `{ available: true }`

#### Scenario: Slug no disponible
- **WHEN** se llama con un slug que ya existe en `enterprises`
- **THEN** retorna `{ available: false }`

#### Scenario: Slug vacío o inválido
- **WHEN** se llama con un slug vacío o con formato inválido
- **THEN** retorna `{ available: false }` sin consultar Firestore

#### Scenario: Error de Firestore
- **WHEN** la consulta falla por error de red o credenciales
- **THEN** retorna `{ available: true, error: true }` — no bloquea el formulario
