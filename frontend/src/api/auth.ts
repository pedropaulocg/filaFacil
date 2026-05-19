import { apiFetch } from './client';
import type { AuthResult, AuthUser } from '../types';

export function register(name: string, email: string, password: string): Promise<AuthResult> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email: string, password: string): Promise<AuthResult> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function fetchMe(): Promise<AuthUser> {
  return apiFetch('/auth/me');
}
