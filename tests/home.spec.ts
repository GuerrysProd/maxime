import { expect, test } from "@playwright/test";
import { FUTURE_ROUTES, ROUTES } from "./routes";

const isFutureRoute = (url: string) => FUTURE_ROUTES.some((prefix) => new URL(url).pathname.startsWith(prefix));

for (const route of ROUTES) {
  test(`aucune erreur console — ${route}`, async ({ page }) => {
    const errors: string[] = [];
    const missing: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => response.status() >= 400 && missing.push(response.url()));
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
    // Seules les pages des étapes suivantes peuvent encore manquer (liens préchargés).
    expect(missing.filter((url) => !isFutureRoute(url))).toEqual([]);
  });
}

test("hero d’origine : l’aperçu suit la ligne survolée ou focalisée", async ({ page, isMobile }) => {
  test.skip(isMobile, "pas d’aperçu sur mobile");
  await page.goto("/");
  const index = page.getByRole("heading", { name: "Index" }).locator("xpath=../..");
  const rows = index.getByRole("link");
  await expect(rows).toHaveCount(7);

  await rows.nth(3).hover();
  await expect(rows.nth(3)).toHaveAttribute("data-active", "true");
  const preview = index.locator("[aria-hidden='true'][data-visible]");
  await expect(preview).toBeVisible();

  // Au clavier : la ligne focalisée devient active, l’aperçu se place à sa hauteur.
  await rows.nth(5).focus();
  await expect(rows.nth(5)).toHaveAttribute("data-active", "true");
  const top = await preview.evaluate((el) => parseFloat((el as HTMLElement).style.top));
  expect(top).toBeGreaterThan(5 * 54 - 80);

  // Hors de la liste : l’aperçu disparaît, les liens restent lisibles.
  await page.mouse.move(10, 10);
  await rows.nth(5).blur();
  await index.hover({ position: { x: 5, y: 5 } });
  await page.mouse.move(10, 10);
  await expect(page.getByRole("link", { name: /Rolex Retail Express/ }).first()).toBeVisible();
});

test("hero B : survol ou focus d’une ligne change l’image et la légende", async ({ page, isMobile }) => {
  test.skip(isMobile, "pas de changement d’image au toucher");
  await page.goto("/2");
  const caption = page.locator("figcaption");
  await expect(caption).toContainText("01 / 07");
  await page.getByRole("link", { name: /Alta/ }).first().hover();
  await expect(caption).toContainText("03 / 07");
  await expect(caption).toContainText("Alta, Alpes");
  await page.getByRole("link", { name: /Agora/ }).first().focus();
  await expect(caption).toContainText("05 / 07");
});

test("/2 n’est pas indexée et pointe vers / en canonique", async ({ page }) => {
  await page.goto("/2");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
});

test("FAQ : un seul panneau ouvert à la fois", async ({ page }) => {
  await page.goto("/");
  const buttons = page.locator("button[aria-controls]").filter({ hasText: "?" });
  await expect(buttons.first()).toHaveAttribute("aria-expanded", "true");
  await buttons.nth(1).click();
  await expect(buttons.nth(1)).toHaveAttribute("aria-expanded", "true");
  await expect(buttons.first()).toHaveAttribute("aria-expanded", "false");
  const opened = await page.locator("button[aria-expanded='true']").filter({ hasText: "?" }).count();
  expect(opened).toBe(1);
});
