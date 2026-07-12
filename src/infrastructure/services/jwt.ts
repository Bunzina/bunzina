const encoder = new TextEncoder();

function base64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): string {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isFiniteInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value)
  );
}

function parseJwtPayload(payload: unknown): JwtPayload {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Invalid token payload');
  }

  const { sub, email, role, iat, exp } = payload as Record<string, unknown>;

  if (
    !isString(sub) ||
    !isString(email) ||
    !isString(role) ||
    !isFiniteInteger(iat) ||
    !isFiniteInteger(exp) ||
    exp < 0 ||
    iat < 0
  ) {
    throw new Error('Invalid token payload');
  }

  return { sub, email, role, iat, exp };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 3600;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET must be configured');
  }

  return secret;
}

export async function signJwt(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRES_IN,
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(fullPayload));
  const data = `${headerB64}.${payloadB64}`;

  const key = await getKey(getJwtSecret());
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));

  return `${data}.${base64url(signature)}`;
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const headerB64 = parts[0]!;
  const payloadB64 = parts[1]!;
  const signatureB64 = parts[2]!;
  const data = `${headerB64}.${payloadB64}`;

  const key = await getKey(getJwtSecret());
  const signatureBytes = Uint8Array.from(
    atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
    (c) => c.charCodeAt(0),
  );

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(data),
  );

  if (!valid) throw new Error('Invalid token signature');

  const payload = parseJwtPayload(JSON.parse(base64urlDecode(payloadB64)));

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}
