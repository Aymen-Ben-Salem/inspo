import { requireAdmin } from "@/auth/require-admin";
import {
  getSubscribersForExport,
  recordSubscriberExport,
} from "@/features/admin/subscribers-repository";

function csvCell(value: string) {
  const formulaSafe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${formulaSafe.replaceAll('"', '""')}"`;
}

export async function POST() {
  const { userId } = await requireAdmin();
  const subscribers = await getSubscribersForExport();
  const rows = subscribers.map((subscriber) =>
    [
      subscriber.email,
      subscriber.status,
      subscriber.source,
      subscriber.consentedAt.toISOString(),
      subscriber.unsubscribedAt?.toISOString() ?? "",
    ]
      .map(csvCell)
      .join(","),
  );

  await recordSubscriberExport(userId, subscribers.length);

  return new Response(
    [`"email","status","source","consented_at","unsubscribed_at"`, ...rows].join("\n"),
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="inspora-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    },
  );
}
