import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { getMyCondo } from "@/lib/condos.functions";
import { getEmailWithDraft, saveDraft } from "@/lib/emails.functions";
import { AppShell } from "@/components/app-shell";
import { CategoryBadge } from "@/components/category-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PRIORITY_COLOR, PRIORITY_LABEL, type Category, type Priority } from "@/lib/categories";
import { toast } from "sonner";

const condoOpts = queryOptions({ queryKey: ["my-condo"], queryFn: () => getMyCondo() });

export const Route = createFileRoute("/_authenticated/emails/$id")({
  head: () => ({ meta: [{ title: "E-mail — CondoMail AI" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(condoOpts);
    await context.queryClient.ensureQueryData({
      queryKey: ["email", params.id],
      queryFn: () => getEmailWithDraft({ data: { id: params.id } }),
    });
  },
  component: EmailDetailPage,
});

function EmailDetailPage() {
  const { id } = Route.useParams();
  const { data: condo } = useSuspenseQuery(condoOpts);
  const emailQuery = useSuspenseQuery({
    queryKey: ["email", id],
    queryFn: () => getEmailWithDraft({ data: { id } }),
  });
  const { email, draftBody } = emailQuery.data;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const save = useServerFn(saveDraft);
  const [body, setBody] = useState(draftBody);

  useEffect(() => setBody(draftBody), [draftBody]);

  const mutation = useMutation({
    mutationFn: (approve: boolean) => save({ data: { email_id: id, body, approve } }),
    onSuccess: (r) => {
      toast.success(r.approved ? "Resposta enviada" : "Rascunho salvo");
      queryClient.invalidateQueries({ queryKey: ["email", id] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      if (r.approved) navigate({ to: "/emails" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <AppShell title="Detalhe do e-mail" condoName={condo!.nome} sindicoName={condo!.sindico_nome} showProcess={false}>
      <Link to="/emails" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para lista
      </Link>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* Left — original email */}
        <section className="rounded-xl border border-border bg-card shadow-soft lg:col-span-3">
          <div className="border-b border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground">{email.subject}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  De <span className="text-foreground">{email.sender_name}</span> &lt;{email.sender_email}&gt;
                </p>
                <p className="text-xs text-muted-foreground">
                  Para {condo!.contact_email} · {new Date(email.received_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CategoryBadge category={email.category as Category} />
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[email.priority as Priority] }} />
                  {PRIORITY_LABEL[email.priority as Priority]}
                </span>
              </div>
            </div>
          </div>
          <div className="p-5">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{email.body}</pre>

            {email.ai_summary && (
              <div className="mt-6 rounded-md border-l-2 bg-muted/40 p-4" style={{ borderLeftColor: "var(--primary)" }}>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Resumo do agente
                </p>
                <p className="mt-2 text-sm text-foreground">{email.ai_summary}</p>
              </div>
            )}
          </div>
        </section>

        {/* Right — draft */}
        <section className="rounded-xl border border-border bg-card shadow-soft lg:col-span-2">
          <div className="border-b border-border p-5">
            <h3 className="text-sm font-semibold text-foreground">Rascunho gerado pelo agente</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Revise antes de aprovar.</p>
          </div>
          <div className="p-5">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={() => mutation.mutate(true)} disabled={mutation.isPending}>
                Aprovar e enviar
              </Button>
              <Button variant="outline" onClick={() => mutation.mutate(false)} disabled={mutation.isPending}>
                Salvar rascunho
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              O e-mail será enviado em nome do condomínio. O morador poderá responder diretamente ao seu e-mail.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
