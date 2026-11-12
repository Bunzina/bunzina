# language: pt
Funcionalidade: Cadastrar clientes
  Para identificar quem solicita os serviços da oficina
  Como atendente
  Quero manter os dados de contato e um documento único por cliente

  Regra: O documento identifica um único cliente

    Cenário: Cadastrar um cliente com seus dados de contato
      Dado que ainda não existe cliente com o documento informado
      Quando o atendente cadastra o cliente
      Então o cliente fica registrado com documento, e-mail, telefone e endereço

    Cenário: Impedir o cadastro duplicado do mesmo documento
      Dado que já existe um cliente com o documento informado
      Quando o atendente tenta cadastrar o cliente novamente
      Então o cadastro é recusado por conflito

