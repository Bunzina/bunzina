# language: pt
Funcionalidade: Conduzir uma ordem de serviço
  Para atender o veículo desde o recebimento até a entrega
  Como equipe da oficina
  Quero calcular o orçamento e avançar a ordem conforme o trabalho acontece

  Regra: O orçamento soma os serviços e as peças solicitadas

    Cenário: Abrir uma ordem com orçamento calculado
      Dado que cliente, veículo, serviços e peças existem
      Quando a equipe abre uma ordem com um serviço de 150 reais e duas peças de 50 reais
      Então a ordem fica recebida com orçamento total de 250 reais

  Regra: Somente o cliente responsável pode decidir sobre um orçamento aguardando aprovação

    Cenário: Cliente responsável aprova o orçamento
      Dado que a ordem está aguardando aprovação
      Quando o cliente responsável aprova o orçamento
      Então a ordem passa para execução

    Cenário: Cliente responsável recusa o orçamento
      Dado que a ordem está aguardando aprovação
      Quando o cliente responsável recusa o orçamento
      Então a mesma ordem volta para recebida

    Cenário: Impedir que outra pessoa decida sobre o orçamento
      Dado que a ordem está aguardando aprovação
      Quando uma pessoa com outro documento tenta aprovar o orçamento
      Então a decisão é recusada e a ordem não muda

  Regra: Todos os itens de serviço precisam ser concluídos antes de finalizar a ordem

    Cenário: Concluir o serviço e entregar o veículo
      Dado que a ordem está em execução com um serviço pendente
      Quando o mecânico conclui o serviço
      E a equipe finaliza a ordem
      E a equipe registra a retirada do veículo
      Então a ordem fica entregue e o serviço fica concluído

    Cenário: Impedir a finalização enquanto houver serviço pendente
      Dado que a ordem está em execução com um serviço pendente
      Quando a equipe tenta finalizar a ordem
      Então a finalização é recusada

  Regra: Um item de serviço só pode ser concluído uma vez

    Cenário: Impedir a conclusão repetida do mesmo serviço
      Dado que a ordem está em execução com um serviço já concluído
      Quando o mecânico tenta concluir novamente o mesmo serviço
      Então a conclusão repetida é recusada

  Regra: Os itens da ordem só podem ser alterados antes da aprovação

    Cenário: Impedir a alteração de uma ordem aguardando aprovação
      Dado que a ordem está aguardando aprovação
      Quando a equipe tenta alterar seus itens
      Então a alteração é recusada

