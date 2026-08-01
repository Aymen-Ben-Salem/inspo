import "server-only";

import { z } from "zod";

import { getDatabase } from "@/db/client";
import { subscribers } from "@/db/schema";

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

  const database = getDatabase();
  if (!database) throw new NewsletterUnavailableError();

  try {
    await database
      .insert(subscribers)
      .values({
        email: parsed.email,
        source: parsed.source,
        consentedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subscribers.email,
        set: {
          source: parsed.source,
          status: "active",
          consentedAt: new Date(),
          unsubscribedAt: null,
          updatedAt: new Date(),
        },
      });
  } catch (cause) {
    throw new Error("Could not save subscription.", { cause });
  }
}
