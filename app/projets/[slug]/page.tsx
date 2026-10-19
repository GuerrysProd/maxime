import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GasquiPage } from "@/components/gasqui/GasquiPage";
import { ProjectPage } from "@/components/project/ProjectPage";
import { getProjectDetail, getProjectModules, getProjects, projectDetailSlugs } from "@/lib/content";

/** Une page par projet qui a une fiche : gabarit « chapitres », ou « modules » pour Château Gasqui. */
/**
 * Toutes les fiches sont prérendues (generateStaticParams) : la validation « navigation
 * instantanée » du mode développement, qui signale la lecture de params, ne s’applique pas.
 */
export const instant = false;

export function generateStaticParams() {
  return projectDetailSlugs().map((slug) => ({ slug }));
}

function resolve(slug: string) {
  const { items } = getProjects();
  const project = items.find((item) => item.slug === slug);
  const detail = getProjectDetail(slug);
  const modules = getProjectModules(slug);
  if (!project || (!detail && !modules)) return undefined;
  // Projet suivant : le prochain qui a une fiche, en boucle.
  const withPages = items.filter((item) => projectDetailSlugs().includes(item.slug));
  const next = withPages[(withPages.indexOf(project) + 1) % withPages.length];
  return { project, detail, modules, total: items.length, next: next === project ? undefined : next };
}

export async function generateMetadata({ params }: PageProps<"/projets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = resolve(slug);
  if (!page) return {};
  const { project } = page;
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/projets/${project.slug}` },
    openGraph: {
      title: project.name,
      description: project.summary,
      images: [{ url: project.hero.src, width: project.hero.width, height: project.hero.height, alt: project.hero.alt }],
    },
  };
}

export default async function ProjectRoute({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const page = resolve(slug);
  if (!page) notFound();
  const { detail, modules, ...rest } = page;
  if (modules) return <GasquiPage {...rest} content={modules} />;
  return detail ? <ProjectPage {...rest} detail={detail} /> : notFound();
}
