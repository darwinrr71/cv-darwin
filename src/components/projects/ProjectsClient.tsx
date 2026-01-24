"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PageReveal,
  Reveal,
} from "@/components/motion/Reveal";

type ProjectSummary = {
  slug: string;
  title: string;
  oneLinerImpact?: string;
  description?: string;
  tags?: string[];
  stack?: string[];
  links?: {
    repo?: string;
    demo?: string;
  };
};

type UiContent = {
  projects?: {
    title?: string;
    searchPlaceholder?: string;
    viewCaseStudy?: string;
    repo?: string;
    liveDemo?: string;
  };
};

type ProjectsClientProps = {
  locale: string;
  projects: unknown[];
  ui: Record<string, unknown>;
};

function matchesQuery(project: ProjectSummary, query: string) {
  if (!query) return true;
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    project.title,
    project.oneLinerImpact,
    project.description,
    ...(project.tags ?? []),
    ...(project.stack ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function ProjectsClient({ locale, projects, ui }: ProjectsClientProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const projectList = projects as ProjectSummary[];
  const uiContent = ui as UiContent;

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    projectList.forEach((project) => {
      (project.tags ?? []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [projectList]);

  const filteredProjects = useMemo(() => {
    return projectList.filter((project) => {
      const matchesTag = selectedTag
        ? project.tags?.includes(selectedTag)
        : true;
      return matchesTag && matchesQuery(project, query);
    });
  }, [projectList, query, selectedTag]);

  return (
    <PageReveal>
      <section className="space-y-8">
        <Reveal>
          <h1 className="text-3xl font-semibold text-foreground">
            {uiContent.projects?.title ?? "Projects"}
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <div
            className="flex flex-col gap-4
         md:flex-row md:items-center"
          >
            <div className="w-full md:max-w-md">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  uiContent.projects?.searchPlaceholder ?? "Search projects"
                }
                aria-label={
                  uiContent.projects?.searchPlaceholder ?? "Search projects"
                }
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge asChild variant={selectedTag ? "outline" : "default"}>
                <button type="button" onClick={() => setSelectedTag(null)}>
                  All
                </button>
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  asChild
                  variant={selectedTag === tag ? "default" : "outline"}
                >
                  <button type="button" onClick={() => setSelectedTag(tag)}>
                    {tag}
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <Reveal key={project.slug} className="h-full" delay={0.04}>
              <Card className="h-full ring-1 ring-primary/40 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {project.oneLinerImpact ?? project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {(project.tags ?? []).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {project.stack?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 mt-auto">
                  <Button
                    asChild
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-accent"
                  >
                    <Link href={`/${locale}/projects/${project.slug}`}>
                      {uiContent.projects?.viewCaseStudy ?? "View case"}
                    </Link>
                  </Button>
                  {project.links?.repo ? (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={project.links.repo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {uiContent.projects?.repo ?? "Repo"}
                      </a>
                    </Button>
                  ) : null}
                  {project.links?.demo ? (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={project.links.demo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {uiContent.projects?.liveDemo ?? "Demo"}
                      </a>
                    </Button>
                  ) : null}
                </CardFooter>
              </Card>
            </Reveal>
          ))}
        </div>

        {filteredProjects.length === 0 ? (
          <Reveal>
            <p className="text-sm text-muted-foreground">
              No projects match the current filters.
            </p>
          </Reveal>
        ) : null}
      </section>
    </PageReveal>
  );
}
