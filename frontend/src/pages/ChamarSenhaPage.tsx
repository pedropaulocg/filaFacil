import { useCallback, useEffect, useState } from 'react';
import { callNextTicket, listTickets } from '../api/tickets';
import type { Ticket } from '../types';

export function ChamarSenhaPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [lastCalled, setLastCalled] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      setTickets(await listTickets());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar a fila');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCall(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const called = await callNextTicket();
      setLastCalled(called);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao chamar senha');
    } finally {
      setLoading(false);
    }
  }

  const waiting = tickets.filter((ticket) => ticket.status === 'waiting');
  const waitingPriority = waiting.filter((ticket) => ticket.kind === 'priority').length;
  const waitingNormal = waiting.length - waitingPriority;

  return (
    <section className="page">
      <h1>Chamar senha</h1>

      <button
        type="button"
        className="primary big"
        onClick={() => void handleCall()}
        disabled={loading}
      >
        {loading ? 'Chamando...' : 'Chamar próxima'}
      </button>

      {lastCalled && (
        <div className={`highlight ${lastCalled.kind === 'priority' ? 'priority' : ''}`}>
          <span className="highlight-label">Senha chamada</span>
          <span className="highlight-code">{lastCalled.code}</span>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <div className="waiting-summary">
        <span>{waitingPriority} preferencial(is) aguardando</span>
        <span>{waitingNormal} normal(is) aguardando</span>
      </div>
    </section>
  );
}
