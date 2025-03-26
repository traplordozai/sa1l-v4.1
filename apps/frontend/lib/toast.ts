import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const toast = {
  success: ({ title, description, action }: ToastProps) => {
    return sonnerToast.success(title, {
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    })
  },
  error: ({ title, description, action }: ToastProps) => {
    return sonnerToast.error(title, {
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    })
  },
  warning: ({ title, description, action }: ToastProps) => {
    return sonnerToast.warning(title, {
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    })
  },
  info: ({ title, description, action }: ToastProps) => {
    return sonnerToast.info(title, {
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    })
  },
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: (data: T) => ToastProps
      error: (error: unknown) => ToastProps
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success: (data: T) => {
        const result = success(data)
        return {
          title: result.title,
          description: result.description,
        }
      },
      error: (err: any) => {
        const result = error(err)
        return {
          title: result.title,
          description: result.description,
        }
      },
    })
  },
}

