import type { ReactNode } from "react";
import { getProfile, getSite, getUi } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
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
  const actionClassName = [useNavAction ? "nav-action" : null, buttonClassName]
    .filter(Boolean)
    .join(" ");
  const wrapAction = (node: ReactNode) =>
    closeOnAction ? <SheetClose asChild>{node}</SheetClose> : node;
  const withTooltip = (node: ReactNode, label: string) => {
    if (!iconOnly) {
      return wrapAction(node);
    }

    return (
      <div className="group relative">
        {wrapAction(node)}
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 bottom-0 z-10 -translate-x-1/2 translate-y-full whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs text-card-foreground opacity-0 shadow-md transition-all group-hover:opacity-100 group-hover:translate-y-[110%] group-focus-within:opacity-100 group-focus-within:translate-y-[110%]"
        >
          {label}
        </span>
      </div>
    );
  };

  const showAction = (action: ContactAction) => visibleActions.includes(action);

  return (
    <div
      className={["flex flex-wrap items-center gap-2", actionsClassName]
        .filter(Boolean)
        .join(" ")}
    >
      {showAction("email")
        ? withTooltip(
            <EmailActionButton
              variant={variant}
              size={size}
              aria-label={ui.actions.email}
              className={actionClassName}
              label={ui.actions.email}
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
                  <span>{ui.actions.linkedin}</span>
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
                  <span>{githubLabel}</span>
                </span>
              </a>
            </Button>,
            githubLabel,
          )
        : null}
    </div>
  );
}
