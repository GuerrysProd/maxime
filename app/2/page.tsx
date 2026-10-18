import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { getHome } from "@/lib/content";

const { meta } = getHome();

/** Même accueil avec le hero B (brief §3) : non indexé, canonique vers /. */
export const metadata: Metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function HomeHeroB() {
  return <HomePage heroVariant="B" />;
}
