import { useCallback, useEffect, useState } from 'react';
import {
  callNextTicket,
  finishTicket,
  listTickets,
  markTicketAbsent,
  recallTicket,
} from '../api/tickets';
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

  async function handleFinish(): Promise<void> {
    if (!lastCalled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await finishTicket(lastCalled.id);
      setLastCalled(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar atendimento');
    } finally {
      setLoading(false);
    }
  }

  async function handleAbsent(): Promise<void> {
    if (!lastCalled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await markTicketAbsent(lastCalled.id);
      setLastCalled(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar ausência');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecall(id: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const recalled = await recallTicket(id);
      setLastCalled(recalled);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rechamar senha');
    } finally {
      setLoading(false);
    }
  }

  const waiting = tickets.filter((ticket) => ticket.status === 'waiting');
  const waitingPriority = waiting.filter((ticket) => ticket.kind === 'priority').length;
  const waitingNormal = waiting.length - waitingPriority;
  const absent = tickets.filter((ticket) => ticket.status === 'absent');

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
        <>
          <div className={`highlight ${lastCalled.kind === 'priority' ? 'priority' : ''}`}>
            <span className="highlight-label">Senha chamada</span>
            <span className="highlight-code">{lastCalled.code}</span>
          </div>
          <div className="action-buttons">
            <button
              type="button"
              className="secondary"
              onClick={() => void handleFinish()}
              disabled={loading}
            >
              Finalizar atendimento
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => void handleAbsent()}
              disabled={loading}
            >
              Não compareceu
            </button>
          </div>
        </>
      )}

      {error && <p className="error">{error}</p>}

      {absent.length > 0 && (
        <>
          <h2>Senhas ausentes</h2>
          <ul className="ticket-list">
            {absent.map((ticket) => (
              <li key={ticket.id}>
                <span className="ticket-code">{ticket.code}</span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => void handleRecall(ticket.id)}
                  disabled={loading}
                >
                  Rechamar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="waiting-summary">
        <span>{waitingPriority} preferencial(is) aguardando</span>
        <span>{waitingNormal} normal(is) aguardando</span>
      </div>
    </section>
  );
}
