import { TicketModel, type TicketHydrated } from '../models/Ticket.js';
import { nextSequence } from '../models/Counter.js';
import type { Ticket } from '../types/ticket.js';

export class TicketService {
  async generate(): Promise<Ticket> {
    const number = await nextSequence('ticketNumber');
    const doc = await TicketModel.create({ number });
    return this.toTicket(doc);
  }

  async list(): Promise<Ticket[]> {
    const docs = await TicketModel.find().sort({ number: 1 });
    return docs.map((doc) => this.toTicket(doc));
  }

  private toTicket(doc: TicketHydrated): Ticket {
    return {
      number: doc.number,
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
