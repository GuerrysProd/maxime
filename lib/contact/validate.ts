/**
 * Règles du formulaire « Démarrer un projet », partagées par le navigateur (validation
 * étape par étape) et la Server Action (contrôle final). Sans dépendance : ce fichier
 * est aussi envoyé au client.
 */

/** Plafond des pièces jointes : une requête vers une fonction Vercel est limitée à 4,5 Mo. */
export const MAX_FILES_MB = 4;
export const MAX_FILES_BYTES = MAX_FILES_MB * 1024 * 1024;
export const MAX_FILES_COUNT = 5;
export const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";
/** Délai minimal entre l’affichage du formulaire et l’envoi (anti-robot). */
export const MIN_FILL_MS = 3000;

export type FieldName =
  | "type"
  | "place"
  | "surface"
  | "budget"
  | "deadline"
  | "message"
  | "files"
  | "name"
  | "email"
  | "phone"
  | "preference"
  | "consent";

/** Clé du message d’erreur dans contact.json → form.errors. */
export type ErrorKey =
  | "type"
  | "place"
  | "surface"
  | "budget"
  | "deadline"
  | "message"
  | "files"
  | "name"
  | "email"
  | "phone"
  | "preference"
  | "phoneNeeded"
  | "consent";

export type FieldErrors = Partial<Record<FieldName, ErrorKey>>;

/** Champs de chaque étape, dans l’ordre (étapes 1 à 5). */
export const STEP_FIELDS: FieldName[][] = [
  ["type"],
  ["place", "surface"],
  ["budget", "deadline"],
  ["message", "files"],
  ["name", "email", "phone", "preference", "consent"],
];

export interface ProjectRequest {
  type: string;
  place: string;
  surface: string;
  budget: string;
  deadline: string;
  message: string;
  name: string;
  email: string;
  phone: string;
  preference: string;
  consent: boolean;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export interface Choices {
  types: string[];
  budgets: string[];
  deadlines: string[];
  preferences: string[];
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+0-9 ().-]{6,20}$/;
const SURFACE = /^\d{1,6}([.,]\d{1,2})?$/;

export function validate(
  data: ProjectRequest,
  files: FileInfo[],
  choices: Choices,
  only?: FieldName[],
): FieldErrors {
  const errors: FieldErrors = {};
  const check = (field: FieldName, ok: boolean, key: ErrorKey = field as ErrorKey) => {
    if ((!only || only.includes(field)) && !ok && !errors[field]) errors[field] = key;
  };

  check("type", choices.types.includes(data.type));
  check("place", data.place.trim().length > 0 && data.place.length <= 120);
  check("surface", data.surface.trim() === "" || SURFACE.test(data.surface.trim()));
  check("budget", choices.budgets.includes(data.budget));
  check("deadline", choices.deadlines.includes(data.deadline));
  check("message", data.message.trim().length >= 20 && data.message.length <= 5000);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  check(
    "files",
    files.length <= MAX_FILES_COUNT &&
      total <= MAX_FILES_BYTES &&
      files.every((file) => ACCEPTED_TYPES.includes(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name)),
  );
  check("name", data.name.trim().length > 0 && data.name.length <= 120);
  check("email", EMAIL.test(data.email.trim()) && data.email.length <= 200);
  check("phone", data.phone.trim() === "" || PHONE.test(data.phone.trim()));
  check("preference", choices.preferences.includes(data.preference));
  check("phone", !(data.preference === "telephone" && data.phone.trim() === ""), "phoneNeeded");
  check("consent", data.consent);
  return errors;
}

/** Première étape (1 à 5) qui contient une erreur. */
export function firstStepWithError(errors: FieldErrors): number {
  const index = STEP_FIELDS.findIndex((fields) => fields.some((field) => errors[field]));
  return index === -1 ? 5 : index + 1;
}

/** Lecture d’un FormData en demande typée. */
export function readRequest(form: FormData): ProjectRequest {
  const text = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    type: text("type"),
    place: text("place"),
    surface: text("surface"),
    budget: text("budget"),
    deadline: text("deadline"),
    message: text("message"),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    preference: text("preference"),
    consent: text("consent") === "oui",
  };
}
