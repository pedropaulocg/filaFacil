import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, type UserHydrated } from '../models/User.js';
import { HttpError } from '../errors/HttpError.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export class AuthService {
  private readonly jwtSecret: string;

  constructor(jwtSecret: string = process.env.JWT_SECRET ?? 'dev-secret-change-me') {
    this.jwtSecret = jwtSecret;
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const existing = await UserModel.findOne({ email });
    if (existing) {
      throw new HttpError(409, 'Email já cadastrado');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, passwordHash });
    return this.buildResult(user);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await UserModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'Credenciais inválidas');
    }
    return this.buildResult(user);
  }

  async getUser(userId: string): Promise<AuthUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado');
    }
    return this.toAuthUser(user);
  }

  verifyToken(token: string): string {
    let decoded: string | jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, this.jwtSecret);
    } catch {
      throw new HttpError(401, 'Token inválido');
    }
    if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
      throw new HttpError(401, 'Token inválido');
    }
    return decoded.userId;
  }

  private buildResult(user: UserHydrated): AuthResult {
    const token = jwt.sign({ userId: user.id }, this.jwtSecret, {
      expiresIn: TOKEN_TTL_SECONDS,
    });
    return { token, user: this.toAuthUser(user) };
  }

  private toAuthUser(user: UserHydrated): AuthUser {
    return { id: user.id, name: user.name, email: user.email };
  }
}
