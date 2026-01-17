"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, string> = {
  sv: "Svenska",
  en: "English",
  es: "Español",
};

const localeFlags: Record<Locale, string> = {
  sv: "🇸🇪",
  en: "🇺🇸",
  es: "🇪🇸",
};

const localeOptions = locales.map((locale) => ({
  value: locale,
  label: localeLabels[locale],
}));

type LanguageSwitcherProps = {
  currentLocale: string;
};

function buildLocalePath(pathname: string, locale: string) {
  const segments = pathname.split("/");
  if (segments.length < 2) {
    return `/${locale}`;
  }

  segments[1] = locale;
  const nextPath = segments.join("/");
  return nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? `/${currentLocale}`;
  const searchParams = useSearchParams();
  const query = searchParams?.toString();
  const normalizedLocale = currentLocale.toLowerCase();
  const activeValue =
    locales.find((locale) => locale === normalizedLocale) ?? currentLocale;
  const activeOption =
    localeOptions.find((option) => option.value === activeValue) ?? null;
  const label =
    activeOption?.value?.toUpperCase() ?? currentLocale.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Select language"
          className="nav-action flex items-center gap-2 brightness-80 hover:brightness-100"
        >
          <Globe className="size-4" aria-hidden />
          <span className="text-sm font-medium">{label}</span>
          <ChevronDown className="size-3 opacity-70" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        aria-label="Language options"
      >
        {localeOptions.map((option) => {
          const isActive = option.value === activeValue;
          const nextPath = buildLocalePath(pathname, option.value);
          const href = query ? `${nextPath}?${query}` : nextPath;

          return (
            <DropdownMenuItem
              asChild
              key={option.value}
              className={cn(
                "w-full rounded-md px-3 py-2.5 hover:bg-accent/60 focus:bg-accent",
                isActive && "bg-muted/50"
              )}
            >
              <Link
                href={href}
                aria-label={`Switch language to ${option.label}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none" aria-hidden>
                      {localeFlags[option.value]}
                    </span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </span>
                  {isActive ? <Check className="size-4" aria-hidden /> : null}
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
