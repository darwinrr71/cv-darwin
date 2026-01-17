import { readFile } from "fs/promises";
import path from "path";

import { assertLocale } from "@/lib/i18n";

const jsonCache = new Map<string, unknown>();

async function readJson<T>(relativePath: string): Promise<T> {
  if (jsonCache.has(relativePath)) {
    return jsonCache.get(relativePath) as T;
  }

  const absolutePath = path.join(process.cwd(), relativePath);

  try {
    const file = await readFile(absolutePath, "utf8");
    const parsed = JSON.parse(file) as T;
    jsonCache.set(relativePath, parsed);
    return parsed;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      throw new Error(`Missing content file: ${relativePath}`);
    }

    throw error;
  }
}

export async function getSite() {
  return readJson<unknown>("content/site.json");
}

export async function getProfile(locale: string) {
  assertLocale(locale);
  return readJson<unknown>(`content/locales/${locale}/profile.json`);
}

export async function getProjects(locale: string) {
  assertLocale(locale);
  return readJson<unknown>(`content/locales/${locale}/projects.json`);
}

export async function getUi(locale: string) {
  assertLocale(locale);
  return readJson<unknown>(`content/locales/${locale}/ui.json`);
}

export async function getPages(locale: string) {
  assertLocale(locale);
  return readJson<unknown>(`content/locales/${locale}/pages.json`);
}
