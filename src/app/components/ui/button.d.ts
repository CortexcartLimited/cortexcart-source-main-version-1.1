import * as React from "react"
import { type VariantProps } from "class-variance-authority"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null
    size?: "default" | "sm" | "lg" | "icon" | null
    asChild?: boolean
}

export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>
export function buttonVariants(props: any): string
