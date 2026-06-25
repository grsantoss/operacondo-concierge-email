import type { Category, Priority, EmailStatus } from "./categories";

export interface SeedEmail {
  sender_name: string;
  sender_email: string;
  subject: string;
  body: string;
  category: Category;
  priority: Priority;
  status: EmailStatus;
  ai_summary: string;
}

export const SEED_EMAILS: SeedEmail[] = [
  {
    sender_name: "Maria Helena Souza",
    sender_email: "maria.souza@exemplo.com",
    subject: "URGENTE — Vazamento no apartamento 304",
    body: "Boa tarde, síndico.\n\nEstou com um vazamento ativo no banheiro do meu apartamento (304, bloco A). A água está infiltrando para o teto da unidade 204 abaixo. Preciso de uma vistoria com urgência hoje ainda.\n\nFico à disposição no telefone (11) 98765-4321.\n\nAtenciosamente,\nMaria Helena",
    category: "manutencao",
    priority: "alta",
    status: "rascunho_pronto",
    ai_summary: "Moradora do apto 304 relata vazamento ativo no banheiro com infiltração no apto 204. Solicita vistoria urgente. Classificado como Manutenção — Prioridade Alta.",
  },
  {
    sender_name: "Limpa Mais Serviços LTDA",
    sender_email: "comercial@limpamais.com.br",
    subject: "Proposta — Contrato de limpeza áreas comuns",
    body: "Prezado(a) Síndico(a),\n\nConforme conversa anterior, segue nossa proposta para o serviço de limpeza das áreas comuns do condomínio, com 2 colaboradores fixos de segunda a sábado.\n\nValor mensal: R$ 8.400,00\nVigência: 12 meses\nReajuste: IPCA anual\n\nAguardamos seu retorno para agendar visita técnica.\n\nAtenciosamente,\nCarlos Mendes — Comercial",
    category: "fornecedor",
    priority: "media",
    status: "novo",
    ai_summary: "Proposta comercial de empresa de limpeza para áreas comuns, R$ 8.400/mês por 12 meses. Aguarda retorno para visita técnica.",
  },
  {
    sender_name: "Roberto Lima",
    sender_email: "rlima@exemplo.com",
    subject: "Reclamação — Barulho excessivo no corredor 5º andar",
    body: "Síndico, boa noite.\n\nEstou registrando reclamação sobre o barulho excessivo no corredor do 5º andar nas últimas três noites, após as 23h. Parece ser de visitantes da unidade 502.\n\nGostaria que o regulamento interno fosse reforçado junto aos moradores.\n\nObrigado,\nRoberto Lima — apto 504",
    category: "reclamacao",
    priority: "media",
    status: "em_analise",
    ai_summary: "Morador do 504 reclama de barulho excessivo no corredor do 5º andar após 23h, possivelmente da unidade 502. Pede reforço do regulamento.",
  },
  {
    sender_name: "Administradora Prisma",
    sender_email: "financeiro@prisma.adm.br",
    subject: "Boleto referente ao mês de junho/2026",
    body: "Olá,\n\nSegue em anexo o boleto da taxa condominial referente ao mês de junho/2026, com vencimento em 10/06.\n\nValor: R$ 1.245,00\n\nQualquer dúvida estamos à disposição.\n\nPrisma Administradora",
    category: "financeiro",
    priority: "baixa",
    status: "respondido",
    ai_summary: "Administradora envia boleto da taxa de junho/2026, R$ 1.245,00, vencimento 10/06.",
  },
  {
    sender_name: "Júlia Pereira",
    sender_email: "julia.p@exemplo.com",
    subject: "Reserva do salão de festas — sábado 12/07",
    body: "Boa tarde,\n\nGostaria de reservar o salão de festas para o sábado 12/07, das 14h às 22h, para o aniversário do meu filho (cerca de 30 convidados).\n\nPosso passar para retirar o termo de uso?\n\nObrigada,\nJúlia Pereira — apto 1102",
    category: "reserva",
    priority: "baixa",
    status: "rascunho_pronto",
    ai_summary: "Moradora do 1102 solicita reserva do salão de festas para 12/07 (14h–22h), aniversário infantil com ~30 convidados.",
  },
  {
    sender_name: "Eduardo Tanaka",
    sender_email: "etanaka@exemplo.com",
    subject: "Convocação extraordinária — segurança do prédio",
    body: "Síndico,\n\nVários moradores do bloco B comentaram comigo sobre a necessidade de reforçar a portaria à noite. Gostaria de sugerir uma assembleia extraordinária para discutir o assunto.\n\nMe coloco à disposição para ajudar na organização.\n\nEduardo Tanaka — apto 803",
    category: "assembleia",
    priority: "media",
    status: "novo",
    ai_summary: "Morador do 803 sugere convocação de assembleia extraordinária para discutir reforço da portaria noturna.",
  },
  {
    sender_name: "Patrícia Alves",
    sender_email: "patiavles@exemplo.com",
    subject: "Elevador social parado novamente",
    body: "Síndico, o elevador social do bloco A parou de novo hoje de manhã. Já é a terceira vez no mês. Os moradores idosos do 7º andar estão tendo muita dificuldade. Precisamos resolver isso com urgência.\n\nObrigada,\nPatrícia",
    category: "manutencao",
    priority: "alta",
    status: "novo",
    ai_summary: "Moradora reporta terceira falha do elevador social do bloco A no mês. Idosos do 7º andar prejudicados. Prioridade alta.",
  },
  {
    sender_name: "Fernando Castro",
    sender_email: "fcastro@exemplo.com",
    subject: "Dúvida sobre regras de mudança",
    body: "Boa tarde,\n\nVou me mudar no próximo final de semana. Posso fazer a mudança no sábado pela manhã? Preciso reservar o elevador de serviço?\n\nObrigado,\nFernando — apto 207",
    category: "informativo",
    priority: "baixa",
    status: "rascunho_pronto",
    ai_summary: "Morador do 207 pergunta sobre regras de mudança no sábado e reserva do elevador de serviço.",
  },
  {
    sender_name: "Segurança 24h Brasil",
    sender_email: "comercial@seguranca24h.com.br",
    subject: "Renovação de contrato — vigia noturno",
    body: "Prezado Síndico,\n\nO contrato do serviço de vigia noturno vence em 30/06. Gostaríamos de agendar reunião para discutir renovação com reajuste de 4,2% (IPCA).\n\nAtenciosamente,\nSegurança 24h Brasil",
    category: "fornecedor",
    priority: "media",
    status: "novo",
    ai_summary: "Empresa de segurança propõe renovação do contrato de vigia noturno com reajuste de 4,2%.",
  },
  {
    sender_name: "Ana Beatriz Moreira",
    sender_email: "anabia@exemplo.com",
    subject: "Cobrança em duplicidade — boleto de maio",
    body: "Síndico,\n\nRecebi dois boletos referentes à taxa de maio/2026. Já paguei o primeiro no dia 08/05. Como devo proceder?\n\nAnexo o comprovante.\n\nAna Beatriz — apto 401",
    category: "financeiro",
    priority: "alta",
    status: "em_analise",
    ai_summary: "Moradora do 401 reporta cobrança em duplicidade da taxa de maio, com comprovante de pagamento anexo.",
  },
];
