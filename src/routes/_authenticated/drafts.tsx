import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getMyCondo } from "@/lib/condos.functions";
import { listEmails } from "@/lib/emails.functions";
import { AppShell } from "@/components/app-shell";
import { CategoryBadge } from "@/components/category-badge";
import type { Category } from "@/lib/categories";

const condoOpts = queryOptions({ queryKey: ["my-condo"], queryFn: () => getMyCondo() });
const emailsOpts = queryOptions({ queryKey: ["emails"], queryFn: () => listEmails() });

export const Route = createFileRoute("/_authenticated/drafts")({
  head: () => ({ meta: [{ title: "Rascunhos — CondoMail AI" }] }),
  loader: async ({ context }) => {
    const condo = await context.queryClient.ensureQueryData(condoOpts);
    if (!condo || !condo.setup_complete) throw redirect({ to: "/onboarding" });
    await context.queryClient.ensureQueryData(emailsOpts);
  },
  component: DraftsPage,
});

function DraftsPage() {
  const { data: condo } = useSuspenseQuery(condoOpts);
  const { data: emails } = useSuspenseQuery(emailsOpts);
  const drafts = emails.filter((e) => e.status === "rascunho_pronto");

  return (
    <AppShell title="Rascunhos prontos" condoName={condo!.nome} sindicoName={condo!.sindico_nome} showProcess={false}>
      <div className="rounded-xl border border-border bg-card shadow-soft">
        <ul className="divide-y divide-border">
          {drafts.map((e) => (
            <li key={e.id}>
              <Link to="/emails/$id" params={{ id: e.id }} className="flex items-center gap-4 p-4 hover:bg-muted/40">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{e.sender_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.subject}</p>
                </div>
                <CategoryBadge category={e.category as Category} />
                <span className="text-xs text-primary">Revisar →</span>
              </Link>
            </li>
          ))}
          {drafts.length === 0 && (
            <li className="p-12 text-center text-sm text-muted-foreground">
              Nenhum rascunho aguardando revisão. Tudo em dia!
            </li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}
