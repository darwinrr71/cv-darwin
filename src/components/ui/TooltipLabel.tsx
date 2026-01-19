import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TooltipLabelProps = {
  label: string;
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
};

export function TooltipLabel({
  label,
  children,
  className,
  wrapperClassName,
}: TooltipLabelProps) {
  return (
    <div className={cn("group relative", wrapperClassName)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 bottom-0 z-10 -translate-x-1/2 translate-y-full whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs text-card-foreground opacity-0 shadow-md transition-all group-hover:opacity-100 group-hover:translate-y-[110%] group-focus-within:opacity-100 group-focus-within:translate-y-[110%]",
          className,
        )}
      >
        {label}
      </span>
    </div>
  );
}
