# 🌾 RÉVOLUTION AGRICOLE — GUIDE TECHNIQUE & DOCUMENTATION SYSTÈME (GEMINI.md)

> **Document de référence pour les développeurs et agents d'intelligence artificielle.**  
> Ce fichier résume l'architecture complète, les fonctionnalités livrées, les choix technologiques et stylistiques, ainsi que les directives strictes pour toute extension future du projet.

---

## 📌 1. Ce que fait l'application

**Révolution Agricole** est une plateforme SaaS *mobile-first* conçue spécifiquement pour les acteurs du secteur agropastoral au **Burkina Faso** et en Afrique de l'Ouest sahélienne. 

Elle réunit au sein d'une interface unifiée, résiliente et haute performance :
1. **L'information vérifiée et la météo agronomique locale** (alertes pluie, vent, hygrométrie pour planifier semis et traitements).
2. **Le pilotage technico-économique de l'exploitation** (suivi des parcelles, suivi des cycles culturaux semis-récolte, calcul en direct de la marge nette réelle).
3. **La gestion de trésorerie simplifiée** (saisie en 30 secondes des dépenses et encaissement en temps réel des ventes de récoltes au comptant ou par Mobile Money).
4. **La mise en relation et le marché agricole** (mise en vente des récoltes bord champ / marché, approvisionnement en intrants certifiés, location de motopompes et tracteurs).
5. **L'accès aux opportunités et financements vérifiés** (appels à projets ministériels, guichet subventions PReCA, fonds résilience maraîchage).

### Publics cibles modélisés
- **Producteurs / Maraîchers** (ex. *Awa Ouédraogo* à Koudougou - 1,8 ha maraîcher irrigué).
- **Offreurs d'équipements & intrants** (ex. *Rasmané Sawadogo* à Ouagadougou).
- **Acheteurs / Grossistes** (ex. *Salif Traoré* à Bobo-Dioulasso).
- **Modérateurs / Administrateurs** (ex. *Dr. Aminata Diallo*, validation des annonces et vérification stricte +90j).

---

## 🚀 2. Toutes les fonctionnalités implémentées

### A. Dashboard de Pilotage (Inspiré d'AgriVision)
- **Barre latérale (Sidebar) à navigation hiérarchique** : Groupes `ACCUEIL`, `S'INFORMER`, `OPPORTUNITÉS`, `ÉCHANGER`, `MON EXPLOITATION`, `ADMINISTRATION` et carte d'avancement de profil.
- **Bandeau de salutation contextuel** : Salutation dynamique, commune de rattachement, widget détaché horloge/date avec fuseau horaire Ouagadougou (`GMT+0`).
- **4 Cartes Pastel d'Indicateurs Métier** :
  - *Dépenses du mois* : Affichage en F CFA avec règle inversée (une hausse est marquée défavorable en rouge terre).
  - *Recettes du mois* : Calcul dynamique, tendance favorable en vert.
  - *Cycles en cours* : Nombre de cultures actives avec pastille d'alerte récolte imminente.
  - *Opportunités ouvertes* : Financements vérifiés avec alertes de clôture imminente (< 7 jours).
- **Graphique financier interactif (Recettes vs Dépenses)** : Barres bicolores par mois avec info-bulle interactive, bandeau de marge nette d'octobre et modale d'explication pédagogique de la formule :
  $$\text{Marge Nette du Cycle} = \text{Recettes encaissées} - \text{Dépenses engagées}$$
- **Tableau de suivi des parcelles & cycles culturaux** : Statuts colorés (*Récolte imminente*, *En végétation*, *Repiquage récent*), dates de semis, estimations de récolte et actions rapides.
- **Widget Météo Agricole Réelle** : Données agronomiques complètes (température, vent, humidité, probabilité de pluie) et prévisions sur 4 jours.

### B. Gestion Financière & Encaissement des Ventes (Modale Luxe Fintech)
- **Enregistrement rapide des dépenses** : Saisie d'une charge d'exploitation en 30 secondes catégorisée par cycle ou frais généraux.
- **Enregistrement Luxe d'une Vente de Récolte (`+ Vente récolte`)** :
  - *Carte héro de montant* : Saisie grand format (`28px`), puce `F CFA`, et puces de montants rapides en 1 clic (`+ 25 000 F`, `+ 50 000 F`, `150 000 F`, `+ 250 000 F`, `+ 500 000 F`).
  - *Impact direct sur la marge en temps réel* : Calcul instantané avant soumission du bond de trésorerie et de la marge nette.
  - *Double mode de rattachement (Besoin spécifique utilisateur)* :
    - Mode **Cycle de parcelle enregistré** : Choix parmi les parcelles actives (*Tomate P2, Oignon P1, Chou P3, Maïs P4*).
    - Mode **Autre vente / Saisie libre** : Champ texte libre pour toute vente ponctuelle (*ex : Piment d'eau de Koudougou, Gombo frais, Mangues...*) + puces d'auto-remplissage en 1 clic (`🌶️ Piment`, `🌽 Maïs`, `🥭 Mangues`, `🥬 Gombo`, `🥜 Arachides`, `🍉 Pastèque`, `🍆 Aubergines`, `🌿 Moringa`) + sélection du contexte d'origine (*Jardin de case, Achat-revente grossiste, Sous-produits fanes/son, Cueillette*).
  - *Modes de paiement sous forme de cartes visuelles interactives* : 💵 Espèces au marché (Cash), 🟠 Orange Money (+226), 🔵 Moov Money Flooz (+226), 🏦 Virement / IMF.
  - *Composant Calendrier Moderne Personnalisé* : Remplacement complet de l'input natif par des puces d'accès rapide (*Aujourd'hui, Hier, Avant-hier*), une carte de confirmation horodatée et un mini-calendrier popover dynamique interactif.
  - *Recalcul automatique* : Mise à jour synchronisée des compteurs financiers, de la marge nette, du graphique et génération d'un toast horodaté.

### C. Système d'Abonnement & Monétisation Mobile Money
- **2 Forfaits payants adaptés aux capacités locales** :
  - **Pro Producteur** : `5 000 F CFA/mois` (Alertes SMS météo/ravageurs, fiches hors-ligne, calculs illimités de rentabilité).
  - **Business & Coopératives** : `10 000 F CFA/mois` (Multi-parcelles, exports bancaires PReCA, visibilité prioritaire sur le marché, support dédié).
  - **Forfait Découverte** : `0 F CFA` (Accès de base).
- **Bascule Campagne Agricole (6 mois) à -15%** : Calcul automatique des tarifs saisonniers (`25 500 F` et `51 000 F CFA`).
- **Passerelle de paiement Mobile Money simulée** :
  - Prise en charge d'**Orange Money Burkina** (instructions USSD `*144*4*6#`) et **Moov Money Burkina** (`*555*6#`).
  - Validation avec saisie du numéro `+226`, simulation de validation réseau et bascule instantanée du statut du compte avec badge doré **`⭐ PRO`**.

### D. Simulateur Double Vue : Desktop & Mobile Android
- **Vue Bureau (≥ 1280 px)** : Affichage SaaS multi-colonnes conforme à la capture AgriVision.
- **Simulateur Mobile Android (390 px)** :
  - Cadre de smartphone avec barre d'état système.
  - **Tiroir latéral coulissant (Drawer)** : Accessible via le bouton hamburger (`☰`) en haut à gauche, contenant l'ensemble de la navigation sans aucune barre inférieure encombrante.
  - Disposition optimisée : Météo locale consultée en premier dès l'aube, grille 2×2 d'indicateurs sans défilement horizontal, bouton d'encaissement direct `+ Vente`.

### E. Outils de Démonstration & Robustesse
- **Bandeau prototype permanent** : Sélecteur de profil à la volée, bascule Desktop/Mobile, et sélecteur d'états UI (*Normal*, *Chargement avec squelettes animés*, *États vides Empty States*, *Erreur réseau résiliente avec bouton Réessayer*).

---

## 📂 3. Structure des fichiers

```
REVOLUTION AGRICOLE/
│
├── index.html              # Document HTML5 unique, structure sémantique, modales et SEO
├── README.md               # Présentation du projet et instructions de lancement
├── GEMINI.md               # Le présent fichier de référence technique et de directives IA
├── server.ps1              # Serveur HTTP local natif en PowerShell (Port 3000, No-Cache)
│
├── styles/
│   └── main.css            # Feuille de style unique (~3 500 lignes), Design System complet
│
└── scripts/
    └── app.js              # Moteur applicatif (~1 850 lignes) : état, réactivité, modales, calculs
```

### Rôle détaillé des fichiers clés :
- **[index.html](file:///c:/Users/user/Downloads/REVOLUTION%20AGRICOLE/index.html)** :
  Contient la totalité du squelette HTML : barre de contrôle prototype, layout bureau, conteneur du simulateur mobile Android `#mobileDeviceFrame`, modales (`#modalExpense`, `#modalRevenue`, `#modalFormula`, `#modalPricing`, `#modalCheckout`) et conteneur de notifications toast.
- **[styles/main.css](file:///c:/Users/user/Downloads/REVOLUTION%20AGRICOLE/styles/main.css)** :
  Organisé en 14 sections strictes : Variables de marque et de terroir, reset/base, layout principal, navigation sidebar, cartes pastel d'indicateurs, graphique financier, météo, tableau des cycles, simulateur mobile, tiroir latéral (Drawer), modales standards, grille tarifaire et composants de modale luxe (calendrier popover, cartes de paiement, puces de montants rapides).
- **[scripts/app.js](file:///c:/Users/user/Downloads/REVOLUTION%20AGRICOLE/scripts/app.js)** :
  Contient la base de données démo (`PROFILES_DATA`), la gestion de l'état applicatif (`currentProfileKey`, `currentViewMode`, `currentUIState`, `userSubscriptionStatus`), le moteur de calcul de marge, le moteur de calendrier popover en français, les écouteurs d'événements et le système de notifications toast.
- **[server.ps1](file:///c:/Users/user/Downloads/REVOLUTION%20AGRICOLE/server.ps1)** :
  Serveur web autonome développé avec `System.Net.HttpListener`. Ne nécessite ni Node.js, ni Python, ni serveur externe. Injecte automatiquement les en-têtes HTTP `Cache-Control: no-store, no-cache, must-revalidate` pour garantir un rechargement immédiat.

---

## 🛠️ 4. Technologies utilisées

1. **HTML5 Sémantique** : Balisage accessible, micro-données SEO, structure déclarative claire.
2. **Vanilla CSS3 (Sans framework CSS)** :
   - Zéro dépendance externe lourde (ni Tailwind, ni Bootstrap).
   - Contrôle total via les **variables CSS (`:root`)**.
   - Grilles CSS (`CSS Grid`) et boîtes flexibles (`Flexbox`) adaptatives.
   - Animations fluides accélérées matériellement (`cubic-bezier(0.16, 1, 0.3, 1)`).
3. **Vanilla JavaScript Moderne (ES6+)** :
   - Zéro framework JS (ni React, ni Vue).
   - Manipulation directe et optimisée du DOM.
   - Internationalisation native des devises et dates via `Intl.NumberFormat` et tableaux calendaires français.
4. **Google Fonts** :
   - `Plus Jakarta Sans` : Police géométrique moderne choisie pour sa clarté exceptionnelle en conditions de forte luminosité extérieure.
   - `JetBrains Mono` : Typographie à chasse fixe pour les chiffres et les alignements comptables.
5. **PowerShell 5.1+ / .NET** :
   - Moteur du serveur local de développement via `System.Net.HttpListener`.

---

## 🎨 5. Décisions de Design & Identité Sahélo-Tech

Le design a été conçu pour allier l'élégance des plateformes SaaS internationales (type *Stripe*, *Linear*, *AgriVision*) et les impératifs du terrain agricole sahélien :

1. **Palette Sahélo-Tech à fort contraste (Conforme WCAG AAA)** :
   - **Vert Forêt profond** (`--primary-700: #1E5E2A`, `--primary-900: #0E3615`) : Évoque l'agriculture florissante, les cultures irriguées et sert de couleur d'accentuation principale.
   - **Ocre & Or du Sahel** (`--sahel-ochre: #C8862A`) : Rappelle la terre nourricière latéritique burkinabè, utilisé pour les forfaits Pro et les alertes temporelles.
   - **Fond Vert-Gris reposant** (`--background: #F6F8F4`) : Réduit la fatigue oculaire lors des consultations en plein soleil.
2. **Règle financière métier stricte** :
   - Contrairement aux tableaux de bord financiers classiques où le rouge est toujours synonyme de baisse, ici :
     - **Hausse des dépenses = Rouge terre (Défavorable)**.
     - **Hausse des recettes = Vert forêt (Favorable)**.
3. **Plein écran mobile & Ergonomie tactile** :
   - Toutes les zones de toucher font au minimum `44×44 px`.
   - Pas de barre de navigation fixe coupant le bas de l'écran : priorité au contenu grâce au tiroir latéral (Drawer).
4. **Monnaie locale obligatoire** :
   - Tous les montants sont libellés en **Francs CFA (F CFA / XOF)** avec séparateur de milliers par espace insécable.

---

## 🧠 6. Instructions critiques pour tout futur modèle IA

Si vous êtes un modèle IA invité à maintenir, étendre ou modifier ce projet, vous **DEVEZ IMPÉRATIVEMENT** respecter les règles suivantes :

### Règle 1 : Préservation de l'architecture Vanilla & Zéro Framework
- **Ne convertissez pas ce projet vers React, Vue, Next.js ou Vite** sauf demande explicite et univoque de l'utilisateur. L'un des atouts majeurs du projet est son autonomie totale, sa rapidité d'exécution sans compilation et sa lisibilité directe en fichiers plats.
- N'installez pas de dépendances npm inutiles.

### Règle 2 : Gestion stricte du Cache du Navigateur
- Lorsque vous modifiez `styles/main.css` ou `scripts/app.js`, **vous devez obligatoirement incrémenter le paramètre de version dans `index.html`** (ex : passer de `scripts/app.js?v=2.6` à `scripts/app.js?v=2.7`).
- Sans cette précaution, les navigateurs modernes (Chrome, Edge) risquent de servir l'ancienne version en cache mémoire.

### Règle 3 : Portée des variables JavaScript (Scope Safety)
- Le code dans `scripts/app.js` est encapsulé dans l'écouteur `document.addEventListener('DOMContentLoaded', () => { ... })`.
- **Veillez à ne jamais redéclarer un identifiant avec `const` ou `let` dans la même portée globale de fonction**, car cela génère un `SyntaxError: Identifier has already been declared` qui paralyse instantanément l'exécution de l'ensemble du script.
- Vérifiez systématiquement en amont si une variable de sélection DOM n'a pas déjà été déclarée dans le bloc supérieur.

### Règle 4 : Respect des prix et forfaits
- Les prix des abonnements sont strictement fixés à **5 000 F CFA/mois** (Pro Producteur) et **10 000 F CFA/mois** (Business Coopérative), avec une remise de **-15% sur la formule 6 mois (Campagne agricole)** soit `25 500 F CFA` et `51 000 F CFA`. Ne modifiez pas ces valeurs sans accord explicite.

### Règle 5 : Contexte territorial & agronome Burkinabè
- Lors de l'ajout d'exemples ou de nouvelles fonctionnalités, conservez la cohérence avec le Burkina Faso :
  - *Villes et régions* : Koudougou (Boulkiemdé), Bobo-Dioulasso (Hauts-Bassins), Ouagadougou (Kadiogo), Ouahigouya (Yatenga), Dédougou (Boucle du Mouhoun).
  - *Cultures fréquentes* : Tomate Mongal, Oignon Violet de Galmi, Chou Marché, Maïs pluvial, Gombo, Niébé, Sésame, Mangues Amélie.
  - *Opérateurs de paiement* : Orange Money (`*144*4*6#`) et Moov Money Flooz (`*555*6#`), indicatif téléphonique `+226`.
  - *Programmes publics réels* : PReCA (Projet de Résilience et de Compétitivité Agricole), Ministère de l'Agriculture.

---

## 🗄️ 7. Architecture Full Stack Supabase & Base de Données

Depuis la version 2.9, l'application est entièrement Full Stack connectée au projet Supabase `Revolution agricole`.

### A. Tables Supabase déployées
1. **`public.profiles`** : Comptes acteurs (Awa, Rasmané, Salif, Aminata), rôles, téléphone +226, statut Pro.
2. **`public.parcels`** : Parcelles géoréférencées (P1, P2, P3, P4), superficies en hectares, type d'irrigation.
3. **`public.crop_cycles`** : Cycles culturaux (Tomate Mongal, Oignon de Galmi, Chou KK Cross, Maïs), dates de semis/récolte, statuts.
4. **`public.expenses`** : Dépenses réelles d'exploitation (montants F CFA, catégories, dates, notes).
5. **`public.revenues`** : Ventes de récoltes encaissées (montants F CFA, produit, quantité, acheteur, mode Cash/Orange/Moov, date).
6. **`public.subscriptions`** : Historique des transactions Mobile Money (Orange Money, Moov Money, montants, échéances).

### B. Sécurité Row Level Security (RLS)
- **RLS est activée sur l'intégralité des 6 tables**.
- Chaque utilisateur accède strictement à ses propres parcelles, cycles, dépenses et recettes.
- Le rôle administrateur dispose d'une fonction de supervision sécurisée (`is_profile_owner_or_admin`).

### C. Client Supabase
- Chargé via le CDN officiel v2 dans `index.html`.
- Initialisé dans `scripts/app.js` avec persistance et mode de secours résilient en cas de coupure réseau.

### D. Portail d'Authentification (v3.0)
- **Modale d'authentification native** (`#modalAuth`) permettant la connexion et la création de compte réelle.
- **Formulaire d'inscription** : Nom complet, rôle (Producteur, Fournisseur, Acheteur), téléphone burkinabè (`+226`), commune/région et mot de passe.
- **Enregistrement dans Supabase** : Insertion directe dans `public.profiles`.
- **Démarrage à blanc garanti** : Tout nouvel inscrit commence avec des compteurs strictement vierges à **`0 F CFA`** (0 dépense, 0 recette, 0 marge) pour enregistrer ses vraies données sans interférence.
- **Déconnexion sécurisée** : Bouton rouge « Déconnexion » dans la barre latérale pour fermer la session.

### E. Ergonomie & Visibilité Permanente du Profil (v3.2)
- **Repositionnement stratégique de la pilule profil (`#btnOpenAuth`)** : Placée en position centrale prioritaire dans l'en-tête (juste à côté de la cloche de notification et de la recherche) au lieu de l'extrémité droite.
- **Zéro débordement (Unclipped Guarantee)** : Réduction du padding d'en-tête, dimensions compactes des boutons (`34px`), champ de recherche optimisé (`125px` à `180px`), et labels responsifs (`+ Vente`, `+ Dépense` sous 1366px) garantissant un affichage 100% visible de l'avatar et du prénom sur tous les écrans (1024px, 1280px, 1366px, 1920px et zoom Windows).

### F. Expérience Mobile & Authentification SMS Renforcée (v3.3)
- **Actions doubles sur mobile (`+ Dépense` & `+ Vente`)** :
  - En-tête mobile : Présence simultanée des deux boutons d'action rapide `+ Dépense` (saisie express 30s) et `+ Vente` (encaissement récolte).
  - Bouton flottant (`+` FAB) : Ouvre désormais une feuille d'action contextuelle (Action Sheet) permettant de choisir immédiatement entre ajouter une charge d'exploitation ou enregistrer une vente.
- **Déconnexion réelle & État Vierge (0 F CFA)** :
  - Sur clic « Déconnexion » (mobile ou bureau), la session se ferme réellement.
  - Le tableau de bord bascule instantanément en mode **Invité Déconnecté**, avec compteurs vierges réinitialisés à **`0 F CFA`**, parcelles vidées, et ouverture automatique de la fenêtre de connexion.
- **Confirmation de Sécurité par SMS burkinabè (+226) & Supabase** :
  - Génération d'un code OTP secret à 4 chiffres (ex: `4819`) envoyé et affiché sous forme d'alerte SMS réelle.
  - Sauvegarde et vérification du code directement dans la table Supabase `public.profiles`.
  - Simplification de l'inscription : sélection automatique de l'activité « Producteur / Maraîcher » par défaut pour une création de compte en moins de 15 secondes.

### G. Perfections Ergonomie Modale & Anti-Autofill (v3.4)
- **Zéro rognage & Défilement interne (.auth-modal-dialog)** :
  - En-tête (`RÉVOLUTION AGRICOLE`) et onglets de bascule (`Se connecter` / `Créer un compte`) désormais **100% fixes et visibles en haut** sans aucun débordement hors écran.
  - Défilement fluide interne avec barre discrète sur le corps du formulaire (`overflow-y: auto`), bouton de soumission toujours accessible.
- **Formulaire d'inscription ultra-compact** :
  - Cartes d'activité (« Producteur », « Fournisseur », « Acheteur ») réorganisées sur **3 colonnes horizontales** au lieu d'une colonne verticale, divisant la hauteur occupée par 3.
- **Suppression du pré-remplissage intempestif** :
  - Remplacement de l'autofill navigateur par `autocomplete="off"` et réinitialisation programmatique systématique des champs (`loginIdentifier.value = ''`) à chaque déconnexion et ouverture de modale.

### H. Mode SaaS Professionnel, Plein Écran Mobile Natif & Persistance de Session (v3.5)
- **Suppression du bandeau Prototype en Production** :
  - Le bandeau sombre d'expérimentation (`#protoBar` affichant « DÉMO », « Profil simulé », « État UI ») est désormais **masqué par défaut**.
  - Accessible uniquement sur demande via le paramètre URL explicite `?demo=1`.
  - La plateforme présente immédiatement une allure de SaaS fintech/agritech haut de gamme et commerciale.
- **Plein Écran Mobile Natif (Zero Mockup Bezel)** :
  - Sur smartphone et tablette (`< 1024px`), suppression complète des faux contours de téléphone (`.device-notch`, `.device-home-bar`, cadre noir 390px).
  - L'application remplit **100% de la largeur et de la hauteur de l'écran du visiteur**, s'adaptant avec fluidité à tous les modèles (iPhone, Samsung Galaxy, Xiaomi, Tecno, Infinix).
  - En-tête mobile épuré avec hamburger (`☰`), logo de marque, avatar utilisateur et double bouton d'action rapide `+ Dépense` et `+ Vente`.
- **Persistance Réelle de la Session (`localStorage`)** :
  - La session de l'exploitant connecté (ex : Fabrice ZOMAHOUN, producteur à Koudougou) est mémorisée dans le navigateur via `revolution_session_user`.
  - Au rechargement de la page sur Vercel ou sur téléphone, l'utilisateur retrouve instantanément son vrai compte et ses données réelles synchronisées avec Supabase, sans jamais être réinitialisé vers un profil démo.
- **Auto-Détection d'Écran Responsive** :
  - Bascule automatique et réactive entre l'affichage mobile et l'affichage bureau sans aucune intervention manuelle.

---

*Fin du document de spécification système — Version 3.5 • Révolution Agricole Burkina Faso.*
