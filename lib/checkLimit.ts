import { db } from "./db";

export async function checkAndDecrementCredits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  if (!userId) return { allowed: false, reason: "Please sign in to analyze your resume." };
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true, credits: true } });
  if (!user) return { allowed: false, reason: "User not found" };

  if (user.plan === "pro") return { allowed: true };

  // Atomic conditional decrement — only succeeds if credits > 0, preventing race conditions
  const updated = await db.user.updateMany({
    where: { id: userId, credits: { gt: 0 } },
    data: { credits: { decrement: 1 } },
  });

  if (updated.count === 0) {
    return { allowed: false, reason: "You've used all your free analyses. Upgrade to Pro for unlimited access." };
  }

  return { allowed: true };
}
