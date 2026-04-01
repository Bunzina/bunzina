import { LicensePlate } from './license-plate';

describe('license plate value object', () => {
  test('should create a old license plate with valid properties', () => {
    const licensePlate = new LicensePlate('ABC-1234');

    expect(licensePlate).toBeInstanceOf(LicensePlate);
    expect(licensePlate).toEqual({
      value: 'ABC-1234',
    } as unknown as LicensePlate);
  });

  test('should create a mercosul license plate with valid properties', () => {
    const licensePlate = new LicensePlate('ABC1D23');

    expect(licensePlate).toBeInstanceOf(LicensePlate);
    expect(licensePlate).toEqual({
      value: 'ABC1D23',
    } as unknown as LicensePlate);
  });

  test('should throw an error when creating a license plate with an invalid format', () => {
    expect(() => new LicensePlate('invalid-plate')).toThrow('Invalid license plate format');
  });
});
