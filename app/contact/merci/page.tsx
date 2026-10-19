import type { Metadata } from "next";
import { ConfirmationPage } from "@/components/contact/ConfirmationPage";
import { getContact } from "@/lib/content";

const { meta } = getContact().confirmation;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  robots: { index: false, follow: true },
};

export default function Merci() {
  return <ConfirmationPage />;
}
