import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getMyCondo, createCondo, completeSetup, checkTestEmail } from "@/lib/condos.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

const condoOpts = queryOptions({ queryKey: ["my-condo"], queryFn: () => getMyCondo() });

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Configuração — CondoMail AI" }] }),
  loader: async ({ context }) => {
    const condo = await context.queryClient.ensureQueryData(condoOpts);
    if (condo?.setup_complete) throw redirect({ to: "/dashboard" });
    return null;
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const { data: condo } = useSuspenseQuery(condoOpts);
  const [step, setStep] = useState(condo ? 2 : 1);

  return (
    <div className="min-h-screen bg-muted px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CondoMail AI</span>
        </div>

        <Stepper step={step} />

        <div className="mt-8 rounded-lg border border-border bg-card p-8 shadow-sm">
          {step === 1 && <Step1 onDone={() => setStep(2)} />}
          {step === 2 && condo && <Step2 mirror={condo.mirror_address!} onDone={() => setStep(3)} />}
          {step === 3 && condo && <Step3 condoId={condo.id} />}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Dados do condomínio", "Endereço espelho", "Teste de conexão"];
  return (
    <div className="flex items-center gap-3">
      {labels.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} className="flex flex-1 items-center gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-medium ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : idx}
              </div>
              <span className={`hidden text-xs sm:inline ${active ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {idx < 3 && <div className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function Step1({ onDone }: { onDone: () => void }) {
  const create = useServerFn(createCondo);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ nome: "", cnpj: "", sindico_nome: "", contact_email: "" });
  const mutation = useMutation({
    mutationFn: (data: typeof form) => create({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-condo"] });
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(form);
      }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dados do condomínio</h2>
        <p className="mt-1 text-sm text-muted-foreground">Vamos começar com algumas informações básicas.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome do condomínio</Label>
        <Input id="nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input id="cnpj" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sindico">Nome do síndico responsável</Label>
        <Input id="sindico" required value={form.sindico_nome} onChange={(e) => setForm({ ...form, sindico_nome: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact">E-mail de contato real do condomínio</Label>
        <Input id="contact" type="email" required value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
        <p className="text-xs text-muted-foreground">Este é o e-mail que os moradores já conhecem.</p>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Salvando..." : "Próximo →"}
        </Button>
      </div>
    </form>
  );
}

function Step2({ mirror, onDone }: { mirror: string; onDone: () => void }) {
  const [tab, setTab] = useState<"gmail" | "outlook" | "outros">("gmail");

  function copy() {
    navigator.clipboard.writeText(mirror);
    toast.success("Endereço copiado");
  }

  const instructions = {
    gmail: [
      "Acesse Configurações → Encaminhamento e POP/IMAP no Gmail.",
      "Clique em 'Adicionar um endereço de encaminhamento' e cole o endereço espelho acima.",
      "Confirme o e-mail de verificação enviado pelo Gmail.",
      "Selecione 'Encaminhar uma cópia de todo e-mail recebido para…' e salve.",
    ],
    outlook: [
      "Acesse Configurações → E-mail → Encaminhamento no Outlook.",
      "Marque 'Habilitar encaminhamento' e cole o endereço espelho.",
      "Marque 'Manter uma cópia das mensagens encaminhadas' se desejar.",
      "Salve as alterações.",
    ],
    outros: [
      "Procure a opção de Encaminhamento (Forwarding) nas configurações do seu provedor.",
      "Cadastre o endereço espelho acima como destino.",
      "Confirme qualquer e-mail de verificação que o provedor envie.",
      "Ative o encaminhamento de todas as mensagens recebidas.",
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Seu endereço espelho foi criado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure o encaminhamento automático no seu provedor de e-mail para este endereço.
        </p>
      </div>

      <div className="rounded-md bg-primary p-5 text-primary-foreground">
        <p className="text-xs uppercase tracking-wide text-primary-foreground/80">Endereço espelho</p>
        <div className="mt-2 flex items-center gap-2 rounded-md bg-primary-foreground/10 px-3 py-2">
          <code className="flex-1 truncate font-mono text-sm">{mirror}</code>
          <button onClick={copy} className="rounded p-1 hover:bg-primary-foreground/10">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex gap-1 border-b border-border">
          {(["gmail", "outlook", "outros"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm capitalize ${
                tab === t ? "border-b-2 border-primary font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <ol className="mt-4 space-y-2 text-sm text-foreground">
          {instructions[tab].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onDone} className="text-sm text-muted-foreground hover:underline">
          Fazer isso depois
        </button>
        <Button onClick={onDone}>Já configurei o encaminhamento →</Button>
      </div>
    </div>
  );
}

function Step3({ condoId }: { condoId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const complete = useServerFn(completeSetup);
  const check = useServerFn(checkTestEmail);
  const [confirmed, setConfirmed] = useState(false);

  const simulateAndComplete = useMutation({
    mutationFn: async () => {
      // Simulate: complete setup which seeds inbox
      await complete({ data: { condo_id: condoId } });
      const r = await check({ data: { condo_id: condoId } });
      return r;
    },
    onSuccess: () => {
      setConfirmed(true);
      queryClient.invalidateQueries({ queryKey: ["my-condo"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-lg font-semibold text-foreground">Teste de conexão</h2>

      {!confirmed ? (
        <div className="mx-auto max-w-md rounded-md border border-border bg-muted p-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">Aguardando e-mail de teste...</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Envie qualquer e-mail para o endereço espelho para confirmar a conexão.
          </p>
          <Button onClick={() => simulateAndComplete.mutate()} disabled={simulateAndComplete.isPending} className="mt-5" variant="outline" size="sm">
            {simulateAndComplete.isPending ? "Verificando..." : "Simular recebimento"}
          </Button>
        </div>
      ) : (
        <div className="mx-auto max-w-md rounded-md border border-border bg-card p-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ backgroundColor: "var(--cat-fornecedor-bg)" }}>
            <Check className="h-7 w-7" style={{ color: "var(--cat-fornecedor)" }} />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">Conexão confirmada!</p>
          <p className="mt-1 text-xs text-muted-foreground">Seu painel já tem e-mails de exemplo para você explorar.</p>
          <Button onClick={() => navigate({ to: "/dashboard" })} className="mt-5">
            Ir para o painel →
          </Button>
        </div>
      )}
    </div>
  );
}
