import type { Metadata } from "next";
import { ProjectsPage } from "@/components/projects/ProjectsPage";
import { getPages } from "@/lib/content";

const { meta } = getPages().projects;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/projets" },
};

export default function Projets() {
  return <ProjectsPage />;
}
