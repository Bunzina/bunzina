import { describe, test, expect } from 'bun:test';
import { documentValidation } from './document';

describe('document validation', () => {
  test('should validate a valid CPF', () => {
    const result = documentValidation.parse('123.456.789-09');

    expect(result).toBe('12345678909');
  });

  test('should validate a valid CPF without mask', () => {
    const result = documentValidation.parse('12345678909');

    expect(result).toBe('12345678909');
  });

  test('should reject invalid CPF (repeated digits)', () => {
    expect(() => {
      documentValidation.parse('11111111111');
    }).toThrow('Invalid document number (CPF or CNPJ)');
  });

  test('should reject invalid CPF (wrong digits)', () => {
    expect(() => {
      documentValidation.parse('12345678900');
    }).toThrow('Invalid document number (CPF or CNPJ)');
  });

  test('should validate a valid CNPJ', () => {
    const result = documentValidation.parse('45.723.174/0001-10');

    expect(result).toBe('45723174000110');
  });

  test('should reject invalid CNPJ', () => {
    expect(() => {
      documentValidation.parse('11.111.111/1111-11');
    }).toThrow('Invalid document number (CPF or CNPJ)');
  });

  test('should reject invalid length', () => {
    expect(() => {
      documentValidation.parse('123');
    }).toThrow('Invalid document number (CPF or CNPJ)');
  });
});
