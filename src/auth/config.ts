export function isClerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

function isClerkUserId(userId: string) {
  return userId.startsWith("user_") && userId !== "user_REPLACE_ME";
}

export function getConfiguredAdminUserIds() {
  return new Set(
    (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((userId) => userId.trim())
      .filter(isClerkUserId),
  );
}

export function isAdminAccessConfigured() {
  return isClerkConfigured() && getConfiguredAdminUserIds().size > 0;
}
