import { useState } from 'react';
import { createTicket } from '../api/tickets';
import type { Ticket, TicketKind } from '../types';

export function CriarSenhaPage() {
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(kind: TicketKind): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      setLastTicket(await createTicket(kind));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <h1>Criar senha</h1>
      <div className="kind-buttons">
        <button
          type="button"
          className="primary"
          onClick={() => void handleCreate('normal')}
          disabled={loading}
        >
          Senha normal
        </button>
        <button
          type="button"
          className="primary priority"
          onClick={() => void handleCreate('priority')}
          disabled={loading}
        >
          Senha preferencial
        </button>
      </div>

      {lastTicket && (
        <div className={`highlight ${lastTicket.kind === 'priority' ? 'priority' : ''}`}>
          <span className="highlight-label">Senha gerada</span>
          <span className="highlight-code">{lastTicket.code}</span>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </section>
  );
}
