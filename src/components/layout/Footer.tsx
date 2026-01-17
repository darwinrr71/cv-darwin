import { getUi } from "@/lib/content";
import { ContactActions } from "@/components/contact/ContactActions";

type FooterProps = {
  locale: string;
};

type UiContent = {
  contact?: {
    title?: string;
    subtitle?: string;
  };
};

export async function Footer({ locale }: FooterProps) {
  const ui = (await getUi(locale)) as UiContent;

  return (
    <footer className="site-footer contact-footer mt-auto min-h-[140px] border-t border-border/60 bg-[hsl(var(--footer))]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {ui.contact?.title ?? "Contact"}
          </p>
          {ui.contact?.subtitle ? (
            <p className="text-sm text-muted-foreground">{ui.contact.subtitle}</p>
          ) : null}
        </div>
        <ContactActions
          locale={locale}
          actionsClassName="contact-footer-actions"
          buttonClassName="contact-footer-btn [&>span>span:last-child]:sr-only"
          useNavAction={false}
          iconOnly
        />
      </div>
    </footer>
  );
}

