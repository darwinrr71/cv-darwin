"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ContactFormStrings = {
  fields: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
  submit: string;
  helper: string;
  success: string;
  error: string;
  rateLimited: string;
  validation: {
    required: string;
    invalidEmail: string;
    maxLength: string;
  };
  defaultSubject: string;
};

type ContactFormStringsInput = Partial<
  Omit<ContactFormStrings, "fields" | "validation">
> & {
  fields?: Partial<ContactFormStrings["fields"]>;
  validation?: Partial<ContactFormStrings["validation"]>;
};

type ContactFormProps = {
  strings?: ContactFormStringsInput;
};

const defaultStrings: ContactFormStrings = {
  fields: {
    name: "Full Name",
    email: "Email",
    subject: "Subject / Reason for Contact",
    message: "Message",
  },
  submit: "Send Message",
  helper: "I respond within 24 hours",
  success: "Thank you! We received your message and will reply soon.",
  error: "Something went wrong. Please try again.",
  rateLimited: "Too many messages. Please try again later.",
  validation: {
    required: "This field is required.",
    invalidEmail: "Enter a valid email address.",
    maxLength: "Too long. Please shorten your message.",
  },
  defaultSubject: "Contact form message",
};

const MAX_LENGTHS = {
  name: 80,
  email: 120,
  subject: 120,
  message: 2000,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mergeStrings(
  overrides?: ContactFormStringsInput,
): ContactFormStrings {
  return {
    ...defaultStrings,
    ...overrides,
    fields: {
      ...defaultStrings.fields,
      ...overrides?.fields,
    },
    validation: {
      ...defaultStrings.validation,
      ...overrides?.validation,
    },
  };
}

export function ContactForm({ strings }: ContactFormProps) {
  const s = React.useMemo(() => mergeStrings(strings), [strings]);
  const [values, setValues] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "",
  });
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange =
    (field: keyof typeof values) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const validate = () => {
    const errors: Record<string, string> = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const subject = values.subject.trim();
    const message = values.message.trim();

    if (!name) {
      errors.name = s.validation.required;
    } else if (name.length > MAX_LENGTHS.name) {
      errors.name = s.validation.maxLength;
    }

    if (!email) {
      errors.email = s.validation.required;
    } else if (email.length > MAX_LENGTHS.email) {
      errors.email = s.validation.maxLength;
    } else if (!emailRegex.test(email)) {
      errors.email = s.validation.invalidEmail;
    }

    if (subject && subject.length > MAX_LENGTHS.subject) {
      errors.subject = s.validation.maxLength;
    }

    if (!message) {
      errors.message = s.validation.required;
    } else if (message.length > MAX_LENGTHS.message) {
      errors.message = s.validation.maxLength;
    }

    return errors;
  };

  const mapServerErrors = (errors: Record<string, string>) => {
    const mapped: Record<string, string> = {};
    const codeMap: Record<string, string> = {
      required: s.validation.required,
      invalid_email: s.validation.invalidEmail,
      max_length: s.validation.maxLength,
    };

    Object.entries(errors).forEach(([field, code]) => {
      mapped[field] = codeMap[code] ?? s.error;
    });

    return mapped;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
          honeypot: values.company.trim(),
          defaultSubject: s.defaultSubject,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        fieldErrors?: Record<string, string>;
      };

      if (response.ok) {
        setSuccessMessage(s.success);
        setValues({
          name: "",
          email: "",
          subject: "",
          message: "",
          company: "",
        });
      } else if (response.status === 400 && data.fieldErrors) {
        setFieldErrors(mapServerErrors(data.fieldErrors));
      } else if (response.status === 429) {
        setFormError(s.rateLimited);
      } else {
        setFormError(s.error);
      }
    } catch {
      setFormError(s.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const textareaClassName =
    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border w-full min-w-0 rounded-md border bg-background px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-[140px]";

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="contact-name"
            className="text-sm font-medium text-foreground"
          >
            {s.fields.name}
          </label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            maxLength={MAX_LENGTHS.name}
            value={values.name}
            onChange={handleChange("name")}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
          />
          {fieldErrors.name ? (
            <p
              id="contact-name-error"
              className="text-xs text-destructive"
              role="alert"
            >
              {fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="contact-email"
            className="text-sm font-medium text-foreground"
          >
            {s.fields.email}
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={MAX_LENGTHS.email}
            value={values.email}
            onChange={handleChange("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "contact-email-error" : undefined
            }
          />
          {fieldErrors.email ? (
            <p
              id="contact-email-error"
              className="text-xs text-destructive"
              role="alert"
            >
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="contact-subject"
            className="text-sm font-medium text-foreground"
          >
            {s.fields.subject}
          </label>
          <Input
            id="contact-subject"
            name="subject"
            maxLength={MAX_LENGTHS.subject}
            value={values.subject}
            onChange={handleChange("subject")}
            aria-invalid={Boolean(fieldErrors.subject)}
            aria-describedby={
              fieldErrors.subject ? "contact-subject-error" : undefined
            }
          />
          {fieldErrors.subject ? (
            <p
              id="contact-subject-error"
              className="text-xs text-destructive"
              role="alert"
            >
              {fieldErrors.subject}
            </p>
          ) : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="contact-message"
            className="text-sm font-medium text-foreground"
          >
            {s.fields.message}
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            maxLength={MAX_LENGTHS.message}
            value={values.message}
            onChange={handleChange("message")}
            className={textareaClassName}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={
              fieldErrors.message ? "contact-message-error" : undefined
            }
          />
          {fieldErrors.message ? (
            <p
              id="contact-message-error"
              className="text-xs text-destructive"
              role="alert"
            >
              {fieldErrors.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={handleChange("company")}
        />
      </div>

      <div className="space-y-2">
        <Button type="submit" disabled={isSubmitting}>
          {s.submit}
        </Button>
        <p className="text-xs text-muted-foreground">{s.helper}</p>
        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
        {successMessage ? (
          <p className="text-sm text-foreground" role="status">
            {successMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
