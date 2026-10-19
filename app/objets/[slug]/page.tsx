import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ObjectPage } from "@/components/objects/ObjectPage";
import { getObject, getObjects } from "@/lib/content";

export function generateStaticParams() {
  return getObjects().map((piece) => ({ slug: piece.slug }));
}

export async function generateMetadata({ params }: PageProps<"/objets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const piece = getObject(slug);
  if (!piece) return {};
  const first = piece.media[0];
  const image = first.type === "image" ? first.image : first.poster;
  const description = piece.summary && !piece.summary.includes("[À COMPLÉTER") ? piece.summary : `${piece.name} — ${piece.type}`;
  return {
    title: piece.name,
    description,
    alternates: { canonical: `/objets/${piece.slug}` },
    openGraph: { title: piece.name, description, images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] },
  };
}

export default async function ObjectRoute({ params }: PageProps<"/objets/[slug]">) {
  const { slug } = await params;
  const piece = getObject(slug);
  if (!piece) notFound();
  return <ObjectPage piece={piece} />;
}
