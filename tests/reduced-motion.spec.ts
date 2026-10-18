import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

/** « Réduire les animations » doit couper tout mouvement (brief §7). */
test.use({ reducedMotion: "reduce" });

for (const route of ROUTES) {
  test(`aucun mouvement avec prefers-reduced-motion — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    // Défilement complet : déclenche apparitions, parallaxe, en-tête compact.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
    });

    const moving = await page.evaluate(() => {
      const toMs = (value: string) =>
        Math.max(...value.split(",").map((v) => (v.trim().endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000)));
      const offenders: string[] = [];
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
        for (const pseudo of [null, "::before", "::after"] as const) {
          const style = getComputedStyle(el, pseudo);
          const animated = style.animationName !== "none" && toMs(style.animationDuration) > 0 && style.animationPlayState === "running";
          const transitioned = toMs(style.transitionDuration) > 0;
          if (animated || transitioned) {
            offenders.push(`${el.tagName.toLowerCase()}.${el.className}${pseudo ?? ""} anim=${style.animationName} ${style.animationDuration} trans=${style.transitionDuration}`);
          }
        }
      }
      return offenders;
    });
    expect(moving, "éléments encore animés").toEqual([]);

    // Parallaxe coupée et contenus affichés d’emblée.
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-parallax]"))
        .filter((el) => {
          const style = getComputedStyle(el);
          return Number(style.opacity) < 1 || (style.transform !== "none" && style.transform !== "matrix(1, 0, 0, 1, 0, 0)");
        })
        .map((el) => el.outerHTML.slice(0, 120)),
    );
    expect(hidden, "éléments masqués ou déplacés").toEqual([]);
  });
}

test("menu mobile : focus piégé, Échap ferme et rend le focus", async ({ page, isMobile }) => {
  test.skip(!isMobile, "menu mobile uniquement");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Ouvrir le menu" });
  await toggle.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Fermer le menu" })).toBeFocused();

  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
});
