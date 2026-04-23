import { makeAutoPart } from '@/test/factories/make-auto-part';
import { describe, expect, test } from 'bun:test';
import { AutoPartsListPresenter } from './auto-parts-list-presenter';

describe('auto parts list presenter', () => {
  test('should convert auto parts array to http response with pagination', () => {
    const autoPart1 = makeAutoPart({ name: 'Brake Pad' });
    const autoPart2 = makeAutoPart({ name: 'Air Filter' });

    const response = AutoPartsListPresenter.toHttp(
      [autoPart1, autoPart2],
      1,
      20,
    );

    expect(response).toEqual({
      data: [
        {
          id: expect.any(String),
          name: 'Brake Pad',
          description: 'High-quality brake pad for improved stopping power.',
          price: expect.any(Number),
          stock: 100,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          name: 'Air Filter',
          description: 'High-quality brake pad for improved stopping power.',
          price: expect.any(Number),
          stock: 100,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
      },
    });
  });

  test('should return empty data array when no auto parts exist', () => {
    const response = AutoPartsListPresenter.toHttp([], 2, 10);

    expect(response).toEqual({
      data: [],
      pagination: {
        page: 2,
        limit: 10,
      },
    });
  });

  test('should preserve pagination values in response', () => {
    const autoParts = Array.from({ length: 3 }, (_, index) =>
      makeAutoPart({ name: `Part ${index + 1}` }),
    );

    const response = AutoPartsListPresenter.toHttp(autoParts, 5, 5);

    expect(response.pagination).toEqual({
      page: 5,
      limit: 5,
    });
    expect(response.data).toHaveLength(3);
  });
});
