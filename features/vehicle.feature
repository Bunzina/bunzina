# language: pt
Funcionalidade: Cadastrar veículos
  Para associar um veículo ao cliente responsável
  Como atendente
  Quero identificar cada veículo por uma placa válida e única

  Regra: Um veículo pertence a um cliente existente e sua placa não se repete

    Cenário: Cadastrar um veículo de um cliente
      Dado que existe um cliente cadastrado
      Quando o atendente cadastra um veículo com placa Mercosul
      Então o veículo fica associado ao cliente

    Cenário: Impedir que dois veículos usem a mesma placa
      Dado que existe um cliente cadastrado e a placa já está em uso
      Quando o atendente tenta cadastrar outro veículo com essa placa
      Então o cadastro do veículo é recusado por conflito

