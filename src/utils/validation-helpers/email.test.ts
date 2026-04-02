import { describe, test, expect } from 'bun:test';
import { emailValidation } from './email';

describe('email validation', () => {
  test('should validate a valid email', () => {
    const result = emailValidation.parse('John@Example.com');

    expect(result).toBe('john@example.com');
  });

  test('should throw error for invalid email', () => {
    expect(() => {
      emailValidation.parse('invalid-email');
    }).toThrow('Invalid email address');
  });

  test('should normalize email to lowercase', () => {
    const result = emailValidation.parse('TEST@EMAIL.COM');

    expect(result).toBe('test@email.com');
  });
});
