# Site de Maxime Vallat

Next.js (App Router) + TypeScript. Le contexte complet (sources, règles de contenu, design system, décisions) est dans `../CLAUDE.md`.

```bash
npm install
npm run images   # importe les images référencées par content/ depuis ../images-par-projet/
npm run dev      # http://localhost:3000
npm run check    # lint + types + build + tests (axe, mouvement réduit)
npm run captures -- etape-2   # captures maquette / site dans .captures/etape-2/
```

- Contenus : `content/fr/*.json`, lus uniquement via `lib/content.ts`.
- Images : `public/images/` et `content/media-manifest.json` sont générés par `scripts/import-images.mjs`.
