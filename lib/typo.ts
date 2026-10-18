/**
 * Typographie française appliquée à tout le contenu chargé (brief §1) :
 * apostrophe ’, espaces insécables dans « », avant : ; ? ! et entre un nombre et son unité.
 * Idempotente : on peut l’appliquer plusieurs fois au même texte.
 */
const NBSP = " ";

/** Clés dont la valeur n’est pas du texte affiché (chemins, identifiants…). */
const SKIPPED_KEYS = new Set([
  "_note",
  "src",
  "href",
  "slug",
  "id",
  "type",
  "kind",
  "position",
  "positionMobile",
  "project",
  "pieces",
  "categories",
  "template",
  "code",
  "count",
  "frieze",
]);

export function frTypo(text: string): string {
  return text
    .replace(/(\p{L})'(\p{L})/gu, "$1’$2")
    .replace(/«[  ]?/g, `«${NBSP}`)
    .replace(/[  ]?»/g, `${NBSP}»`)
    .replace(/[  ]([:;?!])/g, `${NBSP}$1`)
    .replace(/(\d)[  ](h|min|m²|m|cm|mm|km|kg|€|%)(?=$|[\s.,;:!?)»])/g, `$1${NBSP}$2`);
}

/** Applique frTypo à toutes les chaînes d’un arbre JSON, sauf aux clés techniques. */
export function applyTypo<T>(value: T, key?: string): T {
  if (key && SKIPPED_KEYS.has(key)) return value;
  if (typeof value === "string") return frTypo(value) as T;
  if (Array.isArray(value)) return value.map((item) => applyTypo(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, applyTypo(v, k)]),
    ) as T;
  }
  return value;
}

/** Remplace {cle} par la valeur correspondante. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}
