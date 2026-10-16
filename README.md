# 🌱 Révolution Agricole — Système de Design & Dashboard Interactif

Ce projet est l'implémentation directe et fidèle du **système de design et du tableau de bord** de la plateforme SaaS **Révolution Agricole**, inspiré de l'ergonomie primée d'**AgriVision** et adapté au contexte agro-climatique et économique du Burkina Faso (Sahel, F CFA, connectivité intermittente, données vérifiées).

---

## 🎯 Points Clés Inspirés d'AgriVision & Adaptations Burkinabè

| Élément AgriVision | Décision & Justification dans Révolution Agricole |
| :--- | :--- |
| **Barre latérale groupée** (MAIN, MANAGEMENT, SUPPORT) | **Garde intégrale** : Groupes `ACCUEIL`, `S'INFORMER`, `OPPORTUNITÉS`, `ÉCHANGER`, `MON EXPLOITATION`, `COMPTE`. Élément actif sur fond vert pastel (`#EAF4E6`) avec texte et icône vert foncé. |
| **En-tête Identité & Actions** | Identité de l'acteur agricole à gauche (nom, rôle, commune burkinabè), recherche globale, alertes avec pastille rouge et avatar. |
| **Bouton « Download Report »** | **Remplacé par l'action contextuelle prioritaire** : « + Ajouter une dépense » (Producteur), « + Publier une annonce » (Fournisseur), ou « + Demande d'achat » (Acheteur). |
| **4 Cartes d'indicateurs pastel** | Une teinte pastel par domaine (Vert exploitation `#EAF4E6`, Bleu météo/recettes `#EEF5FD`, Jaune cycles/production `#FFF7E0`, Violet opportunités `#F2EFFD`). |
| **Flèche rouge d'alerte** | **Corrigé** : La couleur reflète le jugement (vert favorable, rouge défavorable). Une hausse des dépenses est rouge, une hausse des recettes est verte. |
| **Courbe d'humidité du sol** | **Remplacée par le Bar Chart Dépenses / Recettes** : Adapté aux producteurs sans capteurs connectés, avec calcul transparent de la marge nette sous le graphique (`Recettes − Dépenses`). |
| **Tableau « Field Status »** | **Transformé en « Mes cycles en cours »** : Culture, parcelle, semis, récolte prévue, pastille d'état dynamique et menu d'actions. |
| **Carte Météo** | Données Open-Meteo pour Koudougou avec probabilité de pluie, température, vent et mention obligatoire de la **source et heure de MAJ**. |
| **Carte « Go Premium »** | **Remplacée par « Complétez votre profil 60% »** avec barre de progression pour qualifier les données de météo et subventions. |

---

## 📱 Double Affichage : Bureau & Simulateur Mobile Android

Conformément à la **Section 2 du plan d'implémentation**, la vue mobile n'est pas une simple réduction :
1. **Météo en premier** : Consultée en priorité le matin avant d'aller au champ.
2. **Indicateurs en grille 2×2** : Zéro défilement horizontal.
3. **Échéances urgentes** : Alertes de dates limites (PReCA) et récoltes imminentes.
4. **Cycles en cartes verticales** : Adapté aux écrans tactiles 360–430 px.
5. **Bouton d'action flottant (+)** : Saisie d'une dépense en moins de 30 secondes.
6. **Barre de navigation inférieure à 5 entrées** : Accueil, Marché, Financements, Exploitation, Menu.

---

## ⚡ Sélecteur de Rôles Dynamique

En haut de l'écran, la barre de contrôle prototype permet de tester les 4 profils du plan :
- **🌾 Productrice** : Awa Ouédraogo (Koudougou) — Suivi des dépenses/recettes, cycles tomate/oignon/chou.
- **🚜 Fournisseur** : Rasmané Sawadogo (Ouagadougou) — Annonces actives, contacts reçus (appels/WhatsApp).
- **💼 Acheteur** : Salif Traoré (Bobo-Dioulasso) — Offres de maïs et sésame, prix indicatifs vérifiés.
- **🛡️ Admin / Modérateur** : File de modération, opportunités > 90 jours à revérifier, journal d'audit.

---

## 💻 Visualisation Rapide

Ouvrez simplement le fichier [index.html](file:///c:/Users/user/Downloads/REVOLUTION%20AGRICOLE/index.html) dans n'importe quel navigateur moderne (Chrome, Edge, Firefox, Safari).
