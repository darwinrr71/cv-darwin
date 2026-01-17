import { readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { createElement } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";

import { assertLocale } from "@/lib/i18n";

const mdxCache = new Map<
  string,
  { frontmatter: Record<string, unknown>; content: ReactNode }
>();

function mergeClassName(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

const mdxComponents: MDXComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) =>
    createElement("h2", {
      ...props,
      className: mergeClassName(
        "mt-10 text-2xl font-semibold text-foreground",
        props.className
      ),
    }),
  h3: (props: ComponentPropsWithoutRef<"h3">) =>
    createElement("h3", {
      ...props,
      className: mergeClassName(
        "mt-8 text-xl font-semibold text-foreground",
        props.className
      ),
    }),
  p: (props: ComponentPropsWithoutRef<"p">) =>
    createElement("p", {
      ...props,
      className: mergeClassName(
        "mt-4 text-base leading-7 text-muted-foreground",
        props.className
      ),
    }),
  ul: (props: ComponentPropsWithoutRef<"ul">) =>
    createElement("ul", {
      ...props,
      className: mergeClassName(
        "mt-4 list-disc space-y-2 pl-6 text-muted-foreground",
        props.className
      ),
    }),
  li: (props: ComponentPropsWithoutRef<"li">) =>
    createElement("li", {
      ...props,
      className: mergeClassName("leading-7", props.className),
    }),
  a: (props: ComponentPropsWithoutRef<"a">) =>
    createElement("a", {
      ...props,
      className: mergeClassName(
        "text-primary underline-offset-4 hover:underline",
        props.className
      ),
    }),
  code: (props: ComponentPropsWithoutRef<"code">) =>
    createElement("code", {
      ...props,
      className: mergeClassName(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground",
        props.className
      ),
    }),
};

export async function getProjectMdx(locale: string, slug: string) {
  assertLocale(locale);

  const cacheKey = `${locale}/${slug}`;
  if (mdxCache.has(cacheKey)) {
    return mdxCache.get(cacheKey)!;
  }

  const relativePath = path.join(
    "content",
    "locales",
    locale,
    "projects-mdx",
    `${slug}.mdx`
  );
  const absolutePath = path.join(process.cwd(), relativePath);

  try {
    const file = await readFile(absolutePath, "utf8");
    const { data, content } = matter(file);
    const rendered = await MDXRemote({ source: content, components: mdxComponents });
    const result = {
      frontmatter: data as Record<string, unknown>,
      content: rendered,
    };

    mdxCache.set(cacheKey, result);
    return result;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      throw new Error(`Missing MDX file: ${relativePath}`);
    }

    throw error;
  }
}
