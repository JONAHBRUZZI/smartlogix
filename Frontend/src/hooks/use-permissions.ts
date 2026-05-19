import { getRoleProfile, hasPermission, type AppPermission } from "@/app/access";
import { useAuth } from "@/app/auth";

export function usePermissions() {
  const { session } = useAuth();
  const role = session?.role ?? null;

  return {
    role,
    profile: role ? getRoleProfile(role) : null,
    can(permission: AppPermission) {
      return role ? hasPermission(role, permission) : false;
    }
  };
}