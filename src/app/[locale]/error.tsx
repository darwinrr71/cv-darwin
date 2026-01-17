"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { assertLocale, defaultLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  const params = useParams<{ locale?: string | string[] }>();
  const rawLocale = params?.locale;
  const locale = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale ?? defaultLocale;

  assertLocale(locale);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">
            Please try again or return to the home page.
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          <Button asChild variant="outline">
            <Link href={`/${locale}`}>Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
