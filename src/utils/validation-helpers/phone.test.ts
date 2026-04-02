import { describe, test, expect } from 'bun:test';
import { phoneValidation } from './phone';

describe('phone validation', () => {
  test('should validate a valid phone number', () => {
    const result = phoneValidation.parse('+5511999999999');

    expect(result).toBe('+5511999999999');
  });

  test('should validate phone without +', () => {
    const result = phoneValidation.parse('11999999999');

    expect(result).toBe('11999999999');
  });

  test('should throw error for invalid phone', () => {
    expect(() => {
      phoneValidation.parse('000000000');
    }).toThrow('Invalid phone number format');
  });

  test('should throw error for empty string', () => {
    expect(() => {
      phoneValidation.parse('');
    }).toThrow();
  });
});
