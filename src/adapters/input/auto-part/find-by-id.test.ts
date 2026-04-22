import { AutoPartPresenter } from '@/adapters/output/auto-part/auto-part-presenter';
import type { FindAutoPartByIdUseCase } from '@/application/use-cases/auto-part/find-by-id';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { FindAutoPartByIdInput } from './find-by-id';

describe('find auto part by id input', () => {
  let findAutoPartByIdUseCase: MockProxy<FindAutoPartByIdUseCase>;
  let findAutoPartByIdInput: FindAutoPartByIdInput;

  beforeEach(() => {
    findAutoPartByIdUseCase = mock();
    findAutoPartByIdInput = new FindAutoPartByIdInput(findAutoPartByIdUseCase);
  });

  test('should find an auto part', async () => {
    const autoPart = makeAutoPart();

    findAutoPartByIdUseCase.execute
      .calledWith(any())
      .mockResolvedValue(autoPart);

    const request = {
      params: { id: autoPart.id! },
    } as unknown as Context;

    const result = await findAutoPartByIdInput.execute(request);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(AutoPartPresenter.toHttp(autoPart))),
    );
    expect(findAutoPartByIdUseCase.execute).toHaveBeenCalledWith({
      id: autoPart.id!,
    });
  });

  test('should return 400 when id is invalid', async () => {
    const request = {
      params: { id: 'invalid-uuid' },
    } as unknown as Context;

    const result = await findAutoPartByIdInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(findAutoPartByIdUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    findAutoPartByIdUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('db error'));

    const request = {
      params: { id },
    } as unknown as Context;

    const result = await findAutoPartByIdInput.execute(request);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({ error: 'Failed to find auto part' });
    expect(findAutoPartByIdUseCase.execute).toHaveBeenCalledWith({ id });
  });
});
