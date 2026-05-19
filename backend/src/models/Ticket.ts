import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import type { TicketKind, TicketStatus } from '../types/ticket.js';

export interface TicketDocument {
  number: number;
  kind: TicketKind;
  status: TicketStatus;
  createdAt: Date;
  calledAt: Date | null;
  calledBy: Types.ObjectId | null;
}

const ticketSchema = new Schema<TicketDocument>(
  {
    number: { type: Number, required: true },
    kind: { type: String, enum: ['normal', 'priority'], required: true },
    status: {
      type: String,
      enum: ['waiting', 'called'],
      required: true,
      default: 'waiting',
    },
    calledAt: { type: Date, default: null },
    calledBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ticketSchema.index({ kind: 1, number: 1 }, { unique: true });

export type TicketHydrated = HydratedDocument<TicketDocument>;

export const TicketModel = model<TicketDocument>('Ticket', ticketSchema);
