import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getMyCondo } from "@/lib/condos.functions";
import { listEmails } from "@/lib/emails.functions";
import { AppShell } from "@/components/app-shell";
import { CategoryBadge } from "@/components/category-badge";
import { CATEGORIES, CATEGORY_LABEL, PRIORITY_COLOR, PRIORITY_LABEL, STATUS_LABEL, type Category, type Priority, type EmailStatus } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Search } from "lucide-react";

const condoOpts = queryOptions({ queryKey: ["my-condo"], queryFn: () => getMyCondo() });
const emailsOpts = queryOptions({ queryKey: ["emails"], queryFn: () => listEmails() });

export const Route = createFileRoute("/_authenticated/emails/")({
  head: () => ({ meta: [{ title: "E-mails — CondoMail AI" }] }),
  loader: async ({ context }) => {
    const condo = await context.queryClient.ensureQueryData(condoOpts);
    if (!condo || !condo.setup_complete) throw redirect({ to: "/onboarding" });
    await context.queryClient.ensureQueryData(emailsOpts);
  },
  component: EmailsPage,
});

function EmailsPage() {
  const { data: condo } = useSuspenseQuery(condoOpts);
  const { data: emails } = useSuspenseQuery(emailsOpts);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category | "">("");
  const [prio, setPrio] = useState<Priority | "">("");
  const [stat, setStat] = useState<EmailStatus | "">("");

  const filtered = useMemo(() => {
    return emails.filter((e) => {
      if (cat && e.category !== cat) return false;
      if (prio && e.priority !== prio) return false;
      if (stat && e.status !== stat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!e.sender_name.toLowerCase().includes(q) && !e.subject.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [emails, search, cat, prio, stat]);

  return (
    <AppShell title="E-mails recebidos" condoName={condo!.nome} sindicoName={condo!.sindico_nome}>
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por remetente ou assunto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={cat} onChange={(v) => setCat(v as Category | "")} placeholder="Todas categorias">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
            ))}
          </Select>
          <Select value={prio} onChange={(v) => setPrio(v as Priority | "")} placeholder="Todas prioridades">
            {(["alta","media","baixa"] as Priority[]).map((p) => (
              <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
            ))}
          </Select>
          <Select value={stat} onChange={(v) => setStat(v as EmailStatus | "")} placeholder="Todos status">
            {(["novo","em_analise","rascunho_pronto","respondido"] as EmailStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Remetente</th>
                <th className="px-4 py-3 font-medium">Assunto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Prioridade</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Recebido</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-foreground">{e.sender_name}</td>
                  <td className="px-4 py-3 text-muted-foreground"><span className="line-clamp-1 max-w-[300px]">{e.subject}</span></td>
                  <td className="px-4 py-3"><CategoryBadge category={e.category as Category} /></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[e.priority as Priority] }} />
                      {PRIORITY_LABEL[e.priority as Priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{STATUS_LABEL[e.status as EmailStatus]}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(e.received_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/emails/$id" params={{ id: e.id }} className="inline-flex gap-1 text-muted-foreground hover:text-primary">
                      <Eye className="h-4 w-4" />
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-sm text-muted-foreground">
                    Nenhum e-mail corresponde aos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function Select({ value, onChange, placeholder, children }: { value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}
