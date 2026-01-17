export type EmailDraft = {
  to: string;
  subject?: string;
  body?: string;
};

export function buildMailto({ to, subject, body }: EmailDraft): string {
  const parts: string[] = [];

  if (subject) {
    parts.push(`subject=${encodeURIComponent(subject)}`);
  }

  if (body) {
    parts.push(`body=${encodeURIComponent(body)}`);
  }

  return parts.length ? `mailto:${to}?${parts.join("&")}` : `mailto:${to}`;
}

export function buildOutlookCompose({ to, subject, body }: EmailDraft): string {
  const parts: string[] = [`to=${encodeURIComponent(to)}`];

  if (subject) {
    parts.push(`subject=${encodeURIComponent(subject)}`);
  }

  if (body) {
    parts.push(`body=${encodeURIComponent(body)}`);
  }

  return `https://outlook.office.com/mail/deeplink/compose?${parts.join("&")}`;
}

export function isTouchDevice(): boolean {
  return (
    typeof window !== "undefined" &&
    (navigator.maxTouchPoints > 0 ||
      window.matchMedia?.("(pointer: coarse)").matches)
  );
}

export function getEmailHref(draft: EmailDraft): string {
  return isTouchDevice() ? buildOutlookCompose(draft) : buildMailto(draft);
}

export function openExternal(url: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
