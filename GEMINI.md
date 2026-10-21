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

### Règle 6 : Modifications de Base de Données Réelles dans Supabase
- **Toute modification de base de données doit être faite réellement dans Supabase avec l'outil Supabase**, jamais seulement dans le code ou en `localStorage`. Aucune simulation ou persistance factice locale n'est tolérée pour les entités métier.

### Règle 7 : Vérification & Preuve Supabase Avant Clôture
- **Avant de dire qu'une tâche est terminée, vérifiez systématiquement dans Supabase que les tables, colonnes, règles RLS et espaces Storage demandés existent vraiment**, et affichez-les formellement à l'utilisateur comme preuve d'exécution.

### Règle 8 : Transparence sur les Attentes d'Accord Utilisateur
- **Si une étape attend l'accord de l'utilisateur, indiquez-le clairement et sans ambiguïté** au lieu d'annoncer prématurément que la tâche est terminée.

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

### I. Portail d'Entrée Obligatoire & Personnalisation Nom Utilisateur (v3.8)
- **Portail d'Entrée Obligatoire (`#authPortalScreen`)** :
  - Tout nouvel arrivant non connecté atterrit impérativement sur la page d'accueil d'authentification sahélo-tech.
  - Le tableau de bord et les données privées sont masqués tant que l'utilisateur n'a pas créé un compte ou ne s'est pas connecté.
- **Formulaire d'Inscription à 3 cases exactes (Exigence Audio Utilisateur)** :
  1. *Case 1* : **Nom d'utilisateur ou Nom complet** (`#portalRegUsername`, ex: `Fabrice ZOMAHOUN`).
  2. *Case 2* : **Numéro de téléphone (+226) ou Gmail** (`#portalRegContact`).
  3. *Case 3* : **Mot de passe** (`#portalRegPassword`).
- **Personnalisation Complète du Nom (« Bonjour, Fabrice 🌱 »)** :
  - Partout où le prénom "Awa" apparaissait par défaut, le prénom réel de l'utilisateur est désormais injecté dynamiquement dès la connexion :
    - Titre de salutation bureau : `Bonjour, [Prénom] 🌱`
    - Salutation en-tête mobile : `Bonjour, [Prénom] 🌱`
    - Nom en-tête principal : `[Nom complet]`
    - Pilule profil : `[Prénom]`
    - Profil tiroir latéral mobile : `[Nom complet]`
- **Démarrage à blanc garanti (0 F CFA)** :
  - Tout compte nouvellement créé commence avec des compteurs strictement vierges à 0 F CFA pour enregistrer ses vraies charges et récoltes.
- **Déconnexion complète** :
  - Le clic sur « Déconnexion » vide la session `localStorage` et renvoie immédiatement l'utilisateur sur le portail d'authentification.

### J. Vrais Comptes Utilisateurs & Google OAuth (v4.0)
- **Connexion Google (« Continuer avec Google »)** :
  - Intégration de `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
  - Bouton officiel Google avec icône multichrome stylisé aux normes Sahélo-Tech.
- **Secours Email + Mot de passe** :
  - Formulaires dédiés avec bascule par onglets (« Se connecter » / « Créer un compte ») via `supabase.auth.signInWithPassword` et `supabase.auth.signUp`.
- **Suppression définitive de la connexion par téléphone & du faux SMS** :
  - Fin des faux codes SMS et formulaires OTP simulés.
- **Onboarding / Complétion de Profil Obligatoire (`#modalOnboarding`)** :
  - À la première connexion (Google ou Email), si le profil n'est pas encore complété (`is_onboarded: false`), une modale demande impérativement :
    1. *Nom complet* (pré-rempli via les métadonnées Google ou email).
    2. *Téléphone burkinabè* (`+226`).
    3. *Commune / Région* (Koudougou, Ouagadougou, Bobo-Dioulasso, etc.).
    4. *Activité principale* (Producteur / Maraîcher, Fournisseur d'équipements, Acheteur / Grossiste).
  - Enregistrement immédiat dans `public.profiles` avec `is_onboarded: true`.
- **Isolation Stricte Row Level Security (RLS)** :
  - `public.profiles` : chaque utilisateur ne peut insérer, lire et mettre à jour que son propre profil (`id = auth.uid()::text`).
  - `public.parcels`, `public.crop_cycles`, `public.expenses`, `public.revenues`, `public.subscriptions` : isolation stricte par `is_profile_owner_or_admin(profile_id)`.
- **États Vides Élégants (Empty States)** :
  - Tout nouvel utilisateur démarre avec des compteurs à `0 F CFA`, un graphique calé à 0 F, et un tableau des cycles affichant une carte explicative avec bouton d'action `+ Enregistrer ma première dépense`.
- **Préservation Intacte du Mode Démo & Tarifs** :
  - Le lien d'aperçu démo rapide reste disponible pour les démonstrations (Awa Ouédraogo).

### K. Ergonomie Tiroir Mobile Safari & Défilement Interne (v4.1)
- **Hauteur dynamique 100dvh & Défilement fluide** :
  - Le tiroir latéral `.mobile-drawer` est calibré en `100dvh` (`height: 100vh; height: 100dvh;`) avec `overscroll-behavior: contain`.
  - Le conteneur interne `.mobile-drawer-nav` est défilable sans friction (`overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;`).
- **Visibilité garantie du bouton Déconnexion** :
  - Marge basse de sécurité `padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 80px)` assurant que le bouton « Déconnexion » ne soit jamais masqué par la barre d'outils flottante de Safari sur iPhone ou Chrome sur Android.
- **Suppression des fermetures accidentelles au toucher** :
  - Suppression de la fermeture automatique lors du glissement ou toucher sur les liens de navigation.
  - Le menu se ferme uniquement en appuyant sur la croix (`×`) ou en touchant l'overlay sombre à droite (`#mobileDrawerOverlay`).
- **Verrouillage du défilement arrière-plan** :
  - La classe `body.drawer-open` applique `overflow: hidden !important;` pour empêcher la page sous-jacente de défiler quand le menu est ouvert.

### L. Suppression du Clignotement au Chargement & Écran Splash (v4.2)
- **Zéro Clignotement (Anti-FOUC)** :
  - Le portail de connexion (`#authPortalScreen`) et le tableau de bord (`#viewportContainer`) sont masqués par défaut (`class="hidden"`).
  - Un écran de chargement élégant (`#appLoadingScreen`) arborant le logo officiel Révolution Agricole et une barre animée s'affiche instantanément dès le premier octet HTML.
- **Résolution Asynchrone de Session** :
  - L'application attend l'évaluation de `supabase.auth.getSession()` :
    - Si une session utilisateur valide existe : transition directe vers le tableau de bord sans jamais afficher le portail d'authentification.
    - S'il n'y a pas de session : bascule immédiate vers le portail de connexion et masquage de l'écran de chargement.

### M. Module Financements & Opportunités Connecté Supabase (v4.3)
- **Table Supabase `public.financements`** :
  - 15 champs normalisés : `id`, `titre`, `organisme`, `type`, `description_courte`, `conditions_eligibilite`, `public_vise`, `montant`, `date_limite`, `region`, `contact`, `lien_postuler`, `source`, `statut` (`en_attente`, `publie`, `expire`), `created_at`, `updated_at`.
  - Fonction de sécurité : `is_financements_admin()` vérifiant `profiles.is_admin`, la session démo admin ou les claims.
  - **Sécurité RLS stricte** :
    - Public / Utilisateurs normaux : lecture autorisée **uniquement** pour `statut = 'publie'`.
    - Administrateurs : accès complet en lecture (tous statuts), insertion, modification et suppression.
- **Espace Administration (« Gérer les financements »)** :
  - Accessible via la barre latérale sous `ADMINISTRATION` (`#admin-financements`) et dans le tiroir mobile.
  - Filtres par onglets de statut : `Tous`, `En attente`, `Publiés`, `Expirés`.
  - Tri prioritaire : les fiches `en_attente` s'affichent en tête avec puce dorée et compteur dédié dans la navigation (prêt pour l'intégration future d'agents IA collecteurs).
  - Bouton « + Ajouter un financement » ouvrant le formulaire complet à 13 champs.
  - Boutons d'action sur chaque fiche :
    - « Publier » (bascule immédiate du statut vers `publie`).
    - « Retirer » (bascule immédiate du statut vers `expire`).
    - « Modifier » (pré-remplit le formulaire pour mise à jour).
- **Espace Utilisateur (« Financements & Opportunités »)** :
  - Accessible via `OPPORTUNITÉS > Financements` (`#opportunites`) ou clic sur la carte statistique 4.
  - Données 100% réelles issues de Supabase (anciens mockups supprimés).
  - Tri chronologique automatique par date limite la plus proche.
  - Filtres interactifs par type (Tous, Subvention, Prêt, Appel à projets, Formation...) et région (Tout le Burkina, Hauts-Bassins, Centre, Boucle du Mouhoun...).
  - Badge clignotant rouge/ocre **« ⏳ Clôture dans X jours »** pour toute échéance `< 7 jours`.
  - Détection automatique d'expiration : les fiches dont la date limite est passée basculent automatiquement en `expire` et n'apparaissent plus dans la liste publique.
  - Modale détaillée (`#modalFinancementDetails`) avec récapitulatif complet, éligibilité et bouton « Postuler » ouvrant le lien officiel.

### N. Vraie Date du Jour & Compte à Rebours Dynamique (v4.4)
- **Horloge et Date Réelle en Direct (`updateDashboardDateTime`)** :
  - Fin des dates statiques (« jeudi 16 octobre 2026 », « 08:30 »).
  - Bureau : `#liveDateDisplay` calcule la date du jour en français complet (ex: « Samedi 17 octobre 2026 ») et `#liveTimeDisplay` affiche l'heure locale actualisée en temps réel (toutes les 10 secondes) avec le fuseau Ouagadougou.
  - Mobile : sous la salutation, `.mobile-subdate` est dynamiquement formatée en abrégé selon le jour réel (ex: « sam. 17 oct. • Koudougou »).
- **Comptes à Rebours Réels & Échéances Dynamiques** :
  - Centralisation via `getDiffDaysFromToday(targetDateStr)` gérant rigoureusement le décalage horaire local et UTC minuit.
  - Carte 4 Dashboard (« Opportunités ouvertes ») : le badge calcule le nombre réel d'opportunités clôturant dans `≤ 7 jours`, ou affiche le compte à rebours vers la prochaine clôture (`⏳ Prochaine dans X j`).
  - Section « Échéances » du tableau de bord (Bureau et Mobile) : les fiches réelles de Supabase s'affichent avec leur compte à rebours dynamique (`Aujourd'hui`, `Demain`, `Dans X j`), avec pulsation visuelle d'alerte et ouverture directe des détails au clic.
  - Pages Financements (Desktop & Mobile) : les badges clignotants `⏳ Clôture dans X jours` et l'auto-expiration s'appuient sur la vraie date du jour.
- **Modales d'Enregistrement de Transactions** :
  - Initialisation automatique sur la date réelle d'aujourd'hui (`new Date()`).
  - Puces rapides (« Aujourd'hui », « Hier », « Avant-hier ») calculées dynamiquement avec les vraies dates relatives.

### O. Cartes Financements, Guichet Permanent & Montants Longs (v4.5)
- **Bloc « MONTANT » Optimisé Mobile & Bureau** :
  - L'étiquette `MONTANT` est désormais positionnée en haut du bloc, sur sa propre ligne dédiée, en petite typographie majuscule (`font-size: 10px`, `font-weight: 800`).
  - Le montant s'affiche en dessous sur toute la largeur, aligné à gauche en vert forêt gras (`color: var(--primary-700)`, `font-size: 13.5px`, `font-weight: 800`).
  - Sur les cartes (bureau et mobile), limitation à 2 lignes maximum via `-webkit-line-clamp: 2` avec points de suspension (`...`) pour les montants à texte long (ex: « Opération spéciale : 750 forages à prix subventionné »).
  - Dans la page de détails (`#modalFinancementDetails`), le montant s'affiche dans son intégralité sans aucune troncature (`white-space: normal`, `word-break: break-word`).
- **Fiches sans Date Limite (« Guichet permanent »)** :
  - Lorsque `date_limite` est vide ou null (ex: « FBDES Tõogo »), remplacement de l'ancien « Clôture : » par un badge vert discret `Guichet permanent` (`.badge-guichet-permanent`).
  - Dans la modale de détails, le libellé bascule automatiquement de « Date limite » à « Disponibilité » avec le badge `Guichet permanent`.
  - Immunité totale contre l'auto-expiration : ces fiches restent en permanence visibles dans le catalogue public et ne passent jamais en `statut = 'expire'`.
  - Tri intelligent : les opportunités permanentes s'affichent proprement après les appels à échéance fixe sans jamais être masquées.
- **Compte à Rebours Dynamique & Date du Jour** :
  - Suppression de tout texte de date statique dans le HTML initial.
  - Calcul direct en temps réel via `new Date()` pour les cartes, la salutation, l'en-tête et les badges d'urgence (`⏳ Clôture aujourd'hui`, `⏳ Clôture dans X jours`).

### P. Météo Agricole Réelle Open-Meteo, 8 Communes & Alertes Automatiques (v4.6)
- **Connexion API Réelle Open-Meteo (Sans clé)** :
  - Fin complète des données météorologiques fixes de démonstration.
  - Connexion directe à l'API gratuite Open-Meteo (`https://api.open-meteo.com/v1/forecast`) avec les paramètres agronomiques réels : `temperature_2m`, `relative_humidity_2m`, `weather_code`, `wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m`, `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum`, `precipitation_probability_max`, `wind_speed_10m_max`, `wind_gusts_10m_max`.
  - Fuseau horaire officiel : `timezone=Africa/Ouagadougou`.
- **Prise en Charge des 8 Communes Agricoles Clés** :
  - **Ouagadougou** : `12.37, -1.52` (Centre / Kadiogo)
  - **Bobo-Dioulasso** : `11.18, -4.29` (Hauts-Bassins / Houet)
  - **Koudougou** : `12.25, -2.36` (Centre-Ouest / Boulkiemdé)
  - **Ouahigouya** : `13.58, -2.42` (Nord / Yatenga)
  - **Dédougou** : `12.46, -3.46` (Boucle du Mouhoun / Mouhoun)
  - **Banfora** : `10.63, -4.76` (Cascades / Comoé)
  - **Kaya** : `13.09, -1.08` (Centre-Nord / Sanmatenga)
  - **Fada N'Gourma** : `12.06, 0.36` (Est / Gourma)
  - Détection automatique de la commune de rattachement depuis le profil de l'exploitant (`user.location`), avec repli robuste sur **Ouagadougou** si la localité est inconnue.
  - Sélecteur interactif de commune (`#selectMeteoCommune` sur bureau, `#selectMobileMeteoCommune` sur mobile) permettant de consulter immédiatement la météo d'un autre bassin de production.
- **Données Météorologiques Affichées en Direct** :
  - **Maintenant** : Température réelle en °C, humidité relative (%), vent en km/h et direction cardinale (Nord, Nord-Est, etc.), icône météo WMO adaptée (ciel dégagé, éclaircies, brume sahélo-désertique, averses, orages).
  - **7 Jours** : Nom du jour réel (Aujourd'hui, Dimanche, Lundi...), date réelle (`17 oct.`), températures maximale et minimale, probabilité de pluie (%) et cumul pluviométrique attendu en mm.
  - **Heure réelle de dernière mise à jour** : Affichage transparent `MAJ HH:MM` dans la carte et sur la page.
- **Système de Cache de 1 Heure & Résilience Hors-Ligne** :
  - Mémorisation de la réponse dans `localStorage` par commune (`revolution_weather_cache_v4_[commune]`) avec horodatage `Date.now()`.
  - Pas d'appels API superflus lors des réouvertures dans l'intervalle de 60 minutes.
  - En cas d'indisponibilité du réseau ou de coupure Internet en zone rurale, restitution immédiate de la dernière météo connue avec mention `Hors-ligne`.
  - Boutons d'actualisation manuelle en 1 clic pour forcer une synchronisation réseau fraîche à tout moment.
- **Alertes Agricoles Automatiques (Bandeau contextuel Orange / Rouge)** :
  - **Forte pluie (Rouge / Danger)** : Pluie prévue `> 20 mm` dans la journée OU probabilité `≥ 70%` → `« 🌧️ Pluie prévue : reportez les traitements et l'irrigation. »`
  - **Forte chaleur (Orange / Avertissement)** : Température `≥ 40 °C` (actuelle ou maximale prévue) → `« ☀️ Forte chaleur : arrosez tôt le matin ou le soir, protégez les jeunes plants. »`
  - **Vent fort (Orange / Avertissement)** : Rafales de vent `≥ 40 km/h` (`wind_gusts_10m_max`) → `« 💨 Vent fort : évitez les pulvérisations. »`
  - Si aucune alerte météo n'est active, le bandeau reste strictement masqué.
- **Expérience Unifiée Bureau & Mobile** :
  - Tableau de bord : Carte « Météo agricole » synchronisée avec prévisions 7j en format compact et lien direct vers la page détaillée.
  - Page Météo dédiée (`#meteo`) : Accessible via la barre latérale, le tiroir mobile ou le lien de la carte, proposant la carte héros, les métriques d'évapotranspiration, les 7 jours détaillés avec badges de recommandations agronomiques adaptées, et les conseils culturaux sahéliens.

### O. Architecture Sécurité Supabase Auth & RLS Étanches (v5.1)
- **Authentification par Numéro (+226) sans SMS payant** :
  - L'utilisateur saisit son numéro burkinabè et son mot de passe.
  - Le frontend transforme automatiquement le numéro en email technique standardisé (`tel226XXXXXXXX@revolution-agricole.app`) accepté par Supabase GoTrue.
  - Inscription via `supabase.auth.signUp` et connexion via `supabase.auth.signInWithPassword`.
  - Suppression intégrale des faux codes SMS et du stockage en clair des mots de passe.
- **Assainissement de la Table `public.profiles`** :
  - Colonnes sensibles `password` et `verification_code` définitivement supprimées.
  - Tous les profils sont liés par leur véritable identifiant cryptographique `profiles.id = auth.users.id`.
- **Règles RLS Étanches sur l'Ensemble des Tables** :
  - Suppression de tout contournement anonyme (`auth.uid() IS NULL`), de l'en-tête `x-profile-id`, et du profil `'admin'` simulé.
  - Fonction de sécurité `public.is_admin()` en `SECURITY DEFINER`.
  - `public.profiles`, `public.parcels`, `public.crop_cycles`, `public.expenses`, `public.revenues`, `public.subscriptions` : chaque utilisateur ne lit et ne modifie que ses propres données (`profile_id = auth.uid()::text`).
  - `public.financements` : consultation publique réservée aux offres au statut `publie` ; insertion, mise à jour, suppression et consultation des offres en attente ou expirées strictement réservées aux profils avec `is_admin() = true`.
- **Comptes d'Exploitation & Démonstration** :
  - Compte administrateur de Fabrice ZOMAHOUN (Google OAuth et téléphone) conservé avec privilèges élevés (`is_admin: true`).
  - Comptes de démonstration Awa, Rasmané, Salif et Dr. Aminata convertis en véritables utilisateurs Supabase Auth avec mots de passe chiffrés.
  - Table `financements` et cron `expirer-financements-quotidien` préservés intacts.
- **Google OAuth & Complétion de Profil** :
  - Connexion officielle Google OAuth redirigeant vers `https://r2volution-agricole.vercel.app`.
  - Modale d'onboarding `#modalOnboarding` pour recueillir numéro (+226), commune et activité à la première connexion sans écraser les privilèges d'administration.

### P. Verrouillage Plein Écran Déconnecté, Zéro Démo & Hardening Supabase (v5.2)
- **Écran de Connexion / Inscription Exclusif et Plein Écran Hors Session** :
  - Lorsqu'aucun utilisateur n'est connecté (`currentSession === null`), seul l'écran d'accueil (`#authPortalScreen`) est visible.
  - Fixé en plein écran absolu (`position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 99999;`).
  - Le tableau de bord, la barre latérale, le menu mobile, la météo et toutes les pages applicatives sont strictement masqués (`#viewportContainer.hidden, .viewport-wrapper.hidden { display: none !important; }`), empêchant tout affichage ou accès tant que la session n'est pas confirmée.
  - Durant la vérification asynchrone initiale de session (`supabase.auth.getSession()`), seul l'écran de chargement (`#appLoadingScreen`) avec logo animé est affiché.
- **Suppression Définitive de Tout Mode et Contenu de Démonstration** :
  - Retrait du bandeau prototype `#protoBar`.
  - Retrait du lien « Aperçu rapide en mode démo » et de la section « Tester en 1 clic ».
  - Suppression totale des données fictives codées en dur (Awa, Rasmané, Salif, Aminata, parcelles P1-P4, faux cycles, fausses dépenses et recettes).
  - Un nouvel utilisateur dispose d'un espace 100% vierge avec compteurs à 0 F CFA et messages d'accueil / incitation à créer sa première parcelle.
- **Suppression des Comptes de Démonstration dans Supabase** :
  - Suppression intégrale dans `auth.users`, `auth.identities` et `public.profiles` des 4 comptes de test (Awa Ouédraogo, Rasmané Sawadogo, Salif Traoré, Dr. Aminata Kaboré) et de leurs données associées.
  - Seuls les deux comptes réels de Fabrice ZOMAHOUN (Google OAuth et téléphone) subsistent et conservent le statut super-administrateur (`is_admin = true`).
- **Suppression des Faux Éléments SMS** :
  - Éradication complète des formulaires, avertissements et codes OTP simulés (code 4819 et numéro +226 70 12 34 56).
- **Visibilité Continue de Google OAuth** :
  - Le bouton « Continuer avec Google » est placé au-dessus des onglets et reste visible en permanence sur les vues Connexion et Inscription.
- **Sécurisation des Fonctions Supabase (search_path & Privilèges)** :
  - Droits `EXECUTE` révoqués pour `anon` et `authenticated` sur les fonctions internes `handle_new_user()` et `rls_auto_enable()`.
  - Ajout explicite de `SET search_path = public` sur les fonctions `handle_new_user()` et `clean_security_columns()` pour prévenir toute injection de schéma.
### Q. Module Conseils Agronomiques Réels Connecté Supabase & Administration (v5.3)
- **Table Supabase `public.conseils`** :
  - Colonnes : `id` (UUID), `titre` (texte), `categorie` (`maraîchage`, `céréales`, `élevage`, `irrigation`, `sol et fertilisation`, `maladies et ravageurs`, `récolte et conservation`), `cultures` (texte, ex: `tomate, oignon`), `resume` (2 phrases max), `contenu` (texte complet avec étapes numérotées), `saison` (`saison sèche`, `saison des pluies`, `toute l'année`), `regions` (défaut `Tout le Burkina Faso`), `source` (nom de l'organisme ou lien), `duree_lecture` (en minutes), `statut` (`en_attente`, `publie`, `archive`), `date_publication` (date), `created_at`, `updated_at`.
  - **Sécurité Row Level Security (RLS)** :
    - Public / Utilisateurs connectés : lecture autorisée **uniquement** pour `statut = 'publie'` (`conseils_select_policy`).
    - Administrateurs (`is_admin = true`) : lecture complète de tous les statuts (`en_attente`, `publie`, `archive`), création (`conseils_insert_policy`), modification / publication / archivage (`conseils_update_policy`), et suppression (`conseils_delete_policy`).
  - Déclencheur automatique `trg_conseils_updated_at` pour actualiser `updated_at` à chaque modification.
- **Espace Administration (« Gérer les conseils »)** :
  - Accessible sous la section `ADMINISTRATION > Gérer les conseils` (`#admin-conseils`) pour les profils administrateurs.
  - Filtre par statut : `Tous`, `En attente`, `Publiés`, `Archivés`.
  - Tri prioritaire : les fiches `en_attente` s'affichent en tête avec puce dorée et badge compteur d'alerte en direct dans la barre latérale et le tiroir mobile.
  - Bouton « + Ajouter un conseil » ouvrant la modale `#modalManageConseil` avec saisie des fiches techniques.
  - Boutons d'action par fiche : `Lire` (lecture complète), `Modifier` (édition), `Publier` (mise en ligne immédiate), `Archiver` (déplacement en archives).
- **Espace Utilisateur (« Conseils Agronomiques »)** :
  - Accessible via `S'INFORMER > Conseils` (`#conseils`) ou depuis la carte héro du tableau de bord.
  - Affichage strict des seuls conseils au statut `publie` issus de Supabase (faux conseils démo supprimés), triés du plus récent au plus ancien.
  - Filtre interactif par catégorie : *Tous*, *Maraîchage*, *Céréales*, *Élevage*, *Irrigation*, *Sol et fertilisation*, *Maladies et ravageurs*, *Récolte et conservation*.
  - Modale de lecture complète (`#modalConseilDetails`) affichant le résumé, le guide étape par étape, les cultures ciblées, la saison et la région.
  - **Synthèse Vocale 🔊 « Écouter le conseil »** :
    - Intégration de la Web Speech API (`SpeechSynthesis`) avec voix française rythmée (`rate = 0.92`).
    - Lecture fluide du titre, de la catégorie, des cultures, du résumé synthétique, des étapes pratiques et de la source.
    - Bascule dynamique du bouton en `⏹️ Arrêter la lecture` avec animation pulsée durant l'écoute.
  - **Badge « X nvx » dans le menu** :
    - Calcule automatiquement le nombre de conseils publiés depuis moins de 7 jours (`date_publication >= now - 7j`).
  - **Carte « Conseil agronomique » du Tableau de Bord (`#dashAdviceCard`)** :
    - Dynamique et connectée : affiche le dernier conseil agronomique publié avec son titre, résumé, temps de lecture et catégorie.
    - Clic direct sur « Lire le conseil → » ouvrant immédiatement la fiche complète dans la modale.

### R. Modèles de Cultures & Prévision Automatique de Récolte (v5.4)
- **Table Supabase `public.modeles_cultures`** :
  - Colonnes : `id` (UUID), `nom_culture` (texte not null), `variete` (texte, null = toutes variétés), `categorie` (maraîchage, céréales…), `mode_depart` (`pepiniere` ou `semis_direct`), `pepiniere_jours_min` (int), `pepiniere_jours_max` (int), `recolte_jours_min` (int), `recolte_jours_max` (int), `conseil_court` (phrase simple sans abréviations), `source` (nom/lien de l'organisme), `actif` (booléen default true), `created_at` (timestamptz).
  - **Row Level Security (RLS)** :
    - Lecture autorisée pour tous (`actif = true` ou `is_admin()`).
    - Insertion, modification et suppression strictement réservées aux administrateurs (`is_admin()`).
  - **Données certifiées de départ (sources officielles vérifiées)** :
    1. *Oignon* : toutes variétés, maraîchage, pépinière (40 à 45 jours), récolte (90 à 120 jours après repiquage), conseil court : « Repiquez quand les plants ont 5 à 6 feuilles. », source : Chambre régionale d'agriculture de Maradi, fiche oignon 2017.
    2. *Tomate* : toutes variétés, maraîchage, pépinière (28 à 42 jours), récolte : NULL (inconnue), conseil court : « Repiquez les plants après quatre à six semaines en pépinière. », source : Fiche technique tomate FBT3, CORAF / MITA.
    3. *Maïs* : variété Komsaya, céréales, semis direct, récolte (85 à 95 jours après semis), conseil court : « Komsaya est une variété précoce de l'INERA. », source : INERA / Sidwaya.
  - **Zéro donnée d'exemple dans les tables utilisateur** : les tables `parcels` et `crop_cycles` restent strictement dédiées aux utilisateurs (`profile_id`).
- **Formulaire Utilisateur « Ajouter une culture » (`#modalAddCropCycle`)** :
  - Sélecteur facultatif de modèle (`#cropCycleModeleSelect`) alimenté en direct depuis `modeles_cultures (actif = true)`.
  - Sélection d'un modèle :
    - Préremplissage automatique du nom de la culture et de la catégorie.
    - Calcul automatique de la date de récolte estimée : `estimated_harvest_date = planting_date + recolte_jours_min`.
    - Affichage de la fourchette de récolte en toutes lettres (ex: « Récolte prévue entre le 30 décembre 2026 et le 29 janvier 2027 »).
    - Si `mode_depart = 'pepiniere'` : affichage de la période de repiquage en toutes lettres (ex: « Repiquage prévu entre le 10 novembre 2026 et le 15 novembre 2026 »).
    - Si durée de récolte inconnue (Tomate) : le champ de date de récolte reste vide et le message officiel « Demandez la durée à l'agent d'agriculture de votre zone. » s'affiche clairement.
    - Création manuelle sans modèle : fonctionne en saisie libre sans aucune contrainte.
  - Bouton **« 🔊 Écouter »** : synthèse vocale adaptée aux producteurs peu lettrés qui lit à voix haute le nom de la culture, les dates de repiquage, les dates de récolte et le conseil agronomique.
- **Espace Administration (« Gérer les modèles »)** :
  - Accessible via `ADMINISTRATION > Gérer les modèles` (`#admin-modeles`) pour les profils administrateurs.
  - Onglets de filtrage : `Tous`, `Actifs`, `Désactivés`.
  - Création et modification de modèles dans la modale `#modalManageModele` (saisie des durées min/max, conseil court et source).
  - Action d'activation / désactivation en 1 clic (`toggleModeleActive`).

### S. Régions Officielles du Burkina Faso & Bilan Financier par Parcelle (v5.5)
- **Table Supabase `public.regions`** :
  - Colonnes : `id` (UUID), `nom` (text not null), `chef_lieu` (text not null), `anciens_noms` (text[]), `ordre` (int).
  - Remplie avec les **17 régions officielles** (Conseil des ministres du 2 juillet 2025) : Bankui (Dédougou), Djôrô (Gaoua), Goulmou (Fada N'Gourma), Guiriko (Bobo-Dioulasso), Kadiogo (Ouagadougou), Kuilsé (Kaya), Liptako (Dori), Nando (Koudougou), Nakambé (Tenkodogo), Nazinon (Manga), Oubri (Ziniaré), Sirba (Bogandé), Soum (Djibo), Tannounyan (Banfora), Tapoa (Diapaga), Sourou (Tougan), Yaadga (Ouahigouya).
  - `public.parcels` dispose d'une colonne `region_id` (UUID nullable, référence vers `regions`).
- **Formulaire Parcelle** :
  - Menu déroulant « Votre région » listant « Nom (Chef-lieu) » trié par nom.
  - Champ location transformé en « Village ou quartier (facultatif) ».
- **Classement Régional des Conseils et Financements** :
  - Si l'utilisateur possède au moins une parcelle localisée :
    1. Section « Pour votre région » (correspondance exacte avec nom ou anciens noms, regex mot entier).
    2. Section « Tout le Burkina Faso ».
    3. Section « Autres régions ».
  - Aucun élément n'est masqué, seul l'ordre est optimisé pour la pertinence locale.
- **Bilan Financier par Parcelle** :
  - Bloc « Bilan de cette parcelle » affiché sur chaque fiche parcelle (desktop et mobile).
  - Total des dépenses = somme des dépenses rattachées aux cultures de cette parcelle (`expenses.crop_cycle_id -> crop_cycles.parcel_id`).
  - Total des ventes = somme des recettes rattachées aux cultures de cette parcelle (`revenues.crop_cycle_id -> crop_cycles.parcel_id`).
  - Gain = ventes - dépenses. Vert « Vous avez gagné X francs CFA » si positif, orange « Vous avez perdu X francs CFA » si négatif.
  - Détail culture par culture en dessous.
  - État vide pédagogique sans dépenses ni ventes : « Ajoutez vos dépenses et vos ventes pour voir si cette parcelle vous fait gagner de l'argent. »
  - Bouton « 🔊 Écouter » lisant le bilan complet en français pour les exploitants peu lettrés (sans abréviation : strictly « francs CFA »).
  - Modales d'ajout de dépense et de vente proposant le rattachement facultatif à une culture (`crop_cycle_id`).

### R. Lien Culture ↔ Modèle & Choix « Autre Culture » (v5.6)
- **Lien Culture ↔ Modèle (Point 1)** :
  - Colonne `modele_id` (uuid, nullable, clé étrangère vers `public.modeles_cultures(id) ON DELETE SET NULL`) dans `public.crop_cycles`.
  - Lors de l'enregistrement d'une culture avec un modèle agronomique sélectionné, l'identifiant du modèle est persisté dans `modele_id`.
  - Conservation intégrale des règles RLS et données existantes.
- **Choix « Autre culture (pas dans la liste) » (Point 2)** :
  - Ajout en dernière position du sélecteur de modèle de l'option « ✏️ Autre culture (pas dans la liste) ».
  - Si cette option est choisie : `modele_id` reste nul (`null`), le producteur saisit librement le nom de sa culture et choisit sa catégorie.
  - Affichage clair et pédagogique : *« Nous ne connaissons pas encore la durée de cette culture. Indiquez vous-même la date de récolte prévue. »*, lisible à voix haute via « 🔊 Écouter ».
  - Dans l'espace administrateur « Gérer les modèles de cultures », une section *« 📋 Cultures déclarées par les producteurs »* recense les cultures saisies librement avec le nombre de producteurs distincts, et un bouton d'action directe *« ➕ Créer modèle »* pour pré-remplir la création du modèle agronomique correspondant.

- **Conseils Adaptés aux Cultures du Producteur (Point 3 - v5.7)** :
  - Dans le menu Conseils (desktop et mobile), si le producteur a au moins une culture en cours, ajout en tête d'une section prioritaire **« 🌱 Pour vos cultures »**.
  - Sélection des conseils publiés dont le champ `cultures` mentionne le nom de la culture ou du modèle du producteur (comparaison insensible aux majuscules et aux accents, par mot entier avec tolérance plurielle).
  - Principe de préservation intégrale : **aucun conseil n'est jamais masqué**, seul l'ordre d'affichage est optimisé pour placer en premier les conseils pertinents pour les cultures du producteur, suivi des sections territoriales « 📍 Pour votre région », « 🇧🇫 Tout le Burkina Faso », et « 🌍 Autres régions ».

### S. Défilement Interne des Modales Mobile & Boutons d'Action Sticky (v5.8)
- **Résolution du rognage de contenu sur Android (Chrome) & iPhone (WebKit/Safari)** :
  1. *Défilement interne* : Boîtes de dialogue de modales configurées avec `max-height: 100dvh` (fallback `100vh`), `overflow-y: auto`, `-webkit-overflow-scrolling: touch`, `overscroll-behavior: contain` et `touch-action: pan-y` pour garantir la prise en compte du glissement tactile du doigt.
  2. *Zéro blocage JavaScript* : Vérification qu'aucun gestionnaire tactile n'exécute de `preventDefault` sur les fenêtres modales.
  3. *Marge de sécurité basse* : `padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 110px)` sur tous les conteneurs de contenu (`.fin-detail-body`, `.modal-body-content`, `.modal-form`, `.luxury-modal-body`, `.pricing-content`) afin que les textes longs ne soient jamais dissimulés sous les boutons fixes ou les barres d'adresse mobile.
  4. *Boutons d'action sticky* : Poutres d'actions (notamment « Commander sur WhatsApp » et « Appeler le fournisseur ») épinglées en bas de fenêtre (`position: sticky; bottom: 0; z-index: 25;`) avec fond opaque protecteur (`background: var(--surface)`) et ombre portée ascendante pour rester 100% lisibles et accessibles.
  5. *Blocage automatique du défilement arrière-plan* : Classe `modal-open` appliquée dynamiquement sur `body` et `html` (`overflow: hidden !important`) via un `MutationObserver` et retirée instantanément dès la fermeture de la dernière fenêtre.
  6. *Application universelle* : Prise en charge identique sur l'ensemble des 20 modales de la plateforme (fiches matériel, financements, conseils, formulaires d'ajout/modification, dépenses, ventes, abonnements, authentification).

### T. Support des GIF Animés Matériel, Textareas Agrandies & Normalisation WhatsApp (v5.9)
- **Support des GIF et WebP Animés dans « Matériel & Services »** :
  1. *Acceptation dans le formulaire* : `materielPhotoInput` accepte désormais les formats `.gif`, `image/gif`, `.webp`, `.png`, `.jpg`, `.jpeg`.
  2. *Exemption de compression Canvas* : Les fichiers GIF (`image/gif` ou `.gif`) et les fichiers WebP animés (détectés via le conteneur RIFF/chunks `ANIM`/`ANMF`) contournent la compression Canvas pour être envoyés directement dans Supabase Storage avec leur type MIME d'origine (`image/gif` ou `image/webp`), préservant ainsi l'intégralité de leur boucle d'animation. Les images JPG et PNG continuent d'être compressées automatiquement via Canvas.
  3. *Configuration Supabase Storage* : Extension de `allowed_mime_types` sur le bucket `materiels` pour autoriser formellement `image/gif`.
  4. *Rendu en mouvement* : Affichage fluide et continu sur les cartes catalogue (`.materiel-card-img`), le carrousel principal de la fiche détail (`#matDetailMainPhoto`), et l'aperçu du formulaire (`renderPhotoPreviews`).
- **Agrandissement Dynamique des Textareas** :
  - Les champs « Description » et « Caractéristiques techniques » bénéficient d'un format de départ spacieux de **8 lignes** (`rows="8"`, `min-height: 180px`, `line-height: 1.55`) et s'agrandissent automatiquement en temps réel (`autoExpandTextarea`) au fur et à mesure de la saisie de texte ou lors du pré-remplissage en mode modification.
- **Normalisation Stricte des Liens WhatsApp (`wa.me`)** :
  - Fonction `sanitizeBurkinaPhone` qui élimine tout préfixe `+226`, `00226` ou `226` saisi par l'utilisateur avant de recomposer le lien officiel `https://wa.me/226[numéro]` : l'indicatif 226 n'est plus jamais dupliqué en `wa.me/226226...`.
### U. Résolution Enregistrement WebP & GIF Animés & Diagnostic d'Erreur Précis (v6.0)
- **Origine du blocage identifiée et résolue** :
  1. *Échec de détection et écrasement Canvas* : L'ancienne détection par tranche binaire fixe (`slice(0, 256)`) ne trouvait pas les marqueurs `ANIM` lorsque des métadonnées (EXIF, ICCP, XMP) précédaient le flux d'animation WebP. Le fichier basculait alors vers la compression Canvas `compressImageFile(file)`. Canvas levait une exception `img.onerror` non gérée qui rejetait un objet `Event` brut (sans propriété `.message`), bloquant le script avant l'émission de la moindre requête réseau HTTP.
  2. *Bypass total de Canvas pour GIF et WebP* : Désormais, **tous les fichiers GIF (`image/gif` ou extension `.gif`) et WebP (`image/webp` ou extension `.webp`)** contournent systématiquement la compression Canvas et sont transférés tels quels avec toutes leurs images d'animation intactes.
  3. *Typage MIME strict Supabase Storage* : Dans `uploadMaterielPhoto`, conversion sécurisée du fichier en `Blob` avec type MIME strict garanti (`image/webp` ou `image/gif`) pour éviter que le navigateur ne transmette un type vide ou générique `application/octet-stream` rejeté par la liste blanche du bucket `materiels`.
  4. *Conservation de la compression JPG & PNG* : Les photos classiques JPEG et PNG continuent d'être compressées automatiquement à 1200×1200 px avec une qualité de 0.8 pour économiser la bande passante.
  5. *Diagnostic technique explicite dans les alertes* : En cas d'erreur lors de l'enregistrement d'un produit, le toast affiche désormais la raison technique exacte (`Impossible d'enregistrer le produit : ${errorDetail}`) au lieu du message opaque précédent, permettant une compréhension immédiate de tout incident.

### V. Finalisation Complète de « Mon exploitation » (v6.1)
- **1. Parcelles Géoréférencées & Cultures Associées** :
  - Formulaire complet d'ajout/modification de parcelles : nom, superficie en hectares (avec texte d'aide pédagogique : *« 1 hectare = un carré de 100 pas sur 100 pas »*), type d'irrigation (`goutte-à-goutte`, `pluie`, `arrosoir`, `pompe`, `bas-fond`), région (table `regions`) et village (colonne `village` ajoutée dans Supabase).
  - Chaque fiche parcelle affiche en direct la liste des cultures actives avec leur rentabilité réelle (dépenses, ventes et gain net en F CFA).
- **2. Cycles Culturaux en 3 Choix Simples & Frise Temporelle** :
  - Démarrage d'un cycle en 3 choix simples : (1) la parcelle, (2) la culture avec variété issue de `modeles_cultures`, et (3) la date de semis ou mise en pépinière.
  - Calcul et persistance réels dans Supabase des colonnes `repiquage_date`, `harvest_date_min`, `harvest_date_max`, `variete` et `conseil_court`.
  - Statut dynamique calculé automatiquement : *« En pépinière »*, *« En croissance »*, *« Récolte proche (<15j) »*, *« À récolter »*, *« Terminé »*.
  - Frise chronologique visuelle haute précision avec jalons (semis, repiquage, récolte) et repère dynamique *« Aujourd'hui »* qui progresse jour après jour.
  - Gestion des interventions et travaux agricoles personnalisés (sarclage, neem, compost) reliés à chaque cycle dans la table `cycle_tasks`.
- **3. Tâche pg_cron Quotidienne des Rappels d'Exploitation** :
  - Tâche `rappels_exploitation_quotidien` enregistrée dans `cron.job` (`0 6 * * *` soit 06h00 UTC / heure de Ouagadougou).
  - Exécute la fonction `public.generer_rappels_exploitation()` avec protection stricte anti-doublon pour alerter la veille du repiquage, le début de récolte et la veille des tâches planifiées.
- **4. Finances & Marges Nettes Réelles (Zéro Donnée Démo)** :
  - Suppression intégrale de tous les chiffres de démonstration en dur dans le code.
  - Calcul dynamique en direct des dépenses et recettes du mois courant et de la marge de campagne.
  - Graphique en barres bicolores des flux réels sur les 6 derniers mois.
  - Fiches de rentabilité par cycle avec marge nette colorée en vert (bénéfice) ou rouge (déficit).
- **5. Synthèse Consolidée de l'Exploitation** :
  - Métriques globales en temps réel : surface totale cultivée, nombre de cycles actifs, marge nette cumulée, culture la plus rentable de l'exploitation.
  - Calendrier unifié des prochaines échéances sous 30 jours (repiquages, récoltes, travaux).
- **6. Compte d'Exploitation Certifié & Imprimable** :
  - Fonctionnalité conditionnée au statut Pro (`profiles.is_pro = true`).
  - Utilisateur gratuit : aperçu flouté avec calque incitatif *« 🔒 Passer au Forfait Pro »*.
  - Utilisateur Pro : bilan comptable officiel complet certifié, ventilé par catégorie de charge et par parcelle/culture, avec cachet électronique horodaté et mise en page optimisée pour l'impression / PDF (`window.print()`).

### W. Sécurité Supabase & Gestion des Rappels de Cultures (v6.2)
- **Durcissement de Sécurité sur `public.generer_rappels_exploitation()`** :
  - `SET search_path = public` ajouté à la fonction `SECURITY DEFINER` pour prévenir tout risque de détournement de schéma d'exécution.
  - Privilège `EXECUTE` révoqué des rôles non autorisés (`PUBLIC`, `anon`, `authenticated`). Seuls le superutilisateur `postgres` et `service_role` (utilisé par `pg_cron`) conservent le droit d'exécution de la routine quotidienne.
- **Support des Types de Notifications `agronomique` & `tache`** :
  - Ajout des icônes dédiées dans la page Notifications : `🌾` (vert pastel `#E8F5E9`) pour les rappels de culture et `📋` (ambre pastel `#FFF8E1`) pour les tâches d'entretien.
  - Ajout de l'interrupteur *« 🌾 Rappels de mes cultures »* dans la modale Profil & Paramètres sous la section *« Mes notifications »*, activé par défaut (`checked`).
  - Filtrage dynamique synchronisé avec `localStorage` (`revolution_notif_prefs_[profileId]`) masquant ou affichant les rappels selon le choix de l'utilisateur.

### X. Stabilisation du Menu Tiroir & Verrouillage Anti-Doublon d'Auth (v6.3)
- **Origine du Phénomène Identifiée & Neutralisée** :
  1. *Événements Auth Concurrents & Multiples Récritures DOM* : À la connexion, `portalLoginForm` et `onAuthStateChange('SIGNED_IN')` lançaient en parallèle plusieurs initialisations réseau (`checkUserProfileAndProceed`). Les multiples résolutions asynchrones réexécutaient `renderMobileView()`, écrasant le DOM de `mobileAppMount` et effaçant la classe `.open` du tiroir qui venait d'être touché par l'utilisateur.
  2. *Rebond & Propagation d'Événements* : Le clic sur le bouton hamburger (☰) ne contenait pas `e.stopPropagation()`. L'overlay `.mobile-drawer-overlay` recevait l'événement dès son affichage sous le doigt et refermait aussitôt le menu.
- **Correctifs Appliqués** :
  1. *Verrous d'initialisation* : Mise en place de `currentSessionInitializedUserId` et `isSessionInitializing` dans `checkUserProfileAndProceed` interdisant les exécutions concurrentes et répétées pour un même utilisateur déjà actif.
  2. *Événements Supabase ciblés dans onAuthStateChange* :
     - `TOKEN_REFRESHED` : met uniquement à jour l'objet `currentAuthUser` sans réinitialiser l'application.
     - `SIGNED_IN` / `USER_UPDATED` répété : met à jour l'utilisateur sans relancer le flux complet.
     - `SIGNED_OUT` : réinitialise formellement les verrous de session pour garantir une reconnexion immédiate propre sans recharger la page.
  3. *Préservation de l'état du drawer* : `renderMobileView()` mémorise `wasDrawerOpen` avant toute réécriture DOM et rétablit immédiatement l'ouverture si le tiroir était déployé.
  4. *Protection stricte anti-propagation* : Ajout systématique de `e.stopPropagation()` et `e.preventDefault()` sur les boutons d'ouverture (☰ hamburger, avatar), les boutons de fermeture (✕ croix, clic overlay) et les boutons d'actions principales bureau et mobile (cloche notifications, + Dépense, + Vente, profil).

### Y. Correction Intégrale de la Navigation & Routage Unifié Multi-Plateforme (v6.4)
- **Origine du dysfonctionnement identifiée** :
  1. *Absence de branches mobiles pour l'Exploitation* : Dans `renderMobileView()`, `currentRoutePage` n'avait pas de branches pour `'synthese'`, `'cycles'` et `'finances'`. La navigation tombait systématiquement dans le bloc `else` par défaut qui réinjectait le HTML du tableau de bord.
  2. *Réouverture parasite du tiroir mobile* : Lors du clic sur un lien du menu, `navigateToPage` réexécutait `renderMobileView` qui réactivait l'ouverture via `if (wasDrawerOpen) openMobileDrawer()`.
  3. *Manque de table de correspondance (alias et liens notifications)* : Les ancres utilisées par les notifications (`#exploitation-cycles`, `#opportunites`, etc.) ou les raccourcis du dashboard (`#toutes-echeances`) n'étaient pas résolues dans `handleRoute()`.
- **Correctifs Appliqués** :
  1. *Routage mobile complet de « Mon exploitation »* : Ajout des 3 fonctions de rendu dédiées `getMobileSyntheseHtml()`, `getMobileCyclesHtml()` et `getMobileFinancesHtml()` dans `renderMobileView()`.
  2. *Dictionnaire unifié de résolution (`ROUTE_ALIASES`)* : Mappage complet de toutes les ancres principales et de tous les alias :
     - `#synthese`, `#exploitation-synthese`, `#toutes-echeances` → Synthèse de l'exploitation
     - `#parcelles`, `#exploitation-parcelles` → Parcelles & cultures
     - `#cycles`, `#exploitation-cycles` → Cycles culturaux (semis, repiquages, récoltes)
     - `#finances`, `#exploitation-finances` → Finances & Marges réelles
     - `#opportunites`, `#financements` → Opportunités & Subventions
     - `#conseils` → Conseils agronomiques
     - `#meteo`, `#meteo-details` → Météo agricole & Prévisions 7j
     - `#marche`, `#annonces` → Marché agricole
     - `#materiel-services`, `#materiel` → Matériel & Services
     - `#mes-annonces` → Mes annonces
     - `#admin-financements`, `#admin-conseils`, `#admin-modeles`, `#admin-materiels`, `#admin-queue` → Administration
     - `#notifications` → Centre de notifications réelles
     - `#abonnements`, `#pricing` → Modale Forfaits Pro
     - `#profil` → Modale Profil & Paramètres
  3. *Fermeture automatique du menu sur téléphone* :
     - Tout clic sur `.mobile-drawer-link` déclenche `isNavigatingRoute = true; closeMobileDrawer();`.
     - `renderMobileView()` vérifie `if (wasDrawerOpen && !isNavigatingRoute) openMobileDrawer(); isNavigatingRoute = false;`, garantissant la fermeture immédiate et durable du menu lors d'une navigation.
  4. *Raccordement de tous les raccourcis du tableau de bord* :
     - Cartes 1 et 2 (Dépenses / Recettes) → `#finances`
     - Carte 3 (Cycles en cours) → `#cycles`
     - Carte 4 (Opportunités ouvertes) → `#opportunites`
     - « Voir tout » des échéances urgentes (bureau et mobile) → `#synthese`
     - « Voir toutes les parcelles → » → `#parcelles`
     - « Prévisions 7j → » et carte météo mobile → `#meteo`
  5. *Gestion résiliente des adresses inconnues avec console.warn* :
     - Toute ancre non répertoriée déclenche `console.warn('⚠️ [Navigation] Adresse inconnue demandée :', '#' + rawHash);`, redirige vers `#dashboard` et affiche le tableau de bord de secours.

---

*Fin du document de spécification système — Version 6.4 • Révolution Agricole Burkina Faso.*



