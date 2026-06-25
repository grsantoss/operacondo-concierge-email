export const CATEGORIES = [
  "urgente",
  "manutencao",
  "reclamacao",
  "fornecedor",
  "financeiro",
  "assembleia",
  "reserva",
  "informativo",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = "alta" | "media" | "baixa";
export type EmailStatus = "novo" | "em_analise" | "rascunho_pronto" | "respondido";

export const CATEGORY_LABEL: Record<Category, string> = {
  urgente: "Urgente",
  manutencao: "Manutenção",
  reclamacao: "Reclamação",
  fornecedor: "Fornecedor",
  financeiro: "Financeiro",
  assembleia: "Assembleia",
  reserva: "Reserva",
  informativo: "Informativo",
};

export const CATEGORY_STYLE: Record<Category, { bg: string; fg: string }> = {
  urgente: { bg: "var(--cat-urgente-bg)", fg: "var(--cat-urgente)" },
  manutencao: { bg: "var(--cat-manutencao-bg)", fg: "var(--cat-manutencao)" },
  reclamacao: { bg: "var(--cat-reclamacao-bg)", fg: "var(--cat-reclamacao)" },
  fornecedor: { bg: "var(--cat-fornecedor-bg)", fg: "var(--cat-fornecedor)" },
  financeiro: { bg: "var(--cat-financeiro-bg)", fg: "var(--cat-financeiro)" },
  assembleia: { bg: "var(--cat-assembleia-bg)", fg: "var(--cat-assembleia)" },
  reserva: { bg: "var(--cat-reserva-bg)", fg: "var(--cat-reserva)" },
  informativo: { bg: "var(--cat-informativo-bg)", fg: "var(--cat-informativo)" },
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  alta: "var(--cat-urgente)",
  media: "var(--cat-manutencao)",
  baixa: "var(--cat-fornecedor)",
};

export const STATUS_LABEL: Record<EmailStatus, string> = {
  novo: "Novo",
  em_analise: "Em análise",
  rascunho_pronto: "Rascunho pronto",
  respondido: "Respondido",
};
