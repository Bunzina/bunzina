import type { Context } from "elysia";
import { CreateCustomerUseCase } from "@/application/use-cases/customer/create";
import { CustomerRepository } from "@/infrastructure/repositories/customer/customer-repository";
import { CreateCustomerInput } from "@/adapters/input/customer/create";

let createCustomerUseCase: CreateCustomerUseCase;
let customerRepository: CustomerRepository;
let createCustomerInput: CreateCustomerInput;
let dbClient: any; //TODO: ENTENDER A IMPLEMENTAÇÃO

const setDependencies = (dbInstance: any) => {
  customerRepository = new CustomerRepository(dbInstance); //TODO: ENTENDER A IMPLEMENTAÇÃO
  createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
  createCustomerInput = new CreateCustomerInput(createCustomerUseCase);
};

export const createCustomerHandler = async (
  context: Context,
): Promise<Response> => {
  try {
    setDependencies(dbClient);
    return await createCustomerInput.execute(context);
  } catch (error) {
    /* dbClient.disconnect(); */ //TODO: ENTENDER A IMPLEMENTAÇÃO
    return new Response(
      JSON.stringify({ error: "Failed to create customer" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
