"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipLabel } from "@/components/ui/TooltipLabel";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

type NavbarClientProps = {
  locale: string;
  ui: {
    nav: {
      home: string;
      homeTooltip?: string;
      projects: string;
      about: string;
      contact: string;
    };
    actions?: {
      themeA?: string;
      themeB?: string;
    };
  };
  site: {
    siteName?: string;
  };
  mobileContactActions: React.ReactNode;
  desktopContactActions: React.ReactNode;
};

const EASE = "cubic-bezier(0.22,1,0.36,1)";
const HIDE_START_Y = 24;
const HIDE_DELTA = 10;
const SHOW_DELTA = 8;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

type NavStyle = React.CSSProperties & {
  "--nav-bg-alpha"?: number;
  "--tw-bg-opacity"?: number;
};

export function NavbarClient({
  locale,
  ui,
  site,
  mobileContactActions,
  desktopContactActions,
}: NavbarClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  const [, startTransition] = React.useTransition();

  const headerRef = React.useRef<HTMLElement | null>(null);
  const [headerH, setHeaderH] = React.useState(0);

  const [scrollY, setScrollY] = React.useState(0);
  const [hidden, setHidden] = React.useState(false);
  const [durMs, setDurMs] = React.useState(240);

  const hiddenRef = React.useRef(false);
  const lastYRef = React.useRef(0);
  const downAccRef = React.useRef(0);
  const upAccRef = React.useRef(0);

  const rafPendingRef = React.useRef(false);
  const pendingYRef = React.useRef(0);

  const [bgBaseVar, setBgBaseVar] = React.useState<"primary" | "card">("card");

  const items = [
    { href: `/${locale}`, label: ui.nav.home },
    { href: `/${locale}/projects`, label: ui.nav.projects },
    { href: `/${locale}/about`, label: ui.nav.about },
    { href: `/${locale}/contact`, label: ui.nav.contact },
  ];

  const normalizedPathname =
    pathname?.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  const isDesktopActive = (href: string) => {
    const normalizedHref =
      href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href;

    if (normalizedHref === `/${locale}`) {
      return normalizedPathname === normalizedHref;
    }

    return (
      normalizedPathname === normalizedHref ||
      normalizedPathname?.startsWith(`${normalizedHref}/`)
    );
  };

  const themeA = ui.actions?.themeA ?? "Slate";
  const themeB = ui.actions?.themeB ?? "Warm";
  const brandLabel = site.siteName ?? ui.nav.home;
  const homeTooltip = ui.nav.homeTooltip ?? ui.nav.home;
  const brandText = (
    <span className="inline-flex items-center">
      <span className="font-semibold">D</span>
      <span className="-ml-1.5 md:-ml-2 font-medium opacity-90">R</span>
    </span>
  );
  const brandClassName =
    "brand-mark -my-1 md:my-0 text-3xl font-semibold leading-[0.95] tracking-[-0.04em] text-current opacity-90 md:text-4xl md:-ml-3";
  const brandDesktopClassName = `${brandClassName} absolute left-14 top-1/2 -translate-y-[55%] hidden md:inline-flex md:items-center`;
  const brandMobileClassName = `${brandClassName} inline-flex items-center`;

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);

    updatePreference();

    if (media.addEventListener) {
      media.addEventListener("change", updatePreference);
      return () => media.removeEventListener("change", updatePreference);
    }

    media.addListener(updatePreference);
    return () => media.removeListener(updatePreference);
  }, []);

  React.useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const isSlate = root.classList.contains("theme-slate");
      setBgBaseVar(isSlate ? "primary" : "card");
    };

    update();

    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      setHeaderH(Math.ceil(r.height));
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  function navigateFromDrawer(href: string) {
    setMobileOpen(false);
    if (pathname === href) return;

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    const delay = prefersReducedMotion ? 0 : 180;
    timeoutRef.current = window.setTimeout(() => {
      startTransition(() => {
        router.push(href);
      });
    }, delay);
  }

  React.useEffect(() => {
    const initY = window.scrollY;
    lastYRef.current = initY;
    pendingYRef.current = initY;
    setScrollY(initY);

    const forceVisibleNoAnim = () => {
      downAccRef.current = 0;
      upAccRef.current = 0;

      if (hiddenRef.current) {
        hiddenRef.current = false;
        setDurMs(0);
        setHidden(false);
      } else {
        setDurMs(0);
      }
    };

    const hideBar = () => {
      if (hiddenRef.current) return;
      hiddenRef.current = true;
      downAccRef.current = 0;
      upAccRef.current = 0;
      setDurMs(220);
      setHidden(true);
    };

    const showBar = () => {
      if (!hiddenRef.current) return;
      hiddenRef.current = false;
      downAccRef.current = 0;
      upAccRef.current = 0;
      setDurMs(240);
      setHidden(false);
    };

    const process = (y: number) => {
      setScrollY(y);

      if (prefersReducedMotion) {
        if (hiddenRef.current) {
          hiddenRef.current = false;
          setHidden(false);
        }
        downAccRef.current = 0;
        upAccRef.current = 0;
        lastYRef.current = y;
        return;
      }

      if (mobileOpen) {
        forceVisibleNoAnim();
        lastYRef.current = y;
        return;
      } else {
        setDurMs((prev) => (prev === 0 ? 240 : prev));
      }

      const last = lastYRef.current;
      const delta = y - last;

      if (delta > 0) {
        downAccRef.current += delta;
        upAccRef.current = 0;

        if (y > HIDE_START_Y && downAccRef.current > HIDE_DELTA) {
          hideBar();
        }
      } else if (delta < 0) {
        upAccRef.current += -delta;
        downAccRef.current = 0;

        if (y < HIDE_START_Y || upAccRef.current > SHOW_DELTA) {
          showBar();
        }
      }

      if (y < HIDE_START_Y && hiddenRef.current) {
        showBar();
      }

      lastYRef.current = y;
    };

    const onScroll = () => {
      pendingYRef.current = window.scrollY;

      if (rafPendingRef.current) return;
      rafPendingRef.current = true;

      window.requestAnimationFrame(() => {
        rafPendingRef.current = false;
        process(pendingYRef.current);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [mobileOpen, prefersReducedMotion]);

  const bgAlpha = React.useMemo(() => {
    if (prefersReducedMotion) return 1;

    const minAlpha = 0.6;
    const maxDistance = 260;

    const t = clamp(1 - scrollY / maxDistance, 0, 1);
    return minAlpha + (1 - minAlpha) * t;
  }, [prefersReducedMotion, scrollY]);

  const headerStyle: NavStyle | undefined = prefersReducedMotion
    ? undefined
    : {
        transform:
          mobileOpen || !hidden ? "translateY(0)" : "translateY(-100%)",
        transitionProperty: "transform, background-color",
        transitionTimingFunction: EASE,
        transitionDuration: `${mobileOpen ? 0 : durMs}ms, 240ms`,
        willChange: "transform, background-color",
        backgroundColor: `hsl(var(--${bgBaseVar}) / ${bgAlpha})`,
        "--nav-bg-alpha": bgAlpha,
        ...(bgBaseVar === "primary" ? { "--tw-bg-opacity": bgAlpha } : {}),
      };

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <header
        ref={headerRef}
        className="site-navbar mobile-navbar fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur"
        style={headerStyle}
      >
        <Link
          href={`/${locale}`}
          className={brandDesktopClassName}
          aria-label={brandLabel}
        >
          <TooltipLabel
            label={homeTooltip}
            className="font-normal leading-normal tracking-normal"
          >
            {brandText}
            <span className="sr-only">{brandLabel}</span>
          </TooltipLabel>
        </Link>
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:hidden">
            <Link
              href={`/${locale}`}
              className={brandMobileClassName}
              aria-label={brandLabel}
            >
              <span className="sr-only">{brandLabel}</span>
              {brandText}
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle themeA={themeA} themeB={themeB} />
              <LanguageSwitcher currentLocale={locale} />
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="nav-action"
                  aria-label="Open menu"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
            </div>
          </div>

          <div className="relative hidden items-stretch justify-between gap-4 px-6 py-0 md:flex">
            <nav
              className="flex flex-wrap items-stretch gap-2"
              aria-label="Primary"
            >
              {items.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="nav-link group relative h-full rounded-none px-4 py-5 text-lg text-muted-foreground transition-colors duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted/50 hover:text-foreground focus-visible:ring-ring/50"
                >
                  <Link href={item.href}>
                    <span className="font-medium tracking-tight transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none group-hover:-translate-y-[0.5px]">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "pointer-events-none absolute left-3 right-3 bottom-3 h-[3px] rounded-full bg-gradient-to-r from-current/70 to-current transition-[transform,opacity] duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left",
                        isDesktopActive(item.href)
                          ? "scale-x-100 opacity-100"
                          : "scale-x-0 opacity-0",
                        "group-hover:scale-x-100 group-hover:opacity-70",
                      )}
                    />
                  </Link>
                </Button>
              ))}
            </nav>
            <div className="flex items-stretch gap-2 pl-6 ml-6">
              {desktopContactActions}
              <ThemeToggle themeA={themeA} themeB={themeB} navStyle />
              <LanguageSwitcher currentLocale={locale} navStyle />
            </div>
          </div>
        </div>
      </header>

      <div aria-hidden style={{ height: headerH }} />

      <SheetContent
        side="right"
        className="mobile-drawer fixed inset-y-0 right-0 z-60 h-dvh w-[88vw] max-w-105 translate-x-0 overflow-y-auto bg-background text-foreground p-0"
      >
        <div className="flex h-full flex-col">
          <div className="mobile-drawer-header flex h-14 items-center justify-between px-4">
            <span className="text-sm font-semibold">{brandLabel}</span>
            <SheetClose asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="nav-action"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="flex h-full flex-col gap-5 p-5">
            <nav className="space-y-3" aria-label="Mobile">
              {items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => navigateFromDrawer(item.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "drawer-link flex w-full items-center rounded-md border-l-2 border-transparent px-4 py-3 text-left text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:border-primary/50 active:bg-muted/40",
                      isActive &&
                        "drawer-link-active bg-muted/40 font-semibold text-foreground border-primary/70",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <Separator />
            {mobileContactActions}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
