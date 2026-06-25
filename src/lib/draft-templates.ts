import type { Category } from "./categories";

export function generateDraft(category: Category, senderName: string): string {
  const greeting = `Prezado(a) ${senderName.split(" ")[0]},`;
  const sign = "Atenciosamente,\nA Administração do Condomínio";

  const bodies: Record<Category, string> = {
    urgente:
      "Recebemos sua mensagem e estamos tratando o caso com a máxima prioridade. Nossa equipe entrará em contato em até 2 horas para dar os próximos passos.",
    manutencao:
      "Recebemos seu chamado. Já acionamos a equipe técnica responsável e uma vistoria será realizada em até 24 horas. Manteremos você informado(a) sobre o andamento.",
    reclamacao:
      "Agradecemos seu contato. Sua reclamação foi registrada e será encaminhada conforme o regulamento interno. Tomaremos as providências cabíveis e retornaremos com um posicionamento em breve.",
    fornecedor:
      "Agradecemos o envio da proposta. Iremos analisá-la junto ao conselho consultivo e retornaremos com uma posição em até 5 dias úteis.",
    financeiro:
      "Confirmamos o recebimento da sua mensagem. Encaminhamos ao setor financeiro para verificação e daremos retorno assim que tivermos a confirmação.",
    assembleia:
      "Sua sugestão foi recebida. Avaliaremos a pertinência da convocação junto ao conselho e, caso aprovada, a pauta será divulgada conforme prevê a convenção.",
    reserva:
      "Confirmamos a disponibilidade da data solicitada. O termo de uso está disponível na portaria para retirada e assinatura. Por favor, traga um documento de identificação.",
    informativo:
      "Agradecemos o seu contato. Segue abaixo a informação solicitada. Estamos à disposição para qualquer outra dúvida.",
  };

  return `${greeting}\n\n${bodies[category]}\n\n${sign}`;
}
