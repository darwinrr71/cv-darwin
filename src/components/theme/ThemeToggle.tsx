"use client";

import * as React from "react";
import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

type ThemeToggleProps = {
  themeA: string;
  themeB: string;
  navStyle?: boolean;
};

export function ThemeToggle({ themeA, themeB, navStyle }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const currentLabel = theme === "theme-slate" ? themeA : themeB;
  const labelClassName = [
    "font-normal",
    navStyle
      ? "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none group-hover:-translate-y-[0.5px]"
      : null,
  ]
    .filter(Boolean)
    .join(" ");
  const navClassName =
    "nav-link group relative h-full rounded-none bg-transparent border-transparent shadow-none px-4 py-5 text-sm font-normal text-muted-foreground transition-colors duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted/50 hover:text-foreground focus-visible:ring-ring/50";

  return (
    <Button
      type="button"
      variant={navStyle ? "ghost" : "outline"}
      size="sm"
      onClick={toggleTheme}
      aria-label={currentLabel}
      className={navStyle ? navClassName : "nav-action group relative font-normal"}
    >
      <Palette className="size-4" />
      <span className={navStyle ? "hidden sm:inline-block" : "hidden sm:inline"}>
        <span className={labelClassName}>{currentLabel}</span>
      </span>
      <span className={navStyle ? "sm:hidden" : "sm:hidden"}>
        <span className={labelClassName}>{currentLabel}</span>
      </span>
    </Button>
  );
}
