import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { DraftText } from "@/components/ui/DraftText";
import { MAX_FILES_MB } from "@/lib/contact/validate";
import { getContact, getObjects, getSite } from "@/lib/content";
import { fill, frTypo } from "@/lib/typo";
import { BookingPicker } from "./BookingPicker";
import { ProjectForm, ProjectFormFromParams } from "./ProjectForm";
import styles from "./ContactPage.module.css";

/** Démarrer un projet (aperçu 09) : formulaire en cinq étapes, rendez-vous, coordonnées. */
export function ContactPage() {
  const contact = getContact();
  const { phone, email, address, region } = getSite().contact;
  const f = contact.form;

  // Textes du formulaire complétés ici : le composant client ne reçoit que des chaînes prêtes.
  const form = {
    ...f,
    attachments: { ...f.attachments, help: frTypo(fill(f.attachments.help ?? "", { max: MAX_FILES_MB })) },
    errors: {
      ...f.errors,
      files: frTypo(fill(f.errors.files, { max: MAX_FILES_MB })),
      server: fill(f.errors.server, { email: email.value }),
      rateLimit: fill(f.errors.rateLimit, { phone: phone.value }),
    },
  };
  const formProps = {
    form,
    budgetNote: <DraftText value={f.budget.pending} />,
    filesNote: <DraftText value={f.attachments.maxNote} />,
  };
  const pieces = Object.fromEntries(getObjects().map((piece) => [piece.slug, piece.name]));
  const [before, after = ""] = contact.booking.text.split("{duration}");

  return (
    <>
      <SiteHeader variant="solid" current="contact" />
      <main id={MAIN_ID} className={styles.main}>
        <header className={`wrap g12 ${styles.header}`}>
          <div className={styles.heading}>
            <p className="meta muted">{contact.eyebrow}</p>
            <h1 className={`serif ${styles.title}`}>{contact.title}</h1>
          </div>
          <p className={`muted ${styles.intro}`}>{contact.intro}</p>
        </header>

        <div className={`wrap ${styles.body}`}>
          <div className={styles.card}>
            <Suspense fallback={<ProjectForm {...formProps} />}>
              <ProjectFormFromParams {...formProps} pieces={pieces} />
            </Suspense>
          </div>

          <aside className={styles.aside}>
            <BookingPicker
              labels={contact.booking}
              bookingUrl={process.env.NEXT_PUBLIC_BOOKING_URL || undefined}
              intro={
                <>
                  {before}
                  <DraftText value={contact.booking.duration} />
                  {after}
                </>
              }
            />
            <section className={styles.details} aria-labelledby="coordonnees-titre">
              <h2 id="coordonnees-titre" className="meta muted">
                {contact.details.label}
              </h2>
              <address className={styles.address}>
                <a href={phone.href}>
                  <DraftText value={{ value: phone.value, draft: phone.draft, missing: false }} />
                </a>
                <a href={email.href} className={styles.email}>
                  <DraftText value={{ value: email.value, draft: email.draft, missing: false }} />
                </a>
                <span className="muted">
                  <DraftText value={address} />
                </span>
                <span className="muted">{region}</span>
              </address>
              <p className={styles.help}>{contact.details.note}</p>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
