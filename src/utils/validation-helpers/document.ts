import { z } from 'zod';

function clean(value: string) {
  return value.replace(/\D/g, '');
}

function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11) return false;

  if (/^(\d)\1+$/.test(cpf)) return false;

  const calcDigit = (base: string, factor: number) => {
    let total = 0;

    for (let i = 0; i < base.length; i++) {
      total += Number(base.charAt(i)) * factor--;
    }

    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const firstDigit = calcDigit(cpf.slice(0, 9), 10);
  const secondDigit = calcDigit(cpf.slice(0, 10), 11);

  return (
    firstDigit === Number(cpf.charAt(9)) &&
    secondDigit === Number(cpf.charAt(10))
  );
}

function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;

  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    let total = 0;

    for (let i = 0; i < base.length; i++) {
      const digit = Number(base.charAt(i));
      const weight = weights[i];

      if (weight === undefined) return false;

      total += digit * weight;
    }

    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, ...weights1];

  const firstDigit = calcDigit(cnpj.slice(0, 12), weights1);
  const secondDigit = calcDigit(cnpj.slice(0, 13), weights2);

  return (
    firstDigit === Number(cnpj.charAt(12)) &&
    secondDigit === Number(cnpj.charAt(13))
  );
}

export const documentValidation = z
  .string()
  .transform((value) => clean(value))
  .refine((value) => {
    if (value.length === 11) return isValidCPF(value);
    if (value.length === 14) return isValidCNPJ(value);
    return false;
  }, 'Invalid document number (CPF or CNPJ)');
