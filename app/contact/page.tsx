import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/ContactPage";
import { getContact } from "@/lib/content";

const { meta } = getContact();

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return <ContactPage />;
}
