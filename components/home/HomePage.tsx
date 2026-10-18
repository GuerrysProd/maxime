import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { getFaq, getHome, getObjects, getProjects, getServices, getSite, getUi, projectHref, projectsCount } from "@/lib/content";
import { CtaSection } from "./CtaSection";
import { Faq } from "./Faq";
import { HeroB } from "./HeroB";
import { HeroBIntro } from "./HeroBIntro";
import { HERO_TITLE_ID, HeroOrigin } from "./HeroOrigin";
import { Manifesto } from "./Manifesto";
import { Method } from "./Method";
import { ObjectsTeaser } from "./ObjectsTeaser";
import { Parcours } from "./Parcours";
import { SelectedProjects } from "./SelectedProjects";
import { ServicesList } from "./ServicesList";
import { Territories } from "./Territories";

/**
 * Page d’accueil unique pour / (hero d’origine) et /2 (hero B) — brief §3.
 * La variante A (écran 04A) se branchera ici sans toucher au reste de la page.
 */
export type HeroVariant = "origin" | "B";

export function HomePage({ heroVariant = "origin" }: { heroVariant?: HeroVariant }) {
  const site = getSite();
  const home = getHome();
  const ui = getUi();
  const { items: projects, inPreparation } = getProjects();
  const pieces = getObjects();
  const services = getServices();
  const faq = getFaq().filter((item) => item.home);
  const countLabel = projectsCount(projects.length);

  return (
    <>
      <SiteHeader variant={heroVariant === "B" ? "split" : "overlay"} />
      <main id={MAIN_ID}>
        {heroVariant === "B" ? (
          <HeroB
            titleId={HERO_TITLE_ID}
            intro={<HeroBIntro site={site} hero={home.hero} titleId={HERO_TITLE_ID} />}
            indexTitle={home.hero.indexTitle}
            countLabel={countLabel}
            captionPrefix={home.hero.imageCaption}
            items={projects.map((project) => ({
              slug: project.slug,
              number: project.number,
              name: project.name,
              place: project.place,
              placeShort: project.placeShort ?? project.place,
              href: projectHref(project.slug),
              image: project.cover,
            }))}
          />
        ) : (
          <HeroOrigin
            site={site}
            hero={home.hero}
            countLabel={countLabel}
            index={projects.map((project) => ({
              slug: project.slug,
              number: project.number,
              name: project.name,
              place: project.place,
              href: projectHref(project.slug),
              preview: project.hero,
            }))}
          />
        )}
        <Manifesto site={site} home={home.manifesto} />
        <SelectedProjects home={home.projects} projects={projects} inPreparation={inPreparation} />
        <ObjectsTeaser home={home.objects} pieces={pieces} projects={projects} />
        <ServicesList home={home.services} offers={services.offers} />
        <Method home={home.method} steps={services.method} />
        <Parcours label={home.parcours.label} items={site.parcours} />
        <Territories home={home.territories} territories={site.territories} />
        <Faq home={home.faq} items={faq} />
        <CtaSection home={home.cta} site={site} ui={ui} />
      </main>
    </>
  );
}
