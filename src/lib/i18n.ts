export const locales = ["sv", "en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = locales[0];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function assertLocale(value: string): asserts value is Locale {
  if (!isLocale(value)) {
    throw new Error(`Unsupported locale: ${value}`);
  }
}
