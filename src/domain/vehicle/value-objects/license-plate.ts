export class LicensePlate {
  value: string;

  constructor(value: string) {
    if (!this.validateLicensePlate(value)) {
      throw new Error("Invalid license plate format");
    }

    this.value = value;
  }

  private validateLicensePlate(plate: string): boolean {
    if (!plate) {
      return false;
    }

    const formatedPlate = plate.trim().toUpperCase();
    const oldRegex = /^[A-Z]{3}-\d{4}$/; // formato antigo: ABC-1234
    const mercosulRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/; // Mercosul: ABC1D23

    return oldRegex.test(formatedPlate) || mercosulRegex.test(formatedPlate);
  }
}
