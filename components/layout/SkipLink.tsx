import { getUi } from "@/lib/content";
import styles from "./SkipLink.module.css";

export const MAIN_ID = "contenu";

export function SkipLink() {
  return (
    <a className={styles.skip} href={`#${MAIN_ID}`}>
      {getUi().skipLink}
    </a>
  );
}
