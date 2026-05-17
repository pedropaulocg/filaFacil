import type { Ticket } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function generateTicket(): Promise<Ticket> {
  const response = await fetch(`${API_URL}/tickets`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Falha ao gerar senha');
  }
  return (await response.json()) as Ticket;
}

export async function listTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_URL}/tickets`);
  if (!response.ok) {
    throw new Error('Falha ao carregar a fila');
  }
  return (await response.json()) as Ticket[];
}
