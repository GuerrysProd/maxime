"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { HeaderVariant } from "./SiteHeader";
import styles from "./SiteHeader.module.css";

const COMPACT_AFTER = 80;
export const MENU_ID = "menu-mobile";

interface MenuState {
  open: boolean;
  close: () => void;
}

const MenuContext = createContext<MenuState>({ open: false, close: () => {} });
export const useMobileMenu = () => useContext(MenuContext);

/** Partie interactive de l’en-tête : état compact au défilement et ouverture du menu mobile. */
export function HeaderShell({
  variant,
  labels,
  menu,
  children,
}: {
  variant: HeaderVariant;
  labels: { open: string; close: string };
  menu: ReactNode;
  children: ReactNode;
}) {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setCompact(window.scrollY > COMPACT_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  return (
    <MenuContext.Provider value={{ open, close }}>
      <header className={styles.header} data-variant={variant} data-compact={compact || undefined}>
        <div className={`wrap ${styles.bar}`}>
          {children}
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuToggle}
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size={20} />
            <span className="sr-only">{labels.open}</span>
          </button>
        </div>
      </header>
      {menu}
    </MenuContext.Provider>
  );
}
