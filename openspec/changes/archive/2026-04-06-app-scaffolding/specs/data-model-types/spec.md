## ADDED Requirements

### Requirement: Interfaces TypeScript para todas las colecciones Firestore
El archivo `src/types/index.ts` SHALL exportar interfaces que mapeen 1:1 con el modelo de datos de Firestore. Los IDs de documentos SHALL ser `string`. Los timestamps SHALL ser `FirebaseFirestore.Timestamp` en contexto servidor.

Interfaces requeridas:

```typescript
interface Enterprise {
  id: string;
  name: string;
  slug: string;
  plan: 'basic' | 'pro' | 'enterprise';
  createdAt: FirebaseFirestore.Timestamp;
  claimCounter: number;
}

interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
}

interface Claim {
  id: string;
  ticketNumber: string;
  status: ClaimStatus;
  category: ClaimCategory;
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  accessToken: string;
  rating: number | null;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

interface HistoryEntry {
  id: string;
  action: string;
  authorId: string;
  timestamp: FirebaseFirestore.Timestamp;
}
```

#### Scenario: TypeScript valida tipos al asignar un Claim
- **WHEN** se intenta asignar un objeto con `status: "pendiente"` (valor inválido) a una variable de tipo `Claim`
- **THEN** TypeScript emite error de compilación

#### Scenario: Interfaces importables desde cualquier archivo server
- **WHEN** un archivo en `lib/queries/` importa `{ Claim }` desde `types/index.ts`
- **THEN** la importación funciona sin errores de TypeScript

### Requirement: Type aliases para unions del dominio
SHALL existir tipos `ClaimStatus` y `ClaimCategory` exportados que reflejen los valores válidos del dominio.

```typescript
type ClaimStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type ClaimCategory =
  | 'defective_product'
  | 'delivery_delay'
  | 'poor_service'
  | 'billing_error'
  | 'warranty'
  | 'other';
```

#### Scenario: Valor inválido de status rechazado por TypeScript
- **WHEN** se asigna `"cancelled"` a una variable de tipo `ClaimStatus`
- **THEN** TypeScript emite error en tiempo de compilación

### Requirement: Constantes del dominio en `constants/index.ts`
SHALL existir el archivo `src/constants/index.ts` que exporte:

1. `CLAIM_CATEGORIES`: Record de `ClaimCategory` → label en español para mostrar en UI
2. `CLAIM_STATUSES`: Record de `ClaimStatus` → label en español
3. `CLAIM_ROLES`: Record de roles → label en español

```typescript
export const CLAIM_CATEGORIES: Record<ClaimCategory, string> = {
  defective_product: 'Producto defectuoso',
  delivery_delay: 'Retraso en entrega',
  poor_service: 'Mal servicio al cliente',
  billing_error: 'Error en cobro / facturación',
  warranty: 'Garantía',
  other: 'Otro',
};
```

#### Scenario: Constante usada en UI para mostrar label
- **WHEN** un componente recibe `category: 'delivery_delay'` y consulta `CLAIM_CATEGORIES['delivery_delay']`
- **THEN** obtiene el string `'Retraso en entrega'`

#### Scenario: TypeScript detecta key inexistente en CLAIM_CATEGORIES
- **WHEN** se accede a `CLAIM_CATEGORIES['invalid_key']`
- **THEN** TypeScript emite error de compilación por key no válida
