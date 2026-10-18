import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./ArrowLink.module.css";

interface ArrowLinkProps {
  href: string;
  children: ReactNode;
  direction?: "right" | "up-right" | "none";
  className?: string;
}

/** Lien souligné avec flèche (brief §5). */
export function ArrowLink({ href, children, direction = "right", className }: ArrowLinkProps) {
  return (
    <Link className={[styles.link, className].filter(Boolean).join(" ")} href={href}>
      {children}
      {direction !== "none" && (
        <Icon name={direction === "right" ? "arrow-right" : "arrow-up-right"} className={styles.icon} />
      )}
    </Link>
  );
}
