import Link from "next/link";
import { notFound } from "next/navigation";

import { assertLocale } from "@/lib/i18n";
import { getProjects } from "@/lib/content";
import { getProjectMdx } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type PageProps = {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string };
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const p = await Promise.resolve(params);
  assertLocale(p.locale);

  const projects = (await getProjects(p.locale)) as Array<{
    slug: string;
    title: string;
    oneLinerImpact?: string;
    description?: string;
    tags?: string[];
    stack?: string[];
    links?: { repo?: string; demo?: string };
  }>;

  const project = projects.find((item) => item.slug === p.slug);

  if (!project) {
    notFound();
  }

  let mdxContent: Awaited<ReturnType<typeof getProjectMdx>> | null = null;
  try {
    mdxContent = await getProjectMdx(p.locale, p.slug);
  } catch {
    notFound();
  }

  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/${p.locale}/projects`}
            className="hover:text-foreground hover:underline"
          >
            Projects
          </Link>
          <span aria-hidden="true">/</span>
          <span>{project.title}</span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground">
          {project.title}
        </h1>
        <p className="text-base text-muted-foreground">
          {project.oneLinerImpact ?? project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {(project.tags ?? []).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {(project.stack ?? []).map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {project.links?.repo ? (
            <Button asChild variant="outline" size="sm">
              <a href={project.links.repo} target="_blank" rel="noreferrer">
                Repo
              </a>
            </Button>
          ) : null}
          {project.links?.demo ? (
            <Button asChild variant="outline" size="sm">
              <a href={project.links.demo} target="_blank" rel="noreferrer">
                Live demo
              </a>
            </Button>
          ) : null}
        </div>
      </header>

      <Separator />

      <section className="space-y-6">
        {mdxContent?.content}
      </section>
    </article>
  );
}
