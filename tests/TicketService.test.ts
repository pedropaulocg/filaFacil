import { describe, it, expect, beforeEach } from 'vitest';
import { TicketService } from '../src/services/TicketService.js';

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(() => {
    service = new TicketService();
  });

  it('generates tickets with auto-incremented numbers starting at 1', () => {
    const first = service.generate();
    const second = service.generate();

    expect(first.number).toBe(1);
    expect(second.number).toBe(2);
  });

  it('includes an ISO createdAt timestamp', () => {
    const ticket = service.generate();

    expect(ticket.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
