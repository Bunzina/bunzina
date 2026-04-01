import { Quote } from './quote';

describe('quote value object', () => {
  test('should create a quote with valid input', () => {
    const quote = new Quote({ servicesTotal: 100, autoPartsTotal: 50 });

    expect(quote).toBeInstanceOf(Quote);
    expect(quote).toEqual({
      servicesTotal: 100,
      autoPartsTotal: 50,
      total: 150,
    });
  });

  test('should throw an error if services total is negative', () => {
    expect(() => new Quote({ servicesTotal: -100, autoPartsTotal: 50 })).toThrow(
      'Services total cannot be negative',
    );
  });

  test('should throw an error if auto parts total is negative', () => {
    expect(() => new Quote({ servicesTotal: 100, autoPartsTotal: -50 })).toThrow(
      'Auto parts total cannot be negative',
    );
  });
});
