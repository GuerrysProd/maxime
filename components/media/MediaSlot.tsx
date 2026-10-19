import type { MediaItem } from "@/lib/content";
import { Picture } from "./Picture";
import styles from "./MediaSlot.module.css";

/**
 * Emplacement média d’une fiche (SOURCES-REELLES §8). Aujourd’hui : une image.
 * Prévu sans rien installer : vidéo, séquence d’images pilotée au défilement, scène 3D
 * (React Three Fiber). Tant que le lecteur correspondant n’existe pas, l’affiche (poster)
 * est montrée ; le futur composant client se branchera ici et se chargera à la demande.
 */
export function MediaSlot({ item, sizes, preload }: { item: MediaItem; sizes: string; preload?: boolean }) {
  switch (item.type) {
    case "image":
      return <Picture image={item.image} sizes={sizes} preload={preload} />;
    case "video":
      return (
        <video className={styles.video} poster={item.poster.src} preload="none" controls playsInline>
          <source src={item.src} />
        </video>
      );
    case "sequence":
    case "scene3d":
      return (
        <div className={styles.pending} data-media-type={item.type}>
          <Picture image={item.poster} sizes={sizes} preload={preload} />
        </div>
      );
  }
}
