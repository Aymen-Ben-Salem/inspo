import "server-only";

import { and, count, desc, eq, ilike } from "drizzle-orm";

import { requireDatabase } from "@/db/client";
import { adminAuditLogs, subscribers } from "@/db/schema";

const PAGE_SIZE = 50;

export async function getAdminSubscribers({ query, page }: { query: string; page: number }) {
  const database = requireDatabase();
  const safePage = Math.max(1, page);
  const where = query ? ilike(subscribers.email, `%${query}%`) : undefined;

  const [rows, [totalRow]] = await Promise.all([
    database
      .select()
      .from(subscribers)
      .where(where)
      .orderBy(desc(subscribers.createdAt))
      .limit(PAGE_SIZE)
      .offset((safePage - 1) * PAGE_SIZE),
    database.select({ total: count() }).from(subscribers).where(where),
  ]);

  const total = totalRow?.total ?? 0;

  return {
    rows,
    page: safePage,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getSubscribersForExport() {
  return requireDatabase()
    .select({
      email: subscribers.email,
      status: subscribers.status,
      source: subscribers.source,
      consentedAt: subscribers.consentedAt,
      unsubscribedAt: subscribers.unsubscribedAt,
    })
    .from(subscribers)
    .orderBy(desc(subscribers.createdAt));
}

export async function unsubscribeSubscriber(id: string, actorId: string) {
  const database = requireDatabase();
  const now = new Date();

  return database.transaction(async (transaction) => {
    const [updated] = await transaction
      .update(subscribers)
      .set({ status: "unsubscribed", unsubscribedAt: now, updatedAt: now })
      .where(and(eq(subscribers.id, id), eq(subscribers.status, "active")))
      .returning({ id: subscribers.id });

    if (!updated) throw new Error("The subscriber is already unsubscribed or no longer exists.");

    await transaction.insert(adminAuditLogs).values({
      actorId,
      action: "subscriber.unsubscribed",
      resourceType: "subscriber",
      resourceId: id,
    });

    return updated;
  });
}

export async function deleteSubscriber(id: string, actorId: string) {
  const database = requireDatabase();

  return database.transaction(async (transaction) => {
    const [deleted] = await transaction
      .delete(subscribers)
      .where(eq(subscribers.id, id))
      .returning({ id: subscribers.id, status: subscribers.status });

    if (!deleted) throw new Error("Subscriber not found.");

    await transaction.insert(adminAuditLogs).values({
      actorId,
      action: "subscriber.deleted",
      resourceType: "subscriber",
      resourceId: id,
      details: { previousStatus: deleted.status },
    });

    return deleted;
  });
}

export async function recordSubscriberExport(actorId: string, count: number) {
  await requireDatabase().insert(adminAuditLogs).values({
    actorId,
    action: "subscriber.exported",
    resourceType: "subscriber",
    details: { count },
  });
}
