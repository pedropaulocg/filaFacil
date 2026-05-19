export type TicketKind = 'normal' | 'priority';
export type TicketStatus = 'waiting' | 'called';

export interface Ticket {
  id: string;
  code: string;
  kind: TicketKind;
  number: number;
  status: TicketStatus;
  createdAt: string;
  calledAt: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}
