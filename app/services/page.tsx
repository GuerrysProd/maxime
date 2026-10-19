import type { Metadata } from "next";
import { ServicesPage } from "@/components/services/ServicesPage";
import { getPages } from "@/lib/content";

const { meta } = getPages().services;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/services" },
};

export default function Services() {
  return <ServicesPage />;
}
