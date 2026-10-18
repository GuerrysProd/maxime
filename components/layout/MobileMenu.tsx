"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { MENU_ID, useMobileMenu } from "./HeaderShell";
import styles from "./MobileMenu.module.css";

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Menu plein écran (écran 02b, brief §5) : fondu 300 ms, focus piégé, Échap ferme,
 * le focus revient au bouton ≡ à la fermeture.
 */
export function MobileMenu({
  brand,
  title,
  closeLabel,
  children,
}: {
  brand: ReactNode;
  title: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const { open, close } = useMobileMenu();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    closeRef.current?.focus();
    document.documentElement.dataset.menuOpen = "true";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    // Le menu n’existe qu’en mise en page mobile : on le ferme si la fenêtre s’élargit.
    const desktop = window.matchMedia("(min-width: 901px)");
    const onResize = () => desktop.matches && close();

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      delete document.documentElement.dataset.menuOpen;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [open, close]);

  return (
    <div
      id={MENU_ID}
      ref={panelRef}
      className={`${styles.menu} on-dark`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-open={open || undefined}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) close();
      }}
    >
      <div className={styles.top}>
        {brand}
        <button ref={closeRef} type="button" className={styles.close} onClick={close}>
          <Icon name="close" size={18} />
          <span className="sr-only">{closeLabel}</span>
        </button>
      </div>
      {children}
    </div>
  );
}
