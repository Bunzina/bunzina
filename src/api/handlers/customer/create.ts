import type { Context } from "elysia";
import { CreateCustomerUseCase } from "@/application/use-cases/customer/create";
import { CustomerRepository } from "@/infrastructure/repositories/customer/customer-repository";
import { CreateCustomerInput } from "@/adapters/input/customer/create";

let createCustomerUseCase: CreateCustomerUseCase;
let customerRepository: CustomerRepository;
let createCustomerInput: CreateCustomerInput;
let dbClient: any; //TO DO: ENTENDER A IMPLEMENTAÇÃO

const setDependencies = (dbInstance: any) => {
  customerRepository = new CustomerRepository(dbInstance); //TO DO: ENTENDER A IMPLEMENTAÇÃO
  createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
  createCustomerInput = new CreateCustomerInput(createCustomerUseCase);
};

export const createCustomerHandler = async (
  context: Context,
): Promise<Response> => {
  setDependencies(dbClient);
  try {
    return await createCustomerInput.execute(context);
  } catch (error) {
    /* dbClient.disconnect(); */ //TO DO: ENTENDER A IMPLEMENTAÇÃO
    return new Response(
      JSON.stringify({ error: "Failed to create customer" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
