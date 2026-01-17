import Link from "next/link";
import { Download } from "lucide-react";

import { assertLocale } from "@/lib/i18n";
import { getProfile, getProjects, getUi } from "@/lib/content";
import { ContactActions } from "@/components/contact/ContactActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = {
  params: { locale: string } | Promise<{ locale: string }>;
};

type ProfileContent = {
  name: string;
  role: string;
  location: string;
  headline: string;
  summary: string;
  highlights: Array<{ title: string; text: string }>;
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    start?: string;
    end?: string;
  }>;
  skills: Record<string, string[]>;
  cta?: {
    primary?: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
};

type ProjectSummary = {
  slug: string;
  title: string;
  featured?: boolean;
  oneLinerImpact?: string;
  description?: string;
  tags?: string[];
  stack?: string[];
  links?: { repo?: string; demo?: string };
};

type UiContent = {
  sections: {
    highlights: string;
    experience: string;
    featuredProjects: string;
    skills: string;
  };
  actions: {
    viewProjects: string;
    downloadCv: string;
  };
  projects?: {
    viewCaseStudy?: string;
    repo?: string;
    liveDemo?: string;
  };
};
export default async function HomePage({ params }: PageProps) {
  const p = await Promise.resolve(params);
  assertLocale(p.locale);

  const [profile, projects, ui] = await Promise.all([
    getProfile(p.locale),
    getProjects(p.locale),
    getUi(p.locale),
  ]);

  const profileContent = profile as ProfileContent;
  const projectsContent = projects as ProjectSummary[];
  const uiContent = ui as UiContent;
  const featuredProjects = projectsContent.filter((project) => project.featured);
  const skills = Object.values(profileContent.skills ?? {}).flat();
  const secondaryCta = profileContent.cta?.secondary;

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-wide text-primary/80">
          Recruiter mode
        </p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground">
            {profileContent.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {profileContent.role}
          </p>
          <p className="text-sm text-muted-foreground">
            {profileContent.location}
          </p>
        </div>
        <div className="space-y-3 text-base leading-7 text-muted-foreground">
          <p>{profileContent.headline}</p>
          <p>{profileContent.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href={`/${p.locale}/projects`}>
              {profileContent.cta?.primary?.label ?? uiContent.actions.viewProjects}
            </Link>
          </Button>
          {secondaryCta?.href ? (
            <Button asChild variant="outline">
              <a
                href={secondaryCta.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {secondaryCta.label ?? uiContent.actions.downloadCv}
              </a>
            </Button>
          ) : null}
          <ContactActions locale={p.locale} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {uiContent.sections.highlights}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {profileContent.highlights?.slice(0, 3).map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {item.text}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {uiContent.sections.experience}
        </h2>
        <div className="space-y-3">
          {profileContent.experience?.map((role) => (
            <div
              key={`${role.company}-${role.title}`}
              className="flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground shadow-[0_1px_2px_rgba(0,0,0,0.10)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">
                  {role.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {role.start} - {role.end}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {role.company}
                {role.location ? ` • ${role.location}` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            {uiContent.sections.featuredProjects}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${p.locale}/projects`}>
              {uiContent.actions.viewProjects}
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredProjects.map((project) => (
            <Card key={project.slug} className="ring-1 ring-primary/40">
              <CardHeader>
                <CardTitle className="text-base">{project.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {project.oneLinerImpact ?? project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                  {(project.tags ?? []).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-accent"
                >
                  <Link href={`/${p.locale}/projects/${project.slug}`}>
                    {uiContent.projects?.viewCaseStudy ?? "View case"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {uiContent.sections.skills}
        </h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
