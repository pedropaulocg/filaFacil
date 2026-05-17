import { Schema, model, type HydratedDocument } from 'mongoose';

export interface TicketDocument {
  number: number;
  createdAt: Date;
}

const ticketSchema = new Schema<TicketDocument>(
  {
    number: { type: Number, required: true, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type TicketHydrated = HydratedDocument<TicketDocument>;

export const TicketModel = model<TicketDocument>('Ticket', ticketSchema);
