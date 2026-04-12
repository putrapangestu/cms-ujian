import type { RoleType } from '@/data/types/Role'

export const hasPermission = (
  userRole: RoleType[],
  allowedRoles?: RoleType[],
) => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.some((role) => userRole.includes(role))
}
