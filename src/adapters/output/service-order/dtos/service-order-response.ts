export interface ServiceOrderServiceItemResponse {
  id: string;
  serviceId: string;
  price: number;
  isCompleted: boolean;
  description?: string;
  finishedAt?: Date;
  executionTimeMs?: number;
}

export interface ServiceOrderAutoPartItemResponse {
  id: string;
  autoPartId: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  description?: string;
}

export interface ServiceOrderQuoteResponse {
  servicesTotal: number;
  autoPartsTotal: number;
  total: number;
}

export interface ServiceOrderResponse {
  id: string;
  customerId: string;
  vehicleId: string;
  status: string;
  serviceItems: ServiceOrderServiceItemResponse[];
  autoPartItems: ServiceOrderAutoPartItemResponse[];
  quote: ServiceOrderQuoteResponse;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  deliveredAt?: Date;
}
