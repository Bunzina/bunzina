# cURL — Bunzina API

Copie um comando por vez em **Import → cURL** no Bruno e selecione o ambiente Local da coleção. Os placeholders `{{variavel}}` são do Bruno; para executar no terminal, substitua-os pelos valores reais.

## 01-sistema / Health

```bash
curl --request GET '{{baseUrl}}/health'
```

## 01-sistema / Readiness

```bash
curl --request GET '{{baseUrl}}/ready'
```

## 01-sistema / Metrics

```bash
curl --request GET '{{baseUrl}}/metrics'
```

## 01-sistema / Inicio

```bash
curl --request GET '{{baseUrl}}/'
```

## 01-sistema / Swagger

```bash
curl --request GET '{{baseUrl}}/swagger'
```

## 01-sistema / OpenAPI

```bash
curl --request GET '{{baseUrl}}/swagger/json'
```

## 02-autenticacao / Login

```bash
curl --request POST '{{baseUrl}}/auth/login' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "document": "{{loginDocument}}",
  "password": "{{loginPassword}}"
}'
```

## 03-usuarios / Criar cliente publico

```bash
curl --request POST '{{baseUrl}}/users' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Usuario Exemplo",
  "document": "{{userDocument}}",
  "email": "usuario@example.com",
  "password": "{{userPassword}}",
  "role": "CUSTOMER"
}'
```

## 03-usuarios / Criar usuario interno

```bash
curl --request POST '{{baseUrl}}/users' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Usuario Exemplo",
  "document": "{{userDocument}}",
  "email": "usuario@example.com",
  "password": "{{userPassword}}",
  "role": "MECHANIC"
}'
```

## 03-usuarios / Buscar usuario

```bash
curl --request GET '{{baseUrl}}/users/{{userId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 03-usuarios / Atualizar usuario

```bash
curl --request PUT '{{baseUrl}}/users/{{userId}}' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Usuario Exemplo",
  "document": "{{userDocument}}",
  "email": "usuario@example.com",
  "role": "CUSTOMER",
  "isActive": true
}'
```

## 03-usuarios / Excluir usuario

```bash
curl --request DELETE '{{baseUrl}}/users/{{userId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 04-clientes / Criar cliente

```bash
curl --request POST '{{baseUrl}}/customers' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Cliente Exemplo",
  "document": "{{customerDocument}}",
  "email": "cliente@example.com",
  "phone": "+5511999999999",
  "address": {
    "street": "Rua das Flores",
    "number": "42",
    "neighborhood": "Centro",
    "city": "Sao Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "complement": "Apto 3"
  }
}'
```

## 04-clientes / Buscar cliente

```bash
curl --request GET '{{baseUrl}}/customers/{{customerDocument}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 04-clientes / Atualizar cliente

```bash
curl --request PUT '{{baseUrl}}/customers/{{customerDocument}}' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Cliente Exemplo",
  "email": "cliente@example.com",
  "phone": "+5511999999999",
  "address": {
    "street": "Rua das Flores",
    "number": "42",
    "neighborhood": "Centro",
    "city": "Sao Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "complement": "Apto 3"
  }
}'
```

## 04-clientes / Excluir cliente

```bash
curl --request DELETE '{{baseUrl}}/customers/{{customerDocument}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 05-veiculos / Criar veiculo

```bash
curl --request POST '{{baseUrl}}/vehicles' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "customerId": "{{customerId}}",
  "licensePlate": "ABC1D23",
  "model": "Corolla",
  "brand": "Toyota",
  "year": 2020
}'
```

## 05-veiculos / Listar veiculo

```bash
curl --request GET '{{baseUrl}}/vehicles?page={{page}}&limit={{limit}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 05-veiculos / Buscar veiculo

```bash
curl --request GET '{{baseUrl}}/vehicles/{{vehicleId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 05-veiculos / Atualizar veiculo

```bash
curl --request PUT '{{baseUrl}}/vehicles/{{vehicleId}}' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "customerId": "{{customerId}}",
  "licensePlate": "ABC1D23",
  "model": "Corolla",
  "brand": "Toyota",
  "year": 2020
}'
```

## 05-veiculos / Excluir veiculo

```bash
curl --request DELETE '{{baseUrl}}/vehicles/{{vehicleId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 06-servicos / Criar servico

```bash
curl --request POST '{{baseUrl}}/services' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Troca de oleo",
  "description": "Troca de oleo do motor",
  "price": 15000,
  "durationInMinutes": 60
}'
```

## 06-servicos / Listar servico

```bash
curl --request GET '{{baseUrl}}/services?page={{page}}&limit={{limit}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 06-servicos / Buscar servico

```bash
curl --request GET '{{baseUrl}}/services/{{serviceId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 06-servicos / Atualizar servico

```bash
curl --request PUT '{{baseUrl}}/services/{{serviceId}}' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Troca de oleo",
  "description": "Troca de oleo do motor",
  "price": 15000,
  "durationInMinutes": 60
}'
```

## 06-servicos / Excluir servico

```bash
curl --request DELETE '{{baseUrl}}/services/{{serviceId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 07-pecas / Criar peca

```bash
curl --request POST '{{baseUrl}}/auto-parts' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Filtro de oleo",
  "description": "Filtro para oleo do motor",
  "price": 4500,
  "stock": 10
}'
```

## 07-pecas / Listar peca

```bash
curl --request GET '{{baseUrl}}/auto-parts?page={{page}}&limit={{limit}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 07-pecas / Buscar peca

```bash
curl --request GET '{{baseUrl}}/auto-parts/{{autoPartId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 07-pecas / Atualizar peca

```bash
curl --request PUT '{{baseUrl}}/auto-parts/{{autoPartId}}' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Filtro de oleo",
  "description": "Filtro para oleo do motor",
  "price": 4500,
  "stock": 10
}'
```

## 07-pecas / Movimentacoes de estoque

```bash
curl --request GET '{{baseUrl}}/auto-parts/{{autoPartId}}/stock-movements?page={{page}}&limit={{limit}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 07-pecas / Excluir peca

```bash
curl --request DELETE '{{baseUrl}}/auto-parts/{{autoPartId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 08-ordens-de-servico / Criar ordem

```bash
curl --request POST '{{baseUrl}}/service-orders' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "customerId": "{{customerId}}",
  "vehicleId": "{{vehicleId}}",
  "serviceItems": [
    {
      "serviceId": "{{serviceId}}",
      "price": 15000,
      "description": "Troca de oleo"
    }
  ],
  "autoPartItems": [
    {
      "autoPartId": "{{autoPartId}}",
      "quantity": 1,
      "unitPrice": 4500,
      "description": "Filtro de oleo"
    }
  ]
}'
```

## 08-ordens-de-servico / Listar ordens

```bash
curl --request GET '{{baseUrl}}/service-orders?page={{page}}&limit={{limit}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 08-ordens-de-servico / Buscar ordem

```bash
curl --request GET '{{baseUrl}}/service-orders/{{serviceOrderId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 08-ordens-de-servico / Consultar por documento publico

```bash
curl --request GET '{{baseUrl}}/service-orders/customer/{{customerDocument}}'
```

## 08-ordens-de-servico / Atualizar itens

```bash
curl --request PUT '{{baseUrl}}/service-orders/{{serviceOrderId}}' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "serviceItems": [
    {
      "serviceId": "{{serviceId}}",
      "price": 15000,
      "description": "Troca de oleo"
    }
  ],
  "autoPartItems": [
    {
      "autoPartId": "{{autoPartId}}",
      "quantity": 1,
      "unitPrice": 4500,
      "description": "Filtro de oleo"
    }
  ]
}'
```

## 08-ordens-de-servico / Avancar status

```bash
curl --request PATCH '{{baseUrl}}/service-orders/{{serviceOrderId}}/status' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "direction": "next"
}'
```

## 08-ordens-de-servico / Confirmar orcamento

```bash
curl --request POST '{{baseUrl}}/service-orders/{{serviceOrderId}}/quote/confirm' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "documentNumber": "{{customerDocument}}",
  "isConfirmed": true
}'
```

## 08-ordens-de-servico / Concluir item de servico

```bash
curl --request PATCH '{{baseUrl}}/service-orders/services/{{serviceOrderItemId}}/complete' \
  --header 'Authorization: Bearer {{token}}'
```

## 08-ordens-de-servico / Excluir ordem

```bash
curl --request DELETE '{{baseUrl}}/service-orders/{{serviceOrderId}}' \
  --header 'Authorization: Bearer {{token}}'
```

## 09-notificacoes / Enviar notificacao

```bash
curl --request POST '{{baseUrl}}/notifications' \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "to": "cliente@example.com",
  "message": "Seu veiculo esta pronto para retirada",
  "subject": "Atualizacao da ordem de servico",
  "deliveryChannel": "EMAIL"
}'
```
