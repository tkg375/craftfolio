import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const session = await getSession();
  if (!adminEmail || !session || session.email.trim() !== adminEmail) redirect("/");
  return <AdminClient />;
}
