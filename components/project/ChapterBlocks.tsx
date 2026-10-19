import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { DraftText } from "@/components/ui/DraftText";
import { Icon } from "@/components/ui/Icon";
import { objectHref, type ChapterBlock, type Figure, type Ui } from "@/lib/content";
import { BeforeAfter } from "./BeforeAfter";
import { ZoningHotspots } from "./ZoningHotspots";
import styles from "./ChapterBlocks.module.css";

const SIZES = {
  full: "(max-width: 900px) 100vw, (max-width: 1440px) 66vw, 952px",
  half: "(max-width: 900px) 100vw, (max-width: 1440px) 33vw, 470px",
  third: "(max-width: 900px) 50vw, (max-width: 1440px) 22vw, 310px",
};

/** Image de contenu à ses proportions (« contain » : croquis et plans, sur fond clair). */
function FigureView({ figure, sizes, ratio }: { figure: Figure; sizes: string; ratio?: string }) {
  const { image, caption, fit } = figure;
  return (
    <figure className={styles.figure}>
      <div
        className={styles.frame}
        data-fit={fit}
        style={{ aspectRatio: ratio ?? `${image.width} / ${image.height}` } as CSSProperties}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          placeholder={fit === "cover" && image.blurDataURL ? "blur" : "empty"}
          blurDataURL={image.blurDataURL}
          style={{ objectFit: fit, objectPosition: image.position }}
        />
      </div>
      {caption && <figcaption className="meta muted">{caption}</figcaption>}
    </figure>
  );
}

function Paragraphs({ items, className }: { items: string[]; className?: string }) {
  return (
    <>
      {items.map((text, index) => (
        <p key={index} className={className ?? styles.paragraph}>
          {text}
        </p>
      ))}
    </>
  );
}

/** Rendu des blocs d’un chapitre, dans l’ordre du contenu. */
export function ChapterBlocks({ blocks, ui }: { blocks: ChapterBlock[]; ui: Ui }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "text":
            return (
              <div key={index} className={styles.text}>
                <Paragraphs items={block.paragraphs} />
              </div>
            );

          case "media":
            return (
              <div key={index} className={styles.media} data-layout={block.layout}>
                {block.items.map((figure, i) => (
                  <FigureView
                    key={i}
                    figure={figure}
                    sizes={block.layout === "duo" || block.layout === "portrait" ? SIZES.half : SIZES.full}
                    ratio={block.layout === "wide" ? "16 / 9" : undefined}
                  />
                ))}
              </div>
            );

          case "beforeAfter":
            return (
              <div key={index} className={styles.wide}>
                <BeforeAfter before={block.before} after={block.after} initial={block.initial} labels={ui.beforeAfter} sizes={SIZES.full} />
              </div>
            );

          case "feature": {
            const [first, ...rest] = block.media;
            return (
              <article key={index} className={styles.feature} data-layout={block.layout}>
                {first && (
                  <div className={styles.featureMedia}>
                    <FigureView figure={first} sizes={block.layout === "stacked" ? SIZES.full : SIZES.half} />
                    {rest.length > 0 && (
                      <div className={styles.featureMore} data-count={rest.length}>
                        {rest.map((figure, i) => (
                          <FigureView key={i} figure={figure} sizes={SIZES.third} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className={styles.featureText}>
                  <p className="meta muted">{block.number ? `${block.number} · ${block.label}` : block.label}</p>
                  <h3 className={`serif ${styles.featureTitle}`}>{block.title}</h3>
                  <Paragraphs items={block.paragraphs} className={styles.featureParagraph} />
                  {block.object && (
                    <ArrowLink href={objectHref(block.object)} direction="up-right" className={styles.objectLink}>
                      {ui.viewObject}
                    </ArrowLink>
                  )}
                </div>
              </article>
            );
          }

          case "pair":
            return (
              <div key={index} className={styles.pair}>
                {block.items.map((item, i) => (
                  <article key={i} className={styles.pairItem}>
                    <FigureView figure={item.media} sizes={SIZES.half} ratio="4 / 5" />
                    <h3 className={`serif ${styles.pairTitle}`}>{item.title}</h3>
                    <Paragraphs items={item.paragraphs} className={styles.featureParagraph} />
                  </article>
                ))}
              </div>
            );

          case "palette":
            return (
              <div key={index} className={styles.palette}>
                <ul>
                  {block.items.map((item) => (
                    <li key={item.name}>
                      <span className={styles.swatch} style={{ background: item.color }} aria-hidden="true" />
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
                <p className="meta muted">
                  <DraftText value={block.note} />
                </p>
              </div>
            );

          case "list":
            return (
              <ul key={index} className={styles.list}>
                {block.items.map((item) => (
                  <li key={item.title}>
                    <h3 className={`serif ${styles.listTitle}`}>{item.title}</h3>
                    <p className={styles.featureParagraph}>{item.text}</p>
                  </li>
                ))}
              </ul>
            );

          case "quote":
            return (
              <blockquote key={index} className={styles.quote}>
                <p className="serif">« {block.text} »</p>
                <p className="meta muted">{block.author}</p>
              </blockquote>
            );

          case "download":
            return (
              <p key={index} className={styles.download}>
                <a href={block.href} className={styles.downloadLink} download>
                  <Icon name="download" size={16} />
                  {block.label}
                </a>
                {block.meta && <span className="meta muted">{block.meta}</span>}
              </p>
            );

          case "zoning":
            return (
              <div key={index} className={styles.wide}>
                <ZoningHotspots block={block} labels={ui.zoning} />
              </div>
            );
        }
      })}
    </>
  );
}
