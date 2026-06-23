import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.email !== "tgordon1@icloud.com") redirect("/");

  const db = await getDb();
  const [users, messages] = await Promise.all([
    db.user.findMany({
      select: { id: true, email: true, plan: true, credits: true, createdAt: true, subscriptionStatus: true },
      orderBy: { createdAt: "desc" },
    }),
    db.supportMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <AdminClient
      users={users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      messages={messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))}
    />
  );
}
