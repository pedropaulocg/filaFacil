import { describe, it, expect } from 'vitest';
import { TicketService } from '../src/services/TicketService.js';

describe('TicketService', () => {
  const service = new TicketService();

  it('starts with an empty queue', async () => {
    expect(await service.list()).toEqual([]);
  });

  it('generates tickets with auto-incremented numbers starting at 1', async () => {
    const first = await service.generate();
    const second = await service.generate();

    expect(first.number).toBe(1);
    expect(second.number).toBe(2);
  });

  it('lists tickets ordered by number', async () => {
    await service.generate();
    await service.generate();
    await service.generate();

    const numbers = (await service.list()).map((ticket) => ticket.number);
    expect(numbers).toEqual([1, 2, 3]);
  });

  it('includes an ISO createdAt timestamp', async () => {
    const ticket = await service.generate();

    expect(ticket.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
