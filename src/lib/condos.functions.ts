import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { SEED_EMAILS } from "./seed-emails";
import { generateDraft } from "./draft-templates";

export const getMyCondo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: memberships, error: mErr } = await supabase
      .from("condo_members")
      .select("condo_id")
      .eq("user_id", userId)
      .limit(1);
    if (mErr) throw new Error(mErr.message);
    if (!memberships || memberships.length === 0) return null;
    const { data: condo, error } = await supabase
      .from("condos")
      .select("*")
      .eq("id", memberships[0].condo_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return condo;
  });

const createCondoSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  cnpj: z.string().trim().max(20).optional().nullable(),
  sindico_nome: z.string().trim().min(2).max(120),
  contact_email: z.string().trim().email().max(255),
});

export const createCondo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createCondoSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: condo, error } = await supabase.rpc("create_condo_for_user", {
      _nome: data.nome,
      _cnpj: data.cnpj ?? "",
      _sindico_nome: data.sindico_nome,
      _contact_email: data.contact_email,
    });
    if (error) throw new Error(error.message);
    return condo;
  });


export const completeSetup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ condo_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error: upErr } = await supabase
      .from("condos")
      .update({ setup_complete: true })
      .eq("id", data.condo_id);
    if (upErr) throw new Error(upErr.message);

    // Seed inbox if empty
    const { count } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("condo_id", data.condo_id);

    if ((count ?? 0) === 0) {
      const now = Date.now();
      const rows = SEED_EMAILS.map((e, i) => ({
        condo_id: data.condo_id,
        sender_name: e.sender_name,
        sender_email: e.sender_email,
        subject: e.subject,
        body: e.body,
        category: e.category,
        priority: e.priority,
        status: e.status,
        ai_summary: e.ai_summary,
        received_at: new Date(now - i * 3600_000).toISOString(),
      }));
      const { data: inserted, error: emErr } = await supabase
        .from("emails")
        .insert(rows)
        .select("id, category, sender_name, status");
      if (emErr) throw new Error(emErr.message);

      const drafts = (inserted ?? [])
        .filter((e) => e.status === "rascunho_pronto" || e.status === "respondido")
        .map((e) => ({
          email_id: e.id,
          condo_id: data.condo_id,
          body: generateDraft(e.category, e.sender_name),
          approved: e.status === "respondido",
          sent_at: e.status === "respondido" ? new Date().toISOString() : null,
        }));
      if (drafts.length > 0) {
        const { error: dErr } = await supabase.from("drafts").insert(drafts);
        if (dErr) throw new Error(dErr.message);
      }
    }
    return { ok: true };
  });

export const checkTestEmail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ condo_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { count } = await context.supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("condo_id", data.condo_id);
    return { count: count ?? 0 };
  });
