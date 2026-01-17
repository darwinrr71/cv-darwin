import enUi from "../../content/locales/en/ui.json";
import esUi from "../../content/locales/es/ui.json";
import svUi from "../../content/locales/sv/ui.json";
import enPages from "../../content/locales/en/pages.json";
import esPages from "../../content/locales/es/pages.json";
import svPages from "../../content/locales/sv/pages.json";

const contactTitles = {
  en: enUi.contact?.title ?? enPages.contact?.title,
  es: esUi.contact?.title ?? esPages.contact?.title,
  sv: svUi.contact?.title ?? svPages.contact?.title,
};

const subjectFallback = {
  en: "Contact",
  es: "Contacto",
  sv: "Kontakt",
};

const greetingByLocale = {
  en: "Hi Darwin,",
  es: "Hola Darwin,",
  sv: "Hej Darwin,",
};

function normalizeLocale(locale: string) {
  const base = locale.split("-")[0];
  return base in subjectFallback ? base : "en";
}

export function getMailtoHref(email: string, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const contactTitle =
    contactTitles[normalizedLocale as keyof typeof contactTitles] ??
    subjectFallback[normalizedLocale as keyof typeof subjectFallback];
  const subject = `${contactTitle} — Darwin Rengifo CV`;
  const greeting =
    greetingByLocale[normalizedLocale as keyof typeof greetingByLocale];
  const body = `${greeting}\n\n— <Your name>`;
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
}
