import { useEffect, useState } from 'react';
import { listTickets } from '../api/tickets';
import type { Ticket } from '../types';

export function FilaPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      try {
        const data = await listTickets();
        if (active) {
          setTickets(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar a fila');
        }
      }
    }

    void load();
    const interval = setInterval(() => void load(), 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const history = tickets
    .filter((ticket) => ticket.calledAt !== null)
    .sort((a, b) => (b.calledAt ?? '').localeCompare(a.calledAt ?? ''));
  const current = history.find((ticket) => ticket.status === 'called') ?? null;
  const past = history.filter((ticket) => ticket !== current);
  const waiting = tickets.filter((ticket) => ticket.status === 'waiting');

  return (
    <section className="page">
      <h1>Fila</h1>

      <div className={`current ${current?.kind === 'priority' ? 'priority' : ''}`}>
        <span className="highlight-label">Senha atual</span>
        <span className="highlight-code">{current ? current.code : '---'}</span>
      </div>

      <h2>Aguardando</h2>
      {waiting.length === 0 ? (
        <p className="muted">Nenhuma senha aguardando.</p>
      ) : (
        <ul className="ticket-list">
          {waiting.map((ticket) => (
            <li key={ticket.id}>
              <span className="ticket-code">{ticket.code}</span>
              <span className="muted">
                {ticket.position != null ? `${ticket.position}ª posição` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2>Senhas anteriores</h2>
      {past.length === 0 ? (
        <p className="muted">Nenhuma senha chamada ainda.</p>
      ) : (
        <ul className="ticket-list">
          {past.map((ticket) => (
            <li key={ticket.id}>
              <span className="ticket-code">{ticket.code}</span>
              <span className="muted">
                {ticket.calledAt
                  ? new Date(ticket.calledAt).toLocaleTimeString('pt-BR')
                  : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="error">{error}</p>}
    </section>
  );
}
