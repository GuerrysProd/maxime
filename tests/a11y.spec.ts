import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function audit(page: import("@playwright/test").Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  for (const v of results.violations) {
    console.log(`[${label}] ${v.impact} — ${v.id} : ${v.help} (${v.nodes.length})`);
    for (const node of v.nodes.slice(0, 3)) console.log(`    ${node.target.join(" ")}`);
  }
  expect(blocking, `violations sérieuses sur ${label}`).toEqual([]);
}

for (const route of ROUTES) {
  test(`axe ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await audit(page, route);
  });

  test(`axe ${route} — page défilée (en-tête compact)`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    await audit(page, `${route} défilée`);
  });
}

test("axe — menu mobile ouvert", async ({ page, isMobile }) => {
  test.skip(!isMobile, "menu mobile uniquement");
  await page.goto("/");
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await audit(page, "menu mobile");
});
