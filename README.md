# TBTrade

TBTrade est une application React + TypeScript de pilotage des opérations
commerciales. Une opération reste rattachée à un dossier unique pendant tout son
cycle de vie : Commercial, Stock, Approvisionnement, Finance, Livraison,
Facturation, Recouvrement, Comptabilité, Direction Générale et clôture.

## Référence fonctionnelle

Le cahier fonctionnel complet est disponible dans
[docs/README_FONCTIONNEL.md](docs/README_FONCTIONNEL.md).

Avant toute modification métier, consulter ce document afin de vérifier :

- le workflow du dossier ;
- les rôles et permissions ;
- les transitions et validations ;
- la traçabilité et les notifications ;
- les conditions de verrouillage, de réouverture et de clôture.

## État actuel

La version actuelle utilise des données de démonstration pour valider l'interface
et le workflow. L'authentification, la base de données, les contrôles backend et
le connecteur Sage 100 doivent être finalisés avant l'utilisation réelle en
production.

Les variables de connexion seront ajoutées lorsque les accès à la base de données
et à Sage 100 seront disponibles.

## Lancement

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Qualité

```bash
npm run lint
```
