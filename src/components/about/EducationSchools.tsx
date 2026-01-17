import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const schoolAssets = {
  foretagsuniversitetet: {
    href: "https://www.foretagsuniversitetet.se/",
    icon: "/icons/foretagsuniversitetet.png",
  },
  agstu: {
    href: "https://yh.agstu.se/",
    icon: "/icons/agstu.png",
  },
  idat: {
    href: "https://www.idat.edu.pe/",
    icon: "/icons/idat.png",
  },
} as const;

type EducationCard = {
  id: keyof typeof schoolAssets;
  title: string;
  institutionName: string;
  institutionLocation?: string;
  years: string;
  competencies: string[];
};

type EducationSchoolsProps = {
  title: string;
  label: string;
  cards: EducationCard[];
};

export default function EducationSchools({
  title,
  label,
  cards,
}: EducationSchoolsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="flex w-full flex-col gap-4">
        {cards.map((card) => {
          const assets = schoolAssets[card.id];
          const competencies = card.competencies.join(" • ");
          return (
            <Card key={card.id} className="w-full">
              <CardContent className="flex w-full flex-col items-center gap-4 p-6 md:flex-row md:items-start md:gap-6">
                <div className="flex shrink-0 items-center justify-center">
                  <Image
                    src={assets.icon}
                    alt={card.institutionName}
                    width={56}
                    height={56}
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div className="flex w-full min-w-0 max-w-full flex-1 flex-col gap-2 text-center md:text-left">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">
                      <span className="block md:inline">
                        <a
                          href={assets.href}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {card.institutionName}
                        </a>
                      </span>
                      {card.institutionLocation ? (
                        <>
                          <span className="hidden md:inline">
                            {` - ${card.institutionLocation}`}
                          </span>
                          <span className="block md:hidden">
                            {card.institutionLocation}
                          </span>
                        </>
                      ) : null}
                      <span className="hidden md:inline">{` (${card.years})`}</span>
                      <span className="block md:hidden">{`(${card.years})`}</span>
                    </p>
                  </div>
                  <div className="space-y-1 pt-2">
                    <p className="text-sm font-semibold text-foreground">
                      {label}
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-normal break-words [overflow-wrap:anywhere]">
                      {competencies}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
