import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "font-pixel text-[11px] tracking-wide px-6 py-3.5 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-cream border-2 border-ink hover:bg-sage hover:border-sage",
  secondary: "bg-transparent text-ink border-2 border-border hover:bg-ink hover:text-cream hover:border-ink",
  ghost: "bg-transparent text-ink border-2 border-transparent hover:border-border",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
  )
);
Button.displayName = "Button";
