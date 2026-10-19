import { expect, test } from "@playwright/test";

const URL = "/projets/chateau-gasqui";

test("Gasqui : compteurs rendus côté serveur avec leur valeur finale", async ({ request }) => {
  const html = await (await request.get(URL)).text();
  expect(html).toContain("421 m²");
  expect(html).toContain("≈ 190");
  expect(html).toContain("Conception effectuée en étroite collaboration avec Sergeant Paysage.");
});

test("Gasqui : plan en calques — chaque étape ajoute ses calques, au clic comme au défilement", async ({ page }) => {
  await page.goto(URL);
  const steps = page.getByRole("list", { name: "Étapes du plan" });
  const counter = page.getByText(/Calques visibles/);
  await expect(counter).toHaveText(/3 \/ 19/);

  await steps.getByRole("button", { name: /Les chemins et les sols/ }).click();
  await expect(steps.getByRole("button", { name: /Les chemins et les sols/ })).toHaveAttribute("aria-pressed", "true");
  await expect(counter).toHaveText(/11 \/ 19/);

  await steps.getByRole("button", { name: /L’ombrière et le mobilier/ }).click();
  await expect(counter).toHaveText(/16 \/ 19/);

  // Défilement : la dernière étape devient active.
  await steps
    .getByRole("button", { name: /La restanque herborée/ })
    .evaluate((button) => button.scrollIntoView({ block: "start" }));
  await expect(steps.getByRole("button", { name: /La restanque herborée/ })).toHaveAttribute("aria-pressed", "true");
});

test("Gasqui : quatre jardins, jour / nuit et été / hiver au clavier", async ({ page }) => {
  await page.goto(URL);
  const gardens = page.getByRole("group", { name: "Choisir un jardin" });
  await gardens.getByRole("button", { name: /Jardin exotique/ }).click();
  await expect(page.getByRole("heading", { level: 3, name: "Jardin exotique" })).toBeVisible();

  const moment = page.getByRole("group", { name: "Moment de la journée" });
  await moment.getByRole("button", { name: "Nuit" }).focus();
  await page.keyboard.press("Enter");
  await expect(moment.getByRole("button", { name: "Nuit" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("img", { name: /guirlandes allumées/ })).toBeVisible();

  const season = page.getByRole("group", { name: "Saison" });
  await season.getByRole("button", { name: "Hiver" }).click();
  await expect(page.getByText("En hiver, la toile est retirée", { exact: false })).toBeVisible();
  await expect(page.getByRole("img", { name: /solstice d’hiver/ })).toBeVisible();
});

test("Gasqui : herbier filtré, compteur annoncé", async ({ page }) => {
  await page.goto(URL);
  const filters = page.getByRole("group", { name: "Filtrer la palette" });
  const herbier = page.locator("#herbier");
  await expect(herbier.getByRole("listitem")).toHaveCount(30);

  await filters.getByRole("button", { name: /Arbres/ }).click();
  await expect(filters.getByRole("button", { name: /Arbres/ })).toHaveAttribute("aria-pressed", "true");
  await expect(herbier.locator("[aria-live='polite']")).toHaveText(/8 essences/);
  await expect(herbier.getByRole("heading", { level: 3 })).toHaveCount(8);

  await filters.getByRole("button", { name: /Exotiques/ }).click();
  await expect(herbier.getByRole("heading", { level: 3, name: "Kniphofia" })).toBeVisible();
  await expect(herbier.getByText("Juin à septembre").first()).toBeVisible();
});
