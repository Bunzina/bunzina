# language: pt
Funcionalidade: Autenticar usuários
  Para permitir que usuários ativos acessem a oficina
  Como usuário cadastrado
  Quero entrar com meu documento e minha senha

  Regra: Somente usuários ativos com credenciais corretas recebem um token

    Cenário: Entrar com credenciais válidas
      Dado que existe um usuário ativo com senha cadastrada
      Quando o usuário informa seu documento e senha corretos
      Então recebe um token de acesso associado ao seu papel

    Cenário: Recusar o acesso de um usuário inativo
      Dado que existe um usuário inativo com senha cadastrada
      Quando o usuário informa seu documento e senha corretos
      Então o acesso é recusado

