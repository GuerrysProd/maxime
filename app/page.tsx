import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { getHome } from "@/lib/content";

const { meta } = getHome();

export const metadata: Metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomePage heroVariant="origin" />;
}
