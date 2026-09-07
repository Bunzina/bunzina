# Diagrama de nuvem

Componentes AWS do alvo da Fase 3. A aplicação não precisa ficar ligada o tempo todo: sobe para a gravação do vídeo e pode ser destruída depois.

![Arquitetura AWS Fase 3 — visão de nuvem](../cloud-overview.png)

## Quem chama quem

| Origem | Destino | Quando |
| --- | --- | --- |
| Cliente | API Gateway | Toda requisição HTTP |
| API Gateway | Lambda Auth | `POST /auth` (login com CPF) |
| API Gateway | ALB / EKS | Demais rotas, depois de validar o JWT |
| Lambda | PostgreSQL gerenciado | Consultar cliente/usuário e status |
| API no EKS | PostgreSQL gerenciado | CRUD e workflow de OS |
| API no EKS | SMTP | E-mail de orçamento (`AWAITING_APPROVAL`) |
| GitHub Actions | ECR, EKS, Terraform | CI/CD dos quatro repositórios |

## O que já existe hoje

VPC, EKS, node group, addons (`vpc-cni`, `kube-proxy`, `coredns`, EBS CSI), ECR e ALB Ingress já são provisionados por `infra/`. O que a Fase 3 acrescenta na nuvem é o **API Gateway**, a **Lambda** e o **banco gerenciado** no lugar do Postgres in-cluster como fonte primária.
