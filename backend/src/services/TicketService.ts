import { TicketModel, type TicketHydrated } from '../models/Ticket.js';
import { nextSequence } from '../models/Counter.js';
import { HttpError } from '../errors/HttpError.js';
import type { Ticket, TicketKind } from '../types/ticket.js';

export class TicketService {
  async generate(kind: TicketKind): Promise<Ticket> {
    const number = await nextSequence(kind);
    const doc = await TicketModel.create({ number, kind, status: 'waiting' });
    return this.toTicket(doc);
  }

  async list(): Promise<Ticket[]> {
    const docs = await TicketModel.find().sort({ createdAt: 1 });
    return docs.map((doc) => this.toTicket(doc));
  }

  async callNext(userId: string): Promise<Ticket> {
    const kind = await this.pickNextKind();
    if (!kind) {
      throw new HttpError(404, 'Não há senhas aguardando');
    }
    const doc = await TicketModel.findOneAndUpdate(
      { kind, status: 'waiting' },
      { status: 'called', calledAt: new Date(), calledBy: userId },
      { sort: { number: 1 }, returnDocument: 'after' },
    );
    if (!doc) {
      throw new HttpError(404, 'Não há senhas aguardando');
    }
    return this.toTicket(doc);
  }

  private async pickNextKind(): Promise<TicketKind | null> {
    const hasPriority = await TicketModel.exists({ kind: 'priority', status: 'waiting' });
    const hasNormal = await TicketModel.exists({ kind: 'normal', status: 'waiting' });
    if (!hasPriority && !hasNormal) {
      return null;
    }
    if (!hasPriority) {
      return 'normal';
    }
    if (!hasNormal) {
      return 'priority';
    }
    const cyclePosition = await nextSequence('callCycle');
    return (cyclePosition - 1) % 3 === 2 ? 'normal' : 'priority';
  }

  private toTicket(doc: TicketHydrated): Ticket {
    return {
      id: doc.id,
      code: this.formatCode(doc.kind, doc.number),
      kind: doc.kind,
      number: doc.number,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      calledAt: doc.calledAt ? doc.calledAt.toISOString() : null,
    };
  }

  private formatCode(kind: TicketKind, value: number): string {
    if (kind === 'priority') {
      return `PRE_${String(value).padStart(3, '0')}`;
    }
    return `NOR_${String(value).padStart(4, '0')}`;
  }
}
