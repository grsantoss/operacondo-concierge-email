import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getMyCondo } from "@/lib/condos.functions";
import { listEmails } from "@/lib/emails.functions";
import { AppShell } from "@/components/app-shell";
import { CategoryBadge } from "@/components/category-badge";
import { CATEGORIES, CATEGORY_LABEL, PRIORITY_COLOR, PRIORITY_LABEL, type Category } from "@/lib/categories";

const condoOpts = queryOptions({ queryKey: ["my-condo"], queryFn: () => getMyCondo() });
const emailsOpts = queryOptions({ queryKey: ["emails"], queryFn: () => listEmails() });

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Painel — CondoMail AI" }] }),
  loader: async ({ context }) => {
    const condo = await context.queryClient.ensureQueryData(condoOpts);
    if (!condo || !condo.setup_complete) throw redirect({ to: "/onboarding" });
    await context.queryClient.ensureQueryData(emailsOpts);
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { data: condo } = useSuspenseQuery(condoOpts);
  const { data: emails } = useSuspenseQuery(emailsOpts);

  const total = emails.length;
  const urgentes = emails.filter((e) => e.priority === "alta").length;
  const aguardando = emails.filter((e) => e.status === "novo" || e.status === "em_analise").length;
  const respondidos = emails.filter((e) => e.status === "respondido").length;

  const byCategory: Record<Category, number> = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  emails.forEach((e) => {
    byCategory[e.category as Category] = (byCategory[e.category as Category] ?? 0) + 1;
  });
  const maxCount = Math.max(1, ...Object.values(byCategory));

  return (
    <AppShell title={`Painel — ${condo!.nome}`} condoName={condo!.nome} sindicoName={condo!.sindico_nome}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="E-mails recebidos" value={total} />
        <MetricCard label="Urgentes" value={urgentes} accent="var(--cat-urgente)" />
        <MetricCard label="Aguardando resposta" value={aguardando} accent="var(--accent)" />
        <MetricCard label="Respondidos" value={respondidos} accent="var(--cat-fornecedor)" />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Volume por categoria (últimos 30 dias)</h2>
        <div className="mt-5 flex h-48 items-stretch gap-3">
          {CATEGORIES.map((c) => {
            const v = byCategory[c];
            const h = Math.round((v / maxCount) * 100);
            return (
              <div key={c} className="flex flex-1 flex-col items-center">
                <div className="flex flex-1 w-full items-end">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{ height: `${Math.max(h, 4)}%`, backgroundColor: `var(--cat-${c})` }}
                  />
                </div>
                <span className="mt-2 truncate text-[10px] text-muted-foreground">{CATEGORY_LABEL[c]}</span>
                <span className="text-xs font-medium text-foreground">{v}</span>
              </div>
            );
          })}
        </div>

      </section>

      <section className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-sm font-semibold text-foreground">Atividade recente</h2>
          <Link to="/emails" className="text-xs text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {emails.slice(0, 5).map((e) => (
            <li key={e.id}>
              <Link to="/emails/$id" params={{ id: e.id }} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[e.priority as keyof typeof PRIORITY_COLOR] }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{e.sender_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.subject}</p>
                </div>
                <CategoryBadge category={e.category as Category} />
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {new Date(e.received_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </Link>
            </li>
          ))}
          {emails.length === 0 && (
            <li className="p-8 text-center text-sm text-muted-foreground">Nenhum e-mail ainda.</li>
          )}
        </ul>
      </section>
    </AppShell>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold" style={{ color: accent ?? "var(--foreground)" }}>
        {value}
      </p>
    </div>
  );
}

// Avoid unused import warning
void PRIORITY_LABEL;
