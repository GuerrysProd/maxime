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
import { GarlandNetwork, MirrorPlan } from "./PlanOverlays";
import { Season } from "./Season";
import styles from "./GasquiPage.module.css";

const NBSP = " ";

/** En-tête de module : surtitre et titre à gauche, texte (ou commandes) à droite. */
function ModuleHeader({
  id,
  label,
  title,
  level = 2,
  children,
}: {
  id: string;
  label: string;
  title: string;
  level?: 2 | 3;
  children?: ReactNode;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className={styles.moduleHeader} data-reveal="">
      <div className={styles.moduleTitleBlock}>
        <p className="meta muted">{label}</p>
        <Heading id={id} className={`serif ${styles.moduleTitle}`}>
          {title}
        </Heading>
      </div>
      {children && <div className={styles.moduleAside}>{children}</div>}
    </div>
  );
}

/** Détail signature (matière, ligne) : image légendée et texte, éventuellement « Le geste ». */
function SignatureFeature({ feature, reverse = false }: { feature: ProjectModules["matter"]; reverse?: boolean }) {
  return (
    <div className={styles.feature} data-reverse={reverse || undefined}>
      <figure className={styles.featureFigure}>
        <div className={styles.featureImage}>
          <Picture image={feature.image} sizes="(max-width: 900px) 100vw, 58vw" />
        </div>
        <figcaption className="meta muted">{feature.caption}</figcaption>
      </figure>
      <div className={styles.featureText} data-reveal="">
        <p className="meta muted">{feature.label}</p>
        <h3 id={`${feature.id}-titre`} className={`serif ${styles.featureTitle}`}>
          {feature.title}
        </h3>
        {feature.text.map((paragraph, i) => (
          <p key={i} className={styles.moduleText}>
            {paragraph}
          </p>
        ))}
        {feature.gesture && (
          <p className={styles.gesture}>
            <span className="meta muted">{feature.gesture.label}</span>
            {feature.gesture.text}
          </p>
        )}
      </div>
    </div>
  );
}

/** Fiche Château Gasqui, gabarit « modules » (aperçu 10, brief §6, SOURCES §4, page du site actuel). */
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
  const { intention, plan, stats, details, matter, dayNight, season, mirrors, line, gardens, herbarium } = content;

  return (
    <>
      <SiteHeader variant="solid" current="projets" />
      <main id={MAIN_ID} className={styles.main}>
        <ProjectIntro project={project} total={total} lead={content.lead} intro={content.intro} specs={content.specs}>
          <p className={styles.credit}>{content.credit}</p>
        </ProjectIntro>

        {/* 01 — L’intention */}
        <section className={`${styles.module} ${styles.ruled}`} aria-labelledby="intention-titre">
          <div className={`wrap ${styles.intention}`}>
            <div className={styles.intentionText}>
              <ModuleHeader id="intention-titre" label={intention.label} title={intention.title} />
              {intention.text.map((paragraph, i) => (
                <p key={i} className={styles.intentionParagraph} data-reveal="">
                  {paragraph}
                </p>
              ))}
            </div>
            <figure className={styles.intentionImage}>
              <Picture image={intention.image} sizes="(max-width: 900px) 100vw, 40vw" />
            </figure>
          </div>
        </section>

        {/* 02 — Le plan */}
        <section className={`${styles.module} ${styles.stone}`} aria-labelledby="plan-titre">
          <div className="wrap">
            <ModuleHeader id="plan-titre" label={plan.label} title={plan.title}>
              <p className={styles.moduleText}>{plan.text}</p>
            </ModuleHeader>
            <LayerPlan
              plan={plan}
              steps={plan.steps.map((step) => ({ title: <DraftText value={step.title} />, text: <DraftText value={step.text} /> }))}
            />
            <a className={styles.pdf} href={plan.pdf.href} download>
              <span className={styles.pdfPreview}>
                <Picture image={plan.pdf.preview} sizes="(max-width: 900px) 100vw, 25vw" />
              </span>
              <span className={styles.pdfText}>
                <span className={`serif ${styles.pdfTitle}`}>{plan.pdf.title}</span>
                <span className={styles.pdfLabel}>
                  {plan.pdf.label}
                  <Icon name="download" size={14} />
                </span>
                <span className="meta muted">{plan.pdf.meta}</span>
              </span>
            </a>
          </div>
        </section>

        {/* Le projet en matière */}
        <section className={styles.stats} aria-labelledby="chiffres-titre">
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
                    <span className="sr-only">{[item.prefix, item.value, item.unit].filter(Boolean).join(NBSP)}</span>
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

        {/* 03 — Les détails signature */}
        <section aria-labelledby="details-titre">
          {/* 01 / Matière */}
          <div className={`${styles.module} ${styles.stone}`}>
            <div className="wrap">
              <ModuleHeader id="details-titre" label={details.label} title={details.title}>
                <p className={styles.moduleText}>{details.text}</p>
              </ModuleHeader>
              <SignatureFeature feature={matter} />
            </div>
          </div>

          {/* 02 / Lumière */}
          <div className={styles.module}>
            <div className="wrap">
              <ModuleHeader id="lumiere-titre" label={dayNight.label} title={dayNight.title} level={3} />
              <DayNight content={dayNight} />
              <div className={styles.network}>
                <GarlandNetwork image={content.planImage} content={dayNight.network} />
              </div>
            </div>
          </div>

          {/* 03 / Ombre */}
          <div className={`${styles.module} ${styles.stone}`}>
            <div className="wrap">
              <ModuleHeader id="ombre-titre" label={season.label} title={season.title} level={3} />
              <Season content={season} />
            </div>
          </div>

          {/* 04 / Perspective */}
          <div className={styles.module}>
            <div className="wrap">
              <ModuleHeader id="perspective-titre" label={mirrors.label} title={mirrors.title} level={3}>
                <p className={styles.moduleText}>{mirrors.text}</p>
              </ModuleHeader>
              <div className={styles.mirrors}>
                <figure className={styles.mirrorPhoto}>
                  <div className={styles.mirrorImage}>
                    <Picture image={mirrors.image} sizes="(max-width: 900px) 100vw, 58vw" />
                  </div>
                  <figcaption className="meta muted">{mirrors.caption}</figcaption>
                </figure>
                <div className={styles.mirrorPlan}>
                  <MirrorPlan image={content.planImage} content={mirrors.plan} />
                </div>
              </div>
              <ol className={styles.mirrorSteps}>
                {mirrors.steps.map((step) => (
                  <li key={step.number} className={styles.mirrorStep} data-reveal="">
                    <span className={styles.mirrorNumber}>{step.number}</span>
                    <h4 className={`serif ${styles.mirrorTitle}`}>{step.title}</h4>
                    <p className={styles.mirrorText}>
                      <DraftText value={step.text} />
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* 05 / Ligne */}
          <div className={`${styles.module} ${styles.stone}`}>
            <div className="wrap">
              <SignatureFeature feature={line} reverse />
            </div>
          </div>
        </section>

        {/* 04 — Les jardins */}
        <section className={styles.module} aria-labelledby="jardins-titre">
          <div className="wrap">
            <ModuleHeader id="jardins-titre" label={gardens.label} title={gardens.title}>
              <p className={`serif ${styles.subtitle}`}>{gardens.subtitle}</p>
            </ModuleHeader>
            <Gardens gardens={gardens} paletteHref="#herbier" />
          </div>
        </section>

        {/* 05 — La palette végétale */}
        <section id="herbier" className={`${styles.module} ${styles.stone}`} aria-labelledby="herbier-titre">
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
