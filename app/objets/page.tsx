import type { Metadata } from "next";
import { ObjectsPage } from "@/components/objects/ObjectsPage";
import { getPages } from "@/lib/content";

const { meta } = getPages().objects;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/objets" },
};

export default function Objets() {
  return <ObjectsPage />;
}
