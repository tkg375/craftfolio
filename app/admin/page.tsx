import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function AdminPage() {
  const session = await getSession();
  if (!ADMIN_EMAIL || !session || session.email !== ADMIN_EMAIL) redirect("/");
  return <AdminClient />;
}
