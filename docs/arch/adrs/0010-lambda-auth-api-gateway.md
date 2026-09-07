# ADR 0010 — Lambda de autenticação e API Gateway

- Status: Proposta
- Data: Fase 3
- RFC: [0001](../rfcs/0001-auth-cpf-lambda-gateway.md)

## Contexto

O PDF pede Function Serverless que (1) valide CPF, (2) consulte existência/status e (3) emita JWT — as três na mesma Function. Também pede API Gateway (AWS, Kong, Traefik ou equivalente) validando JWT antes dos serviços internos.

## Decisão

- **AWS API Gateway** na frente de tudo
- **Uma AWS Lambda** para o fluxo completo de login
- CPF + e-mail + senha no body; CPF associado ao usuário no banco
- Gateway valida JWT nas rotas protegidas; a API **revalida** e aplica RBAC
- HS256 compartilhado (mesmo `JWT_SECRET` da ADR 0004) para não trocar o middleware de uma vez

## Motivo

- AWS nativo encaixa no Terraform/Academy e no vídeo (“deploy na nuvem”)
- Kong/Traefik no cluster não isolam a borda: o tráfego ainda chegaria no EKS sem token
- Uma Function só atende o “não escolher uma das três funcionalidades”
- Segunda validação na API é permitida (e pedida) pelo PDF

## Consequências

- Login sai de `POST /auth/login` na Elysia; a rota atual vira legado ou proxy
- Users ganham coluna de documento (migration nova)
- Lambda precisa alcançar o banco gerenciado (VPC ou URL pública com SSL)
- Gateway e Lambda podem viver no repo da Lambda (RFC 0002)

## Alternativas

- Kong/Traefik no EKS — mais simples de operar, pior isolamento
- Authorizer Lambda separado da Function de login — duas Functions, foge do enunciado do login
- RS256 + JWKS — melhor a longo prazo, mais peça para a demo
