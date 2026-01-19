"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { getEmailHref, openExternal, type EmailDraft } from "@/lib/email";

type EmailActionButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  label: string;
  draft: EmailDraft;
  icon?: React.ReactNode;
  labelClassName?: string;
  showHoverDecoration?: boolean;
  underlineClassName?: string;
};

export const EmailActionButton = React.forwardRef<
  HTMLButtonElement,
  EmailActionButtonProps
>(function EmailActionButton(
  {
    label,
    draft,
    onClick,
    type,
    icon,
    labelClassName,
    showHoverDecoration,
    underlineClassName,
    ...props
  },
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
          <span className={labelClassName}>{label}</span>
        </span>
      ) : (
        <span className={labelClassName}>{label}</span>
      )}
      {showHoverDecoration ? (
        <span
          className={
            underlineClassName ??
            "pointer-events-none absolute left-0 right-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-current/70 to-current transition-[transform,opacity] duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70"
          }
        />
      ) : null}
    </Button>
  );
});

EmailActionButton.displayName = "EmailActionButton";
