import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "outline" | "light";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "md" | "lg";
  icon?: "arrow-right";
  block?: boolean;
  className?: string;
}

/** Action principale en pilule (brief §5) : hauteur 48, 52 sur mobile. */
export function Button({ href, children, variant = "primary", size = "md", icon, block, className }: ButtonProps) {
  const classes = [styles.button, styles[variant], size === "lg" && styles.lg, block && styles.block, className]
    .filter(Boolean)
    .join(" ");
  return (
    <Link className={classes} href={href}>
      {children}
      {icon && <Icon name={icon} className={styles.icon} />}
    </Link>
  );
}
