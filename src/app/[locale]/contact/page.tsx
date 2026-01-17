import { assertLocale } from "@/lib/i18n";
import { getPages, getUi } from "@/lib/content";
import { ContactForm } from "@/components/contact/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function ContactPage({ params }: PageProps) {
  const p = await Promise.resolve(params);
  assertLocale(p.locale);

  const pages = (await getPages(p.locale)) as {
    contact?: { title?: string; intro?: string };
  };
  const ui = (await getUi(p.locale)) as {
    contact?: {
      title?: string;
      subtitle?: string;
      form?: {
        fields?: {
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
        };
        submit?: string;
        helper?: string;
        success?: string;
        error?: string;
        rateLimited?: string;
        defaultSubject?: string;
        validation?: {
          required?: string;
          invalidEmail?: string;
          maxLength?: string;
        };
      };
    };
  };

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">
        {pages.contact?.title ?? ui.contact?.title ?? "Contact"}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">
            {pages.contact?.intro ?? ui.contact?.subtitle ?? ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm strings={ui.contact?.form} />
        </CardContent>
      </Card>
    </section>
  );
}
