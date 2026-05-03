import { t } from 'elysia';

export const notificationSchema = {
  detail: {
    tags: ['Notification'],
    summary: 'Enviar notificação',
    description:
      'Envia uma notificação para o canal informado (EMAIL, SMS ou PUSH).',
    responses: {
      '204': { description: 'Notificação enviada com sucesso' },
      '400': { description: 'Dados inválidos' },
      '401': { description: 'Token ausente ou inválido' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  body: t.Object({
    to: t.String({
      description: 'Destino da notificação (email, telefone ou token)',
      examples: ['cliente@bunzina.com'],
    }),
    message: t.String({
      description: 'Mensagem que será enviada ao destinatário',
      examples: ['Seu veículo está pronto para retirada'],
    }),
    subject: t.Optional(
      t.String({
        description:
          'Assunto da mensagem (aplicável principalmente para email)',
        examples: ['Atualização da ordem de serviço'],
      }),
    ),
    deliveryChannel: t.Union(
      [t.Literal('EMAIL'), t.Literal('SMS'), t.Literal('PUSH')],
      {
        description: 'EMAIL | SMS | PUSH',
        examples: ['EMAIL'],
      },
    ),
  }),
};
