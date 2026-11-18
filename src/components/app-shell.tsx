import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Inbox, FileEdit, Settings, LogOut, Mail, Zap } from "lucide-react";
import { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { simulateNewEmail } from "@/lib/emails.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShellProps {
  children: ReactNode;
  title: string;
  condoName: string;
  sindicoName: string;
  showProcess?: boolean;
}

const NAV = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/emails", label: "E-mails", icon: Inbox },
  { to: "/drafts", label: "Rascunhos", icon: FileEdit },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children, title, condoName, sindicoName, showProcess = true }: ShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const simulate = useServerFn(simulateNewEmail);

  const mutation = useMutation({
    mutationFn: () => simulate(),
    onSuccess: () => {
      toast.success("Novo e-mail recebido");
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      router.invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <aside className="hidden w-64 flex-col bg-ink text-ink-foreground md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-ink-border px-5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <span className="text-[18px] font-semibold tracking-tight"><span className="text-primary">Condo</span>Mail AI</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          <p className="text-eyebrow px-3 pb-2 pt-1 text-ink-muted">Workspace</p>
          {NAV.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-ink-muted hover:bg-sidebar-accent/60 hover:text-ink-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-ink-border p-3">
          <div className="rounded-lg bg-sidebar-accent px-3 py-2.5">
            <p className="truncate text-[12.5px] font-medium text-ink-foreground">{condoName}</p>
            <p className="truncate text-meta text-ink-muted">{sindicoName}</p>
          </div>
          <button
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-[12.5px] text-ink-muted hover:bg-sidebar-accent/60 hover:text-ink-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sticky top-0 z-10 border-b border-border bg-background/85 px-4 backdrop-blur lg:px-8">
          <h1 className="truncate text-[17px] font-semibold tracking-tight text-foreground">{title}</h1>
          {showProcess && (
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              size="sm"
              className="h-9 shrink-0 text-ui font-semibold shadow-soft"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              {mutation.isPending ? "Processando..." : "Processar agora"}
            </Button>
          )}
        </header>
        <main className="flex-1 overflow-auto px-4 py-6 lg:px-8"><div className="mx-auto max-w-[1400px]">{children}</div></main>
      </div>
    </div>
  );
}
