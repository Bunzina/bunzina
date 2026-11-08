import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '@lucas-pmelo/handlers';
import { CreateCustomerUseCase } from '@/application/use-cases/customer/create';
import { CreateVehicleUseCase } from '@/application/use-cases/vehicle/create';
import { CreateServiceOrderUseCase } from '@/application/use-cases/service-order/create';
import { UpdateServiceOrderStatusUseCase } from '@/application/use-cases/service-order/update-status';
import { ValidateQuoteConfirmationUseCase } from '@/application/use-cases/service-order/validate-quote-confirmation';
import { CompleteServiceItemUseCase } from '@/application/use-cases/service-order/complete-service-item';
import { UpdateServiceOrderUseCase } from '@/application/use-cases/service-order/update';
import { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { CreateStockMovementUseCase } from '@/application/use-cases/auto-part/create-stock-movement';
import { LoginUseCase } from '@/application/use-cases/user/login';
import { Document } from '@/domain/core/value-objects/document';
import { Price } from '@/domain/core/value-objects/price';
import { AutoPart } from '@/domain/auto-part/entities/auto-part';
import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { UserRole } from '@/domain/user/types/user-role';
import { verifyJwt } from '@/infrastructure/services/jwt';
import { makeCustomer } from '@/test/factories/make-customer';
import { makeServiceItem } from '@/test/factories/make-service-item';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { makeUser } from '@/test/factories/make-user';

type BddWorld = {
  result?: unknown;
  error?: unknown;
  customer?: ReturnType<typeof makeCustomer>;
  customerRepository?: Record<string, unknown>;
  vehicle?: unknown;
  vehicleRepository?: Record<string, unknown>;
  order?: ReturnType<typeof makeServiceOrder>;
  orderRepository?: Record<string, unknown>;
  serviceOrderUseCases?: Record<string, unknown>;
  movements?: unknown[];
  part?: AutoPart;
  user?: ReturnType<typeof makeUser>;
  userRepository?: Record<string, unknown>;
  token?: string;
};

const capture = async (
  world: BddWorld,
  action: () => Promise<unknown>,
): Promise<void> => {
  world.error = undefined;
  try {
    world.result = await action();
  } catch (error) {
    world.error = error;
  }
};

const customerInput = {
  name: 'Ana Souza',
  document: '123.456.789-09',
  email: 'ana@example.com',
  phone: '+5511999999999',
  address: {
    street: 'Rua das Flores',
    number: '10',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01001000',
    neighborhood: 'Centro',
  },
};

const makeCustomerRepository = (world: BddWorld) => {
  world.customerRepository = {
    findByDocumentNumber: async (document: string) =>
      world.customer?.document.value === document.replace(/\D/g, '')
        ? world.customer
        : null,
    findById: async (id: string) =>
      world.customer?.id === id ? world.customer : null,
    create: async (customer: ReturnType<typeof makeCustomer>) => {
      world.customer = customer;
      return customer;
    },
    update: async (customer: ReturnType<typeof makeCustomer>) => {
      world.customer = customer;
      return customer;
    },
    delete: async () => {
      world.customer = undefined;
    },
  };
  return world.customerRepository;
};

const makeOrderRepository = (world: BddWorld) => {
  world.orderRepository = {
    create: async (order: ReturnType<typeof makeServiceOrder>) => {
      world.order = order;
      return order;
    },
    findById: async (id: string) =>
      world.order?.id === id ? world.order : null,
    findByParams: async () => (world.order ? [world.order] : []),
    update: async (order: ReturnType<typeof makeServiceOrder>) => {
      world.order = order;
      return order;
    },
    delete: async () => {
      world.order = undefined;
    },
    findServiceItemById: async (id: string) =>
      world.order?.serviceItems.find((item) => item.id === id) ?? null,
    updateServiceItem: async (
      item: (typeof world.order)['serviceItems'][number],
    ) => {
      if (world.order) {
        world.order.serviceItems = world.order.serviceItems.map((existing) =>
          existing.id === item.id ? item : existing,
        );
      }
      return item;
    },
    findByServiceItemId: async () => world.order ?? null,
  };
  return world.orderRepository;
};

const prepareOrderStatusUseCase = (world: BddWorld) => {
  const repository = world.orderRepository ?? makeOrderRepository(world);
  const findOrder = new FindServiceOrderByIdUseCase(repository as never);
  const findCustomer = {
    execute: async ({ id }: { id: string }) => {
      if (world.customer?.id === id) return world.customer;
      return makeCustomer({ id });
    },
  };
  return new UpdateServiceOrderStatusUseCase(
    repository as never,
    findOrder,
    findCustomer as never,
    { sendEmail: async () => undefined },
  );
};

const prepareQuoteUseCase = (world: BddWorld) => {
  const repository = world.orderRepository ?? makeOrderRepository(world);
  const findOrder = new FindServiceOrderByIdUseCase(repository as never);
  const findCustomer = {
    execute: async ({ id }: { id: string }) => {
      if (world.customer?.id === id) return world.customer;
      const customer = makeCustomer({ id });
      world.customer = customer;
      return customer;
    },
  };
  return new ValidateQuoteConfirmationUseCase(
    repository as never,
    findOrder,
    findCustomer as never,
  );
};

Given('que ainda não existe cliente com o documento informado', function () {
  const world = this as BddWorld;
  makeCustomerRepository(world);
});

Given('que já existe um cliente com o documento informado', function () {
  const world = this as BddWorld;
  world.customer = makeCustomer({
    document: new Document(customerInput.document),
  });
  makeCustomerRepository(world);
});

When('o atendente cadastra o cliente', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    new CreateCustomerUseCase(world.customerRepository as never).execute(
      customerInput,
    ),
  );
});

When('o atendente tenta cadastrar o cliente novamente', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    new CreateCustomerUseCase(world.customerRepository as never).execute(
      customerInput,
    ),
  );
});

Then(
  'o cliente fica registrado com documento, e-mail, telefone e endereço',
  function () {
    const customer = (this as BddWorld).customer!;
    assert.equal(customer.document.value, '12345678909');
    assert.equal(customer.email.value, customerInput.email);
    assert.equal(customer.phone.value, customerInput.phone);
    assert.equal(customer.address.city, customerInput.address.city);
  },
);

Then('o cadastro é recusado por conflito', function () {
  assert.ok((this as BddWorld).error instanceof ConflictError);
});

Given('que existe um cliente cadastrado', function () {
  const world = this as BddWorld;
  world.customer = makeCustomer({ id: 'customer-1' });
  makeCustomerRepository(world);
  world.vehicleRepository = {
    findByLicensePlate: async (plate: string) =>
      (world.vehicle as { licensePlate?: { value: string } } | undefined)
        ?.licensePlate?.value === plate
        ? world.vehicle
        : null,
    create: async (vehicle: unknown) => {
      world.vehicle = vehicle;
      return vehicle;
    },
  };
});

Given('que existe um cliente cadastrado e a placa já está em uso', function () {
  const world = this as BddWorld;
  world.customer = makeCustomer({ id: 'customer-1' });
  makeCustomerRepository(world);
  world.vehicle = {
    id: 'vehicle-existing',
    licensePlate: { value: 'ABC1D23' },
  };
  world.vehicleRepository = {
    findByLicensePlate: async (plate: string) =>
      (world.vehicle as { licensePlate: { value: string } }).licensePlate
        .value === plate
        ? world.vehicle
        : null,
    create: async (vehicle: unknown) => {
      world.vehicle = vehicle;
      return vehicle;
    },
  };
});

When('o atendente cadastra um veículo com placa Mercosul', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    new CreateVehicleUseCase(
      world.vehicleRepository as never,
      world.customerRepository as never,
    ).execute({
      customerId: 'customer-1',
      licensePlate: 'abc1d23',
      model: 'Gol',
      brand: 'Volkswagen',
      year: 2022,
    }),
  );
});

When(
  'o atendente tenta cadastrar outro veículo com essa placa',
  async function () {
    const world = this as BddWorld;
    await capture(world, () =>
      new CreateVehicleUseCase(
        world.vehicleRepository as never,
        world.customerRepository as never,
      ).execute({
        customerId: 'customer-1',
        licensePlate: 'ABC1D23',
        model: 'Gol',
        brand: 'Volkswagen',
        year: 2022,
      }),
    );
  },
);

Then('o veículo fica associado ao cliente', function () {
  const vehicle = (this as BddWorld).result as {
    customerId: string;
    licensePlate: { value: string };
  };
  assert.equal(vehicle.customerId, 'customer-1');
  assert.equal(vehicle.licensePlate.value, 'ABC1D23');
});

Then('o cadastro do veículo é recusado por conflito', function () {
  assert.ok((this as BddWorld).error instanceof ConflictError);
});

Given('que cliente, veículo, serviços e peças existem', function () {
  const world = this as BddWorld;
  world.customer = makeCustomer({ id: 'customer-1' });
  makeCustomerRepository(world);
  world.serviceOrderRepository = makeOrderRepository(world);
  world.serviceOrderUseCases = {
    findCustomer: { execute: async () => world.customer },
    findVehicle: { execute: async () => ({ id: 'vehicle-1' }) },
    findService: { execute: async ({ id }: { id: string }) => ({ id }) },
    findAutoPart: { execute: async ({ id }: { id: string }) => ({ id }) },
  };
});

When(
  'a equipe abre uma ordem com um serviço de 150 reais e duas peças de 50 reais',
  async function () {
    const world = this as BddWorld;
    const useCases = world.serviceOrderUseCases!;
    await capture(world, () =>
      new CreateServiceOrderUseCase(
        world.orderRepository as never,
        useCases.findCustomer as never,
        useCases.findVehicle as never,
        useCases.findService as never,
        useCases.findAutoPart as never,
      ).execute({
        customerId: 'customer-1',
        vehicleId: 'vehicle-1',
        serviceItems: [{ serviceId: 'service-1', price: 150 }],
        autoPartItems: [{ autoPartId: 'part-1', quantity: 2, unitPrice: 50 }],
      }),
    );
  },
);

Then(
  'a ordem fica recebida com orçamento total de {int} reais',
  function (total: number) {
    assert.equal((this as BddWorld).order?.status, ServiceOrderStatus.RECEIVED);
    assert.equal((this as BddWorld).order?.quote.total, total);
  },
);

Given('que a ordem está aguardando aprovação', function () {
  const world = this as BddWorld;
  world.customer = makeCustomer({ id: 'customer-1' });
  makeCustomerRepository(world);
  world.order = makeServiceOrder({
    id: 'order-1',
    customerId: 'customer-1',
    status: ServiceOrderStatus.AWAITING_APPROVAL,
  });
  makeOrderRepository(world);
});

When('o cliente responsável aprova o orçamento', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    prepareQuoteUseCase(world).execute({
      id: world.order!.id!,
      customerRequesterDocument: world.customer!.document,
      isConfirmed: true,
    }),
  );
});

When('o cliente responsável recusa o orçamento', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    prepareQuoteUseCase(world).execute({
      id: world.order!.id!,
      customerRequesterDocument: world.customer!.document,
      isConfirmed: false,
    }),
  );
});

When(
  'uma pessoa com outro documento tenta aprovar o orçamento',
  async function () {
    const world = this as BddWorld;
    await capture(world, () =>
      prepareQuoteUseCase(world).execute({
        id: world.order!.id!,
        customerRequesterDocument: new Document('987.654.321-00'),
        isConfirmed: true,
      }),
    );
  },
);

Then('a ordem passa para execução', function () {
  assert.equal(
    (this as BddWorld).order?.status,
    ServiceOrderStatus.IN_EXECUTION,
  );
});

Then('a mesma ordem volta para recebida', function () {
  assert.equal((this as BddWorld).order?.id, 'order-1');
  assert.equal((this as BddWorld).order?.status, ServiceOrderStatus.RECEIVED);
});

Then('a decisão é recusada e a ordem não muda', function () {
  assert.ok((this as BddWorld).error);
  assert.equal(
    (this as BddWorld).order?.status,
    ServiceOrderStatus.AWAITING_APPROVAL,
  );
});

Given('que a ordem está em execução com um serviço pendente', function () {
  const world = this as BddWorld;
  world.order = makeServiceOrder({
    id: 'order-1',
    status: ServiceOrderStatus.IN_EXECUTION,
    serviceItems: [makeServiceItem({ id: 'item-1', isCompleted: false })],
  });
  makeOrderRepository(world);
});

Given('que a ordem está em execução com um serviço já concluído', function () {
  const world = this as BddWorld;
  world.order = makeServiceOrder({
    id: 'order-1',
    status: ServiceOrderStatus.IN_EXECUTION,
    serviceItems: [makeServiceItem({ id: 'item-1', isCompleted: true })],
  });
  makeOrderRepository(world);
});

When('o mecânico conclui o serviço', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    new CompleteServiceItemUseCase(
      world.orderRepository as never,
      { incrementExecutionStats: async () => undefined } as never,
    ).execute({ id: 'item-1' }),
  );
});

When('o mecânico tenta concluir novamente o mesmo serviço', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    new CompleteServiceItemUseCase(
      world.orderRepository as never,
      { incrementExecutionStats: async () => undefined } as never,
    ).execute({ id: 'item-1' }),
  );
});

Then('a conclusão repetida é recusada', function () {
  assert.ok((this as BddWorld).error instanceof BadRequestError);
});

When('a equipe finaliza a ordem', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    prepareOrderStatusUseCase(world).execute({
      id: world.order!.id!,
      direction: 'next',
    }),
  );
});

When('a equipe registra a retirada do veículo', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    prepareOrderStatusUseCase(world).execute({
      id: world.order!.id!,
      direction: 'next',
    }),
  );
});

When('a equipe tenta finalizar a ordem', async function () {
  const world = this as BddWorld;
  await capture(world, () =>
    prepareOrderStatusUseCase(world).execute({
      id: world.order!.id!,
      direction: 'next',
    }),
  );
});

Then('a ordem fica entregue e o serviço fica concluído', function () {
  const world = this as BddWorld;
  assert.equal(world.order?.status, ServiceOrderStatus.DELIVERED);
  assert.equal(world.order?.serviceItems[0]?.isCompleted, true);
});

Then('a finalização é recusada', function () {
  assert.ok((this as BddWorld).error instanceof ForbiddenError);
  assert.equal(
    (this as BddWorld).order?.status,
    ServiceOrderStatus.IN_EXECUTION,
  );
});

When('a equipe tenta alterar seus itens', async function () {
  const world = this as BddWorld;
  const useCases = {
    findService: { execute: async ({ id }: { id: string }) => ({ id }) },
    findAutoPart: { execute: async ({ id }: { id: string }) => ({ id }) },
  };
  await capture(world, () =>
    new UpdateServiceOrderUseCase(
      world.orderRepository as never,
      new FindServiceOrderByIdUseCase(world.orderRepository as never),
      useCases.findService as never,
      useCases.findAutoPart as never,
    ).execute({ id: 'order-1', serviceItems: [] }),
  );
});

Then('a alteração é recusada', function () {
  assert.ok((this as BddWorld).error);
  assert.equal(
    (this as BddWorld).order?.status,
    ServiceOrderStatus.AWAITING_APPROVAL,
  );
});

Given('que a peça tem {int} unidades em estoque', function (stock: number) {
  const world = this as BddWorld;
  world.part = new AutoPart({
    id: 'part-1',
    name: 'Filtro',
    description: 'Filtro de óleo',
    price: new Price(50),
    stock,
  });
  world.movements = [];
});

When(
  'o estoque da peça aumenta para {int} unidades',
  async function (stock: number) {
    await recordStockMovement(this as BddWorld, stock);
  },
);

When(
  'o estoque da peça diminui para {int} unidades',
  async function (stock: number) {
    await recordStockMovement(this as BddWorld, stock);
  },
);

When(
  'o estoque da peça continua com {int} unidades',
  async function (stock: number) {
    await recordStockMovement(this as BddWorld, stock);
  },
);

async function recordStockMovement(world: BddWorld, stock: number) {
  const movements = world.movements!;
  const updatedPart = new AutoPart({ ...world.part!, stock });
  const useCase = new CreateStockMovementUseCase({
    create: async (movement) => {
      movements.push(movement);
      return movement;
    },
  } as never);
  world.result = await useCase.execute({
    existingAutoPart: world.part!,
    updatedAutoPart: updatedPart,
  });
}

Then(
  'o histórico registra uma entrada de {int} unidades',
  function (quantity: number) {
    const movement = (this as BddWorld).movements![0] as {
      type: StockMovementType;
      quantity: number;
    };
    assert.equal(movement.type, StockMovementType.IN);
    assert.equal(Math.abs(movement.quantity), quantity);
  },
);

Then(
  'o histórico registra uma saída de {int} unidades',
  function (quantity: number) {
    const movement = (this as BddWorld).movements![0] as {
      type: StockMovementType;
      quantity: number;
    };
    assert.equal(movement.type, StockMovementType.OUT);
    assert.equal(Math.abs(movement.quantity), quantity);
  },
);

Then('nenhuma movimentação é registrada', function () {
  assert.equal((this as BddWorld).movements!.length, 0);
});

Given(
  'que existe um usuário {word} com senha cadastrada',
  async function (status: string) {
    const world = this as BddWorld;
    process.env.JWT_SECRET ??= 'bdd-test-secret';
    const passwordHash = await Bun.password.hash('SenhaSegura123!');
    world.user = makeUser({
      id: 'user-1',
      passwordHash,
      isActive: status === 'ativo',
      role: UserRole.MECHANIC,
    });
    world.userRepository = {
      findByDocument: async (document: string) =>
        document === world.user!.document.value ? world.user : null,
    };
  },
);

When('o usuário informa seu documento e senha corretos', async function () {
  const world = this as BddWorld;
  await capture(world, async () => {
    const result = await new LoginUseCase(
      world.userRepository as never,
    ).execute({
      document: world.user!.document.value,
      password: 'SenhaSegura123!',
    });
    world.token = result.token;
    return result;
  });
});

Then('recebe um token de acesso associado ao seu papel', async function () {
  const world = this as BddWorld;
  assert.ok(world.token);
  const payload = await verifyJwt(world.token!);
  assert.equal(payload.sub, world.user!.id);
  assert.equal(payload.role, UserRole.MECHANIC);
});

Then('o acesso é recusado', function () {
  assert.ok((this as BddWorld).error instanceof UnauthorizedError);
});
