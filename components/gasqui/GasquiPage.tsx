import type { ReactNode } from "react";
import { CtaCompact } from "@/components/home/CtaCompact";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { Picture } from "@/components/media/Picture";
import { NextProject, ProjectIntro } from "@/components/project/ProjectShell";
import { DraftText } from "@/components/ui/DraftText";
import { Icon } from "@/components/ui/Icon";
import type { Project, ProjectModules } from "@/lib/content";
import { CountUp } from "./CountUp";
import { DayNight } from "./DayNight";
import { Gardens } from "./Gardens";
import { Herbarium } from "./Herbarium";
import { LayerPlan } from "./LayerPlan";
import { MirrorDiagram } from "./MirrorDiagram";
import { Season } from "./Season";
import styles from "./GasquiPage.module.css";

const NBSP = " ";

/** En-tête de module : surtitre et titre à gauche, texte (ou commandes) à droite. */
function ModuleHeader({ id, label, title, children }: { id: string; label: string; title: string; children?: ReactNode }) {
  return (
    <div className={styles.moduleHeader} data-reveal="">
      <div className={styles.moduleTitleBlock}>
        <p className="meta muted">{label}</p>
        <h2 id={id} className={`serif ${styles.moduleTitle}`}>
          {title}
        </h2>
      </div>
      {children && <div className={styles.moduleAside}>{children}</div>}
    </div>
  );
}

/** Fiche Château Gasqui, gabarit « modules » (aperçu 10, brief §6, SOURCES §4). */
export function GasquiPage({
  project,
  content,
  total,
  next,
}: {
  project: Project;
  content: ProjectModules;
  total: number;
  next?: Project;
}) {
  const { plan, gardens, stats, dayNight, season, mirrors, materials, herbarium } = content;

  return (
    <>
      <SiteHeader variant="solid" current="projets" />
      <main id={MAIN_ID} className={styles.main}>
        <ProjectIntro project={project} total={total} lead={content.lead} intro={content.intro} specs={content.specs}>
          <p className={styles.credit}>{content.credit}</p>
        </ProjectIntro>

        {/* 01 — Plan en calques */}
        <section className={`${styles.module} ${styles.stone}`} aria-labelledby="plan-titre">
          <div className="wrap">
            <ModuleHeader id="plan-titre" label={plan.label} title={plan.title}>
              <p className={styles.moduleText}>{plan.text}</p>
            </ModuleHeader>
            <LayerPlan
              plan={plan}
              steps={plan.steps.map((step) => ({ title: <DraftText value={step.title} />, text: <DraftText value={step.text} /> }))}
            />
            <a className={styles.pdf} href={plan.pdf.href} target="_blank" rel="noopener">
              <span className={styles.pdfPreview}>
                <Picture image={plan.pdf.preview} sizes="(max-width: 900px) 100vw, 25vw" />
              </span>
              <span className={styles.pdfText}>
                <span className={`serif ${styles.pdfTitle}`}>{plan.pdf.title}</span>
                <span className={styles.pdfLabel}>
                  {plan.pdf.label}
                  <Icon name="arrow-up-right" size={14} />
                </span>
                <span className="meta muted">{plan.pdf.meta}</span>
              </span>
            </a>
          </div>
        </section>

        {/* 02 — Quatre jardins */}
        <section className={styles.module} aria-labelledby="jardins-titre">
          <div className="wrap">
            <ModuleHeader id="jardins-titre" label={gardens.label} title={gardens.title} />
            <Gardens gardens={gardens} paletteHref="#herbier" />
          </div>
        </section>

        {/* Le projet en chiffres */}
        <section className={`${styles.stats} ${styles.stone}`} aria-labelledby="chiffres-titre">
          <div className={`wrap ${styles.statsGrid}`}>
            <div className={styles.statsHead} data-reveal="">
              <p className="meta muted">{stats.label}</p>
              <h2 id="chiffres-titre" className={`serif ${styles.statsTitle}`}>
                {stats.title}
              </h2>
            </div>
            <dl className={styles.statsList}>
              {stats.items.map((item) => (
                <div key={item.label} className={styles.stat} data-reveal="">
                  <dt className={styles.statLabel}>{item.label}</dt>
                  <dd className={`serif ${styles.statValue}`}>
                    <span className="sr-only">
                      {[item.prefix, item.value, item.unit].filter(Boolean).join(NBSP)}
                    </span>
                    <span aria-hidden="true">
                      {item.prefix && <span className={styles.statPrefix}>{item.prefix}</span>}
                      <CountUp value={item.value} />
                      {item.unit && <span className={styles.statUnit}>{NBSP + item.unit}</span>}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 03 — Jour / nuit */}
        <section className={styles.module} aria-labelledby="nuit-titre">
          <div className="wrap">
            <ModuleHeader id="nuit-titre" label={dayNight.label} title={dayNight.title} />
            <DayNight content={dayNight} text={<DraftText value={dayNight.text} />} />
          </div>
        </section>

        {/* 04 — Été / hiver */}
        <section className={`${styles.module} ${styles.stone}`} aria-labelledby="saisons-titre">
          <div className="wrap">
            <ModuleHeader id="saisons-titre" label={season.label} title={season.title} />
            <Season content={season} />
          </div>
        </section>

        {/* 05 — Miroirs : le jardin par ricochet */}
        <section className={styles.module} aria-labelledby="miroirs-titre">
          <div className="wrap">
            <ModuleHeader id="miroirs-titre" label={mirrors.label} title={mirrors.title}>
              <p className={styles.moduleText}>{mirrors.text}</p>
            </ModuleHeader>
            <div className={styles.mirrors}>
              <div className={styles.mirrorDiagram}>
                <MirrorDiagram label={mirrors.diagram} observer={mirrors.observer} artwork={mirrors.artwork} />
              </div>
              <ol className={styles.mirrorSteps}>
                {mirrors.steps.map((step) => (
                  <li key={step.number} className={styles.mirrorStep} data-reveal="">
                    <span className={styles.mirrorNumber}>{step.number}</span>
                    <h3 className={`serif ${styles.mirrorTitle}`}>{step.title}</h3>
                    <p className={styles.mirrorText}>
                      <DraftText value={step.text} />
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <figure className={styles.mirrorImage}>
              <Picture image={mirrors.image} sizes="(max-width: 1440px) 100vw, 1280px" parallax={0.05} />
            </figure>
          </div>
        </section>

        {/* 06 — Matières */}
        <section className={`${styles.module} ${styles.ruled}`} aria-label={materials.label}>
          <div className="wrap">
            <p className={`meta muted ${styles.materialsLabel}`}>{materials.label}</p>
            <div className={styles.materials}>
              {materials.items.map((item) => (
                <article key={item.id} className={styles.material} aria-labelledby={`${item.id}-titre`}>
                  <figure className={styles.materialImage}>
                    <Picture image={item.image} sizes="(max-width: 900px) 100vw, 58vw" />
                  </figure>
                  <div className={styles.materialText} data-reveal="">
                    <h2 id={`${item.id}-titre`} className={`serif ${styles.materialTitle}`}>
                      {item.title}
                    </h2>
                    {item.text.map((paragraph, i) => (
                      <p key={i} className={styles.moduleText}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 07 — Herbier */}
        <section id="herbier" className={`${styles.module} ${styles.ruled}`} aria-labelledby="herbier-titre">
          <div className="wrap">
            <ModuleHeader id="herbier-titre" label={herbarium.label} title={herbarium.title}>
              <p className={styles.moduleText}>{herbarium.text}</p>
            </ModuleHeader>
            <Herbarium content={herbarium} />
          </div>
        </section>

        {next && <NextProject next={next} total={total} />}

        <CtaCompact type={content.contactType} text={content.cta} />
      </main>
    </>
  );
}
