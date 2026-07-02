import { apiFetch } from './client';
import type { Ticket, TicketKind } from '../types';

export function createTicket(kind: TicketKind): Promise<Ticket> {
  return apiFetch('/tickets', {
    method: 'POST',
    body: JSON.stringify({ kind }),
  });
}

export function listTickets(): Promise<Ticket[]> {
  return apiFetch('/tickets');
}

export function callNextTicket(): Promise<Ticket> {
  return apiFetch('/tickets/call', { method: 'POST' });
}

export function finishTicket(id: string): Promise<Ticket> {
  return apiFetch(`/tickets/${id}/finish`, { method: 'POST' });
}
