import { assertLocale } from "@/lib/i18n";
import { getPages, getUi } from "@/lib/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EducationSchools from "@/components/about/EducationSchools";
import { PageReveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

type PageProps = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function AboutPage({ params }: PageProps) {
  const p = await Promise.resolve(params);
  assertLocale(p.locale);

  const pages = (await getPages(p.locale)) as {
    about?: {
      title?: string;
      intro?: string;
      paragraphs?: string[];
      educationTitle?: string;
      educationLabel?: string;
      educationCards?: {
        id: "foretagsuniversitetet" | "agstu" | "idat";
        title: string;
        institutionName: string;
        institutionLocation?: string;
        years: string;
        competencies: string[];
      }[];
    };
  };
  const ui = (await getUi(p.locale)) as { nav?: { about?: string } };
  const title = pages.about?.title ?? ui.nav?.about ?? "About";
  const educationTitle = pages.about?.educationTitle ?? "Education";
  const educationLabel = pages.about?.educationLabel ?? "Competencies:";
  const educationCards = pages.about?.educationCards ?? [];

  return (
    <PageReveal>
      <section className="space-y-6">
        <Stagger className="space-y-6">
          <StaggerItem>
            <h1 className="text-3xl font-semibold text-foreground">
              {title}
            </h1>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-foreground">
                  {pages.about?.intro ?? ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
                {(pages.about?.paragraphs ?? []).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <div className="pt-2 text-foreground">
                  <EducationSchools
                    title={educationTitle}
                    label={educationLabel}
                    cards={educationCards}
                  />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </Stagger>
      </section>
    </PageReveal>
  );
}
