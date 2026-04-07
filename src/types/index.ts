import type { Timestamp } from 'firebase-admin/firestore';

export type ClaimStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ClaimCategory =
  | 'defective_product'
  | 'delivery_delay'
  | 'poor_service'
  | 'billing_error'
  | 'warranty'
  | 'other';

export interface Enterprise {
  id: string;
  name: string;
  slug: string;
  plan: 'basic' | 'pro' | 'enterprise';
  createdAt: Timestamp;
  claimCounter: number;
}

export interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
}

export interface Claim {
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HistoryEntry {
  id: string;
  action: string;
  authorId: string;
  timestamp: Timestamp;
}
