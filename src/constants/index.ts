import type { ClaimCategory, ClaimStatus } from '@/types';

export const CLAIM_CATEGORIES: Record<ClaimCategory, string> = {
  defective_product: 'Producto defectuoso',
  delivery_delay: 'Retraso en entrega',
  poor_service: 'Mal servicio al cliente',
  billing_error: 'Error en cobro / facturación',
  warranty: 'Garantía',
  other: 'Otro',
};

export const CLAIM_STATUSES: Record<ClaimStatus, string> = {
  open: 'Abierto',
  in_progress: 'En progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

export const CLAIM_ROLES: Record<'admin' | 'agent', string> = {
  admin: 'Administrador',
  agent: 'Agente',
};
