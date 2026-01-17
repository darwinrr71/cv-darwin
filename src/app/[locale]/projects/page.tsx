import { assertLocale } from "@/lib/i18n";
import { getProjects, getUi } from "@/lib/content";
import { ProjectsClient } from "@/components/projects/ProjectsClient";

type PageProps = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function ProjectsPage({ params }: PageProps) {
  const p = await Promise.resolve(params);
  assertLocale(p.locale);

  return (
    <ProjectsClient
      locale={p.locale}
      projects={(await getProjects(p.locale)) as unknown[]}
      ui={(await getUi(p.locale)) as Record<string, unknown>}
    />
  );
}
