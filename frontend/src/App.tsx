import { useEffect, useState } from 'react';
import { generateTicket, listTickets } from './api';
import type { Ticket } from './types';
import './App.css';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshQueue() {
    try {
      setTickets(await listTickets());
      setError(null);
    } catch {
      setError('Não foi possível carregar a fila. O servidor está rodando?');
    }
  }

  useEffect(() => {
    void refreshQueue();
  }, []);

  async function handleGenerate() {
    setLoading(true);
    try {
      const ticket = await generateTicket();
      setLastTicket(ticket);
      await refreshQueue();
    } catch {
      setError('Não foi possível gerar a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header>
        <h1>FilaFácil</h1>
        <p className="subtitle">Gerenciamento simples de filas</p>
      </header>

      <button
        type="button"
        className="generate"
        onClick={() => void handleGenerate()}
        disabled={loading}
      >
        {loading ? 'Gerando...' : 'Gerar nova senha'}
      </button>

      {lastTicket && (
        <section className="highlight">
          <span className="highlight-label">Senha gerada</span>
          <span className="highlight-number">{lastTicket.number}</span>
        </section>
      )}

      {error && <p className="error">{error}</p>}

      <section className="queue">
        <div className="queue-header">
          <h2>Fila atual</h2>
          <button type="button" className="refresh" onClick={() => void refreshQueue()}>
            Atualizar
          </button>
        </div>
        {tickets.length === 0 ? (
          <p className="empty">Nenhuma senha na fila.</p>
        ) : (
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.number}>
                <span className="ticket-number">Senha {ticket.number}</span>
                <span className="ticket-time">
                  {new Date(ticket.createdAt).toLocaleTimeString('pt-BR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
