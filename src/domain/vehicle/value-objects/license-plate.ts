export class LicensePlate {
  value: string;

  constructor(value: string) {
    const formattedPlate = value.trim().toUpperCase();

    if (!this.validateLicensePlate(formattedPlate)) {
      throw new Error('Invalid license plate format');
    }

    this.value = formattedPlate;
  }

  private validateLicensePlate(plate: string): boolean {
    if (!plate) {
      return false;
    }

    const formattedPlate = plate.trim().toUpperCase();
    const classicRegex = /^[A-Z]{3}\d{4}$/; // formato clássico sem traço: ABC1234
    const mercosulRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/; // Mercosul: ABC1D23

    return (
      classicRegex.test(formattedPlate) || mercosulRegex.test(formattedPlate)
    );
  }
}
