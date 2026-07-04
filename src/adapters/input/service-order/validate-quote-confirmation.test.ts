import { ServiceOrderPublicPresenter } from '@/adapters/output/service-order/service-order-public-presenter';
import type { ValidateQuoteConfirmationUseCase } from '@/application/use-cases/service-order/validate-quote-confirmation';
import { validateQuoteConfirmationSchema } from './validations/validate-quote-confirmation-schema';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { any, mock as mockExtended, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock as bunMock, test } from 'bun:test';
import type { Context } from 'elysia';
import { validateSchemaZod } from '@lucas-pmelo/validator';

bunMock.module('@lucas-pmelo/logger', () => ({
  default: {
    setEvent: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
}));

import { ValidateQuoteConfirmationInput } from './validate-quote-confirmation';

describe('validate quote confirmation input', () => {
  let validateQuoteConfirmationUseCase: MockProxy<ValidateQuoteConfirmationUseCase>;
  let validateQuoteConfirmationInput: ValidateQuoteConfirmationInput;

  beforeEach(() => {
    validateQuoteConfirmationUseCase = mockExtended();
    validateQuoteConfirmationInput = new ValidateQuoteConfirmationInput(
      validateQuoteConfirmationUseCase,
    );
  });

  test('should validate a quote confirmation request', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const serviceOrder = makeServiceOrder({ id });
    validateQuoteConfirmationUseCase.execute
      .calledWith(any())
      .mockResolvedValue(serviceOrder);

    const request = {
      params: { id },
      body: {
        documentNumber: '123.456.789-09',
        isConfirmed: true,
      },
    } as unknown as Context;

    const result = await validateQuoteConfirmationInput.execute(request);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(
        JSON.stringify(ServiceOrderPublicPresenter.toHttp(serviceOrder)),
      ),
    );
    expect(validateQuoteConfirmationUseCase.execute).toHaveBeenCalledWith({
      id,
      customerRequesterDocument: expect.any(Object),
      isConfirmed: true,
    });
  });

  test('should return 400 when request data is invalid', async () => {
    const request = {
      params: { id: 'invalid-id' },
      body: {
        documentNumber: '123',
        isConfirmed: true,
      },
    } as unknown as Context;

    const { errors } = validateSchemaZod(validateQuoteConfirmationSchema, {
      id: 'invalid-id',
      documentNumber: '123',
      isConfirmed: true,
    });

    const result = await validateQuoteConfirmationInput.execute(request);

    expect(result.status).toBe(400);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      reason: 'Invalid data in request',
      invalidParams: errors,
    });
    expect(validateQuoteConfirmationUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    validateQuoteConfirmationUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('unexpected error'));

    const request = {
      params: { id: '22222222-2222-4222-8222-222222222222' },
      body: {
        documentNumber: '123.456.789-09',
        isConfirmed: false,
      },
    } as unknown as Context;

    const result = await validateQuoteConfirmationInput.execute(request);

    expect(result.status).toBe(500);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      error: 'Failed to validate service order quote',
    });
    expect(validateQuoteConfirmationUseCase.execute).toHaveBeenCalledWith({
      id: '22222222-2222-4222-8222-222222222222',
      customerRequesterDocument: expect.any(Object),
      isConfirmed: false,
    });
  });
});
