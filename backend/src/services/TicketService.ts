import { isValidObjectId, Types } from 'mongoose';
import { TicketModel, type TicketHydrated } from '../models/Ticket.js';
import { nextSequence } from '../models/Counter.js';
import { HttpError } from '../errors/HttpError.js';
import type { Ticket, TicketKind } from '../types/ticket.js';

export function currentDay(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export class TicketService {
  async generate(kind: TicketKind): Promise<Ticket> {
    const day = currentDay();
    const number = await nextSequence(`${kind}:${day}`);
    const doc = await TicketModel.create({ number, kind, day, status: 'waiting' });
    const position = await TicketModel.countDocuments({
      day,
      kind,
      status: 'waiting',
      number: { $lte: number },
    });
    return this.toTicket(doc, position);
  }

  async list(): Promise<Ticket[]> {
    const docs = await TicketModel.find({ day: currentDay() }).sort({ createdAt: 1 });
    const positions = this.queuePositions(docs);
    return docs.map((doc) => this.toTicket(doc, positions.get(doc.id) ?? null));
  }

  private queuePositions(docs: TicketHydrated[]): Map<string, number> {
    const positions = new Map<string, number>();
    const nextPosition: Record<TicketKind, number> = { normal: 1, priority: 1 };
    const waiting = docs
      .filter((doc) => doc.status === 'waiting')
      .sort((a, b) => a.number - b.number);
    for (const doc of waiting) {
      positions.set(doc.id, nextPosition[doc.kind]);
      nextPosition[doc.kind] += 1;
    }
    return positions;
  }

  async callNext(userId: string): Promise<Ticket> {
    const kind = await this.pickNextKind();
    if (!kind) {
      throw new HttpError(404, 'Não há senhas aguardando');
    }
    const doc = await TicketModel.findOneAndUpdate(
      { kind, status: 'waiting', day: currentDay() },
      { status: 'called', calledAt: new Date(), calledBy: userId },
      { sort: { number: 1 }, returnDocument: 'after' },
    );
    if (!doc) {
      throw new HttpError(404, 'Não há senhas aguardando');
    }
    return this.toTicket(doc);
  }

  async finish(id: string): Promise<Ticket> {
    const doc = await this.findByIdOrFail(id);
    if (doc.status !== 'called') {
      throw new HttpError(409, 'Somente senhas chamadas podem ser finalizadas');
    }
    doc.status = 'done';
    doc.finishedAt = new Date();
    await doc.save();
    return this.toTicket(doc);
  }

  async markAbsent(id: string): Promise<Ticket> {
    const doc = await this.findByIdOrFail(id);
    if (doc.status !== 'called') {
      throw new HttpError(409, 'Somente senhas chamadas podem ser marcadas como ausentes');
    }
    doc.status = 'absent';
    await doc.save();
    return this.toTicket(doc);
  }

  async recall(id: string, userId: string): Promise<Ticket> {
    const doc = await this.findByIdOrFail(id);
    if (doc.status !== 'absent' && doc.status !== 'called') {
      throw new HttpError(409, 'Somente senhas chamadas ou ausentes podem ser rechamadas');
    }
    doc.status = 'called';
    doc.calledAt = new Date();
    doc.calledBy = new Types.ObjectId(userId);
    await doc.save();
    return this.toTicket(doc);
  }

  private async findByIdOrFail(id: string): Promise<TicketHydrated> {
    const doc = isValidObjectId(id) ? await TicketModel.findById(id) : null;
    if (!doc) {
      throw new HttpError(404, 'Senha não encontrada');
    }
    return doc;
  }

  private async pickNextKind(): Promise<TicketKind | null> {
    const day = currentDay();
    const hasPriority = await TicketModel.exists({ kind: 'priority', status: 'waiting', day });
    const hasNormal = await TicketModel.exists({ kind: 'normal', status: 'waiting', day });
    if (!hasPriority && !hasNormal) {
      return null;
    }
    if (!hasPriority) {
      return 'normal';
    }
    if (!hasNormal) {
      return 'priority';
    }
    const cyclePosition = await nextSequence(`callCycle:${day}`);
    return (cyclePosition - 1) % 3 === 2 ? 'normal' : 'priority';
  }

  private toTicket(doc: TicketHydrated, position: number | null = null): Ticket {
    return {
      id: doc.id,
      code: this.formatCode(doc.kind, doc.number),
      kind: doc.kind,
      number: doc.number,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      calledAt: doc.calledAt ? doc.calledAt.toISOString() : null,
      finishedAt: doc.finishedAt ? doc.finishedAt.toISOString() : null,
      position,
    };
  }

  private formatCode(kind: TicketKind, value: number): string {
    if (kind === 'priority') {
      return `PRE_${String(value).padStart(3, '0')}`;
    }
    return `NOR_${String(value).padStart(4, '0')}`;
  }
}
