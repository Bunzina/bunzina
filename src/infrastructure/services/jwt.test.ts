import { signJwt, verifyJwt } from './jwt';

describe('jwt service', () => {
  test('should sign and verify a JWT token', async () => {
    const payload = { sub: '123', email: 'test@test.com', role: 'ADMIN' };

    const token = await signJwt(payload);

    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(3);

    const decoded = await verifyJwt(token);

    expect(decoded.sub).toBe('123');
    expect(decoded.email).toBe('test@test.com');
    expect(decoded.role).toBe('ADMIN');
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  test('should reject a token with invalid format', async () => {
    await expect(verifyJwt('invalid')).rejects.toThrow('Invalid token format');
  });

  test('should reject a token with invalid signature', async () => {
    const token = await signJwt({
      sub: '123',
      email: 'test@test.com',
      role: 'ADMIN',
    });

    const parts = token.split('.');
    const tampered = `${parts[0]}.${parts[1]}.invalidsignature`;

    await expect(verifyJwt(tampered)).rejects.toThrow();
  });

  test('should reject a token with invalid payload values', async () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const payload = btoa(
      JSON.stringify({
        sub: '123',
        email: 'test@test.com',
        role: 'ADMIN',
        iat: 1000,
        exp: 'not-a-number',
      }),
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const encoder = new TextEncoder();
    const data = `${header}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(process.env.JWT_SECRET as string),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const invalidPayloadToken = `${data}.${sigB64}`;

    await expect(verifyJwt(invalidPayloadToken)).rejects.toThrow(
      'Invalid token payload',
    );
  });

  test('should reject a token with null payload', async () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const payload = btoa('null')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const encoder = new TextEncoder();
    const data = `${header}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(process.env.JWT_SECRET as string),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const nullPayloadToken = `${data}.${sigB64}`;

    await expect(verifyJwt(nullPayloadToken)).rejects.toThrow(
      'Invalid token payload',
    );
  });

  test('should reject a token with non-integer timestamps', async () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const payload = btoa(
      JSON.stringify({
        sub: '123',
        email: 'test@test.com',
        role: 'ADMIN',
        iat: 1000.5,
        exp: 2000,
      }),
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const encoder = new TextEncoder();
    const data = `${header}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(process.env.JWT_SECRET as string),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const nonIntegerToken = `${data}.${sigB64}`;

    await expect(verifyJwt(nonIntegerToken)).rejects.toThrow(
      'Invalid token payload',
    );
  });

  test('should reject a token with negative exp', async () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const payload = btoa(
      JSON.stringify({
        sub: '123',
        email: 'test@test.com',
        role: 'ADMIN',
        iat: 1000,
        exp: -1,
      }),
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const encoder = new TextEncoder();
    const data = `${header}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(process.env.JWT_SECRET as string),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const negativeExpToken = `${data}.${sigB64}`;

    await expect(verifyJwt(negativeExpToken)).rejects.toThrow(
      'Invalid token payload',
    );
  });

  test('should reject an expired token', async () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const payload = btoa(
      JSON.stringify({
        sub: '123',
        email: 'test@test.com',
        role: 'ADMIN',
        iat: 1000,
        exp: 1001,
      }),
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const encoder = new TextEncoder();
    const data = `${header}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(process.env.JWT_SECRET as string),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const expiredToken = `${data}.${sigB64}`;

    await expect(verifyJwt(expiredToken)).rejects.toThrow('Token expired');
  });
});
