import type { CSSProperties } from "react";
import { CtaCompact } from "@/components/home/CtaCompact";
import { SectionHeader } from "@/components/home/SectionHeader";
import { Logo } from "@/components/layout/Brand";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { Picture } from "@/components/media/Picture";
import { DraftText } from "@/components/ui/DraftText";
import { getProject, getSite, getStudio } from "@/lib/content";
import styles from "./StudioPage.module.css";

/** Le studio (aperçu 07) : présentation, approche, parcours, matières, partenaires. */
export function StudioPage() {
  const studio = getStudio();
  const site = getSite();
  const projectName = (slug: string) => getProject(slug)?.name ?? slug;

  return (
    <>
      <SiteHeader variant="solid" current="studio" />
      <main id={MAIN_ID} className={styles.main}>
        <header className={`wrap g12 ${styles.header}`}>
          <figure className={styles.portrait} data-missing={studio.portrait.image ? undefined : ""}>
            {studio.portrait.image ? (
              <Picture image={studio.portrait.image} sizes="(max-width: 900px) 100vw, 40vw" preload />
            ) : (
              <>
                <Logo kind="monogram" tone="cacao" width={96} className={styles.portraitMark} />
                <figcaption className="meta muted">{studio.portrait.missing}</figcaption>
              </>
            )}
          </figure>
          <div className={styles.intro}>
            <p className="meta muted">{studio.eyebrow}</p>
            <h1 className={`serif ${styles.title}`}>{site.identity.name}</h1>
            <p className={styles.lead}>{studio.lead}</p>
            <p className={styles.bio}>
              <DraftText value={studio.bio} />
            </p>
            <p className="meta muted">{studio.bioNote}</p>
            <blockquote className={styles.quote}>
              <p className="serif">« {site.identity.tagline} »</p>
            </blockquote>
          </div>
        </header>

        <section className={styles.approach} aria-labelledby="approche-titre">
          <div className="wrap">
            <SectionHeader id="approche-titre" label={studio.approach.label} title={studio.approach.title} spacing="md" />
            <ol className={`g12 ${styles.principles}`}>
              {studio.approach.items.map((item, index) => (
                <li key={item.number} data-reveal="" style={{ "--reveal-delay": `${index * 80}ms` } as CSSProperties}>
                  <p className={`serif ${styles.principleNumber}`}>{item.number}</p>
                  <h3 className={styles.principleTitle}>{item.title}</h3>
                  <p className="muted">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.parcours} aria-labelledby="parcours-titre">
          <div className="wrap">
            <SectionHeader
              id="parcours-titre"
              label={studio.parcours.label}
              title={studio.parcours.title}
              aside={<p className="muted">{studio.parcours.note}</p>}
              spacing="md"
            />
            <div className={styles.timeline}>
              <div className={styles.timelineLine} aria-hidden="true" />
              <ol className={styles.steps}>
                {site.parcours.map((item, index) => (
                  <li key={item.id} className={styles.step} data-reveal="" style={{ "--reveal-delay": `${index * 60}ms` } as CSSProperties}>
                    <span className={styles.dot} data-first={index === 0 || undefined} aria-hidden="true" />
                    <p className="meta">
                      <DraftText value={item.period} />
                    </p>
                    <h3 className={`serif ${styles.stepName}`}>{item.name}</h3>
                    <p className={`muted ${styles.stepDetail}`}>
                      {item.kind} · {item.place}
                      {item.detail && (
                        <>
                          <br />
                          <DraftText value={item.detail} />
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className={`g12 ${styles.secondary}`}>
              <div className={styles.other}>
                <h3 className="meta muted">{studio.parcours.otherTitle}</h3>
                <ul>
                  {site.parcoursOther.map((item) => (
                    <li key={item.id}>
                      <span className={styles.otherName}>{item.name}</span>
                      <span className="meta muted">
                        {item.kind} · {item.place} · <DraftText value={item.period} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.tools}>
                <h3 className="meta muted">{studio.parcours.toolsTitle}</h3>
                <p>
                  <DraftText value={site.tools} />
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.materials} aria-labelledby="matieres-titre">
          <div className="wrap">
            <SectionHeader
              id="matieres-titre"
              label={studio.materials.label}
              title={studio.materials.title}
              aside={<p className="muted">{studio.materials.intro}</p>}
              spacing="md"
            />
            <ul className={styles.materialList}>
              {studio.materials.items.map((item, index) => (
                <li key={item.name} className={styles.material} data-reveal="" style={{ "--reveal-delay": `${(index % 4) * 60}ms` } as CSSProperties}>
                  <div className={styles.materialImage}>
                    <Picture image={item.image} sizes="(max-width: 900px) 50vw, 25vw" />
                  </div>
                  <h3 className={`serif ${styles.materialName}`}>{item.name}</h3>
                  <p className="meta muted">
                    {studio.materials.seenIn} {item.projects.map(projectName).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.partners} aria-labelledby="partenaires-titre">
          <div className="wrap">
            <SectionHeader id="partenaires-titre" label={studio.partners.label} title={studio.partners.title} spacing="md" />
            <ul className={styles.partnerList}>
              {[
                ...site.partners,
                { id: "artisans", name: studio.partners.artisans.name, role: studio.partners.artisans.role, text: studio.partners.artisans.text },
              ].map((partner) => (
                <li key={partner.id} className={styles.partner} data-reveal="">
                  <h3 className={`serif ${styles.partnerName}`}>
                    {typeof partner.name === "string" ? partner.name : <DraftText value={partner.name} />}
                  </h3>
                  <p className="meta muted">{partner.role}</p>
                  <p className={styles.partnerText}>
                    <DraftText value={partner.text} />
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CtaCompact />
      </main>
    </>
  );
}
