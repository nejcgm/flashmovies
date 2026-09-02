import * as bcrypt from 'bcrypt';

export async function hashSessionToken(token: string): Promise<string> {
  return bcrypt.hash(token.slice(-32), 5);
}

export async function verifySessionToken(token: string, tokenHash: string): Promise<boolean> {
  return bcrypt.compare(token.slice(-32), tokenHash);
}
