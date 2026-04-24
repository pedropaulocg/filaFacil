import { describe, it, expect, beforeEach } from 'vitest';
import { TicketService } from '../src/services/TicketService.js';

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(() => {
    service = new TicketService();
  });

  it('starts with an empty queue', () => {
    expect(service.list()).toEqual([]);
  });

  it('generates tickets with auto-incremented numbers starting at 1', () => {
    const first = service.generate();
    const second = service.generate();

    expect(first.number).toBe(1);
    expect(second.number).toBe(2);
  });

  it('returns tickets in the order they were generated', () => {
    service.generate();
    service.generate();
    service.generate();

    expect(service.list().map((t) => t.number)).toEqual([1, 2, 3]);
  });

  it('includes an ISO createdAt timestamp', () => {
    const ticket = service.generate();

    expect(ticket.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('returns a copy of the queue, not the internal array', () => {
    service.generate();
    const snapshot = service.list();
    snapshot.pop();

    expect(service.list()).toHaveLength(1);
  });
});
