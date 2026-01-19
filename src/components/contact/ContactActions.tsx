import type { ReactNode } from "react";
import { getProfile, getSite, getUi } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { TooltipLabel } from "@/components/ui/TooltipLabel";
import { EmailActionButton } from "@/components/contact/EmailActionButton";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { Mail } from "lucide-react";

type ContactAction = "email" | "linkedin" | "github";

type ContactActionsProps = {
  locale: string;
  compact?: boolean;
  actionsClassName?: string;
  buttonClassName?: string;
  useNavAction?: boolean;
  closeOnAction?: boolean;
  iconOnly?: boolean;
  actions?: ContactAction[];
  navStyle?: boolean;
};

type UiContent = {
  actions: {
    email: string;
    linkedin: string;
  };
};

type ProfileContent = {
  links: {
    linkedin: string;
  };
};

type SiteContent = {
  links: {
    email: string;
    github: string;
  };
};

const githubLabels: Record<string, string> = {
  sv: "GitHub",
  en: "GitHub",
  es: "GitHub",
};

const defaultActions: ContactAction[] = ["email", "linkedin", "github"];
export async function ContactActions({
  locale,
  compact = false,
  actionsClassName,
  buttonClassName,
  useNavAction = true,
  closeOnAction = false,
  iconOnly = false,
  actions,
  navStyle,
}: ContactActionsProps) {
  const ui = (await getUi(locale)) as UiContent;
  const profile = (await getProfile(locale)) as ProfileContent;
  const site = (await getSite()) as SiteContent;
  const size = compact ? "sm" : "default";
  const variant = compact ? "ghost" : "outline";
  const visibleActions = actions ?? defaultActions;
  const githubLabel = githubLabels[locale] ?? "GitHub";
  const githubHref = `${site.links.github}?tab=repositories`;
  const emailDraft = {
    to: site.links.email,
    subject: "Contacto - Darwin Rengifo",
    body: "Hola Darwin,\r\n\r\nQuisiera conversar sobre...",
  };
  const navStyleEnabled = navStyle ?? (compact && useNavAction && !iconOnly);
  const navLinkClassName =
    "nav-link group relative h-full rounded-none bg-transparent border-transparent shadow-none px-4 py-5 text-sm text-muted-foreground transition-colors duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted/50 hover:text-foreground focus-visible:ring-ring/50";
  const actionClassName = [
    navStyleEnabled ? navLinkClassName : null,
    !navStyleEnabled && useNavAction ? "nav-action" : null,
    !navStyleEnabled ? "group relative" : null,
    "font-normal",
    buttonClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const wrapAction = (node: ReactNode) =>
    closeOnAction ? <SheetClose asChild>{node}</SheetClose> : node;
  const withTooltip = (node: ReactNode, label: string) => {
    if (!iconOnly) {
      return wrapAction(node);
    }

    return (
      <TooltipLabel label={label}>
        {wrapAction(node)}
      </TooltipLabel>
    );
  };

  const showAction = (action: ContactAction) => visibleActions.includes(action);
  const showHover = navStyleEnabled;
  const labelTextClassName = [
    "font-normal",
    showHover
      ? "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none group-hover:-translate-y-[0.5px]"
      : null,
  ]
    .filter(Boolean)
    .join(" ");
  const layoutClassName = navStyleEnabled
    ? "flex flex-wrap items-stretch gap-2"
    : "flex flex-wrap items-center gap-2";

  return (
    <div
      className={[layoutClassName, actionsClassName].filter(Boolean).join(" ")}
    >
      {showAction("email")
        ? withTooltip(
            <EmailActionButton
              variant={variant}
              size={size}
              aria-label={ui.actions.email}
              className={actionClassName}
              label={ui.actions.email}
              labelClassName={labelTextClassName}
              showHoverDecoration={false}
              draft={emailDraft}
              icon={<Mail className="size-4" aria-hidden="true" />}
            />,
            ui.actions.email,
          )
        : null}
      {showAction("linkedin")
        ? withTooltip(
            <Button
              asChild
              variant={variant}
              size={size}
              aria-label={ui.actions.linkedin}
              className={actionClassName}
            >
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                <span className="inline-flex items-center gap-2">
                  <LinkedinIcon className="size-4" />
                  <span className={labelTextClassName}>
                    {ui.actions.linkedin}
                  </span>
                </span>
              </a>
            </Button>,
            ui.actions.linkedin,
          )
        : null}
      {showAction("github")
        ? withTooltip(
            <Button
              asChild
              variant={variant}
              size={size}
              aria-label={githubLabel}
              className={actionClassName}
            >
              <a href={githubHref} target="_blank" rel="noreferrer">
                <span className="inline-flex items-center gap-2">
                  <GithubIcon className="size-4" />
                  <span className={labelTextClassName}>{githubLabel}</span>
                </span>
              </a>
            </Button>,
            githubLabel,
          )
        : null}
    </div>
  );
}
