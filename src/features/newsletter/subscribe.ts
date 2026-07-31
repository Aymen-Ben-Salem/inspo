import "server-only";

import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const subscriptionSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    company: z.string().max(200).optional().default(""),
    source: z.string().trim().min(1).max(80).optional().default("website"),
  })
  .strict();

export class NewsletterUnavailableError extends Error {
  constructor() {
    super("Newsletter storage is not configured yet.");
    this.name = "NewsletterUnavailableError";
  }
}

export async function subscribeToNewsletter(input: unknown) {
  const parsed = subscriptionSchema.parse(input);

  if (parsed.company) return;

  const supabase = createAdminSupabaseClient();
  if (!supabase) throw new NewsletterUnavailableError();

  const { error } = await supabase.from("subscribers").upsert(
    {
      email: parsed.email,
      source: parsed.source,
      consented_at: new Date().toISOString(),
    },
    { onConflict: "email", ignoreDuplicates: true },
  );

  if (error) throw new Error(`Could not save subscription: ${error.message}`);
}
