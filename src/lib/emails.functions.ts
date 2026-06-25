import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { SEED_EMAILS } from "./seed-emails";
import { generateDraft } from "./draft-templates";

async function getUserCondoId(supabase: any, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("condo_members")
    .select("condo_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Nenhum condomínio associado");
  return data.condo_id as string;
}

export const listEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const condoId = await getUserCondoId(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("emails")
      .select("*")
      .eq("condo_id", condoId)
      .order("received_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getEmailWithDraft = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: email, error } = await context.supabase
      .from("emails")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!email) throw new Error("E-mail não encontrado");

    const { data: draft } = await context.supabase
      .from("drafts")
      .select("*")
      .eq("email_id", data.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const draftBody = draft?.body ?? generateDraft(email.category, email.sender_name);
    return { email, draft, draftBody };
  });

export const saveDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ email_id: z.string().uuid(), body: z.string().min(1).max(10000), approve: z.boolean().optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: email, error: eErr } = await context.supabase
      .from("emails")
      .select("id, condo_id")
      .eq("id", data.email_id)
      .maybeSingle();
    if (eErr) throw new Error(eErr.message);
    if (!email) throw new Error("E-mail não encontrado");

    const { data: existing } = await context.supabase
      .from("drafts")
      .select("id")
      .eq("email_id", data.email_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const approved = data.approve === true;
    const payload = {
      email_id: data.email_id,
      condo_id: email.condo_id,
      body: data.body,
      approved,
      sent_at: approved ? new Date().toISOString() : null,
    };

    if (existing) {
      const { error } = await context.supabase.from("drafts").update(payload).eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("drafts").insert(payload);
      if (error) throw new Error(error.message);
    }

    const newStatus = approved ? "respondido" : "rascunho_pronto";
    const { error: sErr } = await context.supabase
      .from("emails")
      .update({ status: newStatus })
      .eq("id", data.email_id);
    if (sErr) throw new Error(sErr.message);

    return { ok: true, approved };
  });

export const simulateNewEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const condoId = await getUserCondoId(context.supabase, context.userId);
    const sample = SEED_EMAILS[Math.floor(Math.random() * SEED_EMAILS.length)];
    const { data, error } = await context.supabase
      .from("emails")
      .insert({
        condo_id: condoId,
        sender_name: sample.sender_name,
        sender_email: sample.sender_email,
        subject: sample.subject,
        body: sample.body,
        category: sample.category,
        priority: sample.priority,
        status: "novo",
        ai_summary: sample.ai_summary,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  });
