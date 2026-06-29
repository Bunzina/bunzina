import { Document } from './document';

describe('document value object', () => {
  test('should create an CPF document with a valid document number', () => {
    const document = new Document('123.456.789-09');

    expect(document).toBeInstanceOf(Document);
    expect(document).toEqual({
      kind: 'CPF',
      value: '12345678909',
    } as unknown as Document);
  });

  test('should create a CNPJ document with a valid document number', () => {
    const document = new Document('45.723.174/0001-10');

    expect(document).toBeInstanceOf(Document);
    expect(document).toEqual({
      kind: 'CNPJ',
      value: '45723174000110',
    } as unknown as Document);
  });

  test('should throw when document number is invalid', () => {
    expect(() => {
      new Document('123');
    }).toThrow('Invalid document number');
  });

  test('should return false when Document value is diferent', () => {
    const document1 = new Document('45723174000110');
    const document2 = new Document('123.456.789-09');
    expect(document1.isEqual(document2)).toBeFalsy();
  });

  test('should return true when Document value is equal', () => {
    const document1 = new Document('45723174000110');
    const document2 = new Document('45723174000110');
    expect(document1.isEqual(document2)).toBeTruthy();
  });
});
