# Plano — CondoMail AI

App SaaS multi-tenant para síndicos no Brasil. Esta primeira versão entrega **estrutura funcional completa com Lovable Cloud**: autenticação real, isolamento por condomínio via RLS, CRUD de e-mails e rascunhos, e todas as 7 telas navegáveis. **Sem ingestão real de e-mail** (chega depois) — vamos popular a inbox com seed data realista por condomínio e oferecer um botão "Simular recebimento" para gerar novos e-mails de teste. **Sem IA real** nesta versão — rascunhos virão de templates pré-prontos por categoria; trocar pelo Lovable AI fica para um próximo passo.

## Backend (Lovable Cloud)

**Auth:** e-mail + senha (Google fica para depois — usuário não pediu).

**Tabelas (todas com RLS por `condo_id`):**

- `condos` — id, nome, cnpj, sindico_nome, contact_email, mirror_address (gerado automaticamente, ex.: `alpha-7f3k@inbox.condomail.com.br`), setup_complete, created_at
- `condo_members` — id, condo_id, user_id, role (`sindico` | `assistente`), created_at. Define quem acessa qual condomínio.
- `emails` — id, condo_id, sender_name, sender_email, subject, body, category (enum), priority (enum: alta/media/baixa), status (enum: novo/em_analise/rascunho_pronto/respondido), received_at, ai_summary
- `drafts` — id, email_id, condo_id, body, approved, sent_at, created_at

Enum `email_category`: manutencao, reclamacao, fornecedor, financeiro, assembleia, reserva, informativo, urgente.

**Função `has_condo_access(_user_id, _condo_id)`** (security definer) para evitar recursão em RLS. Todas as policies em `emails`/`drafts` filtram por `has_condo_access(auth.uid(), condo_id)`.

**Trigger `on_auth_user_created`:** não cria condomínio automaticamente — usuário passa pelo onboarding.

**Geração do mirror_address:** trigger SQL no insert de `condos` que monta `<slug>-<hash6>@inbox.condomail.com.br` a partir do nome.

**Seed:** ao concluir o onboarding (Step 3 "Simular e-mail de teste"), uma função insere ~10 e-mails realistas (vazamento apto 304, proposta de limpeza, boleto, barulho, etc.) no condomínio recém-criado, com categorias e prioridades variadas, alguns já com rascunho pronto.

## Frontend (TanStack Start)

**Rotas:**

- `/auth` — Tela 1 (login + signup)
- `/_authenticated/onboarding` — Telas 2, 3, 4 (stepper controla qual mostrar; redireciona para `/` se `setup_complete = true`)
- `/_authenticated/` — Tela 5 (Dashboard)
- `/_authenticated/emails` — Tela 6 (Lista)
- `/_authenticated/emails/$id` — Tela 7 (Detalhe + rascunho)
- `/_authenticated/settings` — placeholder simples

Guarda do onboarding: layout `_authenticated` busca o condo ativo do usuário; se `setup_complete = false`, redireciona para `/onboarding` (exceto se já está lá).

**Shell:** sidebar com logo, nav (Painel, E-mails, Rascunhos, Configurações), nome do condomínio + síndico + logout no rodapé. Header com título da página, seletor de período e botão "Processar agora" (que dispara a simulação de novo e-mail).

**Design system (src/styles.css, tokens oklch):**

- `--primary` teal profundo `#0F6E56`
- `--accent` âmbar `#EF9F27`
- Badges de categoria como variantes (`urgente` vermelho, `manutencao` laranja, `reclamacao` rosa, `fornecedor` verde, `financeiro` azul, `assembleia` roxo, `reserva` teal, `informativo` cinza)
- Cards brancos, bordas 1px, sem gradientes, grid de 8px, fonte Inter
- Todo o texto em pt-BR

**Tela 7 (split 60/40):** painel esquerdo com e-mail original + summary box (borda teal à esquerda); painel direito com textarea editável pré-preenchida com template por categoria, botões "Aprovar e enviar" / "Editar antes de enviar". Aprovar grava `drafts.approved = true`, `drafts.sent_at = now()` e move `emails.status` para `respondido`.

## Detalhes técnicos

- Server functions em `src/lib/*.functions.ts` com `requireSupabaseAuth`; todas as queries via TanStack Query + `ensureQueryData` nos loaders.
- Botão "Processar agora" / "Simular recebimento" → server fn que insere 1 novo e-mail aleatório do pool de exemplos no condo ativo.
- Templates de resposta por categoria ficam num módulo `src/lib/draft-templates.ts` (puro frontend, sem IA).
- Sem `og:image` agora; metadados simples por rota.

## Fora do escopo desta versão

- Recebimento real de e-mail (encaminhamento SMTP/IMAP)
- IA real classificando/resumindo (será trocada depois pelo Lovable AI Gateway)
- Envio real do e-mail aprovado (por ora só marca como respondido)
- Convidar assistentes para o condomínio
- Login com Google

Confirma para eu começar?