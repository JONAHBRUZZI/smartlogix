import { DEFAULT_DEMO_PASSWORD, REGISTERED_USERS } from "@/lib/user-registry";
import { getRoleProfile } from "@/app/access";
import type { Role } from "@/types/domain";

export { DEFAULT_DEMO_PASSWORD as DEFAULT_LOCAL_PASSWORD };

export interface ManagedUserProfile {
  username: string;
  name: string;
  role: Role;
  team: string;
  summary: string;
  status: "active" | "planned";
}

export const managedUsers: ManagedUserProfile[] = REGISTERED_USERS.map((user) => ({
  username: user.username,
  name: user.name,
  role: user.role,
  team: user.team,
  summary: user.summary,
  status: "active" as const
}));

export function getRoleLabel(role: Role): string {
  return getRoleProfile(role).label;
}
