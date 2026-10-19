/** Récapitulatif affiché sur /contact/merci, transmis par un cookie court (pas par l’URL). */
export const RECAP_COOKIE = "mv-demande";

export interface Recap {
  name: string;
  type: string;
  place: string;
  deadline: string;
}

export function encodeRecap(recap: Recap): string {
  return Buffer.from(JSON.stringify(recap), "utf8").toString("base64url");
}

export function decodeRecap(value: string | undefined): Recap | undefined {
  if (!value) return undefined;
  try {
    const data = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (typeof data?.name === "string" && typeof data?.type === "string") {
      return {
        name: data.name.slice(0, 60),
        type: String(data.type).slice(0, 80),
        place: String(data.place ?? "").slice(0, 120),
        deadline: String(data.deadline ?? "").slice(0, 60),
      };
    }
  } catch {
    // cookie illisible : confirmation générique
  }
  return undefined;
}
