"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { submitProject, type FormState } from "@/app/contact/actions";
import { Icon } from "@/components/ui/Icon";
import {
  ACCEPTED_EXTENSIONS,
  firstStepWithError,
  readRequest,
  STEP_FIELDS,
  validate,
  type ErrorKey,
  type FieldErrors,
  type FieldName,
} from "@/lib/contact/validate";
import type { Contact } from "@/lib/schemas";
import { fill } from "@/lib/typo";
import styles from "./ProjectForm.module.css";

type FormContent = Contact["form"];

type FocusRequest = { kind: "title"; step: number } | { kind: "field"; field: FieldName };

const INITIAL: FormState = { status: "idle" };
const TOTAL = STEP_FIELDS.length;

/**
 * Formulaire « Démarrer un projet » (aperçu 09, brief §6) : cinq étapes dans un seul
 * formulaire, validées une à une ; envoi par Server Action (submitProject).
 * Sans JavaScript, toutes les étapes s’affichent et le formulaire s’envoie normalement.
 */
export function ProjectForm({
  form,
  initialType,
  initialMessage,
  budgetNote,
  filesNote,
}: {
  /** Textes du formulaire, messages déjà complétés ({max}, {email}, {phone}). */
  form: FormContent;
  initialType?: string;
  initialMessage?: string;
  budgetNote?: ReactNode;
  filesNote?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(submitProject, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [seenState, setSeenState] = useState(state);

  const choices = {
    types: form.projectTypes.map((o) => o.id),
    budgets: form.budget.options.map((o) => o.id),
    deadlines: form.deadline.options.map((o) => o.id),
    preferences: form.preference.options.map((o) => o.id),
  };

  // Erreurs renvoyées par le serveur : retour à la première étape concernée.
  if (state !== seenState) {
    setSeenState(state);
    if (state.errors && Object.keys(state.errors).length) {
      const target = firstStepWithError(state.errors);
      setErrors(state.errors);
      setStep(target);
      setFocusRequest({ kind: "field", field: STEP_FIELDS[target - 1].find((f) => state.errors?.[f]) ?? "type" });
    }
  }

  // Heure d’affichage (anti-robot), connue seulement dans le navigateur.
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  useEffect(() => {
    const element = formRef.current;
    if (!focusRequest || !element) return;
    const target =
      focusRequest.kind === "title"
        ? element.querySelector<HTMLElement>(`#c-step-${focusRequest.step}`)
        : (element.querySelector<HTMLElement>(`[name="${focusRequest.field}"]:checked`) ??
          element.querySelector<HTMLElement>(`[name="${focusRequest.field}"]`));
    target?.focus();
  }, [focusRequest]);

  const fileInfos = (list: File[]) => list.map((file) => ({ name: file.name, size: file.size, type: file.type }));

  const check = (fields: FieldName[], list = files): FieldErrors => {
    if (!formRef.current) return {};
    return validate(readRequest(new FormData(formRef.current)), fileInfos(list), choices, fields);
  };

  /** Remplace les erreurs des champs donnés par celles qui viennent d’être calculées. */
  const updateErrors = (fields: FieldName[], found: FieldErrors) =>
    setErrors((previous) => {
      const next = { ...previous };
      for (const field of fields) delete next[field];
      return { ...next, ...found };
    });

  const goTo = (target: number) => {
    setStep(target);
    setFocusRequest({ kind: "title", step: target });
  };

  const next = () => {
    const fields = STEP_FIELDS[step - 1];
    const found = check(fields);
    updateErrors(fields, found);
    const invalid = fields.find((field) => found[field]);
    if (invalid) setFocusRequest({ kind: "field", field: invalid });
    else goTo(step + 1);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    if (step < TOTAL) return next();
    const all = STEP_FIELDS.flat();
    const found = check(all);
    setErrors(found);
    if (Object.keys(found).length) {
      const target = firstStepWithError(found);
      setStep(target);
      setFocusRequest({ kind: "field", field: STEP_FIELDS[target - 1].find((f) => found[f]) ?? "type" });
      return;
    }
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  // Une erreur disparaît dès que le champ concerné change.
  const onChange = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name as FieldName;
    if (name === "files") return;
    setErrors((previous) => {
      if (!previous[name] && !(name === "preference" && previous.phone)) return previous;
      const next = { ...previous };
      delete next[name];
      if (name === "preference") delete next.phone;
      return next;
    });
  };

  /* ---------- Pièces jointes ---------- */

  const setFileList = (list: File[]) => {
    setFiles(list);
    const input = fileRef.current;
    if (input) {
      const transfer = new DataTransfer();
      list.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
    }
    updateErrors(["files"], check(["files"], list));
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    const list = [...files];
    for (const file of Array.from(incoming)) {
      if (!list.some((known) => known.name === file.name && known.size === file.size)) list.push(file);
    }
    setFileList(list);
  };

  /* ---------- Rendu ---------- */

  const errorId = (field: FieldName) => `c-${field}-erreur`;
  const describedBy = (field: FieldName, ...ids: (string | false | undefined)[]) =>
    [...ids, errors[field] && errorId(field)].filter(Boolean).join(" ") || undefined;
  const invalid = (field: FieldName) => (errors[field] ? true : undefined);
  const errorText = (field: FieldName) => {
    const key = errors[field];
    return key ? (
      <p id={errorId(field)} className={styles.error}>
        {form.errors[key as ErrorKey]}
      </p>
    ) : null;
  };
  const hint = (text?: string) => (text ? <span className={styles.hint}>{text}</span> : null);
  const title = (n: number) => (
    <h2 id={`c-step-${n}`} tabIndex={-1} className={`serif ${styles.stepTitle}`}>
      {form.steps[n - 1].title}
    </h2>
  );
  const choiceGroup = (
    field: "budget" | "deadline" | "preference",
    options: { id: string; label: string }[],
    label: string,
    extra?: ReactNode,
  ) => (
    <fieldset className={styles.field} aria-describedby={describedBy(field)}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.choices}>
        {options.map((option) => (
          <label key={option.id} className={styles.choice}>
            <input
              className={styles.radio}
              type="radio"
              name={field}
              value={option.id}
              data-invalid={invalid(field)}
              aria-describedby={describedBy(field)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {extra}
      {errorText(field)}
    </fieldset>
  );

  const message = state.message
    ? { server: form.errors.server, rateLimit: form.errors.rateLimit, spam: form.errors.spam }[state.message]
    : undefined;
  const buttonLabel = pending ? form.sending : step === TOTAL ? form.submit : form.next;

  return (
    <form ref={formRef} className={styles.form} action={formAction} onSubmit={onSubmit} onChange={onChange} noValidate>
      <div className={styles.progress}>
        <div className={styles.progressRow}>
          <p className="meta" aria-live="polite">
            {fill(form.stepCounter, { n: step, total: TOTAL })}
          </p>
          <p className="meta muted">{form.steps[step - 1].name}</p>
        </div>
        <div className={styles.bars} aria-hidden="true">
          {form.steps.map((s, i) => (
            <span key={s.id} className={styles.bar} data-on={i < step || undefined} />
          ))}
        </div>
        <ol className={styles.stepLabels} aria-hidden="true">
          {form.steps.map((s, i) => (
            <li key={s.id} data-on={i + 1 === step || undefined}>
              {s.short}
            </li>
          ))}
        </ol>
      </div>

      {/* 1 · Projet */}
      <div className={styles.step} data-step="" hidden={step !== 1}>
        {title(1)}
        <fieldset className={styles.field} aria-describedby={describedBy("type")}>
          <legend className="sr-only">{form.projectTypesLabel}</legend>
          <div className={styles.cards}>
            {form.projectTypes.map((option) => (
              <label key={option.id} className={styles.card}>
                <input
                  className={styles.radio}
                  type="radio"
                  name="type"
                  value={option.id}
                  defaultChecked={option.id === initialType}
                  data-invalid={invalid("type")}
                  aria-describedby={describedBy("type")}
                />
                <span className={styles.cardTitle}>{option.label}</span>
                <span className={styles.cardDesc}>{option.desc}</span>
              </label>
            ))}
          </div>
          {errorText("type")}
        </fieldset>
      </div>

      {/* 2 · Lieu et surface */}
      <div className={styles.step} data-step="" hidden={step !== 2}>
        {title(2)}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-place">
            {form.place.label}
          </label>
          <input
            id="c-place"
            className={styles.input}
            type="text"
            name="place"
            maxLength={120}
            placeholder={form.place.placeholder}
            autoComplete="address-level2"
            aria-invalid={invalid("place")}
            aria-describedby={describedBy("place")}
          />
          {errorText("place")}
        </div>
        <div className={styles.pair}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="c-surface">
              {form.surface.label} {hint(form.surface.hint)}
            </label>
            <input
              id="c-surface"
              className={styles.input}
              type="text"
              name="surface"
              inputMode="decimal"
              maxLength={9}
              placeholder={form.surface.placeholder}
              aria-invalid={invalid("surface")}
              aria-describedby={describedBy("surface", "c-surface-aide")}
            />
            {errorText("surface")}
          </div>
          <p id="c-surface-aide" className={`${styles.help} ${styles.pairHelp}`}>
            {form.surface.help}
          </p>
        </div>
      </div>

      {/* 3 · Budget et échéance */}
      <div className={styles.step} data-step="" hidden={step !== 3}>
        {title(3)}
        {choiceGroup(
          "budget",
          form.budget.options,
          form.budget.label,
          <p className={styles.help}>
            {form.budget.help} {budgetNote}
          </p>,
        )}
        {choiceGroup("deadline", form.deadline.options, form.deadline.label)}
      </div>

      {/* 4 · Message et pièces jointes */}
      <div className={styles.step} data-step="" hidden={step !== 4}>
        {title(4)}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-message">
            {form.message.label}
          </label>
          <textarea
            id="c-message"
            className={`${styles.input} ${styles.textarea}`}
            name="message"
            rows={6}
            maxLength={5000}
            placeholder={form.message.placeholder}
            defaultValue={initialMessage}
            aria-invalid={invalid("message")}
            aria-describedby={describedBy("message")}
          />
          {errorText("message")}
        </div>
        <div className={styles.field}>
          <p className={styles.label} id="c-files-titre">
            {form.attachments.label} {hint(form.attachments.hint)}
          </p>
          <label
            className={styles.drop}
            data-dragging={dragging || undefined}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <input
              ref={fileRef}
              className={styles.fileInput}
              type="file"
              name="files"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              aria-labelledby="c-files-titre"
              aria-invalid={invalid("files")}
              aria-describedby={describedBy("files", "c-files-aide")}
              onChange={(event) => addFiles(event.currentTarget.files)}
            />
            <Icon name="plus" size={20} />
            <span className={styles.dropText}>
              {form.attachments.drop} <span className={styles.browse}>{form.attachments.browse}</span>
            </span>
            <span id="c-files-aide" className={styles.help}>
              {form.attachments.help} {filesNote}
            </span>
          </label>
          {files.length > 0 && (
            <ul className={styles.files}>
              {files.map((file, index) => (
                <li key={`${file.name}-${file.size}`} className={styles.file}>
                  <span className={styles.fileName}>{file.name}</span>
                  <button
                    type="button"
                    className={styles.fileRemove}
                    onClick={() => setFileList(files.filter((_, i) => i !== index))}
                  >
                    <Icon name="close" size={12} />
                    <span className="sr-only">{fill(form.attachments.remove, { name: file.name })}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errorText("files")}
        </div>
      </div>

      {/* 5 · Coordonnées */}
      <div className={styles.step} data-step="" hidden={step !== 5}>
        {title(5)}
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="c-name">
              {form.name.label}
            </label>
            <input
              id="c-name"
              className={styles.input}
              type="text"
              name="name"
              maxLength={120}
              autoComplete="name"
              aria-invalid={invalid("name")}
              aria-describedby={describedBy("name")}
            />
            {errorText("name")}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="c-email">
              {form.email.label}
            </label>
            <input
              id="c-email"
              className={styles.input}
              type="email"
              name="email"
              maxLength={200}
              autoComplete="email"
              aria-invalid={invalid("email")}
              aria-describedby={describedBy("email")}
            />
            {errorText("email")}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="c-phone">
              {form.phone.label} {hint(form.phone.hint)}
            </label>
            <input
              id="c-phone"
              className={styles.input}
              type="tel"
              name="phone"
              maxLength={20}
              autoComplete="tel"
              aria-invalid={invalid("phone")}
              aria-describedby={describedBy("phone")}
            />
            {errorText("phone")}
          </div>
          {choiceGroup("preference", form.preference.options, form.preference.label)}
        </div>
        <div className={styles.field}>
          <label className={styles.consent}>
            <input
              className={styles.checkbox}
              type="checkbox"
              name="consent"
              value="oui"
              aria-invalid={invalid("consent")}
              aria-describedby={describedBy("consent")}
            />
            {form.consent}
          </label>
          {errorText("consent")}
        </div>
      </div>

      {/* Anti-robot : champ piège invisible et heure d’affichage. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="c-website">{form.honeypot}</label>
        <input id="c-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="startedAt" />

      {message && (
        <p className={styles.alert} role="alert">
          {message}
        </p>
      )}

      <div className={styles.footer}>
        {step > 1 ? (
          <button type="button" className={styles.back} onClick={() => goTo(step - 1)}>
            <Icon name="arrow-left" size={16} />
            {form.back}
          </button>
        ) : (
          <span className={styles.help}>{form.editable}</span>
        )}
        <button type="submit" className={styles.submit} aria-disabled={pending || undefined}>
          <span className={styles.jsLabel}>{buttonLabel}</span>
          <span className={styles.noJsLabel}>{form.submit}</span>
          <Icon name="arrow-right" size={16} />
        </button>
      </div>
    </form>
  );
}

/**
 * Pré-remplissage depuis l’adresse : ?type=… (puces du bandeau d’appel, offres) et
 * ?piece=… (fiches objets). Rendu côté navigateur, sous un <Suspense>.
 */
export function ProjectFormFromParams({
  pieces,
  ...props
}: Omit<Parameters<typeof ProjectForm>[0], "initialType" | "initialMessage"> & { pieces: Record<string, string> }) {
  const params = useSearchParams();
  const piece = pieces[params.get("piece") ?? ""];
  return (
    <ProjectForm
      {...props}
      initialType={params.get("type") ?? undefined}
      initialMessage={piece ? fill(props.form.message.pieceIntro, { name: piece }) : undefined}
    />
  );
}
