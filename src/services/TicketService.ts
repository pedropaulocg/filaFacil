import type { Ticket } from '../types/ticket.js';

export class TicketService {
  private tickets: Ticket[] = [];
  private lastNumber = 0;

  generate(): Ticket {
    this.lastNumber += 1;
    const ticket: Ticket = {
      number: this.lastNumber,
      createdAt: new Date().toISOString(),
    };
    this.tickets.push(ticket);
    return ticket;
  }
}
