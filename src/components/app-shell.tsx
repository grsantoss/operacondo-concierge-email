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
    <div className="flex min-h-screen w-full bg-muted">
      <aside className="hidden w-60 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">CondoMail AI</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="rounded-md px-3 py-2">
            <p className="truncate text-xs font-medium text-sidebar-foreground">{condoName}</p>
            <p className="truncate text-xs text-muted-foreground">{sindicoName}</p>
          </div>
          <button
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-5">
          <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
          {showProcess && (
            <Button
              onClick={() => mutation.mutate({})}
              disabled={mutation.isPending}
              variant="default"
              size="sm"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
              className="shrink-0 hover:opacity-90"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              {mutation.isPending ? "Processando..." : "Processar agora"}
            </Button>
          )}
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
