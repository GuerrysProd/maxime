import { cookies } from "next/headers";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { Picture } from "@/components/media/Picture";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { DraftText } from "@/components/ui/DraftText";
import { Icon } from "@/components/ui/Icon";
import { decodeRecap, RECAP_COOKIE, type Recap } from "@/lib/contact/recap";
import { getContact, getSite } from "@/lib/content";
import { fill } from "@/lib/typo";
import styles from "./ConfirmationPage.module.css";

/** Demande envoyée (aperçu 09b). Le récapitulatif vient du cookie posé par la Server Action. */
export function ConfirmationPage() {
  const c = getContact().confirmation;
  return (
    <>
      <SiteHeader variant="solid" />
      <main id={MAIN_ID} className={styles.main}>
        <div className={`wrap ${styles.grid}`}>
          <div className={styles.status}>
            <span className={styles.check} aria-hidden="true">
              <Icon name="check" size={22} />
            </span>
            <p className="meta muted">{c.label}</p>
            <Suspense fallback={<Message />}>
              <MessageFromCookie />
            </Suspense>
            <div className={styles.actions}>
              <Button href={c.projects.href}>{c.projects.label}</Button>
              <ArrowLink href="/contact#rendez-vous">{c.call}</ArrowLink>
            </div>
          </div>
          <figure className={styles.figure}>
            <div className={styles.frame}>
              <Picture image={c.image} sizes="(max-width: 900px) 100vw, 40vw" />
            </div>
            <figcaption className="meta muted">{c.caption}</figcaption>
          </figure>
        </div>
      </main>
    </>
  );
}

async function MessageFromCookie() {
  const recap = decodeRecap((await cookies()).get(RECAP_COOKIE)?.value);
  return <Message recap={recap} />;
}

function Message({ recap }: { recap?: Recap }) {
  const c = getContact().confirmation;
  const delay = getSite().contact.responseDelay;
  const [before, after = ""] = c.text.split("{delay}");
  const rows: [string, string][] = recap
    ? [
        [c.recap.type, recap.type],
        [c.recap.place, recap.place],
        [c.recap.deadline, recap.deadline],
      ]
    : [];
  return (
    <>
      <h1 className={`serif ${styles.title}`}>{recap?.name ? fill(c.title, { name: recap.name }) : c.titleAnonymous}</h1>
      <p className={styles.text}>
        {before}
        <DraftText value={delay} />
        {after}
      </p>
      {rows.length > 0 && (
        <>
          <dl className={styles.recap}>
            {rows.map(([label, value]) => (
              <div key={label} className={styles.row}>
                <dt className="meta muted">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.copy}>{c.copySent}</p>
        </>
      )}
    </>
  );
}
