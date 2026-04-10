import { t } from 'elysia';

export const createServiceSchema = {
  detail: {
    tags: ['Services'],
    summary: 'Create a new service',
    description: 'Creates a new service with the provided details.',
    requestBody: {
      'application/json': {
        examples: {
          name: 'string',
          description: 'string',
          price: 'number',
          durationInMinutes: 'number',
        },
      },
    },
  },
  body: t.Object({
    name: t.String({ examples: ['Oil Change'] }),
    description: t.String({ examples: ['Complete oil change service'] }),
    price: t.Number({ examples: [50] }),
    durationInMinutes: t.Number({ examples: [30] }),
  }),
};
