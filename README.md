# Souffle

Web app mobile pour **réduire puis arrêter de fumer**. Une seule page HTML, sans serveur : les données sont enregistrées dans le navigateur (et synchronisées dans le compte claude.ai quand la page y est publiée).

Le détail des fonctions est dans [`cahier-des-charges.md`](cahier-des-charges.md).

## Fonctions

- Mode **réduction** (objectif quotidien qui baisse) ou **arrêt total** (compteur depuis la dernière cigarette)
- Suivi des **substituts** : patchs, gommes et cigarette électronique
- **SOS** envie : respiration 3 min, séance « bouger » 7 min ou 3 min
- **Mission du jour**, préparation du **jour J**, **symptômes de manque** avec conseils
- **Petit point** régulier avec conseil et rythme adaptatif
- **Pause fun** : anecdotes, quiz, confettis (lien `#quiz`)
- Stats, 51 badges, étapes santé, mode sombre

## Structure

| Fichier | Rôle |
|---|---|
| `src/page.html` | Structure et design (HTML + CSS) |
| `src/app1.js` | Données, calculs, missions, badges |
| `src/app2.js` | Affichage et actions |
| `build.py` | Assemble le tout dans `index.html` |
| `index.html` | La page finale, à publier |
| `tests/` | Tests dans un vrai navigateur (Playwright) |

## Construire et tester

```bash
python3 build.py                 # produit index.html
node --check app.bundle.js       # vérifie la syntaxe
node tests/run.js                # parcours complets (Playwright + Chrome requis)
```

Pour modifier l'app, change `src/*`, relance `python3 build.py`, puis republie `index.html`.

## Avertissement

Souffle est un outil d'accompagnement, pas un avis médical. Il ne conseille aucun dosage de substituts nicotiniques. Pour de l'aide : Tabac Info Service, **39 89** (appel gratuit).
