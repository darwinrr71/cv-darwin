"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { getEmailHref, openExternal, type EmailDraft } from "@/lib/email";

type EmailActionButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  label: string;
  draft: EmailDraft;
};

export const EmailActionButton = React.forwardRef<
  HTMLButtonElement,
  EmailActionButtonProps
>(function EmailActionButton(
  { label, draft, onClick, type, ...props },
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
      {label}
    </Button>
  );
});

EmailActionButton.displayName = "EmailActionButton";
