import { expect, test } from "@playwright/test";

test("Projets : filtre synchronisé avec l’URL, compteur annoncé", async ({ page }) => {
  await page.goto("/projets");
  const group = page.getByRole("group", { name: "Filtrer par catégorie" });
  await expect(group.getByRole("button", { name: /Tous/ })).toHaveAttribute("aria-pressed", "true");

  await group.getByRole("button", { name: /Paysage/ }).click();
  await expect(page).toHaveURL(/categorie=paysage/);
  await expect(page.locator("[aria-live='polite']").filter({ hasText: /projet/ })).toHaveText(/1 projet/);
  await expect(page.getByRole("heading", { level: 2, name: /Château Gasqui/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /Duplex Pralong/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Index" }).click();
  await expect(page).toHaveURL(/vue=index/);
});

test("Projets : l’URL restaure le filtre et la vue", async ({ page }) => {
  await page.goto("/projets?categorie=lieux-collectifs&vue=index");
  await expect(page.getByRole("button", { name: /Lieux collectifs/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Index" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: /Agora/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Bâtiment S/ }).first()).toBeVisible();
});

test("Avant / après : clavier par pas de 5, valeur annoncée", async ({ page }) => {
  await page.goto("/projets/duplex-pralong");
  const slider = page.getByRole("slider", { name: "Comparer avant et après" });
  await expect(slider).toHaveAttribute("aria-valuetext", "Avant à 50 %, après à 50 %");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuetext", "Avant à 55 %, après à 45 %");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuetext", "Avant à 45 %, après à 55 %");
});

test("Zonage Bâtiment S : chaque pôle est accessible sans survol", async ({ page }) => {
  await page.goto("/projets/batiment-s");
  const zones = page.getByRole("list", { name: "Pôles du projet" });
  await zones.getByRole("button", { name: "Espace sportif" }).click();
  await expect(zones.getByRole("button", { name: "Espace sportif" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 3, name: "Espace sportif" })).toBeVisible();
  await zones.getByRole("button", { name: "Vue générale" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "Un volume commun à activer." })).toBeVisible();
});

test("Zonage Bâtiment S : le survol du bâtiment ouvre un pôle", async ({ page, isMobile }) => {
  test.skip(isMobile, "survol à la souris uniquement");
  await page.goto("/projets/batiment-s");
  const stage = page.getByRole("group", { name: "Isométrie interactive des espaces du projet" });
  await stage.scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle"); // masques construits
  const box = (await stage.boundingBox())!;
  // Balayage du bâtiment : au moins un pôle doit s’ouvrir.
  const titles = new Set<string>();
  for (let x = 0.2; x <= 0.8; x += 0.05) {
    for (let y = 0.3; y <= 0.75; y += 0.05) {
      await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
      titles.add((await page.getByRole("heading", { level: 3 }).filter({ hasText: /Espace|Passerelle|Entrée/ }).allTextContents()).join());
    }
  }
  expect([...titles].filter(Boolean).length).toBeGreaterThan(0);
});

test("Fiche : sommaire des chapitres et projet suivant", async ({ page, isMobile }) => {
  test.skip(isMobile, "sommaire masqué sur mobile");
  await page.goto("/projets/duplex-pralong");
  const nav = page.getByRole("navigation", { name: "Chapitres du projet" });
  await expect(nav.locator("[aria-current]")).toHaveText(/Le projet/);
  await nav.getByRole("link", { name: /Mobilier/ }).click();
  await expect(nav.locator("[aria-current]")).toHaveText(/Mobilier/);
  await expect(page.getByRole("link", { name: /Perchée/ }).last()).toHaveAttribute("href", "/projets/perchee");
});

test("Redirections 301 des anciennes adresses", async ({ request }) => {
  const pairs: [string, string][] = [
    ["/pralong.html", "/projets/duplex-pralong"],
    ["/perchee.html", "/projets/perchee"],
    ["/batiment-s.html", "/projets/batiment-s"],
    ["/index.html", "/"],
  ];
  for (const [from, to] of pairs) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(301);
    expect(new URL(response.headers()["location"], "http://x").pathname).toBe(to);
  }
});
