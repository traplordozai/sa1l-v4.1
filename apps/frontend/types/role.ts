export interface Permission {
    id: string
    name: string
    description: string
    category: string
  }
  
  export interface Role {
    id: string
    name: string
    permissions: string[] // Permission IDs
    description?: string
    isSystem?: boolean
  }
  
  export interface RoleFormData extends Omit<Role, "id"> {
    id?: string
  }
  
  export interface RoleState {
    roles: Role[]
    permissions: Permission[]
    isLoading: boolean
    error: Error | null
  }
  
  export interface RoleOperationCallbacks {
    onSuccess?: (message: string) => void
    onError?: (error: Error) => void
  }
  
  