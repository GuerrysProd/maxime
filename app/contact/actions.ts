"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getContact, getSite } from "@/lib/content";
import { renderMail, sendMail } from "@/lib/contact/mail";
import { encodeRecap, RECAP_COOKIE } from "@/lib/contact/recap";
import { MIN_FILL_MS, readRequest, validate, type FieldErrors, type FileInfo } from "@/lib/contact/validate";
import { fill } from "@/lib/typo";

export interface FormState {
  status: "idle" | "error";
  errors?: FieldErrors;
  /** Message général (envoi impossible, trop de demandes, robot). */
  message?: "server" | "rateLimit" | "spam";
}

/* Limite de débit simple, en mémoire (par instance) : 5 demandes / 10 min / adresse IP. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/** Server Action du formulaire « Démarrer un projet » (brief §6). */
export async function submitProject(_previous: FormState, form: FormData): Promise<FormState> {
  const contact = getContact();
  const site = getSite();
  const labels = contact.emails.fields;
  const f = contact.form;

  // Anti-spam : champ piège rempli, ou envoi trop rapide après l’affichage
  // (heure inscrite par le navigateur ; absente sans JavaScript).
  const startedAt = Number(form.get("startedAt"));
  if (form.get("website") || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) {
    return { status: "error", message: "spam" };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return { status: "error", message: "rateLimit" };

  const request = readRequest(form);
  const files = form.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
  const fileInfos: FileInfo[] = files.map((file) => ({ name: file.name, size: file.size, type: file.type }));
  const errors = validate(request, fileInfos, {
    types: f.projectTypes.map((o) => o.id),
    budgets: f.budget.options.map((o) => o.id),
    deadlines: f.deadline.options.map((o) => o.id),
    preferences: f.preference.options.map((o) => o.id),
  });
  if (Object.keys(errors).length) return { status: "error", errors };

  const label = (options: { id: string; label: string }[], id: string) => options.find((o) => o.id === id)?.label ?? id;
  const typeLabel = label(f.projectTypes, request.type);
  const deadlineLabel = label(f.deadline.options, request.deadline);
  const rows: [string, string][] = [
    [labels.type, typeLabel],
    [labels.place, request.place],
    [labels.surface, request.surface ? `${request.surface} m²` : "—"],
    [labels.budget, label(f.budget.options, request.budget)],
    [labels.deadline, deadlineLabel],
    [labels.message, request.message],
    [labels.files, files.length ? files.map((file) => file.name).join(", ") : "—"],
    [labels.name, request.name],
    [labels.email, request.email],
    [labels.phone, request.phone || "—"],
    [labels.preference, label(f.preference.options, request.preference)],
  ];

  try {
    const attachments = await Promise.all(
      files.map(async (file) => ({ filename: file.name, content: Buffer.from(await file.arrayBuffer()).toString("base64") })),
    );
    const to = process.env.CONTACT_TO_EMAIL || site.contact.email.value;
    const forMaxime = renderMail([contact.emails.toMaxime.intro], rows);
    await sendMail({
      to,
      replyTo: request.email,
      subject: fill(contact.emails.toMaxime.subject, { type: typeLabel, name: request.name }),
      ...forMaxime,
      attachments,
    });

    const visitor = contact.emails.toVisitor;
    const delay = site.contact.responseDelay.missing ? "" : site.contact.responseDelay.value;
    const forVisitor = renderMail(
      [fill(visitor.greeting, { name: request.name }), fill(visitor.intro, { delay: delay || "—" })],
      rows.filter(([field]) => field !== labels.email),
      [visitor.signature],
    );
    await sendMail({ to: request.email, subject: visitor.subject, ...forVisitor });
  } catch (error) {
    console.error("[contact] Échec de l’envoi", error);
    return { status: "error", message: "server" };
  }

  // Récapitulatif pour /contact/merci : cookie court, jamais dans l’URL.
  (await cookies()).set(RECAP_COOKIE, encodeRecap({ name: request.name.split(" ")[0], type: typeLabel, place: request.place, deadline: deadlineLabel }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/contact/merci",
    maxAge: 600,
  });
  redirect("/contact/merci");
}
