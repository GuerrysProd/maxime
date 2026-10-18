import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";

export default function Home() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main id={MAIN_ID} style={{ minHeight: "60vh", paddingTop: "var(--header-height)" }} />
    </>
  );
}
