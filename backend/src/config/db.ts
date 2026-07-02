import mongoose from 'mongoose';
import { TicketModel } from '../models/Ticket.js';

export async function connectToDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri);
  await TicketModel.syncIndexes();
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
}
