"use client"

// File: apps/frontend/components/ui/Modal.tsx
import { Fragment, type ReactNode, forwardRef } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { cn } from "@/lib/utils"
import Button from "./Button"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  className?: string
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      footer,
      size = "md",
      closeOnOverlayClick = true,
      showCloseButton = true,
      className,
    },
    ref,
  ) => {
    // Size classes
    const sizeClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      full: "max-w-4xl",
    }

    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeOnOverlayClick ? onClose : () => {}}
          initialFocus={ref}
        >
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          {/* Modal panel */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  ref={ref}
                  className={cn(
                    "w-full transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all",
                    sizeClasses[size],
                    className,
                  )}
                >
                  {/* Header */}
                  {(title || showCloseButton) && (
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                      <div>
                        {title && (
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            {title}
                          </Dialog.Title>
                        )}
                        {description && (
                          <Dialog.Description className="mt-1 text-sm text-gray-500">{description}</Dialog.Description>
                        )}
                      </div>
                      {showCloseButton && (
                        <button
                          onClick={onClose}
                          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-westernPurple"
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="px-6 py-4">{children}</div>

                  {/* Footer */}
                  {footer && (
                    <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3 bg-gray-50">
                      {footer}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  },
)

Modal.displayName = "Modal"

export interface ConfirmModalProps extends Omit<ModalProps, "children" | "footer"> {
  confirmText?: string
  cancelText?: string
  message: ReactNode
  onConfirm: () => void
  variant?: "primary" | "danger"
  isConfirmLoading?: boolean
}

export const ConfirmModal = ({
  confirmText = "Confirm",
  cancelText = "Cancel",
  message,
  onConfirm,
  variant = "primary",
  isConfirmLoading = false,
  ...props
}: ConfirmModalProps) => {
  return (
    <Modal
      {...props}
      footer={
        <>
          <Button variant="outline" onClick={props.onClose} disabled={isConfirmLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isConfirmLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="py-4">{message}</div>
    </Modal>
  )
}

export default Modal

