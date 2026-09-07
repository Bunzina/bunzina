# Sequência — abertura da ordem de serviço

A OS nasce em `RECEIVED` numa única requisição autenticada, com cliente, veículo e pelo menos um item (serviço ou peça).

![Sequência de abertura da ordem de serviço](../sequence-service-order.png)

## Pré-condições

- Token JWT válido (Gateway + middleware da API)
- Cliente e veículo já cadastrados
- Cada `serviceId` / `autoPartId` existente
- Pelo menos um item na OS

## O que a abertura **não** faz

- Não muda estoque — a baixa ocorre na aprovação do orçamento
- Não envia e-mail — o e-mail sai ao avançar para `AWAITING_APPROVAL`
- Não identifica o cliente por CPF neste endpoint — recebe `customerId` (UUID). A consulta pública por documento é `GET /service-orders/customer/:documentNumber`

## Depois da abertura

`RECEIVED` → `IN_DIAGNOSTIC` → `AWAITING_APPROVAL` → `IN_EXECUTION` → `COMPLETED` → `DELIVERED`

De `AWAITING_APPROVAL` o cliente pode recusar e a OS volta para `RECEIVED`. A máquina está em `src/domain/service-order/state-machines/status-machine.ts`.
