"use client";

import * as React from "react";
import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

type ThemeToggleProps = {
  themeA: string;
  themeB: string;
};

export function ThemeToggle({ themeA, themeB }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const currentLabel = theme === "theme-slate" ? themeA : themeB;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label={currentLabel}
      className="nav-action"
    >
      <Palette className="size-4" />
      <span className="hidden sm:inline">{currentLabel}</span>
      <span className="sm:hidden">{currentLabel}</span>
    </Button>
  );
}
