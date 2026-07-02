import { describe, it, expect, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { TicketService } from '../src/services/TicketService.js';

describe('TicketService', () => {
  const service = new TicketService();
  const operatorId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates a normal ticket with a NOR_ code', async () => {
    const ticket = await service.generate('normal');

    expect(ticket.kind).toBe('normal');
    expect(ticket.status).toBe('waiting');
    expect(ticket.code).toBe('NOR_0001');
  });

  it('generates a priority ticket with a separate PRE_ sequence', async () => {
    await service.generate('normal');
    const priority = await service.generate('priority');

    expect(priority.code).toBe('PRE_001');
  });

  it('throws when calling next with an empty queue', async () => {
    await expect(service.callNext(operatorId)).rejects.toThrow();
  });

  it('marks the called ticket with status and calledAt', async () => {
    await service.generate('normal');
    const called = await service.callNext(operatorId);

    expect(called.status).toBe('called');
    expect(called.calledAt).not.toBeNull();
  });

  it('calls priority before normal when both are waiting', async () => {
    await service.generate('normal');
    await service.generate('priority');

    expect((await service.callNext(operatorId)).kind).toBe('priority');
  });

  it('finishes a called ticket with status done and finishedAt', async () => {
    await service.generate('normal');
    const called = await service.callNext(operatorId);

    const finished = await service.finish(called.id);

    expect(finished.status).toBe('done');
    expect(finished.finishedAt).not.toBeNull();
  });

  it('rejects finishing a ticket that was not called', async () => {
    const waiting = await service.generate('normal');

    await expect(service.finish(waiting.id)).rejects.toThrow(
      'Somente senhas chamadas podem ser finalizadas',
    );
  });

  it('rejects finishing an unknown ticket', async () => {
    await expect(service.finish('nao-existe')).rejects.toThrow('Senha não encontrada');
  });

  it('marks a called ticket as absent', async () => {
    await service.generate('normal');
    const called = await service.callNext(operatorId);

    const absent = await service.markAbsent(called.id);

    expect(absent.status).toBe('absent');
  });

  it('rejects marking a waiting ticket as absent', async () => {
    const waiting = await service.generate('normal');

    await expect(service.markAbsent(waiting.id)).rejects.toThrow(
      'Somente senhas chamadas podem ser marcadas como ausentes',
    );
  });

  it('recalls an absent ticket with a fresh calledAt', async () => {
    await service.generate('normal');
    const called = await service.callNext(operatorId);
    const absent = await service.markAbsent(called.id);

    const recalled = await service.recall(absent.id, operatorId);

    expect(recalled.status).toBe('called');
    expect(recalled.calledAt).not.toBeNull();
    expect(recalled.calledAt).not.toBe(called.calledAt);
  });

  it('rejects recalling a waiting ticket', async () => {
    const waiting = await service.generate('normal');

    await expect(service.recall(waiting.id, operatorId)).rejects.toThrow(
      'Somente senhas chamadas ou ausentes podem ser rechamadas',
    );
  });

  it('does not offer absent tickets on callNext', async () => {
    await service.generate('normal');
    const called = await service.callNext(operatorId);
    await service.markAbsent(called.id);

    await expect(service.callNext(operatorId)).rejects.toThrow('Não há senhas aguardando');
  });

  it('returns the queue position when generating a ticket', async () => {
    const first = await service.generate('normal');
    const second = await service.generate('normal');
    const priority = await service.generate('priority');

    expect(first.position).toBe(1);
    expect(second.position).toBe(2);
    expect(priority.position).toBe(1);
  });

  it('recomputes positions in list after a call', async () => {
    await service.generate('normal');
    await service.generate('normal');
    await service.callNext(operatorId);

    const tickets = await service.list();
    const waiting = tickets.filter((ticket) => ticket.status === 'waiting');
    const called = tickets.filter((ticket) => ticket.status === 'called');

    expect(waiting).toHaveLength(1);
    expect(waiting[0]?.position).toBe(1);
    expect(called[0]?.position).toBeNull();
  });

  it('restarts the numbering on a new day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-07-02T10:00:00'));
    const today = await service.generate('normal');
    expect(today.code).toBe('NOR_0001');

    vi.setSystemTime(new Date('2026-07-03T08:00:00'));
    const tomorrow = await service.generate('normal');

    expect(tomorrow.code).toBe('NOR_0001');
  });

  it('lists only tickets from the current day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-07-02T10:00:00'));
    await service.generate('normal');

    vi.setSystemTime(new Date('2026-07-03T08:00:00'));
    await service.generate('priority');

    const tickets = await service.list();

    expect(tickets).toHaveLength(1);
    expect(tickets[0]?.kind).toBe('priority');
  });

  it('does not call waiting tickets from a previous day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-07-02T10:00:00'));
    await service.generate('normal');

    vi.setSystemTime(new Date('2026-07-03T08:00:00'));

    await expect(service.callNext(operatorId)).rejects.toThrow('Não há senhas aguardando');
  });

  it('follows a 2 priority : 1 normal ratio', async () => {
    for (let i = 0; i < 6; i += 1) {
      await service.generate('priority');
      await service.generate('normal');
    }

    const kinds: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      kinds.push((await service.callNext(operatorId)).kind);
    }

    expect(kinds).toEqual([
      'priority',
      'priority',
      'normal',
      'priority',
      'priority',
      'normal',
    ]);
  });
});
