import type { MetadataRoute } from "next";

/** Rien n’est indexé tant que SITE_INDEXABLE ne vaut pas « true » (site de test). */
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_INDEXABLE !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/", disallow: ["/2", "/contact/merci"] } };
}
