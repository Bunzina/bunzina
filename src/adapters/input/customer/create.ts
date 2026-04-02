import { CustomerPresenter } from '@/adapters/output/customer/customer-presenter';
import { createCustomerSchema } from './validations/create-customer-schema';
import type { CreateCustomerUseCase } from '@/application/use-cases/customer/create';
import type { Context } from 'elysia';
import { ZodError } from 'zod';

export class CreateCustomerInput {
  constructor(private createCustomerUseCase: CreateCustomerUseCase) {}

  execute = async (context: Context): Promise<Response> => {
    try {
      const validatedBody = createCustomerSchema.parse(context.body);
      const customer = await this.createCustomerUseCase.execute(validatedBody);

      return new Response(JSON.stringify(CustomerPresenter.toHttp(customer)), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: 'Invalid data in request',
            issues: error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  };
}
