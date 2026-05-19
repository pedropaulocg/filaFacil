import { Schema, model, type HydratedDocument } from 'mongoose';

export interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export type UserHydrated = HydratedDocument<UserDocument>;

export const UserModel = model<UserDocument>('User', userSchema);
