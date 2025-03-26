type Role = "admin" | "user"

interface User {
  id: string
  role: Role
}

const rules = {
  edit: ["admin"],
  delete: ["admin"],
  view: ["admin", "user"]
}

export function can(action: keyof typeof rules, _resource: string, user: User): boolean {
  return rules[action]?.includes(user.role)
}

export function usePermission(user: User) {
  return {
    can: (action: keyof typeof rules, resource: string) => can(action, resource, user),
  }
}