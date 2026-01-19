import { getSite, getUi } from "@/lib/content";
import { ContactActions } from "@/components/contact/ContactActions";
import { NavbarClient } from "@/components/layout/NavbarClient";

type NavbarProps = {
  locale: string;
};

type UiContent = {
  nav: {
    home: string;
    homeTooltip?: string;
    projects: string;
    about: string;
    contact: string;
  };
  actions?: {
    themeA?: string;
    themeB?: string;
  };
};

type SiteContent = {
  siteName?: string;
};

export async function Navbar({ locale }: NavbarProps) {
  const ui = (await getUi(locale)) as UiContent;
  const site = (await getSite()) as SiteContent;

  return (
    <NavbarClient
      locale={locale}
      ui={ui}
      site={site}
      desktopContactActions={<ContactActions locale={locale} compact navStyle />}
      mobileContactActions={
        <ContactActions
          locale={locale}
          actionsClassName="flex-col items-stretch"
          buttonClassName="drawer-btn w-full justify-start"
          closeOnAction
        />
      }
    />
  );
}
