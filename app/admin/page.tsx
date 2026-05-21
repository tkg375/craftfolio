import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const session = await getSession();
  if (!session || session.email !== 'tgordon1@icloud.com') redirect("/");
  return <AdminClient />;
}
