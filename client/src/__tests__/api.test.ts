import { isTokenValid } from '../services/api';

// Build a minimal JWT with the given exp (seconds since epoch)
function makeToken(exp: number): string {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ userId: 'u1', exp }));
  return `${header}.${payload}.sig`;
}

describe('api — isTokenValid', () => {
  afterEach(() => localStorage.clear());

  it('returns false when no token stored', () => {
    expect(isTokenValid()).toBe(false);
  });

  it('returns false for a malformed token', () => {
    localStorage.setItem('jwt_token', 'not.a.jwt');
    expect(isTokenValid()).toBe(false);
  });

  it('returns false for an expired token', () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    localStorage.setItem('jwt_token', makeToken(past));
    expect(isTokenValid()).toBe(false);
  });

  it('returns true for a valid (non-expired) token', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('jwt_token', makeToken(future));
    expect(isTokenValid()).toBe(true);
  });
});
