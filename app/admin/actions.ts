"use server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = "tgordon1@icloud.com";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.email !== ADMIN_EMAIL) redirect("/");
  return session;
}

export async function setPlan(userId: string, plan: string) {
  await requireAdmin();
  const db = await getDb();
  await db.user.update({ where: { id: userId }, data: { plan } });
  revalidatePath("/admin");
}

export async function setCredits(userId: string, credits: number) {
  await requireAdmin();
  const db = await getDb();
  await db.user.update({ where: { id: userId }, data: { credits } });
  revalidatePath("/admin");
}

export async function addCredits(userId: string, amount: number) {
  await requireAdmin();
  const db = await getDb();
  await db.user.update({ where: { id: userId }, data: { credits: { increment: amount } } });
  revalidatePath("/admin");
}

export async function markMessageRead(messageId: string) {
  await requireAdmin();
  const db = await getDb();
  await db.supportMessage.update({ where: { id: messageId }, data: { read: true } });
  revalidatePath("/admin");
}
