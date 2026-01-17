"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { assertLocale, defaultLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  const params = useParams<{ locale?: string | string[] }>();
  const rawLocale = params?.locale;
  const locale = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale ?? defaultLocale;

  assertLocale(locale);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">
        Page not found
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">
            The page you are looking for does not exist.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/${locale}`}>Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
