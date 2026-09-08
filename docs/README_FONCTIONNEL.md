# TBTrade — README Fonctionnel et Workflow Métier

## 1. Objectif du document

Ce document décrit le **fonctionnement complet de l’application TBTrade**, depuis la source des données jusqu’à la clôture d’un dossier.

Il doit être utilisé par **OpenClaw comme source de vérité fonctionnelle** pour comprendre :

- le contexte métier ;
- les rôles utilisateurs ;
- les étapes du workflow ;
- les règles de gestion ;
- les statuts d’un dossier ;
- les responsabilités de chaque département ;
- les transitions entre services ;
- les validations obligatoires ;
- la logique de verrouillage et de réouverture ;
- la gestion des notifications ;
- la gestion documentaire ;
- la synchronisation avec Sage 100 ;
- les contrôles nécessaires avant clôture.

> Principe fondamental : **une opération commerciale = un dossier TBTrade unique**.

---

# 2. Contexte métier

TBTrade est une société spécialisée dans la **commercialisation de téléphones, accessoires et produits technologiques** auprès de grands revendeurs / grossistes.

Exemples de clients :

- MyTek ;
- Tunisianet ;
- SpaceNet ;
- autres revendeurs et grossistes.

L’entreprise possède plusieurs départements qui interviennent sur une même opération :

- Direction Générale ;
- Commercial ;
- Finance ;
- Comptabilité ;
- Approvisionnement ;
- Stock / Inventaire.

L’objectif de TBTrade est de supprimer les échanges dispersés entre services et de remplacer les traitements manuels par un **workflow centralisé basé sur le dossier**.

---

# 3. Principe général de l’application

Chaque opération doit suivre la logique suivante :

```text
SOURCE DE DONNÉES
        ↓
CRÉATION DU DOSSIER TBTRADE
        ↓
AFFECTATION
        ↓
COMMERCIAL
        ↓
CONTRÔLE STOCK
        ↓
APPROVISIONNEMENT SI NÉCESSAIRE
        ↓
FINANCE
        ↓
PRÉPARATION / LIVRAISON
        ↓
FACTURATION
        ↓
RECOUVREMENT
        ↓
COMPTABILITÉ
        ↓
CONTRÔLE FINAL
        ↓
DIRECTION GÉNÉRALE
        ↓
CLÔTURE
```

Chaque étape doit enregistrer :

- l’utilisateur ;
- le département ;
- la date et l’heure ;
- l’action réalisée ;
- l’ancien statut ;
- le nouveau statut ;
- les observations ;
- les documents ajoutés ;
- les éventuelles validations ou refus.

---

# 4. Source principale des données

La source principale de données métier est **Sage 100**.

TBTrade doit pouvoir consulter ou synchroniser, selon les possibilités techniques :

- clients ;
- fournisseurs ;
- articles ;
- références produits ;
- prix ;
- quantités en stock ;
- dépôts ;
- commandes ;
- factures ;
- bons de livraison ;
- règlements ;
- soldes clients ;
- soldes fournisseurs ;
- écritures comptables ;
- données utiles à l’inventaire.

## 4.1. Principe de synchronisation

Le fonctionnement recommandé est :

```text
SAGE 100
   ↓
Synchronisation / Connecteur
   ↓
Base TBTrade
   ↓
Workflow TBTrade
```

TBTrade ne doit pas modifier directement une donnée critique de Sage sans mécanisme de contrôle.

Chaque donnée importée depuis Sage doit garder son identifiant d’origine afin d’éviter les doublons.

Exemples :

```text
sage_client_id
sage_product_id
sage_invoice_id
sage_supplier_id
sage_order_id
```

---

# 5. Le dossier TBTrade

Le dossier est l’élément central de l’application.

Exemple :

```text
Dossier : TB-2026-000154
Type : Vente
Client : MyTek
Commercial : Ahmed
Montant : 185 000 DT
Date de création : 08/09/2026
Statut : En cours
Étape actuelle : Vérification stock
Responsable actuel : Approvisionnement
```

## 5.1. Numéro de dossier

Chaque dossier doit avoir un identifiant unique.

Format recommandé :

```text
TB-AAAA-NNNNNN
```

Exemple :

```text
TB-2026-000154
```

Le numéro du dossier doit rester identique pendant toute la vie de l’opération.

---

# 6. Onglets d’un dossier

Un dossier doit contenir les sections suivantes :

1. Résumé
2. Client
3. Commercial
4. Produits
5. Stock
6. Approvisionnement
7. Finance
8. Livraison
9. Facturation
10. Recouvrement
11. Comptabilité
12. Documents
13. Tâches
14. Observations
15. Historique

L’utilisateur ne doit pas être obligé d’ouvrir plusieurs modules séparés pour comprendre une opération.

---

# 7. Rôles utilisateurs

## 7.1. Direction Générale

La Direction Générale peut :

- créer un dossier ;
- affecter un dossier ;
- modifier l’affectation ;
- consulter tous les dossiers ;
- consulter tous les départements ;
- ajouter des observations ;
- demander une correction ;
- valider une opération ;
- refuser une opération ;
- clôturer un dossier ;
- réouvrir un dossier clôturé ;
- consulter les KPI ;
- consulter les dossiers bloqués ;
- voir tout l’historique ;
- consulter les documents.

La Direction Générale est le seul rôle pouvant réouvrir un dossier clôturé.

---

## 7.2. Commercial

Le Commercial intervient principalement sur :

- les clients ;
- les commandes clients ;
- les prix de vente ;
- les remises ;
- les conditions commerciales ;
- les factures clients ;
- les règlements clients ;
- les échéanciers de recouvrement ;
- les observations commerciales ;
- le suivi des impayés.

Il peut consulter les informations utiles venant de Sage.

Il ne peut pas modifier un dossier verrouillé.

---

## 7.3. Approvisionnement

L’Approvisionnement gère :

- les besoins fournisseurs ;
- les demandes d’achat ;
- les commandes fournisseurs ;
- les références à commander ;
- les quantités ;
- les prix d’achat ;
- les délais ;
- les preuves de passation ;
- les réceptions ;
- la disponibilité des produits ;
- le lien avec le stock.

---

## 7.4. Stock / Inventaire

Le module Stock / Inventaire doit permettre de suivre :

- stock disponible ;
- stock réservé ;
- stock réceptionné ;
- stock sorti ;
- stock par dépôt ;
- quantité théorique ;
- quantité physique ;
- écarts d’inventaire ;
- références produits ;
- éventuellement IMEI / numéros de série.

Pour les téléphones, la gestion des **IMEI / numéros de série** est fortement recommandée.

---

## 7.5. Finance

La Finance gère :

- encaissements ;
- décaissements ;
- trésorerie ;
- engagements fournisseurs ;
- risques clients ;
- validations financières ;
- limites de crédit ;
- échéances ;
- paiements fournisseurs ;
- suivi des flux financiers.

---

## 7.6. Comptabilité

La Comptabilité gère :

- factures ;
- règlements ;
- rapprochement ;
- contrôle des montants ;
- écritures comptables ;
- rapprochement banque / facture / paiement ;
- écarts ;
- validation comptable.

---

# 8. Cycle de vie principal du dossier

Le cycle de vie principal doit rester simple.

Statuts principaux :

```text
NOUVEAU
   ↓
AFFECTÉ
   ↓
EN COURS
   ↓
EN ATTENTE
   ↓
À VALIDER
   ↓
VALIDÉ
   ↓
À CLÔTURER
   ↓
CLÔTURÉ
```

Ne pas créer un statut principal pour chaque département.

Utiliser deux champs séparés :

```text
status
current_step
```

Exemple :

```text
status = EN_COURS
current_step = APPROVISIONNEMENT
```

---

# 9. Étapes possibles du dossier

Le champ `current_step` peut prendre les valeurs suivantes :

```text
COMMERCIAL
STOCK
APPROVISIONNEMENT
FINANCE
LIVRAISON
FACTURATION
RECOUVREMENT
COMPTABILITE
DIRECTION_GENERALE
CLOTURE
```

---

# 10. Workflow détaillé

## Étape 1 — Création du dossier

Le dossier peut être créé :

- automatiquement depuis une donnée provenant de Sage ;
- manuellement par un utilisateur autorisé ;
- à partir d’une commande client.

Lors de la création, TBTrade doit demander au minimum :

- client ;
- type d’opération ;
- commercial responsable ;
- date ;
- produits ;
- quantités ;
- montant estimé ;
- priorité ;
- observations.

Statut initial :

```text
NOUVEAU
```

---

# 11. Étape 2 — Affectation

La Direction Générale ou un responsable autorisé affecte le dossier.

Le dossier passe de :

```text
NOUVEAU
```

à :

```text
AFFECTÉ
```

Une notification est envoyée au responsable concerné.

Exemple :

```text
Nouveau dossier TB-2026-000154 affecté au service Commercial.
```

---

# 12. Étape 3 — Traitement commercial

Le Commercial vérifie :

- client ;
- commande ;
- produits ;
- quantités ;
- prix ;
- remise ;
- conditions de paiement ;
- encours client ;
- factures non payées ;
- limite de crédit ;
- date de livraison souhaitée.

Exemple :

```text
Client : Tunisianet
Encours actuel : 320 000 DT
Factures échues : 85 000 DT
Nouvelle commande : 450 000 DT
```

Si le risque financier est important :

```text
Validation Finance obligatoire
```

---

# 13. Étape 4 — Contrôle du stock

TBTrade vérifie la disponibilité des articles.

Exemple :

```text
Produit                  Demandé   Disponible
------------------------------------------------
iPhone 17 Pro 256 Go      100        65
Samsung S26 Ultra          50        80
AirPods Pro               100       150
```

## 13.1. Si stock suffisant

Le stock nécessaire peut être réservé au dossier.

```text
Stock suffisant
→ Réservation
→ Étape suivante
```

## 13.2. Si stock insuffisant

TBTrade calcule automatiquement :

```text
Quantité demandée
- quantité disponible
= quantité manquante
```

Exemple :

```text
Demandé : 100
Disponible : 65
Manquant : 35
```

Une tâche est automatiquement créée pour Approvisionnement.

---

# 14. Étape 5 — Approvisionnement

Si une quantité est manquante, le service Approvisionnement reçoit le dossier.

Il doit pouvoir renseigner :

- fournisseur ;
- produit ;
- quantité ;
- prix d’achat ;
- montant ;
- délai ;
- date prévue ;
- référence commande fournisseur ;
- document fournisseur ;
- observation.

Exemple :

```text
Fournisseur : Fournisseur X
Quantité : 35
Prix achat : 3 900 DT
Montant : 136 500 DT
Livraison prévue : 15/09/2026
```

Documents possibles :

- devis ;
- bon de commande ;
- confirmation fournisseur ;
- facture fournisseur ;
- bon de réception.

Après passation :

```text
Commande fournisseur passée
```

---

# 15. Étape 6 — Réception fournisseur

À la réception, le service concerné vérifie :

- quantité commandée ;
- quantité reçue ;
- références ;
- état des produits ;
- numéros de série ;
- IMEI ;
- dépôt ;
- écarts.

Exemple :

```text
Commandé : 35
Reçu : 35
Conforme : 35
```

Si réception complète :

```text
Réception complète
```

Si réception partielle :

```text
Réception partielle
```

Le dossier ne doit pas considérer automatiquement la commande comme totalement disponible si la réception est incomplète.

---

# 16. Étape 7 — Mise à jour stock

Après réception :

```text
Stock précédent
+ quantité reçue
= nouveau stock disponible
```

Le stock lié au dossier peut ensuite être réservé.

Le dossier passe à l’étape suivante lorsque la quantité nécessaire est disponible.

---

# 17. Étape 8 — Validation Finance

La Finance vérifie :

## Côté client

- encours ;
- impayés ;
- plafond autorisé ;
- conditions de règlement ;
- échéances ;
- risque.

## Côté fournisseur

- montant à payer ;
- échéance fournisseur ;
- trésorerie disponible ;
- mode de paiement ;
- engagement.

La Finance doit pouvoir choisir :

```text
VALIDER
VALIDER_AVEC_OBSERVATION
REFUSER
```

Un refus doit obligatoirement contenir une observation.

---

# 18. Étape 9 — Préparation de livraison

Lorsque toutes les validations nécessaires sont obtenues :

```text
Stock disponible
→ Préparation
→ Contrôle
→ Livraison
```

Informations à enregistrer :

- date de préparation ;
- utilisateur ;
- dépôt ;
- produits ;
- quantités ;
- IMEI / numéros de série ;
- bon de sortie ;
- bon de livraison.

---

# 19. Étape 10 — Livraison

Le dossier doit suivre :

```text
À PRÉPARER
→ PRÉPARÉ
→ À LIVRER
→ LIVRÉ
```

Documents possibles :

- bon de livraison ;
- preuve de réception ;
- signature client ;
- pièce jointe ;
- liste IMEI.

Après livraison :

```text
current_step = FACTURATION
```

---

# 20. Étape 11 — Facturation

TBTrade doit associer le dossier à la facture correspondante.

Informations :

- numéro facture ;
- date ;
- client ;
- montant HT ;
- TVA ;
- montant TTC ;
- référence Sage ;
- état.

Exemple :

```text
Facture : FC2026-4587
Client : Tunisianet
Montant : 450 000 DT
Dossier : TB-2026-000155
```

Le même dossier doit être conservé.

Ne jamais créer un nouveau dossier uniquement pour la facture.

---

# 21. Étape 12 — Règlement client

Le Commercial peut enregistrer un règlement client.

Exemple :

```text
Montant facture : 450 000 DT
Montant payé : 150 000 DT
Reste : 300 000 DT
```

Calcul automatique obligatoire :

```text
reste_a_recouvrer = montant_facture - total_reglements
```

Le reste ne doit pas être saisi manuellement.

---

# 22. Étape 13 — Plan de recouvrement

Le reste peut être réparti sur :

- 1 échéance ;
- 2 échéances ;
- 3 échéances.

Chaque échéance doit posséder :

```text
montant
date
mode_reglement
statut
montant_paye
date_paiement
```

Exemple :

```text
Échéance 1
Date : 15/10/2026
Montant : 100 000 DT
Mode : Virement

Échéance 2
Date : 15/11/2026
Montant : 100 000 DT
Mode : Chèque

Échéance 3
Date : 15/12/2026
Montant : 100 000 DT
Mode : Traite
```

Règle obligatoire :

```text
Somme des échéances = reste à recouvrer
```

---

# 23. Statuts des échéances

Statuts possibles :

```text
A_VENIR
AUJOURDHUI
EN_RETARD
PARTIELLEMENT_PAYEE
PAYEE
ANNULEE
```

Le statut doit être calculé automatiquement autant que possible.

---

# 24. Notifications de recouvrement

TBTrade peut générer automatiquement des alertes :

```text
J-7
J-3
J
J+1
J+3
J+7
```

Exemple :

```text
Dossier TB-2026-000155
Échéance client de 100 000 DT arrivée à échéance aujourd’hui.
```

Chaque notification doit ouvrir directement le dossier concerné.

---

# 25. Étape 14 — Comptabilité

La Comptabilité contrôle la cohérence entre :

```text
Facture
+
Règlement
+
Banque
+
Écriture comptable
```

Elle doit pouvoir marquer :

```text
RAPPROCHE
ECART_DETECTE
A_VERIFIER
```

Exemple :

```text
Règlement TBTrade : 100 000 DT
Montant bancaire : 98 500 DT
Écart : 1 500 DT
```

Dans ce cas :

```text
ECART_DETECTE
```

et le dossier ne peut pas être clôturé tant que l’écart n’est pas traité.

---

# 26. Conditions de clôture

Un dossier ne doit pas être clôturé simplement parce qu’un utilisateur clique sur un bouton.

TBTrade doit vérifier automatiquement les préconditions.

Exemple de checklist :

```text
[✓] Commande validée
[✓] Stock disponible / livré
[✓] Livraison terminée
[✓] Facture créée
[✓] Montant facturé cohérent
[✓] Règlements saisis
[✓] Échéances réglées
[✓] Aucun reste à recouvrer
[✓] Comptabilité rapprochée
[✓] Documents obligatoires présents
[✓] Aucune tâche ouverte
[✓] Aucune anomalie bloquante
```

Si toutes les conditions sont vraies :

```text
status = A_CLOTURER
```

La Direction Générale peut alors clôturer.

---

# 27. Clôture du dossier

Après clôture :

```text
status = CLOTURE
locked = true
```

Le dossier devient en lecture seule.

Les services suivants ne peuvent plus modifier le dossier :

- Commercial ;
- Finance ;
- Comptabilité ;
- Approvisionnement ;
- Stock.

---

# 28. Réouverture du dossier

Seule la Direction Générale peut réouvrir un dossier.

La réouverture exige obligatoirement :

```text
motif_reouverture
```

Exemple :

```text
Motif : écart détecté sur un règlement client.
```

L’action doit être historisée :

```text
10/09/2026 14:35
Utilisateur : Direction Générale
Action : Réouverture
Motif : écart règlement client
```

Après réouverture :

```text
locked = false
status = EN_COURS
```

Le dossier doit être renvoyé vers l’étape concernée.

---

# 29. Historique obligatoire

Chaque dossier possède un historique non supprimable.

Exemple :

```text
08/09/2026 09:10
Création dossier
Par : Direction Générale

08/09/2026 09:18
Affectation au Commercial
Par : Direction Générale

08/09/2026 10:42
Contrôle commercial terminé
Par : Commercial

08/09/2026 11:10
Stock insuffisant
Manquant : 35 unités

08/09/2026 11:12
Affectation Approvisionnement

09/09/2026 15:30
Commande fournisseur passée

15/09/2026 10:20
Réception fournisseur complète

16/09/2026 09:00
Validation Finance

17/09/2026 14:10
Livraison effectuée

18/09/2026 10:25
Facture associée

15/12/2026 11:30
Dernière échéance payée

16/12/2026 09:45
Rapprochement comptable validé

16/12/2026 15:00
Dossier clôturé
```

---

# 30. Audit Log

Une table d’audit doit enregistrer les actions importantes.

Champs recommandés :

```text
id
user_id
department_id
action
entity_type
entity_id
old_value
new_value
created_at
ip_address
user_agent
```

Les logs d’audit ne doivent pas pouvoir être supprimés par les utilisateurs standards.

---

# 31. Notifications

Types recommandés :

```text
INFORMATION
ACTION_REQUISE
VALIDATION
ECHEANCE
RETARD
URGENT
ANOMALIE
```

Chaque notification doit contenir au minimum :

```text
id
user_id
dossier_id
type
title
message
is_read
created_at
```

Un clic sur une notification doit ouvrir :

```text
/dossiers/{dossier_id}
```

---

# 32. Tâches

Chaque dossier peut générer une ou plusieurs tâches.

Exemple :

```text
Dossier : TB-2026-000155
Tâche : Commander 35 iPhone 17 Pro
Département : Approvisionnement
Responsable : utilisateur X
Date limite : 12/09/2026
Statut : À faire
```

Statuts :

```text
A_FAIRE
EN_COURS
BLOQUEE
TERMINEE
ANNULEE
```

Un dossier ne peut pas être clôturé avec une tâche obligatoire encore ouverte.

---

# 33. Documents

Chaque document doit être rattaché au dossier.

Types possibles :

```text
DEVIS
BON_COMMANDE_CLIENT
BON_COMMANDE_FOURNISSEUR
FACTURE_CLIENT
FACTURE_FOURNISSEUR
BON_LIVRAISON
BON_RECEPTION
PREUVE_PAIEMENT
RELEVE
LISTE_IMEI
AUTRE
```

Métadonnées :

```text
document_id
dossier_id
type
filename
uploaded_by
uploaded_at
version
comment
```

---

# 34. Gestion IMEI / numéros de série

Pour chaque téléphone, si disponible, enregistrer :

```text
imei
serial_number
product_id
supplier_id
purchase_document
stock_location
customer_id
sales_invoice
dossier_id
status
```

Cela permet la traçabilité :

```text
FOURNISSEUR
→ ACHAT
→ RÉCEPTION
→ STOCK
→ LIVRAISON
→ CLIENT
→ FACTURE
→ DOSSIER
```

---

# 35. Gestion du stock

Le stock doit distinguer :

```text
stock_physique
stock_disponible
stock_reserve
stock_en_commande
stock_recu
stock_sorti
```

Règle importante :

```text
stock_disponible = stock_physique - stock_reserve
```

Une réservation doit être liée à un dossier.

---

# 36. Tableau de bord Direction Générale

La DG doit disposer d’un dashboard contenant au minimum :

- nombre de dossiers ouverts ;
- dossiers en retard ;
- dossiers en attente ;
- dossiers à valider ;
- dossiers à clôturer ;
- montant total à recouvrer ;
- montant échu ;
- montant encaissé ;
- engagements fournisseurs ;
- état de trésorerie ;
- dossiers bloqués par département ;
- délai moyen de traitement ;
- taux de clôture ;
- top clients débiteurs ;
- top commerciaux ;
- commandes fournisseur en retard ;
- anomalies comptables.

---

# 37. Principe "Prochaine action"

Chaque dossier doit indiquer clairement :

```text
statut
étape actuelle
responsable actuel
prochaine action
date limite
```

Exemple :

```text
Dossier : TB-2026-000155
Statut : En cours
Étape : Finance
Responsable : Finance
Prochaine action : Valider l’encours client
Échéance : 10/09/2026
```

C’est un principe central de l’application.

---

# 38. Sous-dossiers / modules internes

Techniquement, une opération peut contenir plusieurs contextes internes :

```text
TB-2026-000155
│
├── COMMERCIAL
├── STOCK
├── APPROVISIONNEMENT
├── FINANCE
├── LIVRAISON
├── FACTURATION
├── RECOUVREMENT
└── COMPTABILITE
```

Mais pour l’utilisateur, il s’agit toujours d’un **seul dossier**.

Ne pas créer plusieurs dossiers indépendants pour une seule opération.

---

# 39. Permissions

Les permissions doivent être gérées finement.

Exemples :

```text
DOSSIER_VIEW
DOSSIER_CREATE
DOSSIER_ASSIGN
DOSSIER_EDIT
DOSSIER_VALIDATE
DOSSIER_CLOSE
DOSSIER_REOPEN

PAYMENT_CREATE
PAYMENT_VALIDATE

STOCK_VIEW
STOCK_RESERVE

SUPPLIER_ORDER_CREATE
SUPPLIER_ORDER_VALIDATE

ACCOUNTING_RECONCILE

DOCUMENT_UPLOAD
DOCUMENT_DELETE

AUDIT_VIEW
```

Les permissions ne doivent pas dépendre uniquement de l’interface.

Elles doivent également être vérifiées côté backend.

---

# 40. Règles de sécurité

OpenClaw doit respecter les règles suivantes :

1. Ne jamais faire confiance au frontend.
2. Vérifier les permissions côté API.
3. Vérifier l’état du dossier avant toute modification.
4. Interdire toute modification d’un dossier clôturé sauf réouverture DG.
5. Historiser toute action importante.
6. Protéger les données financières.
7. Protéger les documents.
8. Ne jamais supprimer silencieusement une trace métier.
9. Utiliser des transactions DB pour les opérations critiques.
10. Empêcher les doublons lors des synchronisations Sage.

---

# 41. Entités principales de la base de données

Entités recommandées :

```text
users
roles
permissions
departments

customers
suppliers
products
warehouses
stock_items
stock_movements
serial_numbers

dossiers
dossier_assignments
dossier_status_history
tasks
comments
documents
notifications

customer_orders
supplier_orders
deliveries
invoices
payments
payment_schedules

finance_validations
supplier_commitments
accounting_reconciliations

audit_logs
sage_sync_logs
```

---

# 42. Entité dossier — champs recommandés

```text
id
reference
type
customer_id
created_by
assigned_to
department_id
status
current_step
priority
total_amount
currency
next_action
due_date
locked
closed_at
closed_by
reopened_at
reopened_by
reopen_reason
created_at
updated_at
```

---

# 43. Règles de transition du workflow

Une transition ne doit être possible que si ses conditions sont remplies.

Exemple :

```text
COMMERCIAL → STOCK
```

possible si :

```text
commande_client_validée = true
```

---

```text
STOCK → APPROVISIONNEMENT
```

si :

```text
stock_insuffisant = true
```

---

```text
STOCK → FINANCE
```

si :

```text
stock_suffisant = true
```

---

```text
APPROVISIONNEMENT → FINANCE
```

si :

```text
besoin_stock_couvert = true
```

---

```text
FINANCE → LIVRAISON
```

si :

```text
validation_finance = true
```

---

```text
LIVRAISON → FACTURATION
```

si :

```text
livraison_terminee = true
```

---

```text
FACTURATION → RECOUVREMENT
```

si :

```text
facture_creee = true
```

---

```text
RECOUVREMENT → COMPTABILITE
```

si :

```text
reste_a_recouvrer = 0
```

ou selon les règles métier validées par la DG.

---

```text
COMPTABILITE → A_CLOTURER
```

si :

```text
rapprochement = VALIDE
```

---

# 44. Gestion des erreurs

Une erreur ne doit pas faire disparaître une action utilisateur.

Exemples :

- erreur Sage ;
- erreur réseau ;
- erreur upload ;
- erreur synchronisation ;
- erreur validation ;
- conflit de modification.

TBTrade doit :

1. afficher un message compréhensible ;
2. journaliser l’erreur ;
3. ne pas perdre les données déjà validées ;
4. permettre de réessayer lorsque possible.

---

# 45. Synchronisation Sage

Chaque synchronisation doit produire un log :

```text
sync_id
entity_type
started_at
completed_at
records_read
records_created
records_updated
records_failed
status
error_message
```

Statuts :

```text
PENDING
RUNNING
SUCCESS
PARTIAL
FAILED
```

---

# 46. Règles UX importantes

L’interface doit toujours montrer :

- référence du dossier ;
- client ;
- statut ;
- étape ;
- responsable ;
- prochaine action ;
- date limite.

L’utilisateur doit comprendre en quelques secondes :

> Où est le dossier ? Qui doit agir ? Que faut-il faire ensuite ?

---

# 47. Page liste des dossiers

Filtres recommandés :

- référence ;
- client ;
- statut ;
- département ;
- responsable ;
- étape ;
- commercial ;
- priorité ;
- date ;
- retard ;
- montant ;
- dossier clôturé / ouvert.

Colonnes recommandées :

```text
Référence
Client
Montant
Statut
Étape
Responsable
Prochaine action
Date limite
Priorité
Dernière mise à jour
```

---

# 48. Couleurs métier recommandées

```text
Nouveau            → neutre
En cours           → information
En attente         → avertissement
En retard          → danger
À valider          → attention
Validé             → succès
Clôturé            → verrouillé / neutre
```

Ne pas utiliser uniquement la couleur pour transmettre une information.

Toujours afficher aussi un texte ou une icône.

---

# 49. Règle fondamentale de traçabilité

Toute action métier doit répondre à quatre questions :

```text
QUI ?
QUOI ?
QUAND ?
POURQUOI ?
```

Exemple :

```text
Qui : Ahmed Ben Ali
Département : Finance
Action : Refus validation
Date : 08/09/2026 15:48
Pourquoi : Encours client supérieur au plafond autorisé
```

---

# 50. Règles absolues pour OpenClaw

OpenClaw doit respecter ces règles pendant tout développement futur de TBTrade.

## 50.1. Ne jamais casser le workflow

Toute nouvelle fonctionnalité doit être compatible avec :

```text
Dossier
→ Étape
→ Responsable
→ Action
→ Validation
→ Historique
→ Étape suivante
→ Clôture
```

## 50.2. Ne jamais dupliquer une opération

Une commande, facture, livraison ou échéance appartenant à une opération doit rester liée au même `dossier_id`.

## 50.3. Ne jamais permettre une modification silencieuse

Chaque changement critique doit laisser une trace.

## 50.4. Ne jamais supprimer l’historique métier

Les logs et historiques doivent être conservés.

## 50.5. Ne jamais modifier un dossier clôturé

Sauf après procédure officielle de réouverture par la DG.

## 50.6. Ne jamais laisser le frontend décider seul

Toutes les règles doivent être contrôlées côté backend.

---

# 51. Ordre recommandé de développement

OpenClaw doit développer ou refactorer TBTrade dans cet ordre :

## Phase 1 — Fondations

- utilisateurs ;
- authentification ;
- rôles ;
- permissions ;
- départements.

## Phase 2 — Dossiers

- création ;
- affectation ;
- statuts ;
- étapes ;
- responsable ;
- prochaine action ;
- historique.

## Phase 3 — Commercial

- clients ;
- commandes ;
- factures ;
- règlements ;
- échéanciers.

## Phase 4 — Stock

- articles ;
- quantités ;
- réservation ;
- mouvements ;
- inventaire ;
- IMEI.

## Phase 5 — Approvisionnement

- fournisseurs ;
- besoins ;
- commandes ;
- réception.

## Phase 6 — Finance

- encaissement ;
- décaissement ;
- engagement ;
- validation.

## Phase 7 — Livraison

- préparation ;
- sortie stock ;
- livraison ;
- documents.

## Phase 8 — Comptabilité

- rapprochement ;
- contrôle ;
- anomalies.

## Phase 9 — Notifications

- notifications ;
- échéances ;
- retards ;
- validations.

## Phase 10 — Sage 100

- connecteur ;
- synchronisation ;
- logs ;
- prévention doublons.

## Phase 11 — Dashboard DG

- KPI ;
- alertes ;
- dossiers bloqués ;
- drill-down.

## Phase 12 — Sécurité et qualité

- audit ;
- tests ;
- sauvegardes ;
- monitoring ;
- performances.

---

# 52. Règle de travail pour OpenClaw

Avant de modifier du code :

1. Lire ce README.
2. Identifier le module concerné.
3. Identifier l’étape du workflow concernée.
4. Vérifier les impacts sur les autres départements.
5. Vérifier les permissions.
6. Vérifier les transitions de statut.
7. Vérifier l’historisation.
8. Vérifier les notifications.
9. Vérifier les conditions de clôture.
10. Ne modifier que ce qui est nécessaire.

Après chaque changement :

1. lancer les tests existants ;
2. ajouter les tests nécessaires ;
3. vérifier le workflow ;
4. vérifier les permissions ;
5. vérifier les données existantes ;
6. documenter le changement.

---

# 53. Critères d’acceptation globaux

TBTrade est considéré fonctionnel lorsque :

- un dossier peut être créé ;
- il peut être affecté ;
- son responsable est connu ;
- son étape actuelle est connue ;
- sa prochaine action est connue ;
- toutes les actions sont historisées ;
- le stock peut être contrôlé ;
- un besoin fournisseur peut être créé ;
- une réception peut être enregistrée ;
- une validation Finance peut être effectuée ;
- une livraison peut être enregistrée ;
- une facture peut être rattachée ;
- un règlement peut être enregistré ;
- un échéancier peut être créé ;
- le reste à recouvrer est calculé ;
- la Comptabilité peut effectuer le rapprochement ;
- la DG peut clôturer ;
- un dossier clôturé est verrouillé ;
- seule la DG peut le réouvrir ;
- les notifications ouvrent le dossier correspondant ;
- les données Sage ne sont pas dupliquées.

---

# 54. Résumé métier

TBTrade est une **plateforme de workflow et de pilotage des opérations commerciales**.

Elle permet de suivre chaque opération :

```text
Commande client
→ Dossier
→ Commercial
→ Stock
→ Approvisionnement
→ Finance
→ Livraison
→ Facturation
→ Recouvrement
→ Comptabilité
→ DG
→ Clôture
```

Le cœur de l’application est :

```text
UNE OPÉRATION
       ↓
UN DOSSIER UNIQUE
       ↓
UNE ÉTAPE ACTUELLE
       ↓
UN RESPONSABLE
       ↓
UNE PROCHAINE ACTION
       ↓
UNE VALIDATION
       ↓
UNE TRACE
       ↓
UNE ÉTAPE SUIVANTE
       ↓
UNE CLÔTURE
```

---

# 55. Hypothèses métier à confirmer

Certains détails doivent être validés avec l’entreprise avant implémentation définitive :

1. Le terme **FNR** est supposé signifier **Fournisseur**.
2. Le rôle exact du Commercial vis-à-vis des fournisseurs doit être confirmé.
3. La synchronisation Sage 100 doit être définie techniquement : lecture seule, bidirectionnelle ou hybride.
4. Les règles de crédit client doivent être confirmées.
5. Les conditions exactes de clôture doivent être validées par la DG.
6. Les documents obligatoires peuvent varier selon le type de dossier.
7. La gestion IMEI doit être activée si elle est pertinente dans le système actuel.
8. Les délais de notification J-7 / J-3 / J+1 / J+3 / J+7 peuvent être configurables.

---

# 56. Instruction finale à OpenClaw

> Considérer ce README comme la référence fonctionnelle principale de TBTrade.
>
> Avant toute création, modification ou refactorisation, vérifier que la solution proposée respecte le workflow dossier, les responsabilités par département, les règles de validation, les permissions, la traçabilité et la clôture.
>
> Ne pas transformer TBTrade en simple CRUD.
>
> TBTrade doit rester une application pilotée par le **workflow métier du dossier**.
