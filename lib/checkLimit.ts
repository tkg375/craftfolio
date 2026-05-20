import { db } from "./db";

export async function checkAndDecrementCredits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  if (!userId) return { allowed: false, reason: "Please sign in to analyze your resume." };
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true, credits: true } });
  if (!user) return { allowed: false, reason: "User not found" };

  if (user.plan === "pro") return { allowed: true };

  if (user.credits <= 0) {
    return { allowed: false, reason: "You've used all your free analyses. Upgrade to Pro for unlimited access." };
  }

  await db.user.update({ where: { id: userId }, data: { credits: { decrement: 1 } } });
  return { allowed: true };
}
