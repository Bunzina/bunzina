export interface ServiceOrderPublicServiceItemResponse {
  description?: string;
  price: number;
}

export interface ServiceOrderPublicAutoPartItemResponse {
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface ServiceOrderPublicResponse {
  status: string;
  serviceItems: ServiceOrderPublicServiceItemResponse[];
  autoPartItems: ServiceOrderPublicAutoPartItemResponse[];
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  deliveredAt?: Date;
}
