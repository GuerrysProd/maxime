import { expect, test, type Page } from "@playwright/test";

/** Adresse IP propre à chaque test : la limite de débit (5 envois / 10 min) ne se partage pas. */
test.beforeEach(async ({ page }) => {
  const ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
});

const next = (page: Page) => page.getByRole("button", { name: /Continuer/ }).click();
/** Les boutons radio sont masqués visuellement : on clique sur leur étiquette. */
const choose = (page: Page, label: string) => page
    .getByRole("radio", { name: new RegExp(`^${label}`) })
    .locator("xpath=..")
    .click();

async function fillUntilContact(page: Page) {
  await choose(page, "Une résidence");
  await next(page);
  await page.getByLabel("Lieu du projet").fill("Hyères");
  await page.getByLabel(/Surface approximative/).fill("120");
  await next(page);
  await choose(page, "À définir ensemble");
  await choose(page, "Dans l’année");
  await next(page);
  await page.getByLabel("Votre message").fill("Rénovation d’une maison de famille, cuisine et séjour.");
  await next(page);
  await page.getByLabel("Nom").fill("Camille Essai");
  await page.getByRole("textbox", { name: "E-mail" }).fill("camille@example.com");
  await choose(page, "E-mail");
  await page.getByLabel(/J’accepte/).check();
}

test("Contact : validation étape par étape, retour sans perte", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByText("Étape 1 / 5")).toBeVisible();

  await next(page);
  await expect(page.getByText("Choisissez le type de votre projet.")).toBeVisible();
  await expect(page.getByRole("radio", { name: /Une résidence/ })).toBeFocused();

  await choose(page, "Une résidence");
  await expect(page.getByText("Choisissez le type de votre projet.")).toHaveCount(0);
  await next(page);
  await expect(page.getByText("Étape 2 / 5")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /Où, et sur quelle surface/ })).toBeFocused();

  await page.getByLabel(/Surface approximative/).fill("cent");
  await next(page);
  await expect(page.getByText("Indiquez le lieu du projet.")).toBeVisible();
  await expect(page.getByText("Indiquez une surface en chiffres, ou laissez vide.")).toBeVisible();
  await expect(page.getByLabel("Lieu du projet")).toBeFocused();
  await expect(page.getByLabel("Lieu du projet")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Lieu du projet").fill("Courchevel");
  await page.getByLabel(/Surface approximative/).fill("");
  await next(page);
  await expect(page.getByText("Étape 3 / 5")).toBeVisible();

  await page.getByRole("button", { name: /Retour/ }).click();
  await expect(page.getByLabel("Lieu du projet")).toHaveValue("Courchevel");
});

test("Contact : pré-remplissage depuis le bandeau d’appel et les fiches objets", async ({ page }) => {
  await page.goto("/contact?type=objet&piece=applique-pinturault");
  await expect(page.getByRole("radio", { name: /Une pièce sur mesure/ })).toBeChecked();
  await next(page);
  await page.getByLabel("Lieu du projet").fill("Lyon");
  await next(page);
  await choose(page, "À définir ensemble");
  await choose(page, "Je me renseigne");
  await next(page);
  await expect(page.getByLabel("Votre message")).toHaveValue(/Pièce concernée.*Applique Pinturault/);
});

test("Contact : rappel par téléphone sans numéro refusé", async ({ page }) => {
  await page.goto("/contact");
  await fillUntilContact(page);
  await choose(page, "Téléphone");
  await page.getByRole("button", { name: /Envoyer ma demande/ }).click();
  await expect(page.getByText("Indiquez un numéro pour être rappelé par téléphone.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Téléphone/ })).toBeFocused();
});

test("Contact : envoi complet puis confirmation avec récapitulatif", async ({ page }) => {
  await page.goto("/contact");
  await fillUntilContact(page);
  await page.waitForTimeout(3100); // délai minimal anti-robot
  await page.getByRole("button", { name: /Envoyer ma demande/ }).click();

  await expect(page).toHaveURL(/\/contact\/merci$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Merci, Camille/);
  const recap = page.locator("dl");
  await expect(recap).toContainText("Une résidence");
  await expect(recap).toContainText("Hyères");
  await expect(recap).toContainText("Dans l’année");
  // Aucune donnée personnelle dans l’adresse.
  expect(page.url()).not.toMatch(/Camille|example/);
});

test("Contact : champ piège rempli, envoi refusé", async ({ page }) => {
  await page.goto("/contact");
  await fillUntilContact(page);
  await page.locator("input[name='website']").evaluate((input: HTMLInputElement) => (input.value = "https://spam.example"));
  await page.waitForTimeout(3100);
  await page.getByRole("button", { name: /Envoyer ma demande/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "La demande n’a pas pu être envoyée" })).toBeVisible();
  await expect(page).toHaveURL(/\/contact$/);
});

test("Confirmation sans demande : message générique, non indexée", async ({ page }) => {
  await page.goto("/contact/merci");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Merci\.$/);
  await expect(page.locator("dl")).toHaveCount(0);
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
});
