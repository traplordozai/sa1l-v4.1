import { CardHeader } from "@/components/ui/card"
// File: apps/frontend/components/ui/Card.tsx
import { forwardRef } from "react"
import PropTypes from "prop-types"
import { cn } from "@/lib/utils"

// CardProps defined using PropTypes at the bottom of the file

const Card = forwardRef < HTMLDivElement,
  CardProps
>(
    (
{
  className,
       variant = 'default',
       size = 'md',
       hoverable = false,
       children,
  ...props
}
, ref) =>
{
  // Base styles
  const baseStyles = "rounded-lg"

  // Variant styles
  const variantStyles = {
    default: "bg-white shadow",
    outline: "bg-white border border-gray-200",
    filled: "bg-gray-100",
  }

  // Size styles
  const sizeStyles = {
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
  }

  return (
          <div
              ref={ref}
              className={cn(
                  baseStyles,
                  variantStyles[variant],
                  sizeStyles[size],
                  hoverable && 'transition-shadow hover:shadow-md',
                  className
              )}
              {...props}
          >
            {children}
          </div>
      );
}
)

Card.displayName = "Card"

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
Card.displayName = "Card"

// CardHeaderProps defined using PropTypes at the bottom of the file
return (
          <div
              ref={ref}
              className={cn('flex flex-col space-y-1.5 pb-4', className)}
{
  ...props
}
>
{
  ;(title || action) && (
    <div className="flex items-center justify-between">
      {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
      {action && <div>{action}</div>}
    </div>
  )
}
{
  subtitle && <p className="text-sm text-gray-500">{subtitle}</p>
}
{
  children
}
</div>
      )
}
)

CardHeader.displayName = "CardHeader"

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef < HTMLDivElement,
  CardContentProps
>(
    (
{
  className, children,
  ...props
}
, ref) =>
{
  return (
CardHeader.displayName = "CardHeader";
  ...props
  >
  children
  </div>
      )
}
)

CardContent.displayName = "CardContent"

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef < HTMLDivElement,
  CardFooterProps
>(
    (
{
  className, children,
  ...props
}
, ref) =>
{
  return (
CardContent.displayName = "CardContent";
  ...props
  >
  children
  </div>
      )
}
)

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardContent, CardFooter }
CardFooter.displayName = "CardFooter"

// PropTypes definitions
Card.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "outline", "filled"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  hoverable: PropTypes.bool,
  children: PropTypes.node,
}

CardHeader.propTypes = {
  className: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  action: PropTypes.node,
  children: PropTypes.node,
}

CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

export { Card, CardHeader, CardContent, CardFooter }

