# language: pt
Funcionalidade: Manter o histórico de estoque de peças
  Para acompanhar as entradas e saídas de peças
  Como responsável pelo estoque
  Quero registrar movimentações quando a quantidade mudar

  Regra: Uma alteração de quantidade registra uma entrada ou saída

    Cenário: Registrar entrada de peças
      Dado que a peça tem 5 unidades em estoque
      Quando o estoque da peça aumenta para 8 unidades
      Então o histórico registra uma entrada de 3 unidades

    Cenário: Registrar saída de peças
      Dado que a peça tem 8 unidades em estoque
      Quando o estoque da peça diminui para 5 unidades
      Então o histórico registra uma saída de 3 unidades

  Regra: Uma quantidade inalterada não cria movimentação

    Cenário: Manter a quantidade atual
      Dado que a peça tem 5 unidades em estoque
      Quando o estoque da peça continua com 5 unidades
      Então nenhuma movimentação é registrada

