import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getMyCondo } from "@/lib/condos.functions";
import { AppShell } from "@/components/app-shell";

const condoOpts = queryOptions({ queryKey: ["my-condo"], queryFn: () => getMyCondo() });

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações — CondoMail AI" }] }),
  loader: async ({ context }) => {
    const condo = await context.queryClient.ensureQueryData(condoOpts);
    if (!condo || !condo.setup_complete) throw redirect({ to: "/onboarding" });
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { data: condo } = useSuspenseQuery(condoOpts);
  return (
    <AppShell title="Configurações" condoName={condo!.nome} sindicoName={condo!.sindico_nome} showProcess={false}>
      <div className="max-w-2xl space-y-4">
        <Field label="Nome do condomínio" value={condo!.nome} />
        <Field label="CNPJ" value={condo!.cnpj ?? "—"} />
        <Field label="Síndico responsável" value={condo!.sindico_nome} />
        <Field label="E-mail de contato" value={condo!.contact_email} />
        <Field label="Endereço espelho" value={condo!.mirror_address!} mono />
      </div>
    </AppShell>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-soft p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
