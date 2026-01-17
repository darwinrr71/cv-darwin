"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { getEmailHref, openExternal, type EmailDraft } from "@/lib/email";

type EmailActionButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  label: string;
  draft: EmailDraft;
  icon?: React.ReactNode;
};

export const EmailActionButton = React.forwardRef<
  HTMLButtonElement,
  EmailActionButtonProps
>(function EmailActionButton(
  { label, draft, onClick, type, icon, ...props },
  ref,
) {
  const handleClick = React.useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    (event) => {
      openExternal(getEmailHref(draft));
      onClick?.(event);
    },
    [draft, onClick],
  );

  return (
    <Button
      ref={ref}
      type={type ?? "button"}
      onClick={handleClick}
      aria-label={props["aria-label"] ?? label}
      {...props}
    >
      {icon ? (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="flex items-center">
            {icon}
          </span>
          <span>{label}</span>
        </span>
      ) : (
        label
      )}
    </Button>
  );
});

EmailActionButton.displayName = "EmailActionButton";
