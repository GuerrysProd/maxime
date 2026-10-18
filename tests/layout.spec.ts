import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

/** Aucune page ne doit défiler horizontalement (brief : mobile 390 px sans débordement). */
for (const route of ROUTES) {
  test(`pas de débordement horizontal — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const { scroll, viewport } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(viewport);
  });
}
