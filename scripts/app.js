/**
 * RÉVOLUTION AGRICOLE — MOTEUR INTERACTIF DU DASHBOARD
 * Implémentation du système multi-profils, responsive mobile et états UI
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // CONFIGURATION ET CONNEXION SUPABASE
  // ==========================================
  const SUPABASE_URL = 'https://wghwbwwffbfvrcuvzijt.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnaHdid3dmZmJmdnJjdXZ6aWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzA2NjMsImV4cCI6MjEwNzc0NjY2M30.sNdDhADkPhcfQEgPAy_QayUvdIJDIqSaPSmGf9CKA_c';

  let supabaseClient = null;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('🌾 [Révolution Agricole] Connecté avec succès à Supabase !');
  } else {
    console.warn('⚠️ [Révolution Agricole] Client Supabase CDN indisponible, bascule en mode local.');
  }

  // ==========================================
  // DONNÉES DES 4 PROFILS CONFORMES AU CAHIER DES CHARGES
  // ==========================================
  const PROFILES_DATA = {
    producer: {
      id: 'producer',
      name: 'Awa Ouédraogo',
      metaRole: 'Maraîchère & Semencière',
      location: '📍 Koudougou (Boulkiemdé)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      actionLabel: 'Ajouter une dépense',
      greeting: 'Bonjour, Awa <span class="greeting-emoji">🌱</span>',
      subtitle: 'Voici l\'essentiel pour votre activité aujourd\'hui sur votre exploitation.',
      isAdmin: false,
      hasExploitation: true,
      stats: [
        {
          module: 'Exploitation',
          label: 'Dépenses du mois',
          value: '185 000',
          unit: 'F CFA',
          trendText: '12% défavorable',
          trendType: 'unfavorable',
          comp: 'vs sept. (165 000 F)',
          color: 'green'
        },
        {
          module: 'Recettes',
          label: 'Recettes du mois',
          value: '420 000',
          unit: 'F CFA',
          trendText: '8% favorable',
          trendType: 'favorable',
          comp: 'vs sept. (388 000 F)',
          color: 'blue'
        },
        {
          module: 'Production',
          label: 'Cycles en cours',
          value: '3',
          unit: 'actifs',
          badge: '1 récolte cette sem.',
          comp: 'Parcelle P2 (Tomate)',
          color: 'yellow'
        },
        {
          module: 'Financements',
          label: 'Opportunités ouvertes',
          value: '5',
          unit: 'vérifiées',
          badge: '2 clôturent < 7 j',
          comp: 'PReCA & Fonds Vert',
          color: 'purple'
        }
      ],
      chartTitle: 'Dépenses et recettes',
      chartSubtitle: 'Évolution des flux de trésorerie sur l\'exploitation',
      marginOct: '+235 000 F CFA',
      deadlines: [
        { title: 'Appel à projets PReCA', meta: 'Subvention intrants • Min. Agriculture', badge: 'Dans 4 j', icon: 'amber' },
        { title: 'Récolte Tomate (0,5 ha)', meta: 'Parcelle P2 • Semis du 02/08', badge: 'Lundi 20', icon: 'green' },
        { title: 'Irrigation & purin de neem', meta: 'Parcelle P1 (Oignon violet)', badge: 'Mer. 22', icon: 'blue' },
        { title: 'Fonds Résilience Maraîchage', meta: 'Équipement goutte-à-goutte sol.', badge: '28 oct.', icon: 'purple' }
      ],
      tableTitle: 'Mes cycles en cours',
      tableSubtitle: '3 cultures suivies sur 1,8 hectare',
      tableHeaders: ['CULTURE & VARIÉTÉ', 'PARCELLE', 'DATE SEMIS', 'RÉCOLTE ESTIMÉE', 'STATUT DU CYCLE', 'ACTIONS'],
      tableRows: [
        {
          avatarText: 'TM',
          avatarClass: 'bg-avatar-green',
          name: 'Tomate Mongal F1',
          sub: 'Maraîchage de contre-saison',
          col2: 'P2 (0,5 ha) • Irrigué',
          col3: '02/08/2026',
          col4: '20/10/2026 (dans 4 j)',
          statusText: 'Récolte imminente',
          statusClass: 'state-harvest',
          dotClass: 'dot-orange'
        },
        {
          avatarText: 'ON',
          avatarClass: 'bg-avatar-yellow',
          name: 'Oignon Violet de Galmi',
          sub: 'Bulbilles certifiées',
          col2: 'P1 (1,0 ha) • Bassin',
          col3: '15/09/2026',
          col4: '12/12/2026',
          statusText: 'En végétation',
          statusClass: 'state-growing',
          dotClass: 'dot-green'
        },
        {
          avatarText: 'CH',
          avatarClass: 'bg-avatar-blue',
          name: 'Chou KK Cross',
          sub: 'Pépinière réussie',
          col2: 'P3 (0,3 ha) • Goutte-à-goutte',
          col3: '01/10/2026',
          col4: '05/12/2026',
          statusText: 'Repiquage récent',
          statusClass: 'state-new',
          dotClass: 'dot-blue'
        }
      ]
    },

    supplier: {
      id: 'supplier',
      name: 'Rasmané Sawadogo',
      metaRole: 'Fournisseur d\'Équipements & Intrants',
      location: '📍 Ouagadougou (Zone Industrielle Kossodo)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      actionLabel: 'Publier une annonce',
      greeting: 'Bonjour, Rasmané <span class="greeting-emoji">🚜</span>',
      subtitle: 'Gérez vos offres de matériel, stocks d\'intrants et contacts qualifiés.',
      isAdmin: false,
      hasExploitation: false,
      stats: [
        {
          module: 'Marché',
          label: 'Annonces actives',
          value: '8',
          unit: 'en ligne',
          trendText: '+2 ce mois',
          trendType: 'favorable',
          comp: '98% taux de réponse',
          color: 'green'
        },
        {
          module: 'Contacts',
          label: 'Contacts reçus (7 j)',
          value: '14',
          unit: 'appels/wa',
          trendText: '▲ 27% vs sem. passée',
          trendType: 'favorable',
          comp: '10 appels • 4 WhatsApp',
          color: 'blue'
        },
        {
          module: 'Expiration',
          label: 'Expirent sous 10 j',
          value: '2',
          unit: 'à renouveler',
          badge: 'Motopompe & Charrue',
          comp: 'Durée max : 60 jours',
          color: 'yellow'
        },
        {
          module: 'Opportunités',
          label: 'Appels d\'offres matériel',
          value: '3',
          unit: 'ouverts',
          badge: 'Projets PReCA & FAO',
          comp: 'Fourniture semences',
          color: 'purple'
        }
      ],
      chartTitle: 'Vues et contacts reçus',
      chartSubtitle: 'Intérêt généré par vos annonces sur le marché national',
      marginOct: '14 contacts qualifiés',
      deadlines: [
        { title: 'Renouveler annonce Motoculteur 15CV', meta: 'Expire dans 48 heures', badge: 'Urgent', icon: 'amber' },
        { title: 'Livraison motopompe solaire', meta: 'Client Coopérative Koudougou', badge: 'Vendredi', icon: 'green' },
        { title: 'Dépôt dossier Fourniture Engrais', meta: 'Appel d\'offres PReCA Ouaga', badge: '25 oct.', icon: 'purple' }
      ],
      tableTitle: 'Mes annonces en vitrine',
      tableSubtitle: 'Gérez la visibilité et les contacts de vos équipements',
      tableHeaders: ['PRODUIT / MATÉRIEL', 'INTENTION & PRIX', 'VUES (30J)', 'CONTACTS', 'STATUT', 'ACTIONS'],
      tableRows: [
        {
          avatarText: 'MC',
          avatarClass: 'bg-avatar-green',
          name: 'Motoculteur Diesel 15 CV + Fraises',
          sub: 'Matériel neuf sous garantie 1 an',
          col2: 'Vente • 1 450 000 F CFA',
          col3: '428 vues',
          col4: '9 contacts',
          statusText: 'Actif (en ligne)',
          statusClass: 'state-growing',
          dotClass: 'dot-green'
        },
        {
          avatarText: 'MP',
          avatarClass: 'bg-avatar-blue',
          name: 'Motopompe Honda 3 pouces 6.5 HP',
          sub: 'Débit 1 000 L/min',
          col2: 'Vente • 280 000 F CFA',
          col3: '315 vues',
          col4: '4 contacts',
          statusText: 'Expire dans 3j',
          statusClass: 'state-harvest',
          dotClass: 'dot-orange'
        },
        {
          avatarText: 'TR',
          avatarClass: 'bg-avatar-yellow',
          name: 'Prestation Labour Tracteur 65 CV',
          sub: 'Zone Bobo et Banfora (rayon 30 km)',
          col2: 'Service • 25 000 F / ha',
          col3: '189 vues',
          col4: '6 réservations',
          statusText: 'Actif (en ligne)',
          statusClass: 'state-growing',
          dotClass: 'dot-green'
        }
      ]
    },

    buyer: {
      id: 'buyer',
      name: 'Salif Traoré',
      metaRole: 'Acheteur & Transformateur Céréalier',
      location: '📍 Bobo-Dioulasso (Houet)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      actionLabel: 'Publier une demande d\'achat',
      greeting: 'Bonjour, Salif <span class="greeting-emoji">💼</span>',
      subtitle: 'Comparez les récoltes disponibles, sécurisez vos volumes et suivez vos achats.',
      isAdmin: false,
      hasExploitation: false,
      stats: [
        {
          module: 'Marché',
          label: 'Offres correspondantes',
          value: '12',
          unit: 'lots récents',
          trendText: '+5 nouveaux lots',
          trendType: 'favorable',
          comp: 'Maïs blanc & Sésame',
          color: 'green'
        },
        {
          module: 'Demandes',
          label: 'Demandes actives',
          value: '2',
          unit: 'en recherche',
          badge: '50t maïs + 20t sésame',
          comp: '4 propositions reçues',
          color: 'blue'
        },
        {
          module: 'Favoris',
          label: 'Producteurs suivis',
          value: '6',
          unit: 'coopératives',
          badge: 'Hauts-Bassins & Boucle',
          comp: 'Alertes récolte actives',
          color: 'yellow'
        },
        {
          module: 'Prix Référence',
          label: 'Maïs blanc (kg indicatif)',
          value: '195',
          unit: 'F / kg',
          trendText: 'Stable vs SONAGESS',
          trendType: 'favorable',
          comp: 'Marché de Bobo (Source certifiée)',
          color: 'purple'
        }
      ],
      chartTitle: 'Volumes achetés & prix moyens',
      chartSubtitle: 'Suivi de vos approvisionnements céréaliers',
      marginOct: 'Total : 35 tonnes sécurisées',
      deadlines: [
        { title: 'Réception lot 15t Maïs Blanc', meta: 'Coopérative Dédougou • Camion affrété', badge: 'Samedi 18', icon: 'green' },
        { title: 'Validation prix contrat Sésame', meta: 'Producteurs Nouna • 20 tonnes', badge: '22 oct.', icon: 'amber' },
        { title: 'Point d\'étape financement Wari', meta: 'Ligne de crédit campagne', badge: '30 oct.', icon: 'purple' }
      ],
      tableTitle: 'Dernières offres de récolte vérifiées',
      tableSubtitle: 'Récoltes disponibles avec contact direct par appel ou WhatsApp',
      tableHeaders: ['PRODUIT & LOCALITÉ', 'QUANTITÉ', 'PRIX DEMANDÉ', 'DATE DE DISPONIBILITÉ', 'PRODUCTEUR', 'ACTIONS'],
      tableRows: [
        {
          avatarText: 'MB',
          avatarClass: 'bg-avatar-yellow',
          name: 'Maïs Blanc Fara grains secs',
          sub: '📍 Dédougou (Boucle du Mouhoun)',
          col2: '25 Tonnes (Sacs 100kg)',
          col3: '185 F / kg (Négociable)',
          col4: 'Disponible immédiatement',
          statusText: 'Vérifié',
          statusClass: 'state-growing',
          dotClass: 'dot-green'
        },
        {
          avatarText: 'SE',
          avatarClass: 'bg-avatar-green',
          name: 'Sésame Blanc biologique',
          sub: '📍 Léo (Sissili)',
          col2: '10 Tonnes triées',
          col3: '700 F / kg',
          col4: 'Récolte le 25/10',
          statusText: 'Récolte imminente',
          statusClass: 'state-harvest',
          dotClass: 'dot-orange'
        },
        {
          avatarText: 'SB',
          avatarClass: 'bg-avatar-blue',
          name: 'Soja non OGM pour tourteaux',
          sub: '📍 Banfora (Comoé)',
          col2: '8 Tonnes',
          col3: '310 F / kg',
          col4: 'Disponible',
          statusText: 'Vérifié',
          statusClass: 'state-new',
          dotClass: 'dot-blue'
        }
      ]
    },

    admin: {
      id: 'admin',
      name: 'Dr. Aminata Kaboré',
      metaRole: 'Administratrice & Modératrice Générale',
      location: '📍 Ouagadougou (Centre de Contrôle)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
      actionLabel: 'Vérifier une opportunité',
      greeting: 'Tableau de bord de Contrôle <span class="greeting-emoji">🛡️</span>',
      subtitle: 'Supervision de l\'authenticité des contenus, modération des annonces et signalements.',
      isAdmin: true,
      hasExploitation: false,
      stats: [
        {
          module: 'Modération',
          label: 'Annonces à modérer',
          value: '6',
          unit: 'en attente',
          trendText: 'Délai moyen : 18 min',
          trendType: 'favorable',
          comp: '4 ventes • 2 services',
          color: 'green'
        },
        {
          module: 'Signalements',
          label: 'Signalements ouverts',
          value: '3',
          unit: 'à traiter',
          badge: '1 suspicion arnaque',
          comp: 'Coordonnées protégées',
          color: 'blue'
        },
        {
          module: 'Vérification',
          label: 'Opportunités > 90 jours',
          value: '9',
          unit: 'à revérifier',
          badge: 'Alerte péremption',
          comp: 'Règle stricte : réactualiser',
          color: 'yellow'
        },
        {
          module: 'Communauté',
          label: 'Nouveaux inscrits (7 j)',
          value: '41',
          unit: 'acteurs',
          trendText: '+18% vs sem. passée',
          trendType: 'favorable',
          comp: '62% producteurs • 38% offreurs',
          color: 'purple'
        }
      ],
      chartTitle: 'Activité de la plateforme (7 jours)',
      chartSubtitle: 'Flux d\'inscriptions, publications et consultations de contacts',
      marginOct: '184 consultations contacts journalières',
      deadlines: [
        { title: 'Revue subvention PReCA', meta: 'Vérifier si le lien officiel est toujours actif', badge: 'Priorité 1', icon: 'amber' },
        { title: 'Signalement annonce semences non certifiées', meta: 'Motif : fausse variété déclarée', badge: 'À traiter', icon: 'purple' },
        { title: 'Rapport mensuel CIL & sécurité', meta: 'Journal des accès et anonymisation', badge: 'Fin de mois', icon: 'blue' }
      ],
      tableTitle: 'File des annonces et contenus à valider',
      tableSubtitle: 'Validez ou rejetez avant publication publique sur le réseau',
      tableHeaders: ['TYPE & CONTENU', 'AUTEUR DÉCLARÉ', 'LOCALITÉ', 'DATE SOUMISSION', 'DÉCISION', 'ACTIONS'],
      tableRows: [
        {
          avatarText: 'AN',
          avatarClass: 'bg-avatar-yellow',
          name: 'Vente 5t Pomme de terre Ouahigouya',
          sub: 'Vérification photos & prix réaliste',
          col2: 'Idrissa Belem (Nouveau)',
          col3: 'Ouahigouya (Yatenga)',
          col4: 'Aujourd\'hui 07:15',
          statusText: 'À modérer',
          statusClass: 'state-harvest',
          dotClass: 'dot-orange'
        },
        {
          avatarText: 'OP',
          avatarClass: 'bg-avatar-green',
          name: 'Subvention Fonds Énergie Solaire CEDEAO',
          sub: 'Source ministérielle vérifiée le 14/10',
          col2: 'Équipe Éditoriale',
          col3: 'National',
          col4: 'Hier 18:30',
          statusText: 'Prêt à publier',
          statusClass: 'state-growing',
          dotClass: 'dot-green'
        },
        {
          avatarText: 'SG',
          avatarClass: 'bg-avatar-blue',
          name: 'Signalement numéro indisponible',
          sub: 'Annonce matériel tracteur #1042',
          col2: 'Signalé par 2 utilisateurs',
          col3: 'Koudougou',
          col4: 'Hier 14:10',
          statusText: 'En enquête',
          statusClass: 'state-new',
          dotClass: 'dot-blue'
        }
      ]
    }
  };

  // État applicatif courant
  let currentProfileKey = 'producer';
  let currentUIState = 'normal';
  let currentViewMode = 'desktop';

  // État des abonnements par profil (5 000 F / 10 000 F CFA)
  const userSubscriptionStatus = {
    producer: false,
    supplier: false,
    buyer: false,
    admin: true
  };
  let currentBillingCycle = 'monthly'; // 'monthly' | 'campaign'
  let currentCheckoutPlan = { id: 'pro', name: 'Pro Producteur', price: 5000 };
  let selectedOperator = 'orange'; // 'orange' | 'moov'

  // Sélecteurs DOM clés
  const roleSelector = document.getElementById('roleSelector');
  const stateSelector = document.getElementById('stateSelector');
  const btnViewDesktop = document.getElementById('btnViewDesktop');
  const btnViewMobile = document.getElementById('btnViewMobile');
  const viewportContainer = document.getElementById('viewportContainer');
  const mobileDeviceFrame = document.getElementById('mobileDeviceFrame');
  const mobileAppMount = document.getElementById('mobileAppMount');
  const adminNoticeBar = document.getElementById('adminNoticeBar');

  // Éléments Desktop
  const userHeaderName = document.getElementById('userHeaderName');
  const userHeaderMeta = document.getElementById('userHeaderMeta');
  const userHeaderAvatar = document.getElementById('userHeaderAvatar');
  const btnHeaderAction = document.getElementById('btnHeaderAction');
  const headerActionLabel = document.getElementById('headerActionLabel');
  const btnHeaderPricing = document.getElementById('btnHeaderPricing');
  const navItemPricing = document.getElementById('navItemPricing');
  const greetingTitle = document.getElementById('greetingTitle');
  const greetingSubtitle = document.getElementById('greetingSubtitle');
  const navGroupExploitation = document.getElementById('navGroupExploitation');
  const navGroupAdmin = document.getElementById('navGroupAdmin');
  const mainChartTitle = document.getElementById('mainChartTitle');
  const tableSectionTitle = document.getElementById('tableSectionTitle');
  const deadlinesList = document.getElementById('deadlinesList');
  const cyclesDataTable = document.getElementById('cyclesDataTable');
  const sidebarPromoCard = document.getElementById('sidebarPromoCard');

  // Modales Dépense, Recette & Formule
  const modalExpense = document.getElementById('modalExpense');
  const modalRevenue = document.getElementById('modalRevenue');
  const modalFormula = document.getElementById('modalFormula');
  const btnCloseModalExpense = document.getElementById('btnCloseModalExpense');
  const btnCancelExpense = document.getElementById('btnCancelExpense');
  const formAddExpense = document.getElementById('formAddExpense');
  const btnCloseModalRevenue = document.getElementById('btnCloseModalRevenue');
  const btnCancelRevenue = document.getElementById('btnCancelRevenue');
  const formAddRevenue = document.getElementById('formAddRevenue');
  const btnHeaderRevenue = document.getElementById('btnHeaderRevenue');
  const btnShowFormula = document.getElementById('btnShowFormula');
  const btnCloseModalFormula = document.getElementById('btnCloseModalFormula');
  const btnCloseFormulaBtn = document.getElementById('btnCloseFormulaBtn');

  // Modales Abonnements & Mobile Money Checkout
  const modalPricing = document.getElementById('modalPricing');
  const btnCloseModalPricing = document.getElementById('btnCloseModalPricing');
  const btnBillingMonthly = document.getElementById('btnBillingMonthly');
  const btnBillingCampaign = document.getElementById('btnBillingCampaign');
  const displayPricePro = document.getElementById('displayPricePro');
  const displayPeriodPro = document.getElementById('displayPeriodPro');
  const displayPriceBiz = document.getElementById('displayPriceBiz');
  const displayPeriodBiz = document.getElementById('displayPeriodBiz');

  const modalCheckout = document.getElementById('modalCheckout');
  const btnCloseModalCheckout = document.getElementById('btnCloseModalCheckout');
  const btnCancelCheckout = document.getElementById('btnCancelCheckout');
  const formCheckout = document.getElementById('formCheckout');
  const checkoutPlanName = document.getElementById('checkoutPlanName');
  const checkoutPlanDesc = document.getElementById('checkoutPlanDesc');
  const checkoutPlanPrice = document.getElementById('checkoutPlanPrice');
  const checkoutPhone = document.getElementById('checkoutPhone');
  const payOptOrange = document.getElementById('payOptOrange');
  const payOptMoov = document.getElementById('payOptMoov');
  const ussdInstructionText = document.getElementById('ussdInstructionText');
  const btnCheckoutText = document.getElementById('btnCheckoutText');

  // Modale Authentification (Connexion & Inscription)
  const modalAuth = document.getElementById('modalAuth');
  const btnCloseModalAuth = document.getElementById('btnCloseModalAuth');
  const btnOpenAuth = document.getElementById('btnOpenAuth');
  const btnAuthText = document.getElementById('btnAuthText');
  const tabAuthLogin = document.getElementById('tabAuthLogin');
  const tabAuthRegister = document.getElementById('tabAuthRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const loginIdentifier = document.getElementById('loginIdentifier');
  const loginPassword = document.getElementById('loginPassword');
  const regFullName = document.getElementById('regFullName');
  const regPhone = document.getElementById('regPhone');
  const regLocation = document.getElementById('regLocation');
  const regPassword = document.getElementById('regPassword');
  const btnLogout = document.getElementById('btnLogout');
  const demoQuickBtns = document.querySelectorAll('.btn-demo-quick');

  // Toast
  const toastNotification = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  const btnToastClose = document.getElementById('btnToastClose');

  // ==========================================
  // FONCTION : RENDU DU PROFIL SÉLECTIONNÉ
  // ==========================================
  function renderProfile(key) {
    const data = PROFILES_DATA[key];
    if (!data) return;

    currentProfileKey = key;

    // 1. Identité utilisateur
    const isPro = userSubscriptionStatus[key] || false;
    userHeaderName.innerHTML = `${data.name} ${isPro ? '<span class="user-badge-pro">⭐ PRO</span>' : ''}`;
    userHeaderMeta.innerHTML = `
      <span class="badge-activity">${data.metaRole}</span>
      <span class="bullet-sep">•</span>
      <span class="user-location">${data.location}</span>
    `;
    if (userHeaderAvatar) {
      userHeaderAvatar.src = data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80';
      userHeaderAvatar.alt = data.name;
      userHeaderAvatar.onerror = function() {
        this.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80';
      };
    }

    if (btnAuthText) {
      const firstName = data.name.split(' ')[0];
      btnAuthText.textContent = firstName || 'Mon compte';
    }

    // 2. Action principale contextuelle
    if (headerActionLabel) headerActionLabel.textContent = data.actionLabel;
    const headerActionLabelShort = document.getElementById('headerActionLabelShort');
    if (headerActionLabelShort) {
      if (data.actionLabel.includes('dépense')) headerActionLabelShort.textContent = '+ Dépense';
      else if (data.actionLabel.includes('annonce')) headerActionLabelShort.textContent = '+ Annonce';
      else headerActionLabelShort.textContent = '+ Action';
    }

    // 3. Salutation
    greetingTitle.innerHTML = `${data.greeting}`;
    greetingSubtitle.textContent = data.subtitle;

    // 4. Gestion de la visibilité des menus selon rôles
    if (data.isAdmin) {
      adminNoticeBar.classList.remove('hidden');
      navGroupAdmin.classList.remove('hidden');
      navGroupExploitation.classList.add('hidden');
    } else {
      adminNoticeBar.classList.add('hidden');
      navGroupAdmin.classList.add('hidden');
      if (data.hasExploitation) {
        navGroupExploitation.classList.remove('hidden');
      } else {
        navGroupExploitation.classList.add('hidden');
      }
    }

    // 5. Mise à jour des 4 Cartes d'indicateurs
    data.stats.forEach((stat, index) => {
      const idx = index + 1;
      const card = document.getElementById(`statCard${idx}`);
      const label = document.getElementById(`statLabel${idx}`);
      const value = document.getElementById(`statValue${idx}`);
      const trend = document.getElementById(`statTrend${idx}`);
      const comp = document.getElementById(`statComp${idx}`);

      if (label) label.textContent = stat.label;
      if (value) {
        value.innerHTML = `${stat.value} <small>${stat.unit}</small>`;
      }
      if (comp) comp.textContent = stat.comp;

      if (trend) {
        if (stat.trendText) {
          trend.className = `trend-badge ${stat.trendType === 'favorable' ? 'trend-favorable' : 'trend-unfavorable'}`;
          trend.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="${stat.trendType === 'favorable' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"/>
            </svg>
            <span>${stat.trendText}</span>
          `;
          trend.classList.remove('hidden');
        } else if (stat.badge) {
          trend.className = 'status-pill-active';
          trend.innerHTML = `<span class="dot-indicator"></span> ${stat.badge}`;
          trend.classList.remove('hidden');
        } else {
          trend.classList.add('hidden');
        }
      }
    });

    // 6. Titres de graphiques & tableaux
    if (mainChartTitle) mainChartTitle.textContent = data.chartTitle;
    if (tableSectionTitle) tableSectionTitle.textContent = data.tableTitle;

    // 7. Échéances
    if (deadlinesList) {
      deadlinesList.innerHTML = data.deadlines.map(item => `
        <div class="deadline-item">
          <div class="deadline-icon-pill icon-${item.icon}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="deadline-info">
            <div class="deadline-title">${item.title}</div>
            <div class="deadline-meta">${item.meta}</div>
          </div>
          <div class="deadline-badge ${item.badge.includes('Urgent') || item.badge.includes('Dans 4 j') ? 'badge-warning' : 'badge-success'}">${item.badge}</div>
        </div>
      `).join('');
    }

    // 8. Tableau de données contextuel
    if (cyclesDataTable) {
      const thead = cyclesDataTable.querySelector('thead tr');
      const tbody = cyclesDataTable.querySelector('tbody');

      if (thead) {
        thead.innerHTML = data.tableHeaders.map((h, i) => `
          <th class="${i === data.tableHeaders.length - 1 ? 'text-right' : ''}">${h}</th>
        `).join('');
      }

      if (tbody) {
        tbody.innerHTML = data.tableRows.map(row => `
          <tr>
            <td>
              <div class="cell-entity">
                <span class="entity-avatar ${row.avatarClass}">${row.avatarText}</span>
                <div class="entity-details">
                  <strong class="entity-name">${row.name}</strong>
                  <span class="entity-sub">${row.sub}</span>
                </div>
              </div>
            </td>
            <td>${row.col2}</td>
            <td class="tabular-numbers">${row.col3}</td>
            <td class="tabular-numbers">${row.col4}</td>
            <td>
              <span class="badge-state ${row.statusClass}">
                <span class="badge-dot ${row.dotClass}"></span> ${row.statusText}
              </span>
            </td>
            <td class="text-right">
              <button class="btn-table-action" title="Options">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    // 8. Mise à jour dynamique de la carte promotionnelle sidebar
    if (sidebarPromoCard) {
      if (isPro) {
        sidebarPromoCard.innerHTML = `
          <div class="promo-badge-icon">⭐</div>
          <div class="promo-text">
            <strong class="promo-title">Forfait Pro Actif</strong>
            <p class="promo-desc">Renouvellement le 16/11/2026 • 5 000 F CFA</p>
          </div>
          <div class="promo-progress-bar">
            <div class="promo-progress-fill" style="width: 100%; background: #2E7D32;"></div>
          </div>
          <button class="promo-btn" id="btnOpenPricing" style="background:#EAF4E6;color:#1E5E2A;border:1px solid #C4DFC0;">Gérer mon forfait</button>
        `;
      } else {
        sidebarPromoCard.innerHTML = `
          <div class="promo-badge-icon">🌾</div>
          <div class="promo-text">
            <strong class="promo-title" id="promoCardTitle">Passer au Forfait Pro</strong>
            <p class="promo-desc" id="promoCardDesc">5 000 F CFA/mois • Marges illimitées, alertes SMS & rappels PReCA.</p>
          </div>
          <div class="promo-progress-bar">
            <div class="promo-progress-fill" style="width: 85%"></div>
          </div>
          <button class="promo-btn" id="btnOpenPricing">Découvrir les forfaits</button>
        `;
      }
      const b = document.getElementById('btnOpenPricing');
      if (b) b.addEventListener('click', openPricingModal);
    }

    // Rafraîchir systématiquement l'écran du simulateur mobile
    renderMobileView();
  }

  // ==========================================
  // FONCTION : RENDU DU SIMULATEUR MOBILE ANDROID (Spécification Section 2)
  // ==========================================
  function renderMobileView() {
    try {
      const data = PROFILES_DATA[currentProfileKey];
      if (!data || !mobileAppMount) return;

      const isPro = userSubscriptionStatus[currentProfileKey] || false;

      mobileAppMount.innerHTML = `
      <!-- TIROIR LATÉRAL GAUCHE MOBILE (DRAWER) -->
      <div class="mobile-drawer-overlay" id="mobileDrawerOverlay"></div>
      <aside class="mobile-drawer" id="mobileDrawer">
        <div class="mobile-drawer-header">
          <div class="brand-logo" style="gap: 8px;">
            <div class="brand-icon-wrapper" style="width: 32px; height: 32px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.7 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-title" style="font-size: 14px;">Révolution</span>
              <span class="brand-sub" style="font-size: 11px;">Agricole</span>
            </div>
          </div>
          <button class="mobile-drawer-close-btn" id="btnCloseMobileDrawer">&times;</button>
        </div>

        <!-- Profil utilisateur dans le tiroir -->
        <div class="mobile-drawer-profile-card">
          <img src="${data.avatar}" alt="Avatar" class="mobile-drawer-avatar">
          <div class="mobile-drawer-user-info">
            <strong class="mobile-drawer-name">${data.name}</strong>
            <span class="mobile-drawer-role">${data.metaRole}</span>
          </div>
        </div>

        <!-- Tous les menus identiques à la version ordinateur -->
        <nav class="mobile-drawer-nav">
          <!-- Groupe 1: ACCUEIL -->
          <div class="nav-section">
            <div class="nav-section-title">ACCUEIL</div>
            <a href="#dashboard" class="nav-item active mobile-drawer-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </span>
              <span class="nav-label">Tableau de bord</span>
            </a>
          </div>

          <!-- Groupe 2: S'INFORMER -->
          <div class="nav-section">
            <div class="nav-section-title">S'INFORMER</div>
            <a href="#conseils" class="nav-item mobile-drawer-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
              </span>
              <span class="nav-label">Conseils</span>
              <span class="nav-pill-count">3 nvx</span>
            </a>
            <a href="#formations" class="nav-item mobile-drawer-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </span>
              <span class="nav-label">Formations</span>
            </a>
            <a href="#meteo" class="nav-item mobile-drawer-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>
              </span>
              <span class="nav-label">Météo</span>
              <span class="nav-status-dot blue"></span>
            </a>
          </div>

          <!-- Groupe 3: OPPORTUNITÉS -->
          <div class="nav-section">
            <div class="nav-section-title">OPPORTUNITÉS</div>
            <a href="#opportunites" class="nav-item mobile-drawer-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m12 6 4 6-4 6"/><path d="M8 12h8"/></svg>
              </span>
              <span class="nav-label">Financements</span>
              <span class="nav-badge-amber">5</span>
            </a>
          </div>

          <!-- Groupe 4: ÉCHANGER -->
          <div class="nav-section">
            <div class="nav-section-title">ÉCHANGER</div>
            <a href="#marche" class="nav-item mobile-drawer-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </span>
              <span class="nav-label">Marché agricole</span>
            </a>
            <a href="#materiel-services" class="nav-item mobile-drawer-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </span>
              <span class="nav-label">Matériel & services</span>
            </a>
            <a href="#mes-annonces" class="nav-item mobile-drawer-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
              <span class="nav-label">Mes annonces</span>
            </a>
          </div>

          <!-- Groupe 5: MON EXPLOITATION -->
          ${data.hasExploitation ? `
            <div class="nav-section">
              <div class="nav-section-title">MON EXPLOITATION</div>
              <a href="#synthese" class="nav-item mobile-drawer-link">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></span>
                <span class="nav-label">Synthèse</span>
              </a>
              <a href="#parcelles" class="nav-item mobile-drawer-link">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg></span>
                <span class="nav-label">Parcelles</span>
              </a>
              <a href="#cycles" class="nav-item mobile-drawer-link">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></span>
                <span class="nav-label">Cycles culturaux</span>
              </a>
              <a href="#finances" class="nav-item mobile-drawer-link">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
                <span class="nav-label">Finances & Marges</span>
              </a>
            </div>
          ` : ''}

          <!-- Groupe 6: ADMIN -->
          ${data.isAdmin ? `
            <div class="nav-section">
              <div class="nav-section-title">ADMINISTRATION</div>
              <a href="#admin-queue" class="nav-item mobile-drawer-link">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></span>
                <span class="nav-label">Files de modération</span>
                <span class="nav-badge-red">6</span>
              </a>
              <a href="#admin-verif" class="nav-item mobile-drawer-link">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/></svg></span>
                <span class="nav-label">Vérification (+90j)</span>
                <span class="nav-badge-amber">9</span>
              </a>
            </div>
          ` : ''}

          <!-- Groupe 7: COMPTE -->
          <div class="nav-section">
            <div class="nav-section-title">COMPTE</div>
            <a href="#notifications" class="nav-item mobile-drawer-link">
              <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg></span>
              <span class="nav-label">Notifications</span>
              <span class="nav-pill-count">2</span>
            </a>
            <a href="#abonnements" class="nav-item mobile-drawer-link" id="btnMobileDrawerPricing">
              <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
              <span class="nav-label">Abonnements & Tarifs</span>
              <span class="nav-badge-amber">Pro</span>
            </a>
            <a href="#profil" class="nav-item mobile-drawer-link">
              <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
              <span class="nav-label">Profil & Paramètres</span>
            </a>
          </div>

          <!-- Carte Promotionnelle dans le tiroir mobile -->
          <div style="background: #FFF9E6; border: 1px solid #F5E0A0; border-radius: 8px; padding: 12px; margin: 12px 14px; font-size: 11.5px; color: #784F11;">
            <strong>${isPro ? '⭐ Forfait Pro Actif' : '⭐ Forfait Pro (5 000 F)'}</strong>
            <p style="margin: 4px 0 8px; font-size: 11px;">${isPro ? 'Alertes SMS et calculs de marge illimités.' : 'Débloquez toutes les fonctionnalités et alertes SMS.'}</p>
            <button type="button" id="btnMobileDrawerGoPro" style="background: #C8862A; color: #FFF; border: none; padding: 7px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer; width: 100%;">
              ${isPro ? 'Gérer mon forfait' : 'Voir les forfaits Pro'}
            </button>
          </div>

          <!-- Déconnexion isolée -->
          <div class="sidebar-logout" style="border-top: 1px solid #E6EAE3; padding-top: 10px; margin-top: 10px;">
            <button class="btn-logout" id="btnMobileLogout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- En-tête mobile compact avec bouton hamburger à gauche -->
      <header class="mobile-header-bar">
        <div class="mobile-header-left">
          <button class="mobile-menu-hamburger-btn" id="btnOpenMobileDrawer" aria-label="Ouvrir le menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div class="mobile-brand">
            <span>🌱</span>
            <span>Révolution Agri.</span>
          </div>
        </div>
        <div class="mobile-header-actions">
          <button class="btn-mobile-expense-pill" id="btnMobileAddExpense" title="Ajouter une dépense">+ Dépense</button>
          <button class="btn-mobile-revenue-pill" id="btnMobileAddRevenue" title="Enregistrer une vente">+ Vente</button>
          <button class="icon-btn mobile-icon-btn" id="btnMobileNotif" aria-label="Notifications" style="width: 30px; height: 30px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
            <span class="notification-badge-dot"></span>
          </button>
          <img src="${data.avatar}" alt="Avatar" class="mobile-user-avatar" id="btnMobileAvatarOpenDrawer" style="cursor: pointer; width: 30px; height: 30px;">
        </div>
      </header>

      <div class="mobile-body">
        <!-- Salutation -->
        <div>
          <h2 class="mobile-greeting">${data.name.split(' ')[0]} ${isPro ? '<span class="user-badge-pro" style="font-size: 10px; vertical-align: middle;">⭐ PRO</span>' : '🌱'}</h2>
          <p class="mobile-subdate">jeu. 16 oct. • ${data.location.split('(')[0]}</p>
        </div>

        <!-- 1. MÉTÉO EN PREMIER (Selon spec : info consultée chaque matin) -->
        <div class="mobile-weather-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">⛅</span>
              <strong style="font-size: 22px;">31 °C</strong>
            </div>
            <span style="font-size: 11px; font-weight: 700; color: #1E5E2A; background: #EAF4E6; padding: 2px 8px; border-radius: 99px;">Pluie 10 %</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #5B6660; border-top: 1px solid #E6EAE3; padding-top: 6px; margin-top: 6px;">
            <span>JEU 32° • VEN 34° • SAM 33°</span>
            <span style="font-size: 10px;">Open-Meteo • 07:45</span>
          </div>
        </div>

        <!-- 2. INDICATEURS EN GRILLE 2x2 (Pas de défilement horizontal) -->
        <div class="mobile-stat-grid">
          ${data.stats.map(s => `
            <div class="mobile-stat-card">
              <span class="mobile-stat-title">${s.label}</span>
              <div class="mobile-stat-val">${s.value} <small style="font-size: 10px;">${s.unit}</small></div>
              <span class="mobile-stat-trend ${s.trendType === 'unfavorable' ? 'text-red' : 'text-green'}">
                ${s.trendText || s.badge || 'Normal'}
              </span>
            </div>
          `).join('')}
        </div>

        <!-- 3. ÉCHÉANCES : CE QUI EST URGENT -->
        <div>
          <div class="mobile-section-header">
            <h4>Échéances urgentes</h4>
            <a href="#">Voir tout</a>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            ${data.deadlines.slice(0, 2).map(d => `
              <div class="deadline-item" style="padding: 10px;">
                <div class="deadline-icon-pill icon-${d.icon}" style="width: 32px; height: 32px;">
                  <span style="font-size: 14px;">⏱</span>
                </div>
                <div class="deadline-info">
                  <div class="deadline-title" style="font-size: 12.5px;">${d.title}</div>
                  <div class="deadline-meta" style="font-size: 11px;">${d.meta}</div>
                </div>
                <div class="deadline-badge badge-warning" style="font-size: 10px;">${d.badge}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. LE TABLEAU DEVIENT UNE LISTE DE CARTES -->
        <div>
          <div class="mobile-section-header">
            <h4>${data.tableTitle}</h4>
            <a href="#">Voir</a>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            ${data.tableRows.slice(0, 2).map(r => `
              <div class="mobile-cycle-card">
                <div class="mobile-cycle-info">
                  <strong>${r.name}</strong>
                  <span>${r.col2} • ${r.col4}</span>
                </div>
                <span class="badge-state ${r.statusClass}" style="font-size: 11px; padding: 2px 8px;">
                  ${r.statusText}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 5. GRAPHIQUE CHARGÉ LORSQU'IL DEVIENT VISIBLE -->
        <div style="background: #FFF; border: 1px solid #E6EAE3; border-radius: 12px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 13px;">${data.chartTitle}</strong>
            <span style="font-size: 11px; color: #1E5E2A; font-weight: 700;">${data.marginOct}</span>
          </div>
          <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 80px; padding-top: 10px; border-bottom: 1px solid #EEE;">
            <div style="width: 10px; height: 60%; background: #2E7D32; border-radius: 2px;"></div>
            <div style="width: 10px; height: 75%; background: #2E7D32; border-radius: 2px;"></div>
            <div style="width: 10px; height: 50%; background: #2E7D32; border-radius: 2px;"></div>
            <div style="width: 10px; height: 80%; background: #2E7D32; border-radius: 2px;"></div>
            <div style="width: 10px; height: 70%; background: #2E7D32; border-radius: 2px;"></div>
            <div style="width: 10px; height: 90%; background: #1E5E2A; border-radius: 2px;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #7C8781; margin-top: 4px;">
            <span>mai</span><span>juin</span><span>juil</span><span>août</span><span>sept</span><span style="font-weight: 700; color: #1E5E2A;">oct</span>
          </div>
        </div>
      </div>

      <!-- BOUTON D'ACTION FLOTTANT (+) MOBILE -->
      <button class="mobile-fab-btn" id="btnMobileFab" title="Ajouter une dépense ou vente">+</button>

      <!-- FEUILLE D'ACTION MOBILE (Action Sheet au clic sur +) -->
      <div class="mobile-action-sheet-overlay hidden" id="mobileActionSheetOverlay">
        <div class="mobile-action-sheet">
          <div class="action-sheet-header">
            <strong>Que voulez-vous enregistrer ?</strong>
            <button class="action-sheet-close" id="btnCloseActionSheet">&times;</button>
          </div>
          <div class="action-sheet-buttons">
            <button type="button" class="sheet-action-btn sheet-expense-btn" id="btnSheetAddExpense">
              <span class="sheet-icon">💸</span>
              <div class="sheet-text">
                <strong>+ Ajouter une dépense</strong>
                <small>Engrais, semences, carburant, main d'œuvre (30s)</small>
              </div>
            </button>
            <button type="button" class="sheet-action-btn sheet-revenue-btn" id="btnSheetAddRevenue">
              <span class="sheet-icon">🌾</span>
              <div class="sheet-text">
                <strong>+ Enregistrer une vente de récolte</strong>
                <small>Vente de parcelles, marché de gros, Mobile Money</small>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;

    // Gestion de l'ouverture et fermeture du Drawer latéral gauche
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('mobileDrawerOverlay');
    const btnOpen = document.getElementById('btnOpenMobileDrawer');
    const btnClose = document.getElementById('btnCloseMobileDrawer');
    const avatarOpen = document.getElementById('btnMobileAvatarOpenDrawer');

    function openMobileDrawer() {
      if (drawer && overlay) {
        drawer.classList.add('open');
        overlay.classList.add('open');
      }
    }

    function closeMobileDrawer() {
      if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
      }
    }

    if (btnOpen) btnOpen.addEventListener('click', openMobileDrawer);
    if (avatarOpen) avatarOpen.addEventListener('click', openMobileDrawer);
    if (btnClose) btnClose.addEventListener('click', closeMobileDrawer);
    if (overlay) overlay.addEventListener('click', closeMobileDrawer);

    // Fermer le tiroir au clic sur un élément de navigation
    const drawerLinks = document.querySelectorAll('.mobile-drawer-link');
    drawerLinks.forEach(link => {
      link.addEventListener('click', closeMobileDrawer);
    });

    const btnMobileLogout = document.getElementById('btnMobileLogout');
    if (btnMobileLogout) {
      btnMobileLogout.addEventListener('click', () => {
        closeMobileDrawer();
        performLogout();
      });
    }

    const btnMobPrice = document.getElementById('btnMobileDrawerPricing');
    if (btnMobPrice) {
      btnMobPrice.addEventListener('click', () => {
        closeMobileDrawer();
        openPricingModal();
      });
    }

    const btnMobGoPro = document.getElementById('btnMobileDrawerGoPro');
    if (btnMobGoPro) {
      btnMobGoPro.addEventListener('click', () => {
        closeMobileDrawer();
        openPricingModal();
      });
    }

    const btnMobExp = document.getElementById('btnMobileAddExpense');
    if (btnMobExp) {
      btnMobExp.addEventListener('click', () => {
        openExpenseModal();
      });
    }

    const btnMobRev = document.getElementById('btnMobileAddRevenue');
    if (btnMobRev) {
      btnMobRev.addEventListener('click', () => {
        openRevenueModal();
      });
    }

    // Feuille d'action contextuelle du bouton flottant (+)
    const actionSheetOverlay = document.getElementById('mobileActionSheetOverlay');
    const btnCloseActionSheet = document.getElementById('btnCloseActionSheet');
    const btnSheetAddExpense = document.getElementById('btnSheetAddExpense');
    const btnSheetAddRevenue = document.getElementById('btnSheetAddRevenue');

    function openActionSheet() {
      if (actionSheetOverlay) actionSheetOverlay.classList.remove('hidden');
    }
    function closeActionSheet() {
      if (actionSheetOverlay) actionSheetOverlay.classList.add('hidden');
    }

    const btnMobileFab = document.getElementById('btnMobileFab');
    if (btnMobileFab) {
      btnMobileFab.addEventListener('click', openActionSheet);
    }
    if (btnCloseActionSheet) btnCloseActionSheet.addEventListener('click', closeActionSheet);
    if (actionSheetOverlay) {
      actionSheetOverlay.addEventListener('click', (e) => {
        if (e.target === actionSheetOverlay) closeActionSheet();
      });
    }
    if (btnSheetAddExpense) {
      btnSheetAddExpense.addEventListener('click', () => {
        closeActionSheet();
        openExpenseModal();
      });
    }
    if (btnSheetAddRevenue) {
      btnSheetAddRevenue.addEventListener('click', () => {
        closeActionSheet();
        openRevenueModal();
      });
    }
    } catch (err) {
      console.error('Erreur renderMobileView:', err);
      if (mobileAppMount) {
        mobileAppMount.innerHTML = `
          <div style="padding: 24px; text-align: center; color: #1E2822;">
            <p style="font-weight: 700; margin-bottom: 8px;">Simulateur Mobile Prêt</p>
            <p style="font-size: 12px; color: #7C8781;">${err.message}</p>
          </div>
        `;
      }
    }
  }

  // ==========================================
  // GESTION DES MODES D'AFFICHAGE (DESKTOP / MOBILE)
  // ==========================================
  function switchViewMode(mode) {
    currentViewMode = mode;
    if (mode === 'mobile') {
      btnViewMobile.classList.add('active');
      btnViewDesktop.classList.remove('active');
      viewportContainer.classList.remove('mode-desktop');
      viewportContainer.classList.add('mode-mobile');
      mobileDeviceFrame.classList.remove('hidden');
      renderMobileView();
    } else {
      btnViewDesktop.classList.add('active');
      btnViewMobile.classList.remove('active');
      viewportContainer.classList.remove('mode-mobile');
      viewportContainer.classList.add('mode-desktop');
      mobileDeviceFrame.classList.add('hidden');
    }
  }

  btnViewDesktop.addEventListener('click', () => switchViewMode('desktop'));
  btnViewMobile.addEventListener('click', () => switchViewMode('mobile'));

  // ==========================================
  // GESTION DES ÉTATS UI (NORMAL, SKELETON, EMPTY, ERROR)
  // ==========================================
  function applyUIState(state) {
    currentUIState = state;
    const body = document.getElementById('dashboardContent');

    // Réinitialiser les classes d'états
    body.classList.remove('state-loading');

    if (state === 'loading') {
      body.classList.add('state-loading');
    } else if (state === 'empty') {
      // Démonstration état vide conforme
      deadlinesList.innerHTML = `
        <div class="widget-empty-state">
          <span class="empty-icon">🌱</span>
          <strong class="empty-title">Aucune échéance urgente</strong>
          <p class="empty-desc">Ajoutez vos cultures ou suivez des opportunités pour recevoir des rappels automatiques avant la date limite.</p>
          <button class="btn-empty-action" id="btnEmptyAction">+ Planifier un cycle</button>
        </div>
      `;
    } else if (state === 'error') {
      deadlinesList.innerHTML = `
        <div class="widget-error-state">
          <span style="font-size: 24px;">⚠️</span>
          <strong class="error-title">Données momentanément indisponibles</strong>
          <p style="font-size: 12px; color: #5B6660;">La synchronisation avec le serveur a rencontré une latence réseau.</p>
          <button class="btn-retry" id="btnRetry">Réessayer</button>
        </div>
      `;
      const btnRetry = document.getElementById('btnRetry');
      if (btnRetry) {
        btnRetry.addEventListener('click', () => {
          stateSelector.value = 'normal';
          applyUIState('normal');
        });
      }
    } else {
      // Normal
      renderProfile(currentProfileKey);
    }
  }

  // ==========================================
  // ACTION PRINCIPALE CONTEXTUELLE
  // ==========================================
  function handlePrimaryAction() {
    if (currentProfileKey === 'producer') {
      openExpenseModal();
    } else {
      showToast('Action contextuelle', `Ouverture du module : ${PROFILES_DATA[currentProfileKey].actionLabel}`);
    }
  }

  btnHeaderAction.addEventListener('click', handlePrimaryAction);

  // Suivi dynamique des finances de la productrice connecté à Supabase
  let currentExpenseTotal = 185000;
  let currentRevenueTotal = 420000;

  async function syncFinancialsFromSupabase(profileId = currentProfileKey) {
    if (!supabaseClient) {
      updateFinancialMetrics();
      return;
    }

    try {
      // 1. Charger les dépenses réelles depuis Supabase
      const { data: expData, error: expError } = await supabaseClient
        .from('expenses')
        .select('amount')
        .eq('profile_id', profileId);

      if (!expError && expData && expData.length > 0) {
        currentExpenseTotal = expData.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
      }

      // 2. Charger les recettes réelles depuis Supabase
      const { data: revData, error: revError } = await supabaseClient
        .from('revenues')
        .select('amount')
        .eq('profile_id', profileId);

      if (!revError && revData && revData.length > 0) {
        currentRevenueTotal = revData.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
      }

      updateFinancialMetrics();
    } catch (err) {
      console.warn('⚠️ Synchronisation financière Supabase :', err);
      updateFinancialMetrics();
    }
  }

  // Synchronisation des cycles culturaux depuis Supabase
  async function syncCropCyclesFromSupabase(profileId = currentProfileKey) {
    if (!supabaseClient || profileId !== 'producer') return;

    try {
      const { data, error } = await supabaseClient
        .from('crop_cycles')
        .select('*, parcels(name, area_ha, irrigation_type)')
        .eq('profile_id', profileId)
        .order('planting_date', { ascending: true });

      if (!error && data && data.length > 0) {
        PROFILES_DATA.producer.tableRows = data.map(item => {
          let dotClass = 'dot-green';
          let statusClass = 'state-growing';
          if (item.status && item.status.includes('Récolte')) {
            dotClass = 'dot-orange';
            statusClass = 'state-harvest';
          } else if (item.status && (item.status.includes('Repiquage') || item.status.includes('nouveau'))) {
            dotClass = 'dot-blue';
            statusClass = 'state-new';
          }

          const initials = (item.crop_name.substring(0, 2)).toUpperCase();
          const pName = item.parcels ? `${item.parcels.name} (${item.parcels.area_ha} ha) • ${item.parcels.irrigation_type}` : 'Parcelle';

          return {
            avatarText: initials,
            avatarClass: 'bg-avatar-green',
            name: item.crop_name,
            sub: item.category || 'Culture maraîchère',
            col2: pName,
            col3: item.planting_date ? new Date(item.planting_date).toLocaleDateString('fr-FR') : '-',
            col4: item.estimated_harvest_date ? new Date(item.estimated_harvest_date).toLocaleDateString('fr-FR') : '-',
            statusText: item.status,
            statusClass: statusClass,
            dotClass: dotClass
          };
        });

        // Mettre à jour le nombre de cycles actifs dans la carte stat3
        if (PROFILES_DATA.producer.stats && PROFILES_DATA.producer.stats[2]) {
          PROFILES_DATA.producer.stats[2].value = String(data.length);
        }
        renderProfile(currentProfileKey);
      }
    } catch (err) {
      console.warn('⚠️ Erreur synchronisation cycles culturaux :', err);
    }
  }

  // Synchronisation de l'abonnement depuis Supabase
  async function syncSubscriptionStatusFromSupabase(profileId = currentProfileKey) {
    if (!supabaseClient) return;

    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('is_pro')
        .eq('id', profileId)
        .single();

      if (!error && data) {
        userSubscriptionStatus[profileId] = !!data.is_pro;
        renderProfile(profileId);
      }
    } catch (err) {
      console.warn('⚠️ Erreur synchronisation abonnement Supabase :', err);
    }
  }

  function updateFinancialMetrics() {
    const netMargin = currentRevenueTotal - currentExpenseTotal;
    const formattedRev = new Intl.NumberFormat('fr-FR').format(currentRevenueTotal);
    const formattedExp = new Intl.NumberFormat('fr-FR').format(currentExpenseTotal);
    const marginSign = netMargin >= 0 ? '+' : '';
    const formattedMargin = `${marginSign}${new Intl.NumberFormat('fr-FR').format(netMargin)} F CFA`;

    // 1. Mettre à jour les stats des cartes
    const stat1 = document.getElementById('statValue1'); // Dépenses
    const stat2 = document.getElementById('statValue2'); // Recettes
    if (stat1 && currentProfileKey === 'producer') {
      stat1.innerHTML = `${formattedExp} <small>F CFA</small>`;
    }
    if (stat2 && currentProfileKey === 'producer') {
      stat2.innerHTML = `${formattedRev} <small>F CFA</small>`;
    }

    // 2. Mettre à jour le bandeau de marge estimée
    const bannerMargin = document.getElementById('bannerMarginOct');
    if (bannerMargin) {
      bannerMargin.textContent = formattedMargin;
    }

    // 3. Mettre à jour la modale de formule
    const fRev = document.getElementById('formulaRecettes');
    const fExp = document.getElementById('formulaDepenses');
    const fMarge = document.getElementById('formulaMarge');
    if (fRev) fRev.textContent = `+${formattedRev} F CFA`;
    if (fExp) fExp.textContent = `−${formattedExp} F CFA`;
    if (fMarge) fMarge.textContent = formattedMargin;

    // 4. Mettre à jour l'info-bulle et barres d'octobre dans le graphique
    const octCol = document.querySelector('.chart-col.active-month');
    if (octCol) {
      octCol.setAttribute('data-rev', formattedRev);
      octCol.setAttribute('data-exp', formattedExp);
      octCol.setAttribute('data-margin', formattedMargin);
    }
    const tooltipRev = document.getElementById('tooltipRev');
    const tooltipExp = document.getElementById('tooltipExp');
    const tooltipMargin = document.getElementById('tooltipMargin');
    if (tooltipRev) tooltipRev.textContent = `${formattedRev} F CFA`;
    if (tooltipExp) tooltipExp.textContent = `${formattedExp} F CFA`;
    if (tooltipMargin) tooltipMargin.textContent = formattedMargin;

    return { netMargin, formattedMargin, formattedRev, formattedExp };
  }

  // ==========================================
  // MODALE DÉPENSE INTERACTIVE (30 SECONDES)
  // ==========================================
  function openExpenseModal() {
    if (modalExpense) {
      modalExpense.classList.remove('hidden');
      const input = document.getElementById('expenseAmount');
      if (input) input.focus();
    }
  }

  function closeExpenseModal() {
    if (modalExpense) {
      modalExpense.classList.add('hidden');
      if (formAddExpense) formAddExpense.reset();
    }
  }

  if (btnCloseModalExpense) btnCloseModalExpense.addEventListener('click', closeExpenseModal);
  if (btnCancelExpense) btnCancelExpense.addEventListener('click', closeExpenseModal);
  if (modalExpense) {
    modalExpense.addEventListener('click', (e) => {
      if (e.target === modalExpense) closeExpenseModal();
    });
  }

  if (formAddExpense) {
    formAddExpense.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amountVal = document.getElementById('expenseAmount').value;
      const cat = document.getElementById('expenseCategory');
      const catVal = cat ? cat.value : 'autre';
      const catText = cat ? cat.options[cat.selectedIndex].text : 'Autre';
      const cycleSelect = document.getElementById('expenseCycle');
      const cycleVal = cycleSelect ? cycleSelect.value : 'global';
      const expenseDate = document.getElementById('expenseDate') ? document.getElementById('expenseDate').value : new Date().toISOString().split('T')[0];
      const expenseNotes = document.getElementById('expenseNote') ? document.getElementById('expenseNote').value.trim() : '';
      const numericAmount = parseInt(amountVal, 10) || 0;

      // Sauvegarde dans Supabase si connecté
      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from('expenses').insert([{
            profile_id: currentProfileKey,
            amount: numericAmount,
            category: catVal,
            cycle_code: cycleVal,
            expense_date: expenseDate,
            notes: expenseNotes || `${catText} - ${cycleVal}`
          }]);
          if (error) {
            console.error('Erreur Supabase insert expense:', error);
          } else {
            console.log('✅ Dépense enregistrée dans Supabase');
          }
        } catch (err) {
          console.warn('Erreur réseau enregistrement dépense :', err);
        }
      }

      await syncFinancialsFromSupabase(currentProfileKey);
      const { formattedMargin } = updateFinancialMetrics();

      closeExpenseModal();
      showToast(
        '💾 Dépense enregistrée sur Supabase !',
        `${new Intl.NumberFormat('fr-FR').format(numericAmount)} F CFA rattaché à « ${catText} ». Marge recalculée : ${formattedMargin}.`
      );
    });
  }

  // ==========================================
  // MODALE RECETTE / VENTE DE RÉCOLTE (REDESIGN LUXE FINTECH)
  // ==========================================
  const revenueAmountInput = document.getElementById('revenueAmount');
  const livePreviewNewRev = document.getElementById('livePreviewNewRev');
  const livePreviewNewMargin = document.getElementById('livePreviewNewMargin');
  const btnSubmitRevenueText = document.getElementById('btnSubmitRevenueText');

  // Sélecteur de cycles et saisie manuelle libre
  const tabCycleRegistered = document.getElementById('tabCycleRegistered');
  const tabCycleCustom = document.getElementById('tabCycleCustom');
  const cycleSelectWrapper = document.getElementById('cycleSelectWrapper');
  const revenueCycleSelect = document.getElementById('revenueCycle');
  const customCropBox = document.getElementById('customCropBox');
  const revenueCustomCropInput = document.getElementById('revenueCustomCropInput');
  const revenueCustomOrigin = document.getElementById('revenueCustomOrigin');
  let isCustomCropMode = false;

  // Sélecteur de paiement visuel
  const payCardOptions = document.querySelectorAll('.pay-card-option');
  const revenuePaymentVal = document.getElementById('revenuePaymentVal');

  // Composant calendrier luxe
  const datePickerCardTrigger = document.getElementById('datePickerCardTrigger');
  const btnToggleCalPopover = document.getElementById('btnToggleCalPopover');
  const customCalendarPopover = document.getElementById('customCalendarPopover');
  const dateFormattedText = document.getElementById('dateFormattedText');
  const revenueDateInput = document.getElementById('revenueDate');
  const calDaysGrid = document.getElementById('calDaysGrid');
  const calMonthTitle = document.getElementById('calMonthTitle');
  const calPrevMonth = document.getElementById('calPrevMonth');
  const calNextMonth = document.getElementById('calNextMonth');
  const calBtnToday = document.getElementById('calBtnToday');
  const calBtnClose = document.getElementById('calBtnClose');
  const dateChipBtns = document.querySelectorAll('.date-chip-btn');

  // État du calendrier
  let calYear = 2026;
  let calMonth = 9; // 0-indexed : 9 = Octobre
  let selectedDateObj = new Date(2026, 9, 16);

  // Noms des mois en français
  const MONTH_NAMES_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const DAY_NAMES_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  function formatFrenchDate(d) {
    const dayName = DAY_NAMES_FR[d.getDay()];
    const dayNum = d.getDate();
    const monthName = MONTH_NAMES_FR[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName} ${dayNum} ${monthName} ${year}`;
  }

  function formatIsoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Générateur de grille du calendrier personnalisé
  function renderCustomCalendar() {
    if (!calDaysGrid) return;
    calDaysGrid.innerHTML = '';
    if (calMonthTitle) {
      calMonthTitle.textContent = `${MONTH_NAMES_FR[calMonth]} ${calYear}`;
    }

    const firstDayIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Dimanche
    // Convertir en format lundi = premier jour (0..6)
    const startOffset = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    // Jours du mois précédent (grisés)
    for (let i = startOffset - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.textContent = daysInPrevMonth - i;
      calDaysGrid.appendChild(cell);
    }

    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.textContent = day;

      const isToday = (calYear === 2026 && calMonth === 9 && day === 16);
      if (isToday) cell.classList.add('today');

      const isSelected = (
        selectedDateObj.getFullYear() === calYear &&
        selectedDateObj.getMonth() === calMonth &&
        selectedDateObj.getDate() === day
      );
      if (isSelected) cell.classList.add('selected');

      cell.addEventListener('click', () => {
        selectedDateObj = new Date(calYear, calMonth, day);
        applySelectedDate(selectedDateObj);
        closeCalendarPopover();
      });

      calDaysGrid.appendChild(cell);
    }
  }

  function applySelectedDate(dateObj) {
    const formattedText = formatFrenchDate(dateObj);
    const isoVal = formatIsoDate(dateObj);

    if (dateFormattedText) dateFormattedText.textContent = formattedText;
    if (revenueDateInput) revenueDateInput.value = isoVal;

    // Synchroniser les puces de raccourcis
    dateChipBtns.forEach(btn => {
      const chipDate = btn.getAttribute('data-date');
      if (chipDate === isoVal) {
        btn.classList.add('active');
      } else if (chipDate) {
        btn.classList.remove('active');
      }
    });

    renderCustomCalendar();
  }

  function toggleCalendarPopover() {
    if (!customCalendarPopover) return;
    const isHidden = customCalendarPopover.classList.contains('hidden');
    if (isHidden) {
      customCalendarPopover.classList.remove('hidden');
      renderCustomCalendar();
    } else {
      customCalendarPopover.classList.add('hidden');
    }
  }

  function closeCalendarPopover() {
    if (customCalendarPopover) customCalendarPopover.classList.add('hidden');
  }

  if (datePickerCardTrigger) datePickerCardTrigger.addEventListener('click', toggleCalendarPopover);
  if (btnToggleCalPopover) btnToggleCalPopover.addEventListener('click', toggleCalendarPopover);
  if (calBtnClose) calBtnClose.addEventListener('click', closeCalendarPopover);

  if (calPrevMonth) {
    calPrevMonth.addEventListener('click', () => {
      calMonth--;
      if (calMonth < 0) {
        calMonth = 11;
        calYear--;
      }
      renderCustomCalendar();
    });
  }

  if (calNextMonth) {
    calNextMonth.addEventListener('click', () => {
      calMonth++;
      if (calMonth > 11) {
        calMonth = 0;
        calYear++;
      }
      renderCustomCalendar();
    });
  }

  if (calBtnToday) {
    calBtnToday.addEventListener('click', () => {
      selectedDateObj = new Date(2026, 9, 16);
      calYear = 2026;
      calMonth = 9;
      applySelectedDate(selectedDateObj);
      closeCalendarPopover();
    });
  }

  // Puces raccourcis de date
  dateChipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetDate = btn.getAttribute('data-date');
      if (targetDate) {
        const parts = targetDate.split('-');
        selectedDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        calYear = selectedDateObj.getFullYear();
        calMonth = selectedDateObj.getMonth();
        applySelectedDate(selectedDateObj);
        closeCalendarPopover();
      }
    });
  });

  // Bascule Onglets Cycle de parcelle / Saisie libre (Besoin utilisateur)
  function setCropMode(isCustom) {
    isCustomCropMode = isCustom;
    if (isCustom) {
      tabCycleCustom.classList.add('active');
      tabCycleRegistered.classList.remove('active');
      customCropBox.classList.remove('hidden');
      if (revenueCycleSelect) revenueCycleSelect.value = 'custom';
      if (revenueCustomCropInput) revenueCustomCropInput.focus();
    } else {
      tabCycleRegistered.classList.add('active');
      tabCycleCustom.classList.remove('active');
      customCropBox.classList.add('hidden');
      if (revenueCycleSelect && revenueCycleSelect.value === 'custom') {
        revenueCycleSelect.value = 'tomato';
      }
    }
  }

  if (tabCycleRegistered) tabCycleRegistered.addEventListener('click', () => setCropMode(false));
  if (tabCycleCustom) tabCycleCustom.addEventListener('click', () => setCropMode(true));

  if (revenueCycleSelect) {
    revenueCycleSelect.addEventListener('change', (e) => {
      if (e.target.value === 'custom') {
        setCropMode(true);
      } else {
        setCropMode(false);
      }
    });
  }

  // Tags rapides de produits maraîchers / fruitiers burkinabè
  const cropTagBtns = document.querySelectorAll('.crop-tag-btn');
  cropTagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cropName = btn.getAttribute('data-name');
      if (revenueCustomCropInput && cropName) {
        revenueCustomCropInput.value = cropName;
        revenueCustomCropInput.focus();
        showToast('Produit sélectionné', `Ajouté : « ${cropName} ».`);
      }
    });
  });

  // Sélection visuelle du mode de paiement
  payCardOptions.forEach(card => {
    card.addEventListener('click', () => {
      payCardOptions.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const method = card.getAttribute('data-method');
      if (revenuePaymentVal) revenuePaymentVal.value = method;
    });
  });

  // Recalcul en temps réel de l'impact financier dans la modale
  function refreshRevenueLivePreview() {
    const rawAmt = revenueAmountInput ? parseInt(revenueAmountInput.value, 10) : 0;
    const numericAmt = isNaN(rawAmt) || rawAmt < 0 ? 0 : rawAmt;
    const estNewRev = currentRevenueTotal + numericAmt;
    const estNewMargin = estNewRev - currentExpenseTotal;

    if (livePreviewNewRev) {
      livePreviewNewRev.textContent = `${new Intl.NumberFormat('fr-FR').format(estNewRev)} F CFA`;
    }
    if (livePreviewNewMargin) {
      livePreviewNewMargin.textContent = `${estNewMargin >= 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR').format(estNewMargin)} F CFA`;
    }
    if (btnSubmitRevenueText) {
      btnSubmitRevenueText.textContent = `Encaisser la recette (+${new Intl.NumberFormat('fr-FR').format(numericAmt)} F CFA)`;
    }
  }

  if (revenueAmountInput) {
    revenueAmountInput.addEventListener('input', refreshRevenueLivePreview);
  }

  // Puces de montants rapides
  const quickAmountChips = document.querySelectorAll('.quick-chip-btn');
  quickAmountChips.forEach(chip => {
    chip.addEventListener('click', () => {
      quickAmountChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const amt = parseInt(chip.getAttribute('data-amt'), 10);
      if (revenueAmountInput && !isNaN(amt)) {
        revenueAmountInput.value = amt;
        refreshRevenueLivePreview();
      }
    });
  });

  // Ouverture et fermeture de la modale d'encaissement
  function openRevenueModal() {
    if (modalRevenue) {
      modalRevenue.classList.remove('hidden');
      refreshRevenueLivePreview();
      renderCustomCalendar();
      if (revenueAmountInput) revenueAmountInput.focus();
    }
  }

  function closeRevenueModal() {
    if (modalRevenue) {
      modalRevenue.classList.add('hidden');
      closeCalendarPopover();
      if (formAddRevenue) formAddRevenue.reset();
      setCropMode(false);
    }
  }

  if (btnHeaderRevenue) btnHeaderRevenue.addEventListener('click', openRevenueModal);
  if (btnCloseModalRevenue) btnCloseModalRevenue.addEventListener('click', closeRevenueModal);
  if (btnCancelRevenue) btnCancelRevenue.addEventListener('click', closeRevenueModal);
  if (modalRevenue) {
    modalRevenue.addEventListener('click', (e) => {
      if (e.target === modalRevenue) closeRevenueModal();
    });
  }

  // Soumission et enregistrement de la recette
  if (formAddRevenue) {
    formAddRevenue.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amountVal = revenueAmountInput ? revenueAmountInput.value : '0';
      const numericAmount = parseInt(amountVal, 10) || 0;

      // Déterminer le libellé du produit
      let finalCropName = 'Récolte';
      let originVal = 'garden';
      if (isCustomCropMode) {
        const customVal = revenueCustomCropInput ? revenueCustomCropInput.value.trim() : '';
        const originSelect = document.getElementById('revenueCustomOrigin');
        originVal = originSelect ? originSelect.value : 'garden';
        const originText = originSelect ? originSelect.options[originSelect.selectedIndex].text.split('/')[0].trim() : 'Hors parcelle';
        finalCropName = customVal ? `${customVal} (${originText})` : `Autre vente libre (${originText})`;
      } else {
        const cycleSelect = document.getElementById('revenueCycle');
        finalCropName = cycleSelect ? cycleSelect.options[cycleSelect.selectedIndex].text.split('(')[0].trim() : 'Récolte';
      }

      // Mode de paiement
      const currentPayMethod = revenuePaymentVal ? revenuePaymentVal.value : 'cash';
      let payName = 'Espèces au marché (Cash)';
      if (currentPayMethod === 'orange') payName = 'Orange Money (+226)';
      else if (currentPayMethod === 'moov') payName = 'Moov Money Flooz (+226)';
      else if (currentPayMethod === 'virement') payName = 'Virement / Coopérative';

      const qty = document.getElementById('revenueQty') ? document.getElementById('revenueQty').value : 'Lot récolté';
      const buyer = document.getElementById('revenueBuyer') ? document.getElementById('revenueBuyer').value : 'Client comptant';
      const rawDate = revenueDateInput ? revenueDateInput.value : new Date().toISOString().split('T')[0];
      const formattedDate = dateFormattedText ? dateFormattedText.textContent : '16 Octobre 2026';

      // Sauvegarde dans Supabase si connecté
      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from('revenues').insert([{
            profile_id: currentProfileKey,
            amount: numericAmount,
            crop_name: finalCropName,
            is_custom_crop: isCustomCropMode,
            custom_origin: isCustomCropMode ? originVal : null,
            payment_method: currentPayMethod,
            quantity: qty,
            buyer_name: buyer,
            revenue_date: rawDate
          }]);
          if (error) {
            console.error('Erreur Supabase insert revenue:', error);
          } else {
            console.log('✅ Recette enregistrée dans Supabase');
          }
        } catch (err) {
          console.warn('Erreur réseau enregistrement recette :', err);
        }
      }

      await syncFinancialsFromSupabase(currentProfileKey);
      const { formattedMargin, formattedRev } = updateFinancialMetrics();

      closeRevenueModal();
      showToast(
        '🎉 Vente enregistrée sur Supabase !',
        `+${new Intl.NumberFormat('fr-FR').format(numericAmount)} F CFA (${qty} - ${finalCropName}) vendus à « ${buyer} » le ${formattedDate} via ${payName}. Recettes du mois : ${formattedRev} F • Marge nette : ${formattedMargin}.`
      );
    });
  }


  // ==========================================
  // EXPLICATION FORMULE DE MARGE
  // ==========================================
  btnShowFormula.addEventListener('click', () => {
    modalFormula.classList.remove('hidden');
  });

  function closeFormulaModal() {
    modalFormula.classList.add('hidden');
  }

  btnCloseModalFormula.addEventListener('click', closeFormulaModal);
  btnCloseFormulaBtn.addEventListener('click', closeFormulaModal);

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(title, message) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toastNotification.classList.remove('hidden');

    setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 4000);
  }

  btnToastClose.addEventListener('click', () => {
    toastNotification.classList.add('hidden');
  });

  // ==========================================
  // ÉVÉNEMENTS SUR LE SÉLECTEUR DE PROFIL ET D'ÉTAT
  // ==========================================
  roleSelector.addEventListener('change', (e) => {
    const newRole = e.target.value;
    renderProfile(newRole);
    syncFinancialsFromSupabase(newRole);
    syncCropCyclesFromSupabase(newRole);
    syncSubscriptionStatusFromSupabase(newRole);
    showToast('Profil actualisé', `Bascule vers le profil : ${PROFILES_DATA[newRole].name}`);
  });

  stateSelector.addEventListener('change', (e) => {
    applyUIState(e.target.value);
  });

  // Raccourcis rapides
  const btnShortcutExpense = document.getElementById('btnShortcutExpense');
  if (btnShortcutExpense) {
    btnShortcutExpense.addEventListener('click', openExpenseModal);
  }

  const btnShortcutListing = document.getElementById('btnShortcutListing');
  if (btnShortcutListing) {
    btnShortcutListing.addEventListener('click', () => {
      showToast('Marché Agricole', 'Formulaire de mise en vente de récolte ouvert.');
    });
  }

  const btnShortcutOpps = document.getElementById('btnShortcutOpps');
  if (btnShortcutOpps) {
    btnShortcutOpps.addEventListener('click', () => {
      showToast('Opportunités vérifiées', 'Filtre appliqué : Appels à projets Ministère & PReCA.');
    });
  }

  // Interactivité du graphique en barres
  const chartCols = document.querySelectorAll('.chart-col');
  const tooltip = document.getElementById('chartTooltip');
  const tooltipMonth = document.getElementById('tooltipMonth');
  const tooltipRev = document.getElementById('tooltipRev');
  const tooltipExp = document.getElementById('tooltipExp');
  const tooltipMargin = document.getElementById('tooltipMargin');

  chartCols.forEach(col => {
    col.addEventListener('mouseenter', () => {
      chartCols.forEach(c => c.classList.remove('active-month'));
      col.classList.add('active-month');

      if (tooltip) {
        tooltipMonth.textContent = col.getAttribute('data-month');
        tooltipRev.textContent = `${col.getAttribute('data-rev')} F CFA`;
        tooltipExp.textContent = `${col.getAttribute('data-exp')} F CFA`;
        tooltipMargin.textContent = `${col.getAttribute('data-margin')} F CFA`;
      }
    });
  });

  // ==========================================
  // MODALE AUTHENTIFICATION (CONNEXION & INSCRIPTION)
  // ==========================================
  function openAuthModal(defaultTab = 'login') {
    if (!modalAuth) return;
    modalAuth.classList.remove('hidden');

    // Vider systématiquement les champs pour éviter le pré-remplissage intempestif par le navigateur
    if (loginIdentifier) loginIdentifier.value = '';
    if (loginPassword) loginPassword.value = '';
    if (regFullName) regFullName.value = '';
    if (regPhone) regPhone.value = '';
    if (regPassword) regPassword.value = '';
    if (otpCodeInput) otpCodeInput.value = '';

    // Remettre le défilement en haut
    if (formLogin) formLogin.scrollTop = 0;
    if (formRegister) formRegister.scrollTop = 0;

    switchAuthTab(defaultTab);
  }

  function closeAuthModal() {
    if (modalAuth) modalAuth.classList.add('hidden');
    if (loginIdentifier) loginIdentifier.value = '';
    if (loginPassword) loginPassword.value = '';
    if (otpCodeInput) otpCodeInput.value = '';
  }

  function switchAuthTab(tab) {
    if (tab === 'login') {
      if (tabAuthLogin) tabAuthLogin.classList.add('active');
      if (tabAuthRegister) tabAuthRegister.classList.remove('active');
      if (formLogin) formLogin.classList.remove('hidden');
      if (formRegister) formRegister.classList.add('hidden');
      if (loginIdentifier) loginIdentifier.focus();
    } else {
      if (tabAuthRegister) tabAuthRegister.classList.add('active');
      if (tabAuthLogin) tabAuthLogin.classList.remove('active');
      if (formRegister) formRegister.classList.remove('hidden');
      if (formLogin) formLogin.classList.add('hidden');
      if (regFullName) regFullName.focus();
    }
  }

  if (tabAuthLogin) tabAuthLogin.addEventListener('click', () => switchAuthTab('login'));
  if (tabAuthRegister) tabAuthRegister.addEventListener('click', () => switchAuthTab('register'));
  if (btnOpenAuth) btnOpenAuth.addEventListener('click', () => openAuthModal('login'));
  if (btnCloseModalAuth) btnCloseModalAuth.addEventListener('click', closeAuthModal);
  if (modalAuth) {
    modalAuth.addEventListener('click', (e) => {
      if (e.target === modalAuth) closeAuthModal();
    });
  }

  // ==========================================
  // FONCTION : DÉCONNEXION RÉELLE (ETAT VIERGE 0 F CFA)
  // ==========================================
  function performLogout() {
    currentProfileKey = 'guest';

    // Profil déconnecté : compteurs vierges à 0 F CFA
    PROFILES_DATA['guest'] = {
      id: 'guest',
      name: 'Invité (Déconnecté)',
      metaRole: 'Session fermée',
      location: '📍 Burkina Faso',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      actionLabel: 'Se connecter',
      greeting: 'Bonjour, Exploitant <span class="greeting-emoji">🌱</span>',
      subtitle: 'Veuillez vous connecter pour gérer vos parcelles, dépenses et récoltes réelles.',
      isAdmin: false,
      hasExploitation: false,
      stats: [
        { module: 'Exploitation', label: 'Dépenses du mois', value: '0', unit: 'F CFA', trendText: '0 dépense', trendType: 'favorable', comp: 'Session déconnectée', color: 'green' },
        { module: 'Recettes', label: 'Recettes du mois', value: '0', unit: 'F CFA', trendText: '0 encaissement', trendType: 'favorable', comp: 'Session déconnectée', color: 'blue' },
        { module: 'Production', label: 'Cycles en cours', value: '0', unit: 'actifs', badge: 'Non connecté', comp: 'Connexion requise', color: 'yellow' },
        { module: 'Financements', label: 'Opportunités ouvertes', value: '5', unit: 'vérifiées', badge: '2 clôturent < 7 j', comp: 'PReCA & Fonds Vert', color: 'purple' }
      ],
      chartTitle: 'Dépenses et recettes',
      chartSubtitle: 'Connectez-vous pour visualiser vos flux financiers réels',
      marginOct: '0 F CFA',
      deadlines: [
        { title: 'Connexion à votre exploitation requise', meta: 'Accédez à vos parcelles et financements en sécurité', badge: 'Requis', icon: 'amber' }
      ],
      tableTitle: 'Mes parcelles & cultures',
      tableSubtitle: 'Connectez-vous pour voir et gérer vos cultures',
      tableHeaders: ['CULTURE & VARIÉTÉ', 'PARCELLE', 'DATE SEMIS', 'RÉCOLTE ESTIMÉE', 'STATUT', 'ACTIONS'],
      tableRows: []
    };

    currentExpenseTotal = 0;
    currentRevenueTotal = 0;
    userSubscriptionStatus['guest'] = false;

    renderProfile('guest');
    updateFinancialMetrics();

    if (btnAuthText) btnAuthText.textContent = 'Connexion';
    if (roleSelector) {
      if (!roleSelector.querySelector('option[value="guest"]')) {
        const opt = document.createElement('option');
        opt.value = 'guest';
        opt.textContent = '🔒 Invité (Déconnecté)';
        roleSelector.appendChild(opt);
      }
      roleSelector.value = 'guest';
    }

    openAuthModal('login');
    showToast('Session fermée', 'Déconnexion effectuée. Connectez-vous avec votre numéro pour retrouver vos données.');
  }

  // Déconnexion Bureau
  if (btnLogout) {
    btnLogout.addEventListener('click', performLogout);
  }

  // Raccourcis profils démo dans la modale
  demoQuickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.getAttribute('data-role');
      if (targetRole && PROFILES_DATA[targetRole]) {
        if (roleSelector) roleSelector.value = targetRole;
        renderProfile(targetRole);
        syncFinancialsFromSupabase(targetRole);
        syncCropCyclesFromSupabase(targetRole);
        syncSubscriptionStatusFromSupabase(targetRole);
        closeAuthModal();
        showToast('Connexion réussie', `Connecté en tant que ${PROFILES_DATA[targetRole].name}`);
      }
    });
  });

  // Sélection visuelle rôle inscription
  const regRoleCards = document.querySelectorAll('.role-card-opt');
  regRoleCards.forEach(card => {
    card.addEventListener('click', () => {
      regRoleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // ==========================================
  // SYSTÈME DE CONFIRMATION SMS / CODE OTP (+226)
  // ==========================================
  const stepAuthOtp = document.getElementById('stepAuthOtp');
  const smsTargetPhone = document.getElementById('smsTargetPhone');
  const smsDisplayCode = document.getElementById('smsDisplayCode');
  const otpCodeInput = document.getElementById('otpCodeInput');
  const btnVerifyOtp = document.getElementById('btnVerifyOtp');
  const btnResendOtp = document.getElementById('btnResendOtp');
  const btnBackFromOtp = document.getElementById('btnBackFromOtp');

  let pendingAuthData = null;
  let currentOtpExpected = null;

  function showOtpStep(phoneFormatted, code) {
    currentOtpExpected = code;
    if (formLogin) formLogin.classList.add('hidden');
    if (formRegister) formRegister.classList.add('hidden');
    if (stepAuthOtp) stepAuthOtp.classList.remove('hidden');

    if (smsTargetPhone) smsTargetPhone.textContent = phoneFormatted;
    if (smsDisplayCode) smsDisplayCode.textContent = code;
    if (otpCodeInput) {
      otpCodeInput.value = '';
      setTimeout(() => otpCodeInput.focus(), 150);
    }

    showToast(
      '📲 Message SMS Reçu (+226)',
      `Votre code de confirmation Révolution Agricole est : [ ${code} ]`
    );
  }

  function hideOtpStep() {
    if (stepAuthOtp) stepAuthOtp.classList.add('hidden');
    switchAuthTab('login');
  }

  if (btnBackFromOtp) btnBackFromOtp.addEventListener('click', hideOtpStep);

  if (btnResendOtp) {
    btnResendOtp.addEventListener('click', () => {
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      currentOtpExpected = newCode;
      if (smsDisplayCode) smsDisplayCode.textContent = newCode;
      showToast('📲 Nouveau code SMS envoyé', `Votre code de confirmation : [ ${newCode} ]`);
    });
  }

  async function completeOtpVerification() {
    const entered = otpCodeInput ? otpCodeInput.value.trim() : '';
    if (!entered || entered !== currentOtpExpected) {
      showToast('⚠️ Code incorrect', 'Veuillez saisir le code à 4 chiffres reçu par SMS.');
      if (otpCodeInput) otpCodeInput.focus();
      return;
    }

    if (!pendingAuthData) {
      closeAuthModal();
      return;
    }

    if (pendingAuthData.isRegistration) {
      const reg = pendingAuthData;
      if (supabaseClient) {
        try {
          await supabaseClient.from('profiles').insert([{
            id: reg.newUserId,
            role: reg.role,
            full_name: reg.fullName,
            meta_role: reg.metaRole,
            location: reg.location,
            phone: '+226 ' + reg.phone,
            avatar_url: reg.avatar,
            is_admin: false,
            is_pro: false,
            password: reg.password,
            verification_code: currentOtpExpected,
            is_verified: true
          }]);
        } catch (err) {
          console.warn('Erreur Supabase insertion profil :', err);
        }
      }

      PROFILES_DATA[reg.newUserId] = {
        id: reg.newUserId,
        name: reg.fullName,
        metaRole: reg.metaRole,
        location: `📍 ${reg.location}`,
        avatar: reg.avatar,
        actionLabel: reg.actionLabel,
        greeting: `Bonjour, ${reg.fullName.split(' ')[0]} <span class="greeting-emoji">🌱</span>`,
        subtitle: 'Bienvenue sur votre exploitation. Vos compteurs démarrent bien à 0 F CFA.',
        isAdmin: false,
        hasExploitation: reg.hasExploitation,
        stats: [
          { module: 'Exploitation', label: 'Dépenses du mois', value: '0', unit: 'F CFA', trendText: '0 dépense', trendType: 'favorable', comp: 'Nouvelle exploitation', color: 'green' },
          { module: 'Recettes', label: 'Recettes du mois', value: '0', unit: 'F CFA', trendText: '0 encaissement', trendType: 'favorable', comp: 'Prêt pour récolte', color: 'blue' },
          { module: 'Production', label: 'Cycles en cours', value: '0', unit: 'actifs', badge: 'Aucun cycle', comp: 'Parcelles à enregistrer', color: 'yellow' },
          { module: 'Financements', label: 'Opportunités ouvertes', value: '5', unit: 'vérifiées', badge: '2 clôturent < 7 j', comp: 'PReCA & Fonds Vert', color: 'purple' }
        ],
        chartTitle: 'Dépenses et recettes',
        chartSubtitle: 'Vos flux de trésorerie réels enregistrés sur Supabase',
        marginOct: '0 F CFA',
        deadlines: [
          { title: 'Ajouter votre première parcelle', meta: 'Définissez vos superficies en hectares', badge: 'Étape 1', icon: 'green' },
          { title: 'Enregistrer vos semences ou carburant', meta: 'Saisie rapide en 30 secondes', badge: 'Étape 2', icon: 'amber' },
          { title: 'Consulter les subventions PReCA', meta: 'Financements Ministère de l\'Agriculture', badge: 'Disponible', icon: 'purple' }
        ],
        tableTitle: 'Mes parcelles & cultures',
        tableSubtitle: 'Suivez vos cultures de la pépinière à la récolte',
        tableHeaders: ['CULTURE & VARIÉTÉ', 'PARCELLE', 'DATE SEMIS', 'RÉCOLTE ESTIMÉE', 'STATUT', 'ACTIONS'],
        tableRows: []
      };

      if (roleSelector) {
        const opt = document.createElement('option');
        opt.value = reg.newUserId;
        opt.textContent = `⭐ ${reg.fullName} (${reg.location.split(' ')[0]})`;
        roleSelector.appendChild(opt);
        roleSelector.value = reg.newUserId;
      }

      currentProfileKey = reg.newUserId;
      currentExpenseTotal = 0;
      currentRevenueTotal = 0;
      userSubscriptionStatus[reg.newUserId] = false;

      renderProfile(reg.newUserId);
      updateFinancialMetrics();
      closeAuthModal();

      showToast(
        '🎉 Numéro validé & Compte créé !',
        `Bienvenue ${reg.fullName} ! Votre numéro burkinabè est confirmé et vos compteurs démarrent bien à 0 F CFA.`
      );
    } else {
      const user = pendingAuthData.user;
      const pKey = user.id;

      if (supabaseClient) {
        try {
          await supabaseClient.from('profiles').update({ is_verified: true, verification_code: currentOtpExpected }).eq('id', pKey);
        } catch (e) {}
      }

      if (!PROFILES_DATA[pKey]) {
        PROFILES_DATA[pKey] = {
          id: pKey,
          name: user.full_name,
          metaRole: user.meta_role || 'Acteur Agricole',
          location: user.location ? `📍 ${user.location}` : '📍 Burkina Faso',
          avatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
          actionLabel: user.role === 'producer' ? 'Ajouter une dépense' : 'Publier une annonce',
          greeting: `Bonjour, ${user.full_name.split(' ')[0]} <span class="greeting-emoji">🌱</span>`,
          subtitle: 'Voici l\'essentiel pour votre activité aujourd\'hui.',
          isAdmin: !!user.is_admin,
          hasExploitation: user.role === 'producer',
          stats: [
            { module: 'Exploitation', label: 'Dépenses du mois', value: '0', unit: 'F CFA', color: 'green' },
            { module: 'Recettes', label: 'Recettes du mois', value: '0', unit: 'F CFA', color: 'blue' },
            { module: 'Production', label: 'Cycles en cours', value: '0', unit: 'actifs', color: 'yellow' },
            { module: 'Financements', label: 'Opportunités ouvertes', value: '5', unit: 'vérifiées', color: 'purple' }
          ],
          chartTitle: 'Dépenses et recettes',
          chartSubtitle: 'Vos flux de trésorerie réels',
          marginOct: '0 F CFA',
          deadlines: [],
          tableTitle: 'Mes cycles en cours',
          tableSubtitle: 'Données issues de Supabase',
          tableHeaders: ['CULTURE & VARIÉTÉ', 'PARCELLE', 'DATE SEMIS', 'RÉCOLTE ESTIMÉE', 'STATUT', 'ACTIONS'],
          tableRows: []
        };

        if (roleSelector) {
          const opt = document.createElement('option');
          opt.value = pKey;
          opt.textContent = `👤 ${user.full_name}`;
          roleSelector.appendChild(opt);
        }
      }

      if (roleSelector) roleSelector.value = pKey;
      renderProfile(pKey);
      await syncFinancialsFromSupabase(pKey);
      await syncCropCyclesFromSupabase(pKey);
      await syncSubscriptionStatusFromSupabase(pKey);
      closeAuthModal();

      showToast(
        'Connexion confirmée',
        `Bienvenue, ${user.full_name} ! Vos données ont été rechargées depuis Supabase.`
      );
    }
    pendingAuthData = null;
  }

  if (btnVerifyOtp) btnVerifyOtp.addEventListener('click', completeOtpVerification);
  if (otpCodeInput) {
    otpCodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        completeOtpVerification();
      }
    });
  }

  // 1. Soumission Création de compte (Inscription)
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = regFullName ? regFullName.value.trim() : 'Nouvel Exploitant';
      const phone = regPhone ? regPhone.value.trim() : '70 12 34 56';
      const location = regLocation ? regLocation.value : 'Koudougou (Boulkiemdé)';
      const selectedRadio = document.querySelector('input[name="regRole"]:checked');
      const role = selectedRadio ? selectedRadio.value : 'producer';
      const password = regPassword ? regPassword.value : '';
      const newUserId = 'user_' + Date.now();

      let metaRole = 'Maraîcher & Céréalier';
      let actionLabel = 'Ajouter une dépense';
      let hasExploitation = true;
      let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80';

      if (role === 'supplier') {
        metaRole = 'Fournisseur d\'Équipements & Intrants';
        actionLabel = 'Publier une annonce';
        hasExploitation = false;
        avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80';
      } else if (role === 'buyer') {
        metaRole = 'Acheteur & Transformateur Céréalier';
        actionLabel = 'Publier une demande d\'achat';
        hasExploitation = false;
        avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80';
      }

      // Génération code SMS
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      pendingAuthData = {
        isRegistration: true,
        newUserId,
        fullName,
        phone,
        location,
        role,
        metaRole,
        actionLabel,
        hasExploitation,
        avatar,
        password
      };

      showOtpStep('+226 ' + phone, code);
    });
  }

  // 2. Soumission Connexion
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = loginIdentifier ? loginIdentifier.value.trim() : '';

      let foundUser = null;
      if (supabaseClient && identifier) {
        try {
          const { data } = await supabaseClient
            .from('profiles')
            .select('*')
            .or(`phone.ilike.%${identifier}%,id.eq.${identifier},full_name.ilike.%${identifier}%`)
            .limit(1);

          if (data && data.length > 0) {
            foundUser = data[0];
          }
        } catch (err) {
          console.warn('Erreur recherche profil Supabase :', err);
        }
      }

      if (!foundUser) {
        const demoKey = Object.keys(PROFILES_DATA).find(k => 
          k.toLowerCase() === identifier.toLowerCase() || 
          PROFILES_DATA[k].name.toLowerCase().includes(identifier.toLowerCase())
        );
        if (demoKey) {
          const p = PROFILES_DATA[demoKey];
          foundUser = {
            id: p.id,
            full_name: p.name,
            meta_role: p.metaRole,
            location: p.location,
            phone: '+226 70 12 34 56',
            avatar_url: p.avatar,
            role: p.id,
            is_admin: p.isAdmin,
            is_pro: userSubscriptionStatus[p.id] || false
          };
        }
      }

      if (!foundUser) {
        foundUser = {
          id: 'user_' + Date.now(),
          full_name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          meta_role: 'Producteur Maraîcher',
          location: 'Koudougou (Boulkiemdé)',
          phone: identifier.startsWith('+') ? identifier : '+226 ' + identifier,
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
          role: 'producer',
          is_admin: false,
          is_pro: false
        };
      }

      // Génération code de confirmation SMS à 4 chiffres
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      pendingAuthData = {
        isRegistration: false,
        user: foundUser
      };

      const phoneToDisplay = foundUser.phone || ('+226 ' + identifier);
      showOtpStep(phoneToDisplay, code);
    });
  }

  // ==========================================
  // MODALE ABONNEMENTS & TARIFS (5 000 F / 10 000 F)
  // ==========================================
  function openPricingModal() {
    if (modalPricing) {
      modalPricing.classList.remove('hidden');
    }
  }

  function closePricingModal() {
    if (modalPricing) {
      modalPricing.classList.add('hidden');
    }
  }

  if (btnCloseModalPricing) btnCloseModalPricing.addEventListener('click', closePricingModal);
  if (btnHeaderPricing) btnHeaderPricing.addEventListener('click', openPricingModal);
  if (navItemPricing) {
    navItemPricing.addEventListener('click', (e) => {
      e.preventDefault();
      openPricingModal();
    });
  }

  // Bascule Mensuel / Campagne 6 mois (-15%)
  if (btnBillingMonthly && btnBillingCampaign) {
    btnBillingMonthly.addEventListener('click', () => {
      currentBillingCycle = 'monthly';
      btnBillingMonthly.classList.add('active');
      btnBillingCampaign.classList.remove('active');
      if (displayPricePro) displayPricePro.textContent = '5 000';
      if (displayPeriodPro) displayPeriodPro.textContent = 'F CFA /mois';
      if (displayPriceBiz) displayPriceBiz.textContent = '10 000';
      if (displayPeriodBiz) displayPeriodBiz.textContent = 'F CFA /mois';
    });

    btnBillingCampaign.addEventListener('click', () => {
      currentBillingCycle = 'campaign';
      btnBillingCampaign.classList.add('active');
      btnBillingMonthly.classList.remove('active');
      if (displayPricePro) displayPricePro.textContent = '25 500';
      if (displayPeriodPro) displayPeriodPro.textContent = 'F CFA /6 mois (-15%)';
      if (displayPriceBiz) displayPriceBiz.textContent = '51 000';
      if (displayPeriodBiz) displayPeriodBiz.textContent = 'F CFA /6 mois (-15%)';
    });
  }

  // Clic sur "Choisir ce forfait"
  const selectPlanBtns = document.querySelectorAll('.btn-select-plan');
  selectPlanBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const planId = btn.getAttribute('data-plan');
      const planName = btn.getAttribute('data-name');
      const baseMonthlyPrice = planId === 'pro' ? 5000 : 10000;
      const campaignPrice = planId === 'pro' ? 25500 : 51000;
      const effectivePrice = currentBillingCycle === 'monthly' ? baseMonthlyPrice : campaignPrice;
      const formattedPrice = new Intl.NumberFormat('fr-FR').format(effectivePrice) + ' F CFA';

      currentCheckoutPlan = {
        id: planId,
        name: planName,
        price: effectivePrice,
        formattedPrice: formattedPrice,
        cycle: currentBillingCycle
      };

      if (checkoutPlanName) checkoutPlanName.textContent = planName;
      if (checkoutPlanDesc) {
        checkoutPlanDesc.textContent = currentBillingCycle === 'monthly' 
          ? 'Abonnement Mensuel • Sans engagement' 
          : 'Campagne Agricole (6 mois) • Réduction -15% appliquée';
      }
      if (checkoutPlanPrice) checkoutPlanPrice.textContent = formattedPrice;
      if (btnCheckoutText) btnCheckoutText.textContent = `Confirmer et Payer (${formattedPrice})`;

      closePricingModal();
      openCheckoutModal();
    });
  });

  // ==========================================
  // MODALE CHECKOUT MOBILE MONEY (BURKINA FASO)
  // ==========================================
  function openCheckoutModal() {
    if (modalCheckout) {
      modalCheckout.classList.remove('hidden');
      if (checkoutPhone) checkoutPhone.focus();
    }
  }

  function closeCheckoutModal() {
    if (modalCheckout) {
      modalCheckout.classList.add('hidden');
    }
  }

  if (btnCloseModalCheckout) btnCloseModalCheckout.addEventListener('click', closeCheckoutModal);
  if (btnCancelCheckout) btnCancelCheckout.addEventListener('click', closeCheckoutModal);

  // Choix opérateur (Orange Money / Moov Money)
  if (payOptOrange && payOptMoov) {
    payOptOrange.addEventListener('click', () => {
      selectedOperator = 'orange';
      payOptOrange.classList.add('selected');
      payOptMoov.classList.remove('selected');
      if (ussdInstructionText) {
        ussdInstructionText.textContent = "Orange Money : Une invite USSD (*144*4*6#) va s'afficher sur votre écran. Validez avec votre code PIN secret.";
      }
    });

    payOptMoov.addEventListener('click', () => {
      selectedOperator = 'moov';
      payOptMoov.classList.add('selected');
      payOptOrange.classList.remove('selected');
      if (ussdInstructionText) {
        ussdInstructionText.textContent = "Moov Money : Composez *555*6# ou validez le push de confirmation avec votre code secret Flooz.";
      }
    });
  }

  // Soumission et enregistrement du paiement Mobile Money sur Supabase
  if (formCheckout) {
    formCheckout.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneVal = checkoutPhone ? checkoutPhone.value.trim() : '';
      const opName = selectedOperator === 'orange' ? 'Orange Money' : 'Moov Money';

      if (btnCheckoutText) {
        btnCheckoutText.textContent = '⏳ Validation auprès de l\'opérateur...';
      }
      const submitBtn = document.getElementById('btnSubmitCheckout');
      if (submitBtn) submitBtn.disabled = true;

      // Calcul de la date d'expiration (1 mois ou 6 mois)
      const now = new Date();
      const monthsToAdd = currentCheckoutPlan.cycle === 'campaign' ? 6 : 1;
      const expiresAt = new Date(now.setMonth(now.getMonth() + monthsToAdd)).toISOString();

      if (supabaseClient) {
        try {
          // 1. Enregistrer la transaction d'abonnement
          await supabaseClient.from('subscriptions').insert([{
            profile_id: currentProfileKey,
            plan_id: currentCheckoutPlan.id,
            plan_name: currentCheckoutPlan.name,
            cycle: currentCheckoutPlan.cycle,
            amount: currentCheckoutPlan.price,
            operator: selectedOperator,
            phone: phoneVal,
            status: 'active',
            expires_at: expiresAt
          }]);

          // 2. Mettre à jour le statut is_pro dans profiles
          await supabaseClient.from('profiles').update({ is_pro: true }).eq('id', currentProfileKey);
          console.log('✅ Abonnement Mobile Money enregistré dans Supabase !');
        } catch (err) {
          console.warn('⚠️ Erreur enregistrement abonnement Supabase :', err);
        }
      }

      setTimeout(() => {
        if (submitBtn) submitBtn.disabled = false;
        closeCheckoutModal();

        // Activer l'abonnement pour le profil courant
        userSubscriptionStatus[currentProfileKey] = true;
        renderProfile(currentProfileKey);

        showToast(
          '🎉 Abonnement Pro activé sur Supabase !',
          `Paiement de ${currentCheckoutPlan.formattedPrice} validé par ${opName} (+226 ${phoneVal}). Statut PRO enregistré dans la base.`
        );
      }, 1000);
    });
  }

  // ==========================================
  // INITIALISATION
  // ==========================================
  renderProfile('producer');
  syncFinancialsFromSupabase('producer');
  syncCropCyclesFromSupabase('producer');
  syncSubscriptionStatusFromSupabase('producer');
  renderMobileView();
});
