import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-pixel text-[9px] px-2 py-1 border border-border inline-block leading-none",
        className
      )}
      {...props}
    />
  );
}
