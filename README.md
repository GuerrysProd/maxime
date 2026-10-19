# Site de Maxime Vallat

Next.js (App Router) + TypeScript. Le contexte complet (sources, règles de contenu, design system, décisions) est dans `../CLAUDE.md`.

## Lancer le site en local

Node.js 22 ou plus récent.

```bash
npm install
npm run dev              # http://localhost:3000
npm run dev -- -p 3001   # sur un autre port si le 3000 est pris
```

Version de production, plus fidèle au site en ligne :

```bash
npm run build
npm start
```

Variables d’environnement : copier `.env.example` en `.env.local` et compléter. Sans valeur, tout fonctionne en local : les e-mails du formulaire sont écrits dans la console, la prise de rendez-vous affiche des créneaux d’exemple.

## Commandes utiles

```bash
npm run images                 # importe les images référencées par content/ depuis ../images-par-projet/
npm run check                  # lint + types + build + tests (axe, mouvement réduit)
npm run captures -- etape-2    # captures maquette / site dans .captures/etape-2/
```

- Contenus : `content/fr/*.json`, lus uniquement via `lib/content.ts`.
- Images : `public/images/` et `content/media-manifest.json` sont générés par `scripts/import-images.mjs` et versionnés (le serveur n’a pas accès aux originaux).

## Mise en ligne (site de test : maxime.projectoi.fr)

Hébergement Node.js Hostinger, relié au dépôt GitHub : chaque `git push` sur `main` relance la construction (`npm run build`) puis le serveur (`next start`).

Réglages de l’hébergement : application `next`, Node.js 22, script `build`, dossier de sortie `.next`.

Variables à définir dans hPanel (une nouvelle construction est nécessaire après chaque modification) :

| Variable | Site de test |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://maxime.projectoi.fr` |
| `SITE_INDEXABLE` | vide : robots.txt et balise robots bloquent l’indexation |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | à définir pour que le formulaire envoie de vrais e-mails |
| `CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID`, `NEXT_PUBLIC_BOOKING_URL` | quand l’outil de rendez-vous est choisi |

Mettre à jour le site : modifier les contenus (`content/fr/`) ou les images (`npm run images`), vérifier avec `npm run check`, puis committer et pousser.
