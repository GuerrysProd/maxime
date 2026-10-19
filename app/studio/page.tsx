import type { Metadata } from "next";
import { StudioPage } from "@/components/studio/StudioPage";
import { getStudio } from "@/lib/content";

const { meta } = getStudio();

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/studio" },
};

export default function Studio() {
  return <StudioPage />;
}
