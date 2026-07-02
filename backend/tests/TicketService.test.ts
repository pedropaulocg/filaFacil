import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { TicketService } from '../src/services/TicketService.js';

describe('TicketService', () => {
  const service = new TicketService();
  const operatorId = new mongoose.Types.ObjectId().toString();

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
