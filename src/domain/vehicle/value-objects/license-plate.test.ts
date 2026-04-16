import { LicensePlate } from './license-plate';

describe('license plate value object', () => {
  test('should create a classic license plate with valid properties', () => {
    const licensePlate = new LicensePlate('ABC1234');

    expect(licensePlate).toBeInstanceOf(LicensePlate);
    expect(licensePlate).toEqual({
      value: 'ABC1234',
    } as unknown as LicensePlate);
  });

  test('should create a mercosul license plate with valid properties', () => {
    const licensePlate = new LicensePlate('ABC1D23');

    expect(licensePlate).toBeInstanceOf(LicensePlate);
    expect(licensePlate).toEqual({
      value: 'ABC1D23',
    } as unknown as LicensePlate);
  });

  test('should throw an error when creating a license plate with dash', () => {
    expect(() => new LicensePlate('ABC-1234')).toThrow(
      'Invalid license plate format',
    );
  });

  test('should throw an error when creating a license plate with invalid format', () => {
    expect(() => new LicensePlate('invalid-plate')).toThrow(
      'Invalid license plate format',
    );
  });
});
