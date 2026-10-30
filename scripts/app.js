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
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true
      }
    });
    window.supabaseClient = supabaseClient;
    console.log(' [Révolution Agricole] Connecté avec succès à Supabase !');
  } else {
    console.warn('️ [Révolution Agricole] Client Supabase CDN indisponible, bascule en mode local.');
  }

  // ==========================================
  // PROFILS UTILISATEURS AUTHENTIFIÉS (RÉEL SUPABASE AUTH)
  // ==========================================
  const PROFILES_DATA = {};

  // État applicatif courant
  let currentProfileKey = null;
  let currentUIState = 'normal';
  let currentViewMode = 'desktop';
  let isRecoveryMode = false; // Flag actif lors du flux de réinitialisation de mot de passe

  // État des abonnements par profil (5 000 F / 10 000 F CFA)
  const userSubscriptionStatus = {};
  let currentBillingCycle = 'monthly'; // 'monthly' | 'campaign'
  let currentCheckoutPlan = { id: 'pro', name: 'Pro Producteur', price: 5000 };
  let selectedOperator = 'orange'; // 'orange' | 'moov'

  // Navigation & État du module Financements (Connecté Supabase)
  let currentRoutePage = 'dashboard'; // 'dashboard' | 'opportunites' | 'admin-financements' | 'meteo'
  let isNavigatingRoute = false; // Empêche la réouverture intempestive du tiroir mobile lors d'un clic de navigation
  let cachedFinancements = [];
  let userSelectedType = 'all';
  let userSelectedRegion = 'all';
  let adminActiveStatusTab = 'en_attente';
  let cachedWeatherResult = null;
  let userManualCommuneKey = null;

  // Variables d'état et sélecteurs DOM pour Conseils Agronomiques
  let cachedConseils = [];
  let userSelectedConseilCategory = 'all';
  let adminConseilActiveStatusTab = 'en_attente';
  let activeConseilSpeechBtn = null;

  // Variables d'état et sélecteurs DOM pour Modèles de Cultures, Parcelles & Régions
  let cachedModelesCultures = [];
  let cachedUserParcels = [];
  let cachedRegions = [];
  let cachedExpenses = [];
  let cachedRevenues = [];
  let cachedCropCycles = [];
  let cachedCycleTasks = [];
  let cachedEtapesCulture = [];
  let adminSelectedCropPlan = '';
  let adminSelectedPhasePlan = 'all';
  let currentEditingEtapeId = null;
  const pageAdminEtapes = document.getElementById('pageAdminEtapes');
  const modalAdminEtape = document.getElementById('modalAdminEtape');
  const formAdminEtape = document.getElementById('formAdminEtape');
  const homeTasksWeekCard = document.getElementById('homeTasksWeekCard');
  let activeAdminModelesTab = 'all';
  let activeCropSpeechBtn = null;
  let activeParcelSpeechBtn = null;
  let cyclesActiveStatusFilter = 'all';
  const modalAddParcel = document.getElementById('modalAddParcel');
  const formAddParcel = document.getElementById('formAddParcel');
  const parcelRegionSelect = document.getElementById('parcelRegionSelect');
  const pageSynthese = document.getElementById('pageSynthese');
  const pageCycles = document.getElementById('pageCycles');
  const pageFinances = document.getElementById('pageFinances');
  const modalAddCycleTask = document.getElementById('modalAddCycleTask');
  const formAddCycleTask = document.getElementById('formAddCycleTask');
  const modalCompteExploitation = document.getElementById('modalCompteExploitation');

  // Variables d'état et sélecteurs DOM pour Matériel & Services
  let cachedMateriels = [];
  let userSelectedMaterielCategory = 'all';
  let userSelectedMaterielTypeOffre = 'all';
  let userMaterielSearchQuery = '';
  let adminMaterielActiveStatusTab = 'all';
  let currentEditingMaterielId = null;
  let currentDetailMaterielPhotos = [];
  let currentDetailPhotoIndex = 0;
  let pendingMaterielPhotos = [];

  // Variables d'état pour Marché agricole, Mes annonces et Modération
  let cachedAnnonces = [];
  let cachedSignalements = [];
  let marcheActiveType = 'vente'; // 'vente' | 'achat'
  let marcheSelectedCategory = 'all';
  let marcheSelectedRegion = 'all';
  let marcheSearchQuery = '';
  let adminQueueActiveStatusTab = 'en_attente'; // 'en_attente' | 'traite' | 'all'
  let pendingAnnoncePhotos = [];
  let currentDetailAnnonce = null;
  let currentEditingAnnonceId = null;
  let currentPublishStep = 1;

  const pageMarche = document.getElementById('pageMarche');
  const pageMesAnnonces = document.getElementById('pageMesAnnonces');
  const pageAdminQueue = document.getElementById('pageAdminQueue');
  const modalPublishAnnonce = document.getElementById('modalPublishAnnonce');
  const modalAnnonceDetails = document.getElementById('modalAnnonceDetails');
  const modalSignalerAnnonce = document.getElementById('modalSignalerAnnonce');
  const formPublishAnnonce = document.getElementById('formPublishAnnonce');
  const formSignalerAnnonce = document.getElementById('formSignalerAnnonce');

  const pageMaterielServices = document.getElementById('pageMaterielServices');
  const pageAdminMateriels = document.getElementById('pageAdminMateriels');
  const modalManageMateriel = document.getElementById('modalManageMateriel');
  const modalMaterielDetails = document.getElementById('modalMaterielDetails');
  const formManageMateriel = document.getElementById('formManageMateriel');

  const pageFinancements = document.getElementById('pageFinancements');
  const pageAdminFinancements = document.getElementById('pageAdminFinancements');
  const pageConseils = document.getElementById('pageConseils');
  const pageAdminConseils = document.getElementById('pageAdminConseils');
  const pageAdminUtilisateurs = document.getElementById('pageAdminUtilisateurs');
  const pageAdminModeles = document.getElementById('pageAdminModeles');
  const pageParcelles = document.getElementById('pageParcelles');
  const pageMeteo = document.getElementById('pageMeteo');
  const pageNotifications = document.getElementById('pageNotifications');
  const btnNotifications = document.getElementById('btnNotifications');
  const btnMarkAllNotifsRead = document.getElementById('btnMarkAllNotifsRead');
  const notificationsListContainer = document.getElementById('notificationsListContainer');
  const notifBadgeCount = document.getElementById('notifBadgeCount');
  const dashboardContent = document.getElementById('dashboardContent');
  const modalManageFinancement = document.getElementById('modalManageFinancement');
  const modalFinancementDetails = document.getElementById('modalFinancementDetails');
  const formManageFinancement = document.getElementById('formManageFinancement');
  const modalManageConseil = document.getElementById('modalManageConseil');
  const modalConseilDetails = document.getElementById('modalConseilDetails');
  const formManageConseil = document.getElementById('formManageConseil');
  const modalAddCropCycle = document.getElementById('modalAddCropCycle');
  const formAddCropCycle = document.getElementById('formAddCropCycle');
  const modalManageModele = document.getElementById('modalManageModele');
  const formManageModele = document.getElementById('formManageModele');

  // Sélecteurs DOM clés
  const roleSelector = document.getElementById('roleSelector');
  const stateSelector = document.getElementById('stateSelector');
  const btnViewDesktop = document.getElementById('btnViewDesktop');
  const btnViewMobile = document.getElementById('btnViewMobile');
  const viewportContainer = document.getElementById('viewportContainer');
  const desktopAppShell = document.getElementById('desktopAppShell');
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
  const liveDateDisplay = document.getElementById('liveDateDisplay');
  const liveTimeDisplay = document.getElementById('liveTimeDisplay');
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

  // Modale Compte & Modale Complétion Profil (Onboarding)
  const modalAuth = document.getElementById('modalAuth');
  const btnCloseModalAuth = document.getElementById('btnCloseModalAuth');
  const btnOpenAuth = document.getElementById('btnOpenAuth');
  const btnAuthText = document.getElementById('btnAuthText');
  const btnLogout = document.getElementById('btnLogout');
  const btnModalLogout = document.getElementById('btnModalLogout');
  const btnEditProfileFromModal = document.getElementById('btnEditProfileFromModal');
  const modalAccountName = document.getElementById('modalAccountName');
  const modalAccountRole = document.getElementById('modalAccountRole');
  const modalAccountEmail = document.getElementById('modalAccountEmail');
  const modalAccountAvatar = document.getElementById('modalAccountAvatar');

  const modalOnboarding = document.getElementById('modalOnboarding');
  const formOnboarding = document.getElementById('formOnboarding');
  const onboardingFullName = document.getElementById('onboardingFullName');
  const onboardingPhone = document.getElementById('onboardingPhone');
  const onboardingLocation = document.getElementById('onboardingLocation');

  // Toast
  const toastNotification = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  const btnToastClose = document.getElementById('btnToastClose');

  // ==========================================
  // GESTION TEMPS RÉEL : VRAIE DATE & COMPTE À REBOURS
  // ==========================================
  const MONTH_SHORT_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    const cleanStr = String(dateStr).split('T')[0].trim();
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  }

  function getDiffDaysFromToday(targetDateStr) {
    const target = parseLocalDate(targetDateStr);
    if (!target || isNaN(target.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  function formatDaysLeftBadge(diffDays) {
    if (diffDays === 0) return "aujourd'hui";
    if (diffDays === 1) return "1 jour";
    return `${diffDays} jours`;
  }

  // ==========================================
  // HELPERS GLOBAUX : CONSEILS & FINANCEMENTS (BUREAU & MOBILE)
  // ==========================================

  // 1. Filtrage des financements ouverts pour les producteurs
  function filterOpenFinancementsForUsers(items) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return (items || []).filter(item => {
        if (!item) return false;
        // Statut strictement 'publie'
        if (String(item.statut || '').trim().toLowerCase() !== 'publie') return false;
        // Si date_limite est vide, nulle ou non renseignée : offre toujours ouverte
        if (!item.date_limite || String(item.date_limite).trim() === '') return true;
        const deadline = parseLocalDate(item.date_limite);
        if (!deadline || isNaN(deadline.getTime())) return true;
        deadline.setHours(23, 59, 59, 999);
        return deadline >= today;
      });
    } catch (e) {
      console.warn('Erreur filterOpenFinancementsForUsers :', e);
      return [];
    }
  }

  // 2. Classe CSS du badge de catégorie de conseil
  function getConseilCategoryBadgeClass(cat) {
    if (!cat) return 'cat-sol';
    const c = String(cat).toLowerCase();
    if (c.includes('maraîch') || c.includes('maraich')) return 'cat-maraichage';
    if (c.includes('céréal') || c.includes('cereal')) return 'cat-cereales';
    if (c.includes('élev') || c.includes('elev')) return 'cat-elevage';
    if (c.includes('irrig')) return 'cat-irrigation';
    if (c.includes('sol') || c.includes('fertil')) return 'cat-sol';
    if (c.includes('malad') || c.includes('ravage')) return 'cat-maladies';
    if (c.includes('récolt') || c.includes('recolt') || c.includes('conserv')) return 'cat-recolte';
    return 'cat-sol';
  }

  // 3. Élément HTML du badge de catégorie (utilisé dans mobile & bureau)
  function getConseilCategoryBadge(cat) {
    const cls = getConseilCategoryBadgeClass(cat);
    return `<span class="conseil-badge-category ${cls}" style="font-size: 11px; padding: 2px 8px;">${cat || 'Conseil'}</span>`;
  }

  // 4. Comptage sécurisé des conseils récents (< 7 jours)
  function getNewConseilsCount() {
    try {
      if (!Array.isArray(cachedConseils) || cachedConseils.length === 0) return 0;
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return cachedConseils.filter(c => {
        if (!c || c.statut !== 'publie') return false;
        const pubDate = c.date_publication ? new Date(c.date_publication) : (c.created_at ? new Date(c.created_at) : null);
        return pubDate && !isNaN(pubDate.getTime()) && pubDate >= sevenDaysAgo;
      }).length;
    } catch (e) {
      console.warn('Erreur getNewConseilsCount :', e);
      return 0;
    }
  }

  // 5. Mise à jour de statut de conseil (publie / archive)
  async function updateConseilStatus(id, newStatus) {
    try {
      if (newStatus === 'publie') {
        if (typeof publishConseil === 'function') return await publishConseil(id);
      } else if (newStatus === 'archive') {
        if (typeof archiveConseil === 'function') return await archiveConseil(id);
      }
      if (supabaseClient) {
        const nowIso = new Date().toISOString();
        const payload = { statut: newStatus, updated_at: nowIso };
        if (newStatus === 'publie') payload.date_publication = nowIso;
        await supabaseClient.from('conseils').update(payload).eq('id', id);
        if (typeof fetchConseils === 'function') await fetchConseils();
      }
    } catch (e) {
      console.error('Erreur updateConseilStatus :', e);
    }
  }

  // 6. Utilitaires pour Modèles de cultures & Dates en toutes lettres (Accessibles vocalement)
  function formatDateEnToutesLettres(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const mois = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return `${dateObj.getDate()} ${mois[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  }

  function addDaysToDate(baseDate, days) {
    if (!baseDate || isNaN(baseDate.getTime())) return new Date();
    const result = new Date(baseDate.getTime());
    result.setDate(result.getDate() + Number(days || 0));
    return result;
  }

  function formatDateForInput(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getModeleModeBadge(mode) {
    if (mode === 'pepiniere') {
      return '<span class="modele-mode-badge modele-mode-pepiniere"> Pépinière</span>';
    }
    return '<span class="modele-mode-badge modele-mode-semis"> Semis direct</span>';
  }

  function getActiveModelesCount() {
    try {
      if (!Array.isArray(cachedModelesCultures)) return 0;
      return cachedModelesCultures.filter(m => m && m.actif).length;
    } catch (e) {
      return 0;
    }
  }

  // Helper pour extraire un résumé clair pour la carte conseil du jour
  function getConseilCardText(item) {
    if (!item) return '';
    if (item.resume && item.resume.trim()) return item.resume.trim();
    if (item.contenu) {
      const cleaned = item.contenu.replace(/^Pourquoi c'est important\s*:\s*/i, '').trim();
      const firstPeriod = cleaned.indexOf('.');
      if (firstPeriod > 30) {
        const secondPeriod = cleaned.indexOf('.', firstPeriod + 1);
        if (secondPeriod > firstPeriod && secondPeriod < 220) {
          return cleaned.slice(0, secondPeriod + 1).trim();
        }
        return cleaned.slice(0, firstPeriod + 1).trim();
      }
      return cleaned.slice(0, 180).trim() + (cleaned.length > 180 ? '…' : '');
    }
    return '';
  }

  // Helper pour calculer la phrase agronomique météo à partir des données réelles Open-Meteo
  function getAgronomicWeatherSentence(weatherRes) {
    if (!weatherRes || !weatherRes.current) {
      return 'Chargement de la météo agronomique…';
    }
    const cur = weatherRes.current;
    const today = (weatherRes.daily && weatherRes.daily[0]) || {};
    const tMax = today.tempMax ?? cur.temperature ?? 30;
    const pRain = today.rainProb ?? 0;
    const sRain = today.rainSum ?? 0;
    const wind = today.windMax ?? cur.windSpeed ?? 0;

    if (sRain >= 15 || pRain >= 70) {
      return `Forte probabilité de pluie (${pRain} %, ${sRain} mm) : reportez les traitements et surveillez les drainages.`;
    }
    if (sRain > 2 || pRain >= 40) {
      return `Risque d'averses (${pRain} %) : maintenez les travaux légers et reportez les pulvérisations.`;
    }
    if (tMax >= 38) {
      return `Forte chaleur (${tMax} °C) : irriguez très tôt le matin ou en soirée pour limiter le stress thermique.`;
    }
    if (wind >= 25) {
      return `Vent soutenu (${wind} km/h) : évitez tout traitement phytosanitaire par dérive.`;
    }
    return `Temps favorable (${tMax} °C, vent ${wind} km/h) : conditions propices aux travaux du sol et à l'arrosage.`;
  }

  // Lecture audio par synthèse vocale du vrai conseil agronomique Supabase
  function speakLatestDailyConseil() {
    const published = (cachedConseils || [])
      .filter(c => c.statut === 'publie')
      .sort((a, b) => new Date(b.date_publication || b.created_at) - new Date(a.date_publication || a.created_at));
    const latest = published[0];
    if (!latest) {
      showToast('Aucun conseil disponible pour le moment.');
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${latest.titre}. ${latest.contenu || getConseilCardText(latest)}`;
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = 'fr-FR';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
      showToast('Lecture audio du conseil en cours…');
    }
  }

  function updateDashboardDateTime() {
    const now = new Date();
    const optionsFull = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const fullDate = now.toLocaleDateString('fr-FR', optionsFull);
    const capitalizedFullDate = fullDate.charAt(0).toUpperCase() + fullDate.slice(1);

    const optionsShort = { weekday: 'long', day: 'numeric', month: 'long' };
    const shortDate = now.toLocaleDateString('fr-FR', optionsShort);
    const capitalizedShortDate = shortDate.charAt(0).toUpperCase() + shortDate.slice(1);
    const loc = (PROFILES_DATA[currentProfileKey]?.location || 'Koudougou').split('(')[0].trim();

    // 1. Sous-titre Bureau : Date et ville en petit (Point 5 : 14px, #4A4A4A)
    if (greetingSubtitle) {
      greetingSubtitle.textContent = `${capitalizedShortDate} • ${loc}`;
    }

    if (liveDateDisplay) {
      liveDateDisplay.textContent = capitalizedFullDate;
    }

    // 2. Heure Bureau en direct (ex: "13:10 • Ouagadougou")
    if (liveTimeDisplay) {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      liveTimeDisplay.textContent = `${hours}:${minutes} • Ouagadougou`;
    }

    // 3. Date Mobile sous la salutation : 14px, #4A4A4A (Point 5)
    const mobileSubdateElements = document.querySelectorAll('.mobile-subdate');
    if (mobileSubdateElements.length > 0) {
      mobileSubdateElements.forEach(el => {
        el.textContent = `${capitalizedShortDate} • ${loc}`;
      });
    }
  }

  function getDashboardDeadlines() {
    const deadlines = [];
    const published = filterOpenFinancementsForUsers(cachedFinancements);

    // 1. Ajouter les opportunités vérifiées de Supabase
    published.forEach(f => {
      if (f.date_limite) {
        const diffDays = getDiffDaysFromToday(f.date_limite);
        if (diffDays !== null && diffDays >= 0) {
          const target = parseLocalDate(f.date_limite);
          let badgeText = '';
          let badgeClass = 'badge-neutral';
          if (diffDays === 0) {
            badgeText = "Aujourd'hui";
            badgeClass = 'badge-urgent-pulse';
          } else if (diffDays === 1) {
            badgeText = 'Demain';
            badgeClass = 'badge-warning';
          } else if (diffDays <= 7) {
            badgeText = `Dans ${diffDays} j`;
            badgeClass = 'badge-warning';
          } else {
            badgeText = `${target.getDate()} ${MONTH_SHORT_FR[target.getMonth()]}`;
            badgeClass = 'badge-neutral';
          }

          deadlines.push({
            id: f.id,
            type: 'financement',
            title: f.titre,
            meta: `${f.type ? f.type.charAt(0).toUpperCase() + f.type.slice(1) : 'Subvention'} • ${f.organisme}`,
            badge: badgeText,
            badgeClass: badgeClass,
            icon: 'amber',
            diffDays: diffDays
          });
        }
      }
    });

    // 2. Tâches agronomiques réelles de l'exploitant (si cycles enregistrés)
    if (currentProfileKey && PROFILES_DATA[currentProfileKey]?.realCycles) {
      PROFILES_DATA[currentProfileKey].realCycles.forEach(c => {
        if (c.estimated_harvest_date) {
          const diffDays = getDiffDaysFromToday(c.estimated_harvest_date);
          if (diffDays !== null && diffDays >= 0) {
            deadlines.push({
              id: c.id,
              type: 'agri',
              title: `Récolte ${c.crop_name}`,
              meta: `${c.parcels?.name || 'Parcelle'} • Récolte estimée`,
              badge: diffDays === 0 ? "Aujourd'hui" : (diffDays === 1 ? 'Demain' : `Dans ${diffDays} j`),
              badgeClass: diffDays <= 3 ? 'badge-success' : 'badge-neutral',
              icon: 'green',
              diffDays: diffDays
            });
          }
        }
      });
    }

    // Trier par échéance la plus proche
    deadlines.sort((a, b) => a.diffDays - b.diffDays);
    return deadlines.slice(0, 4);
  }

  function renderDashboardDeadlines() {
    if (!deadlinesList) return;
    const items = getDashboardDeadlines();

    if (items.length === 0) {
      deadlinesList.innerHTML = `
        <div class="widget-empty-state" style="padding: 16px; text-align: center;">
          <span style="font-size: 20px;"></span>
          <p style="font-size: 12px; color: #6C7A72; margin: 4px 0 0;">Aucune échéance urgente pour le moment.</p>
        </div>
      `;
      return;
    }

    deadlinesList.innerHTML = items.map(item => `
      <div class="deadline-item" data-id="${item.id || ''}" data-type="${item.type}" style="cursor: ${item.type === 'financement' ? 'pointer' : 'default'};">
        <div class="deadline-icon-pill icon-${item.icon}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="deadline-info">
          <div class="deadline-title">${item.title}</div>
          <div class="deadline-meta">${item.meta}</div>
        </div>
        <div class="deadline-badge ${item.badgeClass}">${item.badge}</div>
      </div>
    `).join('');

    // Permettre l'accès direct aux détails de l'opportunité depuis la liste des échéances
    deadlinesList.querySelectorAll('.deadline-item[data-type="financement"]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const found = cachedFinancements.find(f => String(f.id) === String(id));
        if (found) {
          openFinancementDetailsModal(found);
        } else {
          window.location.hash = '#opportunites';
        }
      });
    });
  }

  // ==========================================
  // FONCTION : RENDU DU PROFIL SÉLECTIONNÉ
  // ==========================================
  function renderProfile(key) {
    const data = PROFILES_DATA[key];
    if (!data) return;

    currentProfileKey = key;
    userManualCommuneKey = null;

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

    const userFirstName = data.name ? data.name.trim().split(' ')[0] : 'Fabrice';
    if (greetingTitle) greetingTitle.textContent = `Bonjour, ${userFirstName}`;
    updateDashboardDateTime();

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
        if (idx === 4) {
          const openCount = filterOpenFinancementsForUsers(cachedFinancements).length;
          stat.value = String(openCount);
          stat.unit = 'disponibles';
          value.innerHTML = `${openCount} <small>disponibles</small>`;
        } else {
          value.innerHTML = `${stat.value} <small>${stat.unit}</small>`;
        }
      }
      if (comp) comp.textContent = (idx === 4) ? 'Financements actifs' : stat.comp;

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

    // 7. Échéances dynamiques et comptes à rebours réels
    renderDashboardDeadlines();

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
        if (!data.tableRows || data.tableRows.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="${(data.tableHeaders && data.tableHeaders.length) || 6}" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
                <div style="font-size: 30px; margin-bottom: 6px;"></div>
                <strong style="font-size: 14.5px; color: var(--text-dark); display: block; margin-bottom: 4px;">Aucun cycle ou culture en cours</strong>
                <p style="font-size: 12.5px; margin: 0 0 14px; color: #5D6C63; max-width: 400px; margin-left: auto; margin-right: auto;">
                  Votre tableau de bord démarre à blanc. Enregistrez votre première dépense pour lancer le suivi agronomique.
                </p>
                <button type="button" class="btn-primary-action" id="btnEmptyStateAddExpense" style="margin: 0 auto; display: inline-flex; font-size: 12.5px; padding: 7px 16px;">
                  <span class="action-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
                  <span>+ Enregistrer une première dépense</span>
                </button>
              </td>
            </tr>
          `;
          const btnEmpty = document.getElementById('btnEmptyStateAddExpense');
          if (btnEmpty) {
            btnEmpty.addEventListener('click', openExpenseModal);
          }
        } else {
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
          <div class="promo-badge-icon"></div>
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

    // Rafraîchir systématiquement l'écran du simulateur mobile, la météo et les financements
    updateFinancementsCounters();
    renderMobileView();
    loadAndRenderWeather().catch(() => {});
  }

  // ==========================================
  // VUES MOBILES POUR MÉTÉO, FINANCEMENTS ET ADMINISTRATION
  // ==========================================
  function getTomorrowWeatherAlert(daily) {
    if (!daily || daily.length < 2) return null;
    const tomorrow = daily[1];
    const rainProb = Number(tomorrow.rainProb ?? 0);
    const rainSum = Number(tomorrow.rainSum ?? 0);
    const tempMax = Number(tomorrow.tempMax ?? 30);
    const gustsMax = Number(tomorrow.gustsMax ?? 0);

    const redReasons = [];
    const orangeReasons = [];

    // Pluie
    if (rainSum >= 30) {
      redReasons.push(`très forte pluie (${rainSum} mm)`);
    } else if (rainProb >= 60 || rainSum >= 10) {
      orangeReasons.push(`pluie probable (${rainProb}%)`);
    }

    // Chaleur
    if (tempMax >= 40) {
      redReasons.push(`forte canicule (${tempMax} °C)`);
    } else if (tempMax >= 35) {
      orangeReasons.push(`forte chaleur (${tempMax} °C)`);
    }

    // Vent
    if (gustsMax >= 40) {
      redReasons.push(`vent violent (${gustsMax} km/h)`);
    } else if (gustsMax >= 25) {
      orangeReasons.push(`vent fort (${gustsMax} km/h)`);
    }

    if (redReasons.length > 0) {
      return {
        level: 'red',
        icon: '',
        message: `Alerte demain (${tomorrow.shortDay || 'demain'}) : ${redReasons.join(', ')}. Prévoyez vos précautions.`
      };
    }
    if (orangeReasons.length > 0) {
      return {
        level: 'orange',
        icon: '️',
        message: `Vigilance demain (${tomorrow.shortDay || 'demain'}) : ${orangeReasons.join(', ')}.`
      };
    }
    return null;
  }

  function isPwaInstalled() {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      return true;
    }
    try {
      if (localStorage.getItem('pwa_installed') === '1') {
        return true;
      }
    } catch (e) {}
    return false;
  }

  function isPwaHomeCardClosed() {
    try {
      return localStorage.getItem('pwa_home_card_closed') === '1';
    } catch (e) {
      return false;
    }
  }

  function getMobilePwaHomeCardHtml() {
    if (isPwaInstalled() || isPwaHomeCardClosed()) {
      return '';
    }
    return `
      <!-- CARTE D'INSTALLATION SUR L'ACCUEIL MOBILE (REFERMABLE) -->
      <div class="pwa-mobile-home-card" id="pwaMobileHomeCard">
        <button type="button" class="pwa-home-close-btn" id="btnClosePwaMobileHomeCard" title="Fermer" aria-label="Fermer">&times;</button>
        <div class="pwa-home-card-content">
          <div class="pwa-home-card-icon">
            <img src="images/icons/icon-192x192.png" alt="Logo Révolution Agricole">
          </div>
          <div class="pwa-home-card-text">
            <div class="pwa-home-card-header">
              <span class="pwa-home-badge">Disponible hors-ligne</span>
            </div>
            <strong class="pwa-home-card-title">Installer l'application</strong>
            <p class="pwa-home-card-desc">Accédez à vos parcelles, récoltes et finances en 1 clic depuis votre écran d'accueil, même sans connexion Internet.</p>
          </div>
        </div>
        <div class="pwa-home-card-actions">
          <button type="button" class="btn-pwa-home-dismiss" id="btnDismissPwaMobileHomeCard">Plus tard</button>
          <button type="button" class="btn-pwa-home-install" id="btnInstallPwaMobileHomeCard">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Installer l'application</span>
          </button>
        </div>
      </div>
    `;
  }

  function getMobileDashboardWeatherCardHtml() {
    const w = cachedWeatherResult;
    if (!w) {
      return `
        <div class="mobile-weather-card" id="btnMobileWeatherCardClick" style="cursor: pointer;" title="Voir la semaine complète">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;"></span>
              <strong style="font-size: 20px;">-- °C</strong>
            </div>
            <span style="font-size: 11px; font-weight: 700; color: #1E5E2A; background: #EAF4E6; padding: 2px 8px; border-radius: 99px;">Météo en direct…</span>
          </div>
          <div style="display: flex; justify-content: flex-end; font-size: 11px; color: #1E5E2A; font-weight: 700; border-top: 1px solid #E6EAE3; padding-top: 6px; margin-top: 6px;">
            <span>Voir la semaine →</span>
          </div>
        </div>
      `;
    }

    const interp = computeFarmerInterpretation(w.current, w.daily);
    const tomorrowAlert = getTomorrowWeatherAlert(w.daily);
    const maxTwoAdvices = (interp.adviceList || []).slice(0, 2);
    const speechSupported = ('speechSynthesis' in window);

    return `
      <!-- CARTE MÉTÉO SIMPLIFIÉE DU TABLEAU DE BORD MOBILE -->
      <div class="mobile-weather-card" id="btnMobileWeatherCardClick" style="cursor: pointer;" title="Ouvrir la page Météo complète">
        <!-- 1. Météo d'aujourd'hui : Température, Pluie, Vent -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 26px;">${w.current.meta.icon}</span>
            <div>
              <strong style="font-size: 22px; color: #0E3615;">${w.current.temperature} °C</strong>
              <div style="font-size: 11px; color: #5B6660;">${w.communeName} • ${w.current.meta.label}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; font-weight: 700; color: #1E5E2A; background: #EAF4E6; padding: 2px 8px; border-radius: 99px; display: inline-block;">
              Pluie ${w.daily[0]?.rainProb || 0} % (${w.daily[0]?.rainSum || 0} mm)
            </span>
            <div style="font-size: 10.5px; color: #7C8781; margin-top: 2px;">Vent ${w.current.windSpeed} km/h</div>
          </div>
        </div>

        <!-- 2. Voyant de couleur + "Ce que ça veut dire pour vous" + max 2 conseils -->
        <div class="weather-interpretation-box level-${interp.level}" style="margin: 8px 0; padding: 10px 12px;">
          <div class="wi-header-row" style="margin-bottom: 4px;">
            <div class="wi-title-wrap">
              <span class="wi-status-light light-${interp.level}"></span>
              <span class="wi-title" style="font-size: 11px;">Ce que ça veut dire pour vous</span>
            </div>
            ${speechSupported ? `
              <button type="button" class="wi-listen-btn" id="btnListenMobileDashWeather" style="padding: 2px 7px; font-size: 10px;">
                 <span>Écouter</span>
              </button>
            ` : ''}
          </div>
          <div class="wi-headline" style="font-size: 12px; margin-bottom: 6px; font-weight: 700;">${interp.headline}</div>
          <ul class="wi-advice-list" style="gap: 4px; margin: 0; padding: 0;">
            ${maxTwoAdvices.map(a => `
              <li class="wi-advice-item" style="font-size: 11px;">
                <span class="wi-advice-icon">${a.icon}</span>
                <span>${a.text}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- 3. Alerte pour demain seulement si orange ou rouge -->
        ${tomorrowAlert ? `
          <div class="weather-alert-banner alert-${tomorrowAlert.level === 'red' ? 'danger' : 'warning'}" style="margin: 6px 0; padding: 7px 10px; font-size: 11px; border-radius: 8px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 14px;">${tomorrowAlert.icon}</span>
            <span style="font-weight: 600;">${tomorrowAlert.message}</span>
          </div>
        ` : ''}

        <!-- 4. Lien "Voir la semaine →" ouvrant la page Météo -->
        <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid #E6EAE3; padding-top: 7px; margin-top: 6px;">
          <span style="font-size: 11px; color: #1E5E2A; font-weight: 700;">Voir la semaine →</span>
        </div>
      </div>
    `;
  }

  function getMobileMeteoHtml() {
    const w = cachedWeatherResult;
    const currentCommune = userManualCommuneKey || findCommuneKey();
    const alerts = w ? computeWeatherAlerts(w.current, w.daily[0]) : [];
    const topAlert = alerts.length > 0 ? alerts[0] : null;
    const interp = w ? computeFarmerInterpretation(w.current, w.daily) : null;
    const weeklyAdvice = w ? computeWeeklyAdvice(w.daily) : '';
    const speechSupported = ('speechSynthesis' in window);

    return `
      <div>
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;">️ Météo Agricole</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">${w ? `${w.communeName} • MAJ ${w.updateTime}` : 'Open-Meteo'}</p>
          </div>
          <button type="button" class="btn-refresh-meteo" id="btnRefreshMobileMeteo" style="padding: 6px 10px; font-size: 11.5px; border-radius: 8px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Actualiser</span>
          </button>
        </div>

        <!-- Sélecteur de commune mobile -->
        <div style="margin-bottom: 12px;">
          <label for="selectMobileMeteoCommune" style="font-size: 11px; font-weight: 700; color: #5B6660; display: block; margin-bottom: 4px;">Changer de commune :</label>
          <select id="selectMobileMeteoCommune" class="meteo-commune-select" style="width: 100%; padding: 8px 12px; font-size: 12.5px;">
            <option value="ouagadougou" ${currentCommune === 'ouagadougou' ? 'selected' : ''}>Ouagadougou (Centre)</option>
            <option value="bobo-dioulasso" ${currentCommune === 'bobo-dioulasso' ? 'selected' : ''}>Bobo-Dioulasso (Hauts-Bassins)</option>
            <option value="koudougou" ${currentCommune === 'koudougou' ? 'selected' : ''}>Koudougou (Centre-Ouest)</option>
            <option value="ouahigouya" ${currentCommune === 'ouahigouya' ? 'selected' : ''}>Ouahigouya (Nord)</option>
            <option value="dedougou" ${currentCommune === 'dedougou' ? 'selected' : ''}>Dédougou (Boucle du Mouhoun)</option>
            <option value="banfora" ${currentCommune === 'banfora' ? 'selected' : ''}>Banfora (Cascades)</option>
            <option value="kaya" ${currentCommune === 'kaya' ? 'selected' : ''}>Kaya (Centre-Nord)</option>
            <option value="fada-ngourma" ${currentCommune === 'fada-ngourma' ? 'selected' : ''}>Fada N'Gourma (Est)</option>
          </select>
        </div>

        ${topAlert ? `
          <div class="weather-alert-banner alert-${topAlert.type}" style="margin-bottom: 12px; padding: 10px 12px; font-size: 12px;">
            <span class="alert-icon" style="font-size: 18px;">${topAlert.icon}</span>
            <span class="alert-text">${topAlert.message}</span>
          </div>
        ` : ''}

        ${w ? `
          <!-- Hero Card Météo Mobile -->
          <div style="background: linear-gradient(135deg, #FFF 0%, #F5F9F3 100%); border: 1px solid #D7E5D4; border-radius: 14px; padding: 14px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 36px;">${w.current.meta.icon}</span>
                <div>
                  <div style="font-size: 30px; font-weight: 800; color: #0E3615; line-height: 1;">${w.current.temperature} °C</div>
                  <span style="font-size: 11.5px; font-weight: 700; color: #1E5E2A; background: #EAF4E6; padding: 2px 8px; border-radius: 99px; display: inline-block; margin-top: 4px;">${w.current.meta.label}</span>
                </div>
              </div>
              <div style="text-align: right; font-size: 11px; color: #6C7A72;">
                <div>${w.daily[0]?.tempMax}° / ${w.daily[0]?.tempMin}°</div>
                <div style="color: #1E5E2A; font-weight: 700; margin-top: 2px;">Open-Meteo</div>
              </div>
            </div>

            <!-- Grille 2x2 métriques -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-top: 1px solid #E6EAE3; padding-top: 10px;">
              <div style="background: #FFF; border: 1px solid #E3ECE0; border-radius: 10px; padding: 8px 10px;">
                <span style="font-size: 10.5px; color: #7C8781; display: block;"> HUMIDITÉ</span>
                <strong style="font-size: 14px; color: #1E2822;">${w.current.humidity} %</strong>
              </div>
              <div style="background: #FFF; border: 1px solid #E3ECE0; border-radius: 10px; padding: 8px 10px;">
                <span style="font-size: 10.5px; color: #7C8781; display: block;"> VENT & RAFALES</span>
                <strong style="font-size: 12px; color: #1E2822; display: block; line-height: 1.35;">Vent ${w.current.windSpeed} km/h • Rafales ${w.daily[0]?.gustsMax || w.current.gusts} km/h</strong>
                <span style="font-size: 10px; color: #7C8781; display: block; margin-top: 2px;">Direction : ${w.current.windDirection}</span>
              </div>
              <div style="background: #FFF; border: 1px solid #E3ECE0; border-radius: 10px; padding: 8px 10px;">
                <span style="font-size: 10.5px; color: #7C8781; display: block;">️ PLUIE ESTIMÉE</span>
                <strong style="font-size: 14px; color: #1E2822;">${w.daily[0]?.rainSum || 0} mm</strong>
              </div>
              <div style="background: #FFF; border: 1px solid #E3ECE0; border-radius: 10px; padding: 8px 10px;">
                <span style="font-size: 10.5px; color: #7C8781; display: block;"> PROBABILITÉ</span>
                <strong style="font-size: 14px; color: ${w.daily[0]?.rainProb >= 40 ? '#0A66C2' : '#1E2822'};">${w.daily[0]?.rainProb || 0} %</strong>
              </div>
            </div>
          </div>

          ${interp ? `
            <!-- Encadré Ce que ça veut dire pour vous (Mobile Page) -->
            <div class="weather-interpretation-box level-${interp.level}" style="margin: 10px 0 14px; padding: 12px 14px;">
              <div class="wi-header-row">
                <div class="wi-title-wrap">
                  <span class="wi-status-light light-${interp.level}"></span>
                  <span class="wi-title">Ce que ça veut dire pour vous</span>
                </div>
                ${speechSupported ? `
                  <button type="button" class="wi-listen-btn" id="btnListenMobileMeteo">
                     <span>Écouter</span>
                  </button>
                ` : ''}
              </div>
              <div class="wi-headline">${interp.headline}</div>
              <ul class="wi-advice-list">
                ${interp.adviceList.map(a => `
                  <li class="wi-advice-item">
                    <span class="wi-advice-icon">${a.icon}</span>
                    <span>${a.text}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Conseil de la semaine (Mobile Page) -->
            <div class="weekly-advice-banner" style="margin-bottom: 12px;">
              <span class="wab-icon"></span>
              <div><strong>Conseil de la semaine :</strong> <span>${weeklyAdvice}</span></div>
            </div>
          ` : ''}

          <!-- Prévisions 7 jours en liste mobile -->
          <h4 style="font-size: 13.5px; font-weight: 800; color: #1E2822; margin: 0 0 8px;"> Prévisions sur 7 jours</h4>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
            ${(w.daily || []).map((d, idx) => {
              const badge = computeForecastDayBadge(d, idx, interp);

              return `
                <div style="background: #FFF; border: 1px solid #E6EAE3; border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">${d.meta.icon}</span>
                    <div>
                      <strong style="font-size: 13px; color: #1E2822; display: block;">${d.dayName}</strong>
                      <span style="font-size: 11px; color: #7C8781;">${d.formattedDate} • ${d.meta.label}</span>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 13px; font-weight: 800; color: #1E2822;">${d.tempMax}° / <small style="color: #7C8781;">${d.tempMin}°</small></div>
                    <span style="font-size: 10.5px; font-weight: 700; color: ${d.rainProb >= 40 ? '#0A66C2' : '#2E7D32'};">Pluie ${d.rainProb}% (${d.rainSum}mm)</span>
                    <div style="margin-top: 3px;">
                      <span class="badge-agri-recom ${badge.badgeClass}" style="display: inline-block; font-size: 9.5px; padding: 2px 7px;">${badge.text}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 24px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
            <p style="font-size: 13px; color: #5B6660;">Chargement des données météo…</p>
          </div>
        `}
      </div>
    `;
  }

  function getMobileFinancementsHtml() {
    const openList = filterOpenFinancementsForUsers(cachedFinancements);
    let filtered = openList;
    if (userSelectedType && userSelectedType !== 'all') {
      filtered = filtered.filter(f => f.type && f.type.toLowerCase().trim() === userSelectedType.toLowerCase().trim());
    }
    if (userSelectedRegion && userSelectedRegion !== 'all') {
      const reg = userSelectedRegion.toLowerCase();
      filtered = filtered.filter(f => {
        if (!f.region) return true;
        const fReg = f.region.toLowerCase();
        return fReg.includes(reg) || fReg.includes('tout le burkina') || fReg.includes('national');
      });
    }
    filtered.sort((a, b) => {
      const aHas = Boolean(a.date_limite && String(a.date_limite).trim() !== '');
      const bHas = Boolean(b.date_limite && String(b.date_limite).trim() !== '');
      if (aHas && bHas) return new Date(a.date_limite) - new Date(b.date_limite);
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return 0;
    });

    return `
      <div style="margin-bottom: 14px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <h2 style="font-size: 20px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Financements</h2>
        <p style="font-size: 12px; color: #5B6660; margin: 0;">${openList.length} opportunité${openList.length > 1 ? 's' : ''} disponible${openList.length > 1 ? 's' : ''}</p>
      </div>

      <!-- Filtres types en puces horizontales -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; scrollbar-width: none;">
        ${['all', 'subvention', 'appel à projets', 'prêt', 'concours', 'incubation', 'formation', 'emploi'].map(t => `
          <button type="button" class="mobile-type-chip ${userSelectedType === t ? 'active' : ''}" data-type="${t}" style="
            padding: 6px 12px; border-radius: 99px; font-size: 11.5px; font-weight: 700; border: 1px solid ${userSelectedType === t ? '#1E5E2A' : '#E0E5DC'};
            background: ${userSelectedType === t ? '#1E5E2A' : '#FFF'}; color: ${userSelectedType === t ? '#FFF' : '#4A5750'}; white-space: nowrap; cursor: pointer;
          ">${t === 'all' ? 'Tous' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        `).join('')}
      </div>

      <!-- Grille des cartes financements -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${filtered.length === 0 ? `
          <div style="text-align: center; padding: 32px 16px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
            <p style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1E2822;">Aucun financement trouvé</p>
            <p style="font-size: 12px; color: #7C8781; margin: 0;">Essayez de sélectionner « Tous »</p>
          </div>
        ` : filtered.map(item => {
          const hasDeadline = Boolean(item.date_limite && String(item.date_limite).trim() !== '');
          const diffDays = hasDeadline ? getDiffDaysFromToday(item.date_limite) : null;
          const dl = hasDeadline ? parseLocalDate(item.date_limite) : null;
          const formattedDate = dl ? dl.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
          const isUrgent = diffDays !== null && diffDays >= 0 && diffDays <= 7;
          const typeClass = (item.type || 'subvention').toLowerCase().replace(/[\s']/g, '-');

          return `
            <div class="mobile-fin-card" data-id="${item.id}" style="background: #FFF; border: 1px solid #E6EAE3; border-radius: 12px; padding: 14px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="fin-badge-type ${typeClass}">${item.type}</span>
                <span style="font-size: 11px; color: #6C7A72;"> ${item.region || 'Tout le Burkina'}</span>
              </div>
              <span style="font-size: 10.5px; color: #8A978E; font-weight: 700; text-transform: uppercase;">${item.organisme}</span>
              <h4 style="font-size: 14.5px; font-weight: 700; color: #1E2822; margin: 4px 0 8px; line-height: 1.35;">${item.titre}</h4>
              <div class="fin-card-amount-box" style="margin-bottom: 8px;">
                <span class="fin-amount-label">MONTANT</span>
                <div class="fin-amount-val">${item.montant || 'Non spécifié'}</div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F0F2EE; padding-top: 8px; font-size: 11.5px;">
                ${hasDeadline ? `
                  <span style="color: #6C7A72;">Clôture : ${formattedDate}</span>
                  ${isUrgent ? `<span class="badge-urgent-closing" style="font-size: 10px; padding: 1px 6px;">⏳ ${diffDays === 0 ? "Clôture aujourd'hui" : `Clôture dans ${formatDaysLeftBadge(diffDays)}`}</span>` : ''}
                ` : `
                  <span class="badge-guichet-permanent">Guichet permanent</span>
                `}
              </div>
              <div style="margin-top: 8px; text-align: right;">
                <span style="font-size: 11.5px; font-weight: 700; color: #1E5E2A;">Voir les détails & Postuler →</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function getMobileAdminFinancementsHtml() {
    const pending = cachedFinancements.filter(f => f.statut === 'en_attente');
    const published = cachedFinancements.filter(f => f.statut === 'publie');
    const expired = cachedFinancements.filter(f => f.statut === 'expire');

    let list = cachedFinancements;
    if (adminActiveStatusTab === 'en_attente') list = pending;
    else if (adminActiveStatusTab === 'publie') list = published;
    else if (adminActiveStatusTab === 'expire') list = expired;

    list.sort((a, b) => {
      if (a.statut === 'en_attente' && b.statut !== 'en_attente') return -1;
      if (b.statut === 'en_attente' && a.statut !== 'en_attente') return 1;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;">️ Administration</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">Gérer les financements</p>
          </div>
          <button type="button" class="btn-primary" id="btnMobileOpenAddFin" style="padding: 8px 12px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer;">+ Ajouter</button>
        </div>
      </div>

      ${pending.length > 0 ? `
        <div class="admin-pending-alert-banner" style="margin-bottom: 12px; padding: 10px 12px;">
          <span class="alert-icon" style="font-size: 18px;">⏳</span>
          <div class="alert-content">
            <strong style="font-size: 12.5px;">${pending.length} fiche${pending.length > 1 ? 's' : ''} en attente</strong>
            <span style="font-size: 11px;">À valider pour mise en ligne.</span>
          </div>
        </div>
      ` : ''}

      <!-- Onglets de filtre de statut -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; scrollbar-width: none;">
        <button type="button" class="mobile-admin-tab ${adminActiveStatusTab === 'en_attente' ? 'active' : ''}" data-tab="en_attente" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid ${adminActiveStatusTab === 'en_attente' ? '#C8862A' : '#DDD'};
          background: ${adminActiveStatusTab === 'en_attente' ? '#FEF3D6' : '#FFF'}; color: ${adminActiveStatusTab === 'en_attente' ? '#8A4F00' : '#4A5750'}; cursor: pointer; white-space: nowrap;
        ">En attente (${pending.length})</button>
        <button type="button" class="mobile-admin-tab ${adminActiveStatusTab === 'publie' ? 'active' : ''}" data-tab="publie" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid ${adminActiveStatusTab === 'publie' ? '#2E7D32' : '#DDD'};
          background: ${adminActiveStatusTab === 'publie' ? '#E6F4EA' : '#FFF'}; color: ${adminActiveStatusTab === 'publie' ? '#137333' : '#4A5750'}; cursor: pointer; white-space: nowrap;
        ">Publiés (${published.length})</button>
        <button type="button" class="mobile-admin-tab ${adminActiveStatusTab === 'expire' ? 'active' : ''}" data-tab="expire" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${adminActiveStatusTab === 'expire' ? '#EEEEEE' : '#FFF'}; color: #616161; cursor: pointer; white-space: nowrap;
        ">Expirés (${expired.length})</button>
        <button type="button" class="mobile-admin-tab ${adminActiveStatusTab === 'all' ? 'active' : ''}" data-tab="all" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${adminActiveStatusTab === 'all' ? '#E8ECE5' : '#FFF'}; color: #425247; cursor: pointer; white-space: nowrap;
        ">Tous (${cachedFinancements.length})</button>
      </div>

      <!-- Liste des fiches -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${list.length === 0 ? `
          <div style="text-align: center; padding: 24px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
            <p style="font-weight: 700; font-size: 13px; margin: 0; color: #1E2822;">Aucune fiche</p>
          </div>
        ` : list.map(item => {
          return `
            <div class="admin-fin-item status-${item.statut}" style="padding: 12px 14px; background: #FFF; border-radius: 12px;">
              <div class="admin-fin-content">
                <div class="admin-fin-header-row">
                  <span class="admin-status-pill ${item.statut}">
                    ${item.statut === 'en_attente' ? '⏳ En attente' : (item.statut === 'publie' ? ' Publié' : '⏹️ Expiré')}
                  </span>
                  <span style="font-size: 11px; color: #7C8781;">${item.type}</span>
                </div>
                <h4 class="admin-fin-title" style="font-size: 13.5px; margin: 4px 0;">${item.titre}</h4>
                <div class="admin-fin-meta-row" style="font-size: 11px; color: #6C7A72;">
                  <span>${item.organisme}</span>
                  <span>•</span>
                  <span>${item.montant || 'Montant N/C'}</span>
                </div>
              </div>
              <div class="admin-actions-group" style="margin-top: 8px; display: flex; gap: 6px; width: 100%;">
                ${item.statut !== 'publie' ? `
                  <button type="button" class="btn-admin-action btn-admin-publish btn-action-publish" data-id="${item.id}" style="flex: 1; justify-content: center;"> Publier</button>
                ` : ''}
                <button type="button" class="btn-admin-action btn-admin-edit btn-action-edit" data-id="${item.id}" style="flex: 1; justify-content: center;">️ Modifier</button>
                ${item.statut !== 'expire' ? `
                  <button type="button" class="btn-admin-action btn-admin-withdraw btn-action-withdraw" data-id="${item.id}" style="flex: 1; justify-content: center;"> Retirer</button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function getMobileConseilsHtml() {
    let published = cachedConseils.filter(c => c.statut === 'publie');
    if (userSelectedConseilCategory && userSelectedConseilCategory !== 'all') {
      const cat = userSelectedConseilCategory.toLowerCase().trim();
      published = published.filter(c => (c.categorie || '').toLowerCase().trim() === cat);
    }
    published.sort((a, b) => new Date(b.date_publication || b.created_at) - new Date(a.date_publication || a.created_at));

    const cats = [
      { key: 'all', label: 'Tous' },
      { key: 'maraîchage', label: 'Maraîchage' },
      { key: 'céréales', label: 'Céréales' },
      { key: 'élevage', label: 'Élevage' },
      { key: 'irrigation', label: 'Irrigation' },
      { key: 'sol et fertilisation', label: 'Sol' },
      { key: 'maladies et ravageurs', label: 'Ravageurs' },
      { key: 'récolte et conservation', label: 'Récolte' }
    ];

    const userCropTerms = getUserActiveCropTerms();
    const userRegionTerms = getUserRegionTerms();

    let groupUserCrops = [];
    let remainingConseils = [...published];

    if (userCropTerms.length > 0) {
      groupUserCrops = published.filter(item => {
        if (!item.cultures) return false;
        return userCropTerms.some(term => matchesCropTerm(item.cultures, term));
      });
      const cropItemIds = new Set(groupUserCrops.map(item => item.id));
      remainingConseils = published.filter(item => !cropItemIds.has(item.id));
    }

    function renderMobileCard(item) {
      return `
        <div class="mobile-conseil-card" data-id="${item.id}" style="background: #FFF; border: 1px solid #E6EAE3; border-radius: 12px; padding: 14px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            ${getConseilCategoryBadge(item.categorie)}
            <span style="font-size: 11px; color: #6C7A72;">⏱️ ${item.duree_lecture || 3} min • ${item.saison || 'Toute l\'année'}</span>
          </div>
          <h4 style="font-size: 14.5px; font-weight: 700; color: #1E2822; margin: 4px 0 6px; line-height: 1.35;">${item.titre}</h4>
          ${item.cultures ? `<div class="conseil-cultures-tag" style="margin-bottom: 6px; font-size: 10.5px;"> ${item.cultures}</div>` : ''}
          <p style="font-size: 12px; color: #5B6660; line-height: 1.45; margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.resume || ''}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F0F2EE; padding-top: 8px; font-size: 11.5px;">
            <span style="color: #6C7A72;">${item.source || 'INERA / DGPV'}</span>
            <span style="font-weight: 700; color: #1E5E2A;">Lire le conseil →</span>
          </div>
        </div>
      `;
    }

    let cardsHtml = '';
    if (published.length === 0) {
      cardsHtml = `
        <div style="text-align: center; padding: 32px 16px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
          <p style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1E2822;">Aucun conseil dans cette catégorie</p>
          <p style="font-size: 12px; color: #7C8781; margin: 0;">Sélectionnez « Tous » pour voir l'ensemble des fiches.</p>
        </div>
      `;
    } else {
      if (groupUserCrops.length > 0) {
        cardsHtml += `
          <div style="margin: 8px 0 4px; padding-left: 8px; border-left: 3px solid #1E5E2A; display: flex; align-items: center; gap: 8px;">
            <strong style="font-size: 13.5px; color: #1E2822;"> Pour vos cultures</strong>
            <span style="font-size: 10.5px; background: #EAF4E6; color: #1E5E2A; padding: 1px 6px; border-radius: 8px; font-weight: 700;">${groupUserCrops.length}</span>
          </div>
          ${groupUserCrops.map(renderMobileCard).join('')}
        `;
      }

      if (userRegionTerms && userRegionTerms.length > 0) {
        const groupUserRegion = [];
        const groupNational = [];
        const groupOther = [];

        remainingConseils.forEach(item => {
          const group = getItemRegionGroup(item.regions, userRegionTerms);
          if (group === 'user_region') groupUserRegion.push(item);
          else if (group === 'national') groupNational.push(item);
          else groupOther.push(item);
        });

        if (groupUserRegion.length > 0) {
          cardsHtml += `
            <div style="margin: 14px 0 4px; padding-left: 8px; border-left: 3px solid #C8862A; display: flex; align-items: center; gap: 8px;">
              <strong style="font-size: 13.5px; color: #1E2822;"> Pour votre région</strong>
              <span style="font-size: 10.5px; background: #FFF8E1; color: #8D5B15; padding: 1px 6px; border-radius: 8px; font-weight: 700;">${groupUserRegion.length}</span>
            </div>
            ${groupUserRegion.map(renderMobileCard).join('')}
          `;
        }

        if (groupNational.length > 0) {
          cardsHtml += `
            <div style="margin: 14px 0 4px; padding-left: 8px; border-left: 3px solid #2E7D32; display: flex; align-items: center; gap: 8px;">
              <strong style="font-size: 13.5px; color: #1E2822;"> Tout le Burkina Faso</strong>
              <span style="font-size: 10.5px; background: #E8F5E9; color: #1B5E20; padding: 1px 6px; border-radius: 8px; font-weight: 700;">${groupNational.length}</span>
            </div>
            ${groupNational.map(renderMobileCard).join('')}
          `;
        }

        if (groupOther.length > 0) {
          cardsHtml += `
            <div style="margin: 14px 0 4px; padding-left: 8px; border-left: 3px solid #78909C; display: flex; align-items: center; gap: 8px;">
              <strong style="font-size: 13.5px; color: #1E2822;"> Autres régions</strong>
              <span style="font-size: 10.5px; background: #ECEFF1; color: #455A64; padding: 1px 6px; border-radius: 8px; font-weight: 700;">${groupOther.length}</span>
            </div>
            ${groupOther.map(renderMobileCard).join('')}
          `;
        }
      } else {
        if (groupUserCrops.length > 0 && remainingConseils.length > 0) {
          cardsHtml += `
            <div style="margin: 14px 0 4px; padding-left: 8px; border-left: 3px solid #2E7D32; display: flex; align-items: center; gap: 8px;">
              <strong style="font-size: 13.5px; color: #1E2822;"> Autres conseils</strong>
              <span style="font-size: 10.5px; background: #E8F5E9; color: #1B5E20; padding: 1px 6px; border-radius: 8px; font-weight: 700;">${remainingConseils.length}</span>
            </div>
            ${remainingConseils.map(renderMobileCard).join('')}
          `;
        } else if (groupUserCrops.length === 0) {
          cardsHtml = remainingConseils.map(renderMobileCard).join('');
        }
      }
    }

    return `
      <div style="margin-bottom: 14px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <h2 style="font-size: 20px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Conseils Agricoles</h2>
        <p style="font-size: 12px; color: #5B6660; margin: 0;">${cachedConseils.filter(c => c.statut === 'publie').length} fiches techniques vérifiées</p>
      </div>

      <!-- Filtres catégories en puces horizontales -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; scrollbar-width: none;">
        ${cats.map(c => `
          <button type="button" class="mobile-conseil-cat-chip" data-cat="${c.key}" style="
            padding: 6px 12px; border-radius: 99px; font-size: 11.5px; font-weight: 700; border: 1px solid ${userSelectedConseilCategory === c.key ? '#1E5E2A' : '#E0E5DC'};
            background: ${userSelectedConseilCategory === c.key ? '#1E5E2A' : '#FFF'}; color: ${userSelectedConseilCategory === c.key ? '#FFF' : '#4A5750'}; white-space: nowrap; cursor: pointer;
          ">${c.label}</button>
        `).join('')}
      </div>

      <!-- Grille des cartes conseils mobiles -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${cardsHtml}
      </div>
    `;
  }

  function getMobileAdminConseilsHtml() {
    const pending = cachedConseils.filter(c => c.statut === 'en_attente');
    const published = cachedConseils.filter(c => c.statut === 'publie');
    const archived = cachedConseils.filter(c => c.statut === 'archive');

    let list = cachedConseils;
    if (adminConseilActiveStatusTab === 'en_attente') list = pending;
    else if (adminConseilActiveStatusTab === 'publie') list = published;
    else if (adminConseilActiveStatusTab === 'archive') list = archived;

    list = [...list].sort((a, b) => {
      if (a.statut === 'en_attente' && b.statut !== 'en_attente') return -1;
      if (b.statut === 'en_attente' && a.statut !== 'en_attente') return 1;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;">️ Administration</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">Gérer les conseils agronomiques</p>
          </div>
          <button type="button" class="btn-primary" id="btnMobileOpenAddConseil" style="padding: 8px 12px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer;">+ Ajouter</button>
        </div>
      </div>

      ${pending.length > 0 ? `
        <div class="admin-pending-alert-banner" style="margin-bottom: 12px; padding: 10px 12px;">
          <span class="alert-icon" style="font-size: 18px;">⏳</span>
          <div class="alert-content">
            <strong style="font-size: 12.5px;">${pending.length} conseil${pending.length > 1 ? 's' : ''} en attente</strong>
            <span style="font-size: 11px;">À valider pour mise en ligne publique.</span>
          </div>
        </div>
      ` : ''}

      <!-- Onglets statuts admin mobile -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; scrollbar-width: none;">
        <button type="button" class="mobile-admin-conseil-tab" data-status="en_attente" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${adminConseilActiveStatusTab === 'en_attente' ? '#FEF3D6' : '#FFF'}; color: ${adminConseilActiveStatusTab === 'en_attente' ? '#8A4F00' : '#425247'}; cursor: pointer; white-space: nowrap;
        ">En attente (${pending.length})</button>
        <button type="button" class="mobile-admin-conseil-tab" data-status="publie" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${adminConseilActiveStatusTab === 'publie' ? '#E6F4EA' : '#FFF'}; color: ${adminConseilActiveStatusTab === 'publie' ? '#137333' : '#425247'}; cursor: pointer; white-space: nowrap;
        ">Publiés (${published.length})</button>
        <button type="button" class="mobile-admin-conseil-tab" data-status="archive" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${adminConseilActiveStatusTab === 'archive' ? '#EEEEEE' : '#FFF'}; color: ${adminConseilActiveStatusTab === 'archive' ? '#616161' : '#425247'}; cursor: pointer; white-space: nowrap;
        ">Archivés (${archived.length})</button>
        <button type="button" class="mobile-admin-conseil-tab" data-status="all" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${adminConseilActiveStatusTab === 'all' ? '#E8ECE5' : '#FFF'}; color: #425247; cursor: pointer; white-space: nowrap;
        ">Tous (${cachedConseils.length})</button>
      </div>

      <!-- Liste des fiches admin mobile -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${list.length === 0 ? `
          <div style="text-align: center; padding: 24px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
            <p style="font-weight: 700; font-size: 13px; margin: 0; color: #1E2822;">Aucun conseil</p>
          </div>
        ` : list.map(item => `
          <div class="admin-fin-item status-${item.statut}" style="padding: 12px 14px; background: #FFF; border-radius: 12px;">
            <div class="admin-fin-content">
              <div class="admin-fin-header-row">
                <span class="admin-status-pill ${item.statut}">
                  ${item.statut === 'en_attente' ? '⏳ En attente' : (item.statut === 'publie' ? ' Publié' : ' Archivé')}
                </span>
                ${getConseilCategoryBadge(item.categorie)}
              </div>
              <h4 class="admin-fin-title" style="font-size: 13.5px; margin: 4px 0;">${item.titre}</h4>
              <div class="admin-fin-meta-row" style="font-size: 11px; color: #6C7A72;">
                <span>${item.cultures || item.saison || 'Conseil'}</span>
                <span>•</span>
                <span>${item.source || 'INERA / DGPV'}</span>
              </div>
            </div>
            <div class="admin-actions-group" style="margin-top: 8px; display: flex; gap: 6px; width: 100%;">
              <button type="button" class="btn-admin-action btn-admin-edit btn-mobile-conseil-read" data-id="${item.id}" style="flex: 1; justify-content: center;"> Lire</button>
              <button type="button" class="btn-admin-action btn-admin-edit btn-mobile-conseil-edit" data-id="${item.id}" style="flex: 1; justify-content: center;">️ Modifier</button>
              ${item.statut !== 'publie' ? `
                <button type="button" class="btn-admin-action btn-admin-publish btn-mobile-conseil-publish" data-id="${item.id}" style="flex: 1; justify-content: center;"> Publier</button>
              ` : ''}
              ${item.statut !== 'archive' ? `
                <button type="button" class="btn-admin-action btn-admin-archive btn-mobile-conseil-archive" data-id="${item.id}" style="flex: 1; justify-content: center;"> Archiver</button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ==========================================
  // FONCTION : RENDU DU SIMULATEUR MOBILE ANDROID (Spécification Section 2)
  // ==========================================
  function renderMobileView() {
    try {
      const data = PROFILES_DATA[currentProfileKey];
      if (!data || !mobileAppMount) return;

      const prevDrawer = document.getElementById('mobileDrawer');
      const wasDrawerOpen = !!(prevDrawer && prevDrawer.classList.contains('open'));

      const isPro = userSubscriptionStatus[currentProfileKey] || false;

      let mobileBodyHtml = '';
      if (currentRoutePage === 'opportunites') {
        mobileBodyHtml = getMobileFinancementsHtml();
      } else if (currentRoutePage === 'admin-financements') {
        mobileBodyHtml = getMobileAdminFinancementsHtml();
      } else if (currentRoutePage === 'conseils') {
        mobileBodyHtml = getMobileConseilsHtml();
      } else if (currentRoutePage === 'admin-conseils') {
        mobileBodyHtml = getMobileAdminConseilsHtml();
      } else if (currentRoutePage === 'admin-utilisateurs') {
        mobileBodyHtml = getMobileAdminUtilisateursHtml();
      } else if (currentRoutePage === 'admin-modeles') {
        mobileBodyHtml = getMobileAdminModelesHtml();
      } else if (currentRoutePage === 'admin-etapes') {
        mobileBodyHtml = getMobileAdminEtapesHtml();
      } else if (currentRoutePage === 'materiel-services') {
        mobileBodyHtml = getMobileMaterielsHtml();
      } else if (currentRoutePage === 'admin-materiels') {
        mobileBodyHtml = getMobileAdminMaterielsHtml();
      } else if (currentRoutePage === 'marche') {
        mobileBodyHtml = getMobileMarcheHtml();
      } else if (currentRoutePage === 'mes-annonces') {
        mobileBodyHtml = getMobileMesAnnoncesHtml();
      } else if (currentRoutePage === 'admin-queue' || currentRoutePage === 'admin-moderation') {
        mobileBodyHtml = getMobileAdminQueueHtml();
      } else if (currentRoutePage === 'synthese') {
        mobileBodyHtml = getMobileSyntheseHtml();
      } else if (currentRoutePage === 'parcelles') {
        mobileBodyHtml = getMobileParcellesHtml();
      } else if (currentRoutePage === 'cycles') {
        mobileBodyHtml = getMobileCyclesHtml();
      } else if (currentRoutePage === 'finances') {
        mobileBodyHtml = getMobileFinancesHtml();
      } else if (currentRoutePage === 'meteo') {
        mobileBodyHtml = getMobileMeteoHtml();
      } else if (currentRoutePage === 'notifications') {
        mobileBodyHtml = getMobileNotificationsHtml();
      } else if (currentRoutePage === 'profil') {
        mobileBodyHtml = getMobileProfilHtml();
      } else if (currentRoutePage === 'parametres') {
        mobileBodyHtml = getMobileParametresHtml();
      } else {
        const netMargin = (currentRevenueTotal || 0) - (currentExpenseTotal || 0);
        const isLoss = netMargin < 0;
        const absMargin = Math.abs(netMargin);
        const formattedAbsMargin = new Intl.NumberFormat('fr-FR').format(absMargin);
        const digitCount = absMargin.toString().length;
        let marginClass = '';
        if (digitCount > 9) marginClass = 'len-long';
        else if (digitCount >= 8) marginClass = 'len-9';
        if (isLoss) marginClass += ' is-loss';

        const formattedTotalRev = new Intl.NumberFormat('fr-FR').format(currentRevenueTotal || 0);
        const formattedTotalExp = new Intl.NumberFormat('fr-FR').format(currentExpenseTotal || 0);
        const parcelsCount = (cachedUserParcels || []).length;
        const activeCyclesCount = (cachedCropCycles || []).filter(c => c.status !== 'Terminé' && c.status !== 'Récolté').length;

        const todayDate = new Date();
        const shortDateOpt = { weekday: 'short', day: 'numeric', month: 'short' };
        const rawShortDate = todayDate.toLocaleDateString('fr-FR', shortDateOpt);
        const capitalizedShortDate = rawShortDate.charAt(0).toUpperCase() + rawShortDate.slice(1);
        const userLocName = (data.location || 'Koudougou').split('(')[0].trim();

        const publishedConseils = (cachedConseils || [])
          .filter(c => c.statut === 'publie')
          .sort((a, b) => new Date(b.date_publication || b.created_at) - new Date(a.date_publication || a.created_at));
        const latestDailyConseil = publishedConseils[0];
        const latestAdviceTitle = latestDailyConseil ? latestDailyConseil.titre : 'Chargement du conseil…';
        const latestAdviceBody = latestDailyConseil ? getConseilCardText(latestDailyConseil) : '';

        const curWeather = cachedWeatherResult?.current;
        const tomDaily = cachedWeatherResult?.daily?.[1];
        const weatherTempStr = curWeather ? `${curWeather.temperature} °C` : '-- °C';
        const weatherCityStr = userLocName;
        const weatherTomorrowStr = tomDaily ? `${tomDaily.tempMax} °C • ${tomDaily.meta?.label || 'Ensoleillé'}` : '--';
        const weatherPhrase = getAgronomicWeatherSentence(cachedWeatherResult);

        const openFinancementsCount = typeof filterOpenFinancementsForUsers === 'function'
          ? filterOpenFinancementsForUsers(cachedFinancements).length
          : (cachedFinancements || []).filter(f => f.statut === 'publie').length;

        mobileBodyHtml = `
        <!-- Salutation sobre sans emoji (Point 5 : Titre 26px 800, Date/Ville 14px #4A4A4A) -->
        <div style="margin-bottom: 14px;">
          <h1 class="mobile-greeting" style="font-size: 26px; font-weight: 800; color: #1A1A1A; margin: 0 0 4px; line-height: 1.2;">Bonjour, ${data.name.split(' ')[0]} ${isPro ? '<span class="user-badge-pro" style="font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #FAF0D6; color: #874614; font-weight: 700; vertical-align: middle;">PRO</span>' : ''}</h1>
          <p class="mobile-subdate" style="font-size: 14px; color: #4A4A4A; margin: 0;">${capitalizedShortDate} • ${userLocName}</p>
        </div>

        <!-- 1. GRANDE CARTE VERTE SAISON 2026 (Remplace Dépenses et Recettes) -->
        <section class="home-season-card">
          <div class="season-card-header">
            <span class="season-tag">Saison 2026</span>
            <span class="season-parcels-count">${parcelsCount} parcelle${parcelsCount > 1 ? 's' : ''}</span>
          </div>
          <div class="season-margin-block">
            <span class="season-margin-label">${isLoss ? 'Perte de la saison' : 'Bénéfice de la saison'}</span>
            <div class="season-margin-row">
              <span class="season-amount ${marginClass}">${isLoss ? '− ' : ''}${formattedAbsMargin}</span>
              <span class="season-currency">FCFA</span>
            </div>
          </div>
          <div class="season-subcards-grid">
            <div class="season-subcard">
              <span class="season-subcard-label">Dépenses</span>
              <div class="season-subcard-val">
                <span>${formattedTotalExp}</span> <small>FCFA</small>
              </div>
            </div>
            <div class="season-subcard">
              <span class="season-subcard-label">Ventes</span>
              <div class="season-subcard-val">
                <span>${formattedTotalRev}</span> <small>FCFA</small>
              </div>
            </div>
          </div>
        </section>

        <!-- CARTE "À FAIRE CETTE SEMAINE" (Plan de suivi inter-parcelles) -->
        ${getHomeTasksWeekHtml()}

        <!-- 2. DEUX CARTES BLANCHES CÔTE À CÔTE -->
        <section class="home-two-cards-grid">
          <a href="#parcelles" class="home-white-card">
            <div class="home-card-icon-pill">
              <i data-lucide="sprout"></i>
            </div>
            <div class="home-card-meta">
              <span class="home-card-title">Cycles en cours</span>
              <strong class="home-card-value">${activeCyclesCount} <small>actifs</small></strong>
            </div>
          </a>
          <a href="#opportunites" class="home-white-card">
            <div class="home-card-icon-pill">
              <i data-lucide="award"></i>
            </div>
            <div class="home-card-meta">
              <span class="home-card-title">Opportunités disponibles</span>
              <strong class="home-card-value">${openFinancementsCount} <small>ouverte${openFinancementsCount > 1 ? 's' : ''}</small></strong>
            </div>
          </a>
        </section>

        <!-- 3. MÉTÉO COURTE SUR UNE SEULE CARTE (Point 2 : 100% réelle Open-Meteo) -->
        <section class="home-weather-short-card">
          <div class="weather-short-top">
            <div class="weather-short-temp-group">
              <i data-lucide="cloud-sun" class="weather-short-icon"></i>
              <div>
                <strong class="weather-short-temp">${weatherTempStr}</strong>
                <span class="weather-short-city">${weatherCityStr}</span>
              </div>
            </div>
            <div class="weather-short-tomorrow">
              <span class="tomorrow-label">Demain</span>
              <strong class="tomorrow-val">${weatherTomorrowStr}</strong>
            </div>
          </div>
          <p class="weather-short-advice">
            ${weatherPhrase}
          </p>
        </section>

        <!-- 4. CARTE CONSEIL DU JOUR (Point 1 & Point 6 : Badge jaune, Titre, Résumé, Bouton Écouter vert clair 40px) -->
        <section class="home-daily-advice-card" id="cardMobileDailyAdvice" style="cursor: pointer;">
          <div style="margin-bottom: 8px;">
            <span class="badge-sun-yellow" style="display: inline-block;">Conseil du jour</span>
          </div>
          <h3 class="advice-card-title" id="mobileDailyAdviceTitle" style="margin: 0 0 6px; font-size: 16px; font-weight: 800; color: #1A1A1A; line-height: 1.35;">${latestAdviceTitle}</h3>
          <p class="advice-card-text" id="mobileDailyAdviceText" style="margin: 0 0 12px; font-size: 14px; color: #4A4A4A; line-height: 1.5;">${latestAdviceBody}</p>
          <div>
            <button type="button" class="btn-listen-advice-small" id="btnListenMobileDashAdvice" aria-label="Écouter le conseil agronomique">
              <i data-lucide="volume-2" style="width: 16px; height: 16px;"></i>
              <span>Écouter</span>
            </button>
          </div>
        </section>

        <!-- 5. QUATRE RACCOURCIS EN ICÔNES CARRÉES ARRONDIES -->
        <section class="home-shortcuts-grid">
          <a href="#opportunites" class="shortcut-square-btn" data-page="opportunites">
            <div class="shortcut-icon-box">
              <i data-lucide="landmark"></i>
            </div>
            <span class="shortcut-label">Financer</span>
          </a>
          <a href="#formations" class="shortcut-square-btn" data-page="formations">
            <div class="shortcut-icon-box">
              <i data-lucide="graduation-cap"></i>
            </div>
            <span class="shortcut-label">Formations</span>
          </a>
          <a href="#materiel-services" class="shortcut-square-btn" data-page="materiel-services">
            <div class="shortcut-icon-box">
              <i data-lucide="tractor"></i>
            </div>
            <span class="shortcut-label">Matériel</span>
          </a>
          <a href="#marche" class="shortcut-square-btn" data-page="marche">
            <div class="shortcut-icon-box">
              <i data-lucide="store"></i>
            </div>
            <span class="shortcut-label">Marché</span>
          </a>
        </section>

        <!-- Carte d'installation PWA sur l'accueil mobile (refermable) -->
        ${getMobilePwaHomeCardHtml()}
        `;
      }

      mobileAppMount.innerHTML = `
      <!-- TIROIR LATÉRAL GAUCHE MOBILE (DRAWER) -->
      <div class="mobile-drawer-overlay" id="mobileDrawerOverlay"></div>
      <aside class="mobile-drawer" id="mobileDrawer">
        <div class="mobile-drawer-header">
          <div class="brand-logo" style="display: flex; align-items: center;">
            <img src="assets/logo/logo-revagrik.png" alt="REVAGRIK - Révolution Agricole" style="height: 32px; width: auto; max-width: 170px; object-fit: contain; display: block;">
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
            <a href="#conseils" class="nav-item mobile-drawer-link" data-page="conseils">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
              </span>
              <span class="nav-label">Conseils</span>
              ${(() => {
                try {
                  const cnt = (typeof getNewConseilsCount === 'function') ? getNewConseilsCount() : 0;
                  if (cnt > 0) {
                    return `<span class="nav-pill-count" id="mobileDrawerConseilsBadge">${cnt} nvx</span>`;
                  }
                } catch (e) {
                  console.warn('Erreur affichage badge conseils mobile :', e);
                }
                return `<span class="nav-pill-count" id="mobileDrawerConseilsBadge" style="display:none;"></span>`;
              })()}
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
            <a href="#opportunites" class="nav-item mobile-drawer-link" data-page="opportunites">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m12 6 4 6-4 6"/><path d="M8 12h8"/></svg>
              </span>
              <span class="nav-label">Financements</span>
              ${(() => {
                try {
                  const len = (typeof filterOpenFinancementsForUsers === 'function') ? filterOpenFinancementsForUsers(cachedFinancements).length : 0;
                  return `<span class="nav-badge-amber" id="mobileDrawerFinancementsBadge">${len}</span>`;
                } catch (e) {
                  return `<span class="nav-badge-amber" id="mobileDrawerFinancementsBadge" style="display:none;"></span>`;
                }
              })()}
            </a>
          </div>

          <!-- Groupe 4: ÉCHANGER -->
          <div class="nav-section">
            <div class="nav-section-title">ÉCHANGER</div>
            <a href="#marche" class="nav-item mobile-drawer-link" data-page="marche">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </span>
              <span class="nav-label">Marché agricole</span>
              <span class="nav-badge-neutral hidden" id="mobileDrawerMarcheBadge">0</span>
            </a>
            <a href="#materiel-services" class="nav-item mobile-drawer-link" data-page="materiel-services">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </span>
              <span class="nav-label">Matériel & services</span>
            </a>
            <a href="#mes-annonces" class="nav-item mobile-drawer-link" data-page="mes-annonces">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
              <span class="nav-label">Mes annonces</span>
              <span class="nav-badge-neutral hidden" id="mobileDrawerMesAnnoncesBadge">0</span>
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
              <a href="#parcelles" class="nav-item mobile-drawer-link" data-page="parcelles">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg></span>
                <span class="nav-label">Parcelles & cultures</span>
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
              <a href="#admin-financements" class="nav-item mobile-drawer-link" data-page="admin-financements">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M12 14v4"/><path d="M10 16h4"/></svg></span>
                <span class="nav-label">Gérer les financements</span>
                ${(() => {
                  try {
                    const count = (cachedFinancements || []).filter(f => f.statut === 'en_attente').length;
                    return `<span class="nav-badge-amber" id="mobileDrawerPendingBadge">${count}</span>`;
                  } catch (e) {
                    return `<span class="nav-badge-amber" id="mobileDrawerPendingBadge" style="display:none;"></span>`;
                  }
                })()}
              </a>
              <a href="#admin-conseils" class="nav-item mobile-drawer-link" data-page="admin-conseils">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
                <span class="nav-label">Gérer les conseils</span>
                ${(() => {
                  try {
                    const count = (cachedConseils || []).filter(c => c.statut === 'en_attente').length;
                    return `<span class="nav-badge-amber" id="mobileDrawerConseilsPendingBadge">${count}</span>`;
                  } catch (e) {
                    return `<span class="nav-badge-amber" id="mobileDrawerConseilsPendingBadge" style="display:none;"></span>`;
                  }
                })()}
              </a>
              <a href="#admin-utilisateurs" class="nav-item mobile-drawer-link" data-page="admin-utilisateurs">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
                <span class="nav-label">Utilisateurs</span>
                ${(() => {
                  try {
                    const count = (cachedAdminUsers || []).length;
                    return `<span class="nav-badge-neutral" id="mobileDrawerUsersBadge">${count}</span>`;
                  } catch (e) {
                    return `<span class="nav-badge-neutral" id="mobileDrawerUsersBadge" style="display:none;"></span>`;
                  }
                })()}
              </a>
              <a href="#admin-modeles" class="nav-item mobile-drawer-link" data-page="admin-modeles">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/></svg></span>
                <span class="nav-label">Gérer les modèles</span>
                ${(() => {
                  try {
                    const count = (cachedModelesCultures || []).length;
                    return `<span class="nav-badge-neutral" id="mobileDrawerModelesBadge">${count}</span>`;
                  } catch (e) {
                    return `<span class="nav-badge-neutral" id="mobileDrawerModelesBadge" style="display:none;"></span>`;
                  }
                })()}
              </a>
              <a href="#admin-etapes" class="nav-item mobile-drawer-link" data-page="admin-etapes">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>
                <span class="nav-label">Plans de suivi</span>
                ${(() => {
                  try {
                    const count = (cachedEtapesCulture || []).length;
                    return `<span class="nav-badge-neutral" id="mobileDrawerEtapesBadge">${count}</span>`;
                  } catch (e) {
                    return `<span class="nav-badge-neutral" id="mobileDrawerEtapesBadge" style="display:none;"></span>`;
                  }
                })()}
              </a>
              <a href="#admin-materiels" class="nav-item mobile-drawer-link" data-page="admin-materiels">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>
                <span class="nav-label">Gérer le matériel</span>
                ${(() => {
                  try {
                    const count = (cachedMateriels || []).filter(m => m.statut === 'en_attente').length;
                    return `<span class="nav-badge-amber" id="mobileDrawerMaterielsBadge">${count}</span>`;
                  } catch (e) {
                    return `<span class="nav-badge-amber" id="mobileDrawerMaterielsBadge" style="display:none;"></span>`;
                  }
                })()}
              </a>
              <a href="#admin-queue" class="nav-item mobile-drawer-link" data-page="admin-queue">
                <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></span>
                <span class="nav-label">Files de modération</span>
                ${(() => {
                  try {
                    const count = (cachedSignalements || []).filter(s => s.statut === 'en_attente').length;
                    return `<span class="nav-badge-red ${count === 0 ? 'hidden' : ''}" id="mobileDrawerAdminQueueBadge">${count}</span>`;
                  } catch (e) {
                    return `<span class="nav-badge-red hidden" id="mobileDrawerAdminQueueBadge">0</span>`;
                  }
                })()}
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
            <a href="#installer" class="nav-item mobile-drawer-link" id="btnMobileDrawerInstallPwa">
              <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>
              <span class="nav-label">Installer l'application</span>
              <span class="nav-badge-amber" id="mobileDrawerBadgeInstallPwa" style="background:#EAF4E6;color:var(--bleu-principal, #05507E);font-weight:700;">App</span>
            </a>
          </div>

          <!-- Carte Promotionnelle dans le tiroir mobile -->
          <div style="background: #FBF1D6; border: 1px solid #E0A526; border-radius: 14px; padding: 12px; margin: 12px 14px; font-size: 13px; color: #1A1A1A;">
            <strong style="font-size: 14px; font-weight: 800;">${isPro ? 'Forfait Pro Actif' : 'Forfait Pro (5 000 F)'}</strong>
            <p style="margin: 4px 0 8px; font-size: 12px; color: #4A4A4A;">${isPro ? 'Alertes SMS et calculs de marge illimités.' : 'Débloquez toutes les fonctionnalités et alertes SMS.'}</p>
            <button type="button" id="btnMobileDrawerGoPro" style="background: #A85A1C; color: #FFF; border: none; padding: 10px; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; width: 100%;">
              ${isPro ? 'Gérer mon forfait' : 'Voir les forfaits Pro'}
            </button>
          </div>

          <!-- Déconnexion isolée -->
          <div class="sidebar-logout" style="border-top: 1px solid #ECE6D9; padding-top: 10px; margin-top: 10px;">
            <button class="btn-logout" id="btnMobileLogout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- En-tête mobile compact (Point 4 : menu ☰, logo 38px var(--bleu-principal, #05507E) feuille #E0A526, Révolution Agricole 15px 800, cloche et profil) -->
      <header class="mobile-header-bar">
        <div class="mobile-header-left" style="display: flex; align-items: center; gap: 10px;">
          <button class="mobile-menu-hamburger-btn" id="btnOpenMobileDrawer" aria-label="Ouvrir le menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div class="mobile-brand" style="display: flex; align-items: center; gap: 8px;">
            <img src="assets/logo/logo-revagrik.png" alt="REVAGRIK - Révolution Agricole" style="height: 36px; width: auto; max-width: 165px; object-fit: contain; display: block;">
          </div>
        </div>
        <div class="mobile-header-actions" style="display: flex; align-items: center; gap: 10px;">
          <button class="icon-btn mobile-icon-btn" id="btnMobileNotif" aria-label="Notifications" style="width: 36px; height: 36px; position: relative;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
            <span class="notification-badge-count hidden" id="mobileNotifBadgeCount"></span>
          </button>
          <img src="${data.avatar}" alt="Avatar" class="mobile-user-avatar" id="btnMobileAvatarOpenDrawer" style="cursor: pointer; width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
        </div>
      </header>

      <div class="mobile-body">
        ${mobileBodyHtml}
      </div>

      <!-- BOUTON D'ACTION FLOTTANT (+) MOBILE -->
      <button class="mobile-fab-btn" id="btnMobileFab" title="Ajouter une dépense ou vente">+</button>

      <!-- FEUILLE D'ACTION MOBILE (Action Sheet au clic sur +) -->
      <div class="mobile-action-sheet-overlay hidden" id="mobileActionSheetOverlay">
        <div class="mobile-action-sheet" style="border-radius: 20px 20px 0 0; padding: 20px; background: #FFFFFF;">
          <div class="action-sheet-header" style="margin-bottom: 14px;">
            <strong style="font-size: 16px; font-weight: 800; color: #1A1A1A;">Que voulez-vous enregistrer ?</strong>
            <button class="action-sheet-close" id="btnCloseActionSheet">&times;</button>
          </div>
          <div class="action-sheet-buttons" style="display: flex; flex-direction: column; gap: 10px;">
            <button type="button" class="sheet-action-btn sheet-expense-btn" id="btnSheetAddExpense" style="border-radius: 14px; border: 1.5px solid var(--bleu-principal, #05507E); background: #FFFFFF; min-height: 52px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--bleu-clair, #E6EFF6); color: var(--bleu-principal, #05507E); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="wallet"></i>
              </div>
              <div class="sheet-text" style="text-align: left;">
                <strong style="display: block; font-size: 14.5px; color: #1A1A1A;">+ Ajouter une dépense</strong>
                <small style="font-size: 12px; color: #4A4A4A;">Engrais, semences, carburant, main d'œuvre</small>
              </div>
            </button>
            <button type="button" class="sheet-action-btn sheet-revenue-btn" id="btnSheetAddRevenue" style="border-radius: 14px; background: #A85A1C; color: #FFFFFF; border: none; min-height: 52px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(168, 90, 28, 0.2);">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.2); color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="trending-up"></i>
              </div>
              <div class="sheet-text" style="text-align: left;">
                <strong style="display: block; font-size: 14.5px; color: #FFFFFF;">+ Enregistrer une vente de récolte</strong>
                <small style="font-size: 12px; color: #F6EADF;">Vente au marché, bord champ, encaissement</small>
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

    function openMobileDrawer(e) {
      if (e) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.preventDefault === 'function') e.preventDefault();
      }
      const d = document.getElementById('mobileDrawer');
      const o = document.getElementById('mobileDrawerOverlay');
      if (d && o) {
        d.classList.add('open');
        o.classList.add('open');
        document.body.classList.add('drawer-open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeMobileDrawer(e) {
      if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }
      const d = document.getElementById('mobileDrawer');
      const o = document.getElementById('mobileDrawerOverlay');
      if (d && o) {
        d.classList.remove('open');
        o.classList.remove('open');
        document.body.classList.remove('drawer-open');
        document.body.style.overflow = '';
      }
    }

    if (btnOpen) {
      btnOpen.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        openMobileDrawer(e);
      });
    }
    if (avatarOpen) {
      avatarOpen.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        openMobileDrawer(e);
      });
    }
    if (btnClose) {
      btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeMobileDrawer(e);
      });
    }
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileDrawer(e);
      });
      overlay.addEventListener('touchmove', (e) => {
        e.preventDefault();
      }, { passive: false });
    }

    if (drawer) {
      drawer.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Si le tiroir était ouvert avant la réécriture DOM et qu'on n'est pas en train de naviguer, le maintenir ouvert
    if (wasDrawerOpen && !isNavigatingRoute) {
      openMobileDrawer();
    }
    isNavigatingRoute = false;

    const btnMobileLogout = document.getElementById('btnMobileLogout');
    if (btnMobileLogout) {
      btnMobileLogout.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileDrawer();
        performLogout();
      });
    }

    const btnMobPrice = document.getElementById('btnMobileDrawerPricing');
    if (btnMobPrice) {
      btnMobPrice.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileDrawer();
        openPricingModal();
      });
    }

    const btnMobGoPro = document.getElementById('btnMobileDrawerGoPro');
    if (btnMobGoPro) {
      btnMobGoPro.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileDrawer();
        openPricingModal();
      });
    }

    // Cloche notifications mobile
    const btnMobNotif = document.getElementById('btnMobileNotif');
    if (btnMobNotif) {
      btnMobNotif.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.hash = 'notifications';
        handleRoute();
      });
    }

    // Tout lire mobile
    const btnMobileMarkAllRead = document.getElementById('btnMobileMarkAllRead');
    if (btnMobileMarkAllRead) {
      btnMobileMarkAllRead.addEventListener('click', markAllNotificationsAsRead);
    }

    // Cartes notifications mobile
    document.querySelectorAll('.mobile-notif-card').forEach(card => {
      card.addEventListener('click', async () => {
        const notifId = card.getAttribute('data-notif-id');
        const lien = card.getAttribute('data-lien') || '#dashboard';
        await markNotificationAsRead(notifId);
        const targetRoute = lien.replace(/^#/, '');
        if (targetRoute) {
          window.location.hash = targetRoute;
          handleRoute();
        }
      });
    });

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

    // Bouton installer PWA dans le tiroir mobile
    const btnMobDrawerPwa = document.getElementById('btnMobileDrawerInstallPwa');
    if (btnMobDrawerPwa) {
      btnMobDrawerPwa.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMobileDrawer();
        triggerPwaInstallFlow();
      });
    }

    // Carte d'installation PWA sur l'accueil mobile (refermable)
    const btnInstallMobHome = document.getElementById('btnInstallPwaMobileHomeCard');
    if (btnInstallMobHome) {
      btnInstallMobHome.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerPwaInstallFlow();
      });
    }

    const btnCloseMobHome = document.getElementById('btnClosePwaMobileHomeCard');
    if (btnCloseMobHome) {
      btnCloseMobHome.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = document.getElementById('pwaMobileHomeCard');
        if (card) card.remove();
        try { localStorage.setItem('pwa_home_card_closed', '1'); } catch (err) {}
      });
    }

    const btnDismissMobHome = document.getElementById('btnDismissPwaMobileHomeCard');
    if (btnDismissMobHome) {
      btnDismissMobHome.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = document.getElementById('pwaMobileHomeCard');
        if (card) card.remove();
        try { localStorage.setItem('pwa_home_card_closed', '1'); } catch (err) {}
      });
    }

    // Liens du tiroir mobile (Routing avec fermeture automatique)
    document.querySelectorAll('.mobile-drawer-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = href.replace(/^#/, '');
          isNavigatingRoute = true;
          closeMobileDrawer();
          window.location.hash = target;
          handleRoute();
        }
      });
    });

    // Liens retour au tableau de bord en mobile
    document.querySelectorAll('.mobile-back-to-dashboard').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'dashboard';
        handleRoute();
      });
    });

    // Raccourcis du tableau de bord mobile
    // 1. Grille d'indicateurs 2x2
    document.querySelectorAll('.mobile-stat-card').forEach((card, idx) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (idx === 0 || idx === 1) {
          window.location.hash = 'finances';
        } else if (idx === 2) {
          window.location.hash = 'cycles';
        } else if (idx === 3) {
          window.location.hash = 'opportunites';
        }
        handleRoute();
      });
    });

    // 1b. Écouteurs de la vue Finances & Marges mobile
    const btnMobFinAddExp = document.getElementById('btnMobFinAddExpense');
    if (btnMobFinAddExp) {
      btnMobFinAddExp.addEventListener('click', () => openExpenseModal());
    }
    const btnMobFinAddRev = document.getElementById('btnMobFinAddRevenue');
    if (btnMobFinAddRev) {
      btnMobFinAddRev.addEventListener('click', () => openRevenueModal());
    }

    if (document.getElementById('mobileFinancesTransactionsList')) {
      renderTransactionsList(currentTransFilter, 'mobileFinancesTransactionsList');

      const mobFAll = document.getElementById('mobFilterTransAll');
      const mobFExp = document.getElementById('mobFilterTransExp');
      const mobFRev = document.getElementById('mobFilterTransRev');

      if (mobFAll) mobFAll.addEventListener('click', () => {
        setTransFilter('all');
        renderTransactionsList('all', 'mobileFinancesTransactionsList');
      });
      if (mobFExp) mobFExp.addEventListener('click', () => {
        setTransFilter('expenses');
        renderTransactionsList('expenses', 'mobileFinancesTransactionsList');
      });
      if (mobFRev) mobFRev.addEventListener('click', () => {
        setTransFilter('revenues');
        renderTransactionsList('revenues', 'mobileFinancesTransactionsList');
      });
    }

    // 2. Lien "Voir tout" des échéances urgentes
    const linkMobAllDeadlines = document.getElementById('linkMobileAllDeadlines');
    if (linkMobAllDeadlines) {
      linkMobAllDeadlines.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'synthese';
        handleRoute();
      });
    }

    // 3. Lien "Voir tout" des cycles culturaux
    const linkMobAllCycles = document.getElementById('linkMobileAllCycles');
    if (linkMobAllCycles) {
      linkMobAllCycles.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'cycles';
        handleRoute();
      });
    }

    // 4. Cartes des cycles culturaux
    document.querySelectorAll('.mobile-cycle-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.hash = 'cycles';
        handleRoute();
      });
    });

    // Clic sur bouton + Ajouter financement en mobile
    const btnMobileOpenAddFin = document.getElementById('btnMobileOpenAddFin');
    if (btnMobileOpenAddFin) {
      btnMobileOpenAddFin.addEventListener('click', () => {
        openManageFinancementModal();
      });
    }

    // Événements clic sur cartes financements mobiles
    document.querySelectorAll('.mobile-fin-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = cachedFinancements.find(f => String(f.id) === String(id));
        if (item) openFinancementDetailsModal(item);
      });
    });

    // Événements clic sur échéances opportunités mobiles
    document.querySelectorAll('.mobile-deadline-card[data-type="financement"]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = cachedFinancements.find(f => String(f.id) === String(id));
        if (item) openFinancementDetailsModal(item);
        else window.location.hash = '#opportunites';
      });
    });

    // Puces filtres types en mobile
    document.querySelectorAll('.mobile-type-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        userSelectedType = chip.getAttribute('data-type');
        renderMobileView();
      });
    });

    // Onglets statut admin en mobile
    document.querySelectorAll('.mobile-admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        adminActiveStatusTab = tab.getAttribute('data-tab');
        renderMobileView();
      });
    });

    // Actions admin en mobile
    document.querySelectorAll('.mobile-body .btn-action-publish').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await updateFinancementStatus(id, 'publie');
      });
    });

    document.querySelectorAll('.mobile-body .btn-action-withdraw').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await updateFinancementStatus(id, 'expire');
      });
    });

    document.querySelectorAll('.mobile-body .btn-action-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = cachedFinancements.find(f => String(f.id) === String(id));
        if (item) openManageFinancementModal(item);
      });
    });

    // Clic sur bouton + Ajouter conseil en mobile
    const btnMobileOpenAddConseil = document.getElementById('btnMobileOpenAddConseil');
    if (btnMobileOpenAddConseil) {
      btnMobileOpenAddConseil.addEventListener('click', () => {
        openManageConseilModal();
      });
    }

    // Événements clic sur cartes conseils mobiles
    document.querySelectorAll('.mobile-conseil-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = cachedConseils.find(c => String(c.id) === String(id));
        if (item) openConseilDetailsModal(item);
      });
    });

    // Puces filtres catégories conseils en mobile
    document.querySelectorAll('.mobile-conseil-cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        userSelectedConseilCategory = chip.getAttribute('data-cat');
        renderMobileView();
      });
    });

    // Onglets statut admin conseils en mobile
    document.querySelectorAll('.mobile-admin-conseil-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        adminConseilActiveStatusTab = tab.getAttribute('data-status');
        renderMobileView();
      });
    });

    // Actions admin conseils en mobile
    document.querySelectorAll('.mobile-body .btn-mobile-conseil-read').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = cachedConseils.find(c => String(c.id) === String(id));
        if (item) openConseilDetailsModal(item);
      });
    });

    document.querySelectorAll('.mobile-body .btn-mobile-conseil-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = cachedConseils.find(c => String(c.id) === String(id));
        if (item) openManageConseilModal(item);
      });
    });

    document.querySelectorAll('.mobile-body .btn-mobile-conseil-publish').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await updateConseilStatus(id, 'publie');
      });
    });

    document.querySelectorAll('.mobile-body .btn-mobile-conseil-archive').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await updateConseilStatus(id, 'archive');
      });
    });

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

    // Événements météo mobile
    const btnMobWeatherCard = document.getElementById('btnMobileWeatherCardClick');
    if (btnMobWeatherCard) {
      btnMobWeatherCard.addEventListener('click', () => {
        window.location.hash = 'meteo';
        navigateToPage('meteo');
      });
    }

    const selectMobCommune = document.getElementById('selectMobileMeteoCommune');
    if (selectMobCommune) {
      selectMobCommune.addEventListener('change', (e) => {
        userManualCommuneKey = e.target.value;
        loadAndRenderWeather(true);
      });
    }

    const btnRefMobMeteo = document.getElementById('btnRefreshMobileMeteo');
    if (btnRefMobMeteo) {
      btnRefMobMeteo.addEventListener('click', () => {
        loadAndRenderWeather(true);
      });
    }

    const btnListenMobDash = document.getElementById('btnListenMobileDashWeather');
    if (btnListenMobDash && cachedWeatherResult) {
      const interp = computeFarmerInterpretation(cachedWeatherResult.current, cachedWeatherResult.daily);
      btnListenMobDash.addEventListener('click', (e) => {
        e.stopPropagation();
        speakWeatherInterpretation(interp, btnListenMobDash);
      });
    }

    const btnListenMobMeteo = document.getElementById('btnListenMobileMeteo');
    if (btnListenMobMeteo && cachedWeatherResult) {
      const interp = computeFarmerInterpretation(cachedWeatherResult.current, cachedWeatherResult.daily);
      btnListenMobMeteo.addEventListener('click', (e) => {
        e.stopPropagation();
        speakWeatherInterpretation(interp, btnListenMobMeteo);
      });
    }

    // Écouteurs des raccourcis carrés arrondis de l'accueil mobile
    document.querySelectorAll('.home-shortcuts-grid .shortcut-square-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = btn.getAttribute('data-page') || btn.getAttribute('data-nav');
        if (page) {
          e.preventDefault();
          window.location.hash = page;
          handleRoute();
        }
      });
    });

    // Écouteur vocal et clic du conseil du jour en mobile
    const btnListenMobDashAdv = document.getElementById('btnListenMobileDashAdvice');
    if (btnListenMobDashAdv) {
      btnListenMobDashAdv.addEventListener('click', (e) => {
        e.stopPropagation();
        speakLatestDailyConseil();
      });
    }

    const cardMobAdv = document.getElementById('cardMobileDailyAdvice');
    if (cardMobAdv) {
      cardMobAdv.addEventListener('click', (e) => {
        if (e.target.closest('#btnListenMobileDashAdvice')) return;
        const published = (cachedConseils || [])
          .filter(c => c.statut === 'publie')
          .sort((a, b) => new Date(b.date_publication || b.created_at) - new Date(a.date_publication || a.created_at));
        const latest = published[0];
        if (latest && typeof openConseilDetailsModal === 'function') {
          openConseilDetailsModal(latest);
        }
      });
    }

    // Mise à jour de la visibilité des boutons et cartes PWA
    if (typeof updatePwaVisibility === 'function') {
      updatePwaVisibility();
    }

    if (typeof bindProfilAndParametresEventListeners === 'function') {
      bindProfilAndParametresEventListeners();
    }

    // Génération automatique des icônes Lucide au trait
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
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
      if (btnViewMobile) btnViewMobile.classList.add('active');
      if (btnViewDesktop) btnViewDesktop.classList.remove('active');
      if (viewportContainer) {
        viewportContainer.classList.remove('mode-desktop');
        viewportContainer.classList.add('mode-mobile');
      }
      if (mobileDeviceFrame) mobileDeviceFrame.classList.remove('hidden');
      if (desktopAppShell) desktopAppShell.classList.add('hidden');
      renderMobileView();
    } else {
      if (btnViewDesktop) btnViewDesktop.classList.add('active');
      if (btnViewMobile) btnViewMobile.classList.remove('active');
      if (viewportContainer) {
        viewportContainer.classList.remove('mode-mobile');
        viewportContainer.classList.add('mode-desktop');
      }
      if (mobileDeviceFrame) mobileDeviceFrame.classList.add('hidden');
      if (desktopAppShell) desktopAppShell.classList.remove('hidden');
    }
  }

  if (btnViewDesktop) btnViewDesktop.addEventListener('click', () => switchViewMode('desktop'));
  if (btnViewMobile) btnViewMobile.addEventListener('click', () => switchViewMode('mobile'));

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
          <span class="empty-icon"></span>
          <strong class="empty-title">Aucune échéance urgente</strong>
          <p class="empty-desc">Ajoutez vos cultures ou suivez des opportunités pour recevoir des rappels automatiques avant la date limite.</p>
          <button class="btn-empty-action" id="btnEmptyAction">+ Planifier un cycle</button>
        </div>
      `;
    } else if (state === 'error') {
      deadlinesList.innerHTML = `
        <div class="widget-error-state">
          <span style="font-size: 24px;">️</span>
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
    openExpenseModal();
  }

  if (btnHeaderAction) {
    btnHeaderAction.addEventListener('click', (e) => {
      e.stopPropagation();
      handlePrimaryAction();
    });
  }

  // Suivi dynamique des finances de l'exploitant connecté à Supabase (zéro donnée démo)
  let currentExpenseTotal = 0;
  let currentRevenueTotal = 0;
  let currentMonthExpenseTotal = 0;
  let currentMonthRevenueTotal = 0;

  async function syncFinancialsFromSupabase(profileId = currentProfileKey) {
    if (!supabaseClient) {
      updateFinancialMetrics();
      return;
    }

    try {
      // 1. Charger les dépenses réelles depuis Supabase
      const { data: expData, error: expError } = await supabaseClient
        .from('expenses')
        .select('*')
        .eq('profile_id', profileId);

      if (!expError && expData) {
        cachedExpenses = expData;
        currentExpenseTotal = expData.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
      } else {
        cachedExpenses = [];
        currentExpenseTotal = 0;
      }

      // 2. Charger les recettes réelles depuis Supabase
      const { data: revData, error: revError } = await supabaseClient
        .from('revenues')
        .select('*')
        .eq('profile_id', profileId);

      if (!revError && revData) {
        cachedRevenues = revData;
        currentRevenueTotal = revData.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
      } else {
        cachedRevenues = [];
        currentRevenueTotal = 0;
      }

      // Calcul des flux spécifiques du mois en cours
      const now = new Date();
      const curYear = now.getFullYear();
      const curMonth = now.getMonth();

      const thisMonthExpenses = (cachedExpenses || []).filter(e => {
        if (!e.expense_date) return false;
        const d = new Date(e.expense_date);
        return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth;
      });
      currentMonthExpenseTotal = thisMonthExpenses.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

      const thisMonthRevenues = (cachedRevenues || []).filter(r => {
        if (!r.revenue_date) return false;
        const d = new Date(r.revenue_date);
        return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth;
      });
      currentMonthRevenueTotal = thisMonthRevenues.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

      updateFinancialMetrics();

      if (currentRoutePage === 'parcelles') {
        renderParcellesPage();
      } else if (currentRoutePage === 'synthese') {
        renderSynthesePage();
      } else if (currentRoutePage === 'cycles') {
        renderCyclesPage(cyclesActiveStatusFilter || 'all');
      } else if (currentRoutePage === 'finances') {
        renderFinancesPage();
      }
    } catch (err) {
      console.warn('️ Synchronisation financière Supabase :', err);
      updateFinancialMetrics();
    }
  }

  // Synchronisation des cycles culturaux depuis Supabase
  async function syncCropCyclesFromSupabase(profileId = currentProfileKey) {
    if (!supabaseClient) return;

    try {
      const { data, error } = await supabaseClient
        .from('crop_cycles')
        .select('*, parcels(name, area_ha, irrigation_type)')
        .eq('profile_id', profileId)
        .order('planting_date', { ascending: true });

      cachedCropCycles = data || [];

      if (!error && PROFILES_DATA[profileId]) {
        PROFILES_DATA[profileId].realCycles = data || [];
        if (data && data.length > 0) {
          PROFILES_DATA[profileId].tableRows = data.map(item => {
            let dotClass = 'dot-green';
            let statusClass = 'state-growing';
            if (item.status && item.status.includes('Récolte')) {
              dotClass = 'dot-orange';
              statusClass = 'state-harvest';
            } else if (item.status && (item.status.includes('Repiquage') || item.status.includes('nouveau') || item.status.includes('pépinière'))) {
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

          if (PROFILES_DATA[profileId].stats && PROFILES_DATA[profileId].stats[2]) {
            PROFILES_DATA[profileId].stats[2].value = String(data.length);
          }
        } else {
          PROFILES_DATA[profileId].tableRows = [];
          if (PROFILES_DATA[profileId].stats && PROFILES_DATA[profileId].stats[2]) {
            PROFILES_DATA[profileId].stats[2].value = '0';
          }
        }

        // Mettre à jour les sélecteurs de cycles dans les modales
        const expCycleSel = document.getElementById('expenseCycle');
        if (expCycleSel) {
          expCycleSel.innerHTML = '<option value="">-- Aucune culture (Frais généraux hors parcelle) --</option>' +
            (data || []).map(c => `<option value="${c.id}">${c.crop_name} (${c.parcels?.name || 'Parcelle'})</option>`).join('');
        }
        const revCycleSel = document.getElementById('revenueCycle');
        if (revCycleSel) {
          revCycleSel.innerHTML = '<option value="">-- Aucune culture spécifique (Vente hors parcelle) --</option>' +
            (data || []).map(c => `<option value="${c.id}">${c.crop_name} (${c.parcels?.name || 'Parcelle'})</option>`).join('') +
            '<option value="custom">️ + Vente libre / Saisie personnalisée...</option>';
        }

        renderProfile(currentProfileKey);
      }
    } catch (err) {
      console.warn('️ Erreur synchronisation cycles culturaux :', err);
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
      console.warn('️ Erreur synchronisation abonnement Supabase :', err);
    }
  }

  function updateFinancialMetrics() {
    const netMargin = currentRevenueTotal - currentExpenseTotal;
    const monthMargin = currentMonthRevenueTotal - currentMonthExpenseTotal;

    const formattedMonthRev = new Intl.NumberFormat('fr-FR').format(currentMonthRevenueTotal);
    const formattedMonthExp = new Intl.NumberFormat('fr-FR').format(currentMonthExpenseTotal);
    const formattedTotalRev = new Intl.NumberFormat('fr-FR').format(currentRevenueTotal);
    const formattedTotalExp = new Intl.NumberFormat('fr-FR').format(currentExpenseTotal);

    const marginSign = monthMargin >= 0 ? '+' : '';
    const formattedMargin = `${marginSign}${new Intl.NumberFormat('fr-FR').format(monthMargin)} F CFA`;

    // A. Mise à jour de la grande carte verte "Saison 2026"
    const seasonParcelsCount = document.getElementById('homeSeasonParcelsCount');
    const seasonMarginLabel = document.getElementById('homeSeasonMarginLabel');
    const seasonMarginValue = document.getElementById('homeSeasonMarginValue');
    const seasonExpenses = document.getElementById('homeSeasonExpenses');
    const seasonRevenues = document.getElementById('homeSeasonRevenues');
    const statCyclesHome = document.getElementById('homeStatCycles');
    const statOpportHome = document.getElementById('homeStatOpport');

    const parcelsCount = (cachedUserParcels || []).length;
    if (seasonParcelsCount) {
      seasonParcelsCount.textContent = `${parcelsCount} parcelle${parcelsCount > 1 ? 's' : ''}`;
    }

    if (seasonExpenses) {
      seasonExpenses.textContent = formattedTotalExp;
    }
    if (seasonRevenues) {
      seasonRevenues.textContent = formattedTotalRev;
    }

    // Calcul du bénéfice / perte de la saison avec ajustement dynamique de la taille
    if (seasonMarginValue && seasonMarginLabel) {
      const isLoss = netMargin < 0;
      const absMargin = Math.abs(netMargin);
      const formattedAbsMargin = new Intl.NumberFormat('fr-FR').format(absMargin);
      const digitCount = absMargin.toString().length;

      seasonMarginLabel.textContent = isLoss ? 'Perte de la saison' : 'Bénéfice de la saison';
      seasonMarginValue.textContent = isLoss ? `− ${formattedAbsMargin}` : formattedAbsMargin;

      // Réinitialisation des classes de taille et de statut
      seasonMarginValue.classList.remove('is-loss', 'len-9', 'len-long');
      if (isLoss) {
        seasonMarginValue.classList.add('is-loss');
      }

      // Règle 10 : 34px jusqu'à 7 chiffres, 28px pour 9 chiffres, 24px au-delà
      if (digitCount > 9) {
        seasonMarginValue.classList.add('len-long');
      } else if (digitCount >= 8) {
        seasonMarginValue.classList.add('len-9');
      }
    }

    if (statCyclesHome) {
      const activeCycles = (cachedCropCycles || []).filter(c => c.status !== 'Terminé' && c.status !== 'Récolté');
      statCyclesHome.innerHTML = `${activeCycles.length} <small>actif${activeCycles.length > 1 ? 's' : ''}</small>`;
    }
    if (statOpportHome) {
      const openCount = typeof filterOpenFinancementsForUsers === 'function'
        ? filterOpenFinancementsForUsers(cachedFinancements).length
        : (cachedFinancements || []).filter(f => f.statut === 'publie').length;
      statOpportHome.innerHTML = `${openCount} <small>ouverte${openCount > 1 ? 's' : ''}</small>`;
    }

    // 1. Mettre à jour les stats des cartes bureau (Données réelles du mois)
    const stat1 = document.getElementById('statValue1'); // Dépenses du mois
    const stat2 = document.getElementById('statValue2'); // Recettes du mois
    const stat3 = document.getElementById('statValue3'); // Cycles en cours
    const stat4 = document.getElementById('statValue4'); // Opportunités ouvertes
    const statComp1 = document.getElementById('statComp1');
    const statComp2 = document.getElementById('statComp2');

    if (stat1) {
      stat1.innerHTML = `${formattedMonthExp} <small>F CFA</small>`;
    }
    if (stat2) {
      stat2.innerHTML = `${formattedMonthRev} <small>F CFA</small>`;
    }
    if (stat4) {
      stat4.innerHTML = `7 <small>disponibles</small>`;
    }
    if (statComp1) {
      const expCount = (cachedExpenses || []).filter(e => {
        if (!e.expense_date) return false;
        const d = new Date(e.expense_date);
        return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
      }).length;
      statComp1.textContent = `${expCount} dépense${expCount > 1 ? 's' : ''} ce mois`;
    }
    if (statComp2) {
      const revCount = (cachedRevenues || []).filter(r => {
        if (!r.revenue_date) return false;
        const d = new Date(r.revenue_date);
        return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
      }).length;
      statComp2.textContent = `${revCount} encaissement${revCount > 1 ? 's' : ''} ce mois`;
    }

    if (stat3) {
      const activeCycles = (cachedCropCycles || []).filter(c => c.status !== 'Terminé' && c.status !== 'Récolté');
      stat3.innerHTML = `${activeCycles.length} <small>actif${activeCycles.length > 1 ? 's' : ''}</small>`;
    }

    // Mettre à jour l'objet de profil en mémoire
    if (PROFILES_DATA[currentProfileKey] && PROFILES_DATA[currentProfileKey].stats) {
      if (PROFILES_DATA[currentProfileKey].stats[0]) {
        PROFILES_DATA[currentProfileKey].stats[0].value = formattedMonthExp;
      }
      if (PROFILES_DATA[currentProfileKey].stats[1]) {
        PROFILES_DATA[currentProfileKey].stats[1].value = formattedMonthRev;
      }
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
    if (fRev) fRev.textContent = `+${formattedMonthRev} F CFA`;
    if (fExp) fExp.textContent = `−${formattedMonthExp} F CFA`;
    if (fMarge) fMarge.textContent = formattedMargin;

    // 4. Mettre à jour le graphique SVG du tableau de bord
    const octCol = document.querySelector('.chart-col.active-month');
    if (octCol) {
      octCol.setAttribute('data-rev', formattedMonthRev);
      octCol.setAttribute('data-exp', formattedMonthExp);
      octCol.setAttribute('data-margin', formattedMargin);
      const revBar = octCol.querySelector('.bar-revenue');
      const expBar = octCol.querySelector('.bar-expense');
      if (revBar && expBar) {
        if (currentMonthRevenueTotal === 0 && currentMonthExpenseTotal === 0) {
          revBar.style.height = '4px';
          expBar.style.height = '4px';
        } else {
          const maxVal = Math.max(currentMonthRevenueTotal, currentMonthExpenseTotal, 50000);
          revBar.style.height = `${Math.min(95, Math.max(6, Math.round((currentMonthRevenueTotal / maxVal) * 90)))}%`;
          expBar.style.height = `${Math.min(95, Math.max(6, Math.round((currentMonthExpenseTotal / maxVal) * 90)))}%`;
        }
      }
    }

    // 5. Mettre à jour la carte des tâches de la semaine sur l'accueil
    renderHomeTasksWeekCard();

    // 6. Synchroniser immédiatement la vue mobile si active ou sur écran mobile
    if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
      renderMobileView();
    }

    return { netMargin, formattedMargin, formattedRev: formattedMonthRev, formattedExp: formattedMonthExp };
  }

  // ==========================================
  // MODALE DÉPENSE INTERACTIVE (30 SECONDES)
  // ==========================================
  function openExpenseModal() {
    if (modalExpense) {
      const editInput = document.getElementById('editingExpenseId');
      if (editInput) editInput.value = '';
      const titleEl = document.getElementById('expenseModalTitle');
      if (titleEl) titleEl.textContent = 'Enregistrer une dépense';
      const btnTextEl = document.getElementById('btnSubmitExpenseText');
      if (btnTextEl) btnTextEl.textContent = 'Enregistrer la dépense';

      modalExpense.classList.remove('hidden');
      const input = document.getElementById('expenseAmount');
      if (input) input.focus();
    }
  }

  function openEditExpenseModal(expenseId) {
    if (!modalExpense) return;
    const exp = (cachedExpenses || []).find(e => String(e.id) === String(expenseId));
    if (!exp) {
      showToast('️ Dépense introuvable', 'Impossible de charger la dépense à modifier.');
      return;
    }

    const editInput = document.getElementById('editingExpenseId');
    if (editInput) editInput.value = exp.id;
    const titleEl = document.getElementById('expenseModalTitle');
    if (titleEl) titleEl.textContent = 'Modifier la dépense';
    const btnTextEl = document.getElementById('btnSubmitExpenseText');
    if (btnTextEl) btnTextEl.textContent = 'Enregistrer les modifications';

    const amtInput = document.getElementById('expenseAmount');
    if (amtInput) amtInput.value = Math.round(parseFloat(exp.amount) || 0);

    const catSelect = document.getElementById('expenseCategory');
    if (catSelect && exp.category) catSelect.value = exp.category;

    const cycleSelect = document.getElementById('expenseCycle');
    if (cycleSelect) cycleSelect.value = exp.crop_cycle_id || exp.cycle_code || '';

    const dateInput = document.getElementById('expenseDate');
    if (dateInput && exp.expense_date) dateInput.value = exp.expense_date;

    const noteInput = document.getElementById('expenseNote');
    if (noteInput) noteInput.value = exp.notes || '';

    modalExpense.classList.remove('hidden');
    if (amtInput) amtInput.focus();
  }

  function closeExpenseModal() {
    if (modalExpense) {
      modalExpense.classList.add('hidden');
      if (formAddExpense) formAddExpense.reset();
      const editInput = document.getElementById('editingExpenseId');
      if (editInput) editInput.value = '';
      const titleEl = document.getElementById('expenseModalTitle');
      if (titleEl) titleEl.textContent = 'Enregistrer une dépense';
      const btnTextEl = document.getElementById('btnSubmitExpenseText');
      if (btnTextEl) btnTextEl.textContent = 'Enregistrer la dépense';
    }
  }

  if (btnCloseModalExpense) {
    btnCloseModalExpense.addEventListener('click', (e) => {
      e.stopPropagation();
      closeExpenseModal();
    });
  }
  if (btnCancelExpense) {
    btnCancelExpense.addEventListener('click', (e) => {
      e.stopPropagation();
      closeExpenseModal();
    });
  }
  if (modalExpense) {
    modalExpense.addEventListener('click', (e) => {
      if (e.target === modalExpense) closeExpenseModal();
    });
  }

  if (formAddExpense) {
    formAddExpense.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editingId = document.getElementById('editingExpenseId') ? document.getElementById('editingExpenseId').value : '';
      const amountVal = document.getElementById('expenseAmount').value;
      const cat = document.getElementById('expenseCategory');
      const catVal = cat ? cat.value : 'autre';
      const catText = cat ? cat.options[cat.selectedIndex].text : 'Autre';
      const cycleSelect = document.getElementById('expenseCycle');
      const cycleVal = cycleSelect ? cycleSelect.value : '';
      const cropCycleId = (cycleVal && cycleVal !== 'global' && cycleVal !== '') ? cycleVal : null;
      const expenseDate = document.getElementById('expenseDate') ? document.getElementById('expenseDate').value : new Date().toISOString().split('T')[0];
      const expenseNotes = document.getElementById('expenseNote') ? document.getElementById('expenseNote').value.trim() : '';
      const numericAmount = parseInt(amountVal, 10) || 0;

      // Sauvegarde dans Supabase si connecté
      if (supabaseClient) {
        try {
          if (editingId) {
            // Mode Modification
            const { error } = await supabaseClient.from('expenses').update({
              crop_cycle_id: cropCycleId,
              cycle_code: cycleVal || null,
              amount: numericAmount,
              category: catVal,
              expense_date: expenseDate,
              notes: expenseNotes || `${catText}${cycleVal ? ' - ' + cycleVal : ''}`
            }).eq('id', editingId);

            if (error) {
              console.error('Erreur Supabase update expense:', error);
            } else {
              console.log(' Dépense mise à jour dans Supabase');
            }
          } else {
            // Mode Ajout
            const { error } = await supabaseClient.from('expenses').insert([{
              profile_id: currentProfileKey,
              crop_cycle_id: cropCycleId,
              cycle_code: cycleVal || null,
              amount: numericAmount,
              category: catVal,
              expense_date: expenseDate,
              notes: expenseNotes || `${catText}${cycleVal ? ' - ' + cycleVal : ''}`
            }]);
            if (error) {
              console.error('Erreur Supabase insert expense:', error);
            } else {
              console.log(' Dépense enregistrée dans Supabase');
            }
          }
        } catch (err) {
          console.warn('Erreur réseau enregistrement dépense :', err);
        }
      }

      await syncFinancialsFromSupabase(currentProfileKey);
      const { formattedMargin } = updateFinancialMetrics();

      closeExpenseModal();
      showToast(
        editingId ? 'Dépense modifiée' : 'Dépense ajoutée',
        `${new Intl.NumberFormat('fr-FR').format(numericAmount)} F CFA • Marge actualisée : ${formattedMargin}.`
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

  // État du calendrier initialisé sur la vraie date du jour
  const initDateNow = new Date();
  let calYear = initDateNow.getFullYear();
  let calMonth = initDateNow.getMonth(); // 0-indexed
  let selectedDateObj = new Date(initDateNow.getFullYear(), initDateNow.getMonth(), initDateNow.getDate());

  // Noms des mois en français
  const MONTH_NAMES_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const DAY_NAMES_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const SHORT_DAYS_FR = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  const SHORT_MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

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

      const realToday = new Date();
      const isToday = (calYear === realToday.getFullYear() && calMonth === realToday.getMonth() && day === realToday.getDate());
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
      const today = new Date();
      selectedDateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      calYear = today.getFullYear();
      calMonth = today.getMonth();
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

  // Initialisation dynamique des puces de date (Aujourd'hui, Hier, Avant-hier)
  function initDynamicDateChips() {
    const now = new Date();
    const todayIso = formatIsoDate(now);

    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestIso = formatIsoDate(yest);

    const bYest = new Date(now);
    bYest.setDate(bYest.getDate() - 2);
    const bYestIso = formatIsoDate(bYest);

    const chips = document.querySelectorAll('.date-quick-chips .date-chip-btn[data-date]');
    if (chips.length >= 3) {
      chips[0].setAttribute('data-date', todayIso);
      chips[0].textContent = ` Aujourd'hui (${now.getDate()} ${MONTH_SHORT_FR[now.getMonth()]})`;
      chips[0].classList.add('active');

      chips[1].setAttribute('data-date', yestIso);
      chips[1].textContent = `Hier (${yest.getDate()} ${MONTH_SHORT_FR[yest.getMonth()]})`;
      chips[1].classList.remove('active');

      chips[2].setAttribute('data-date', bYestIso);
      chips[2].textContent = `Avant-hier (${bYest.getDate()} ${MONTH_SHORT_FR[bYest.getMonth()]})`;
      chips[2].classList.remove('active');
    }

    if (revenueDateInput) revenueDateInput.value = todayIso;
    if (dateFormattedText) dateFormattedText.textContent = formatFrenchDate(now);

    const expDate = document.getElementById('expenseDate');
    if (expDate) expDate.value = todayIso;
  }
  initDynamicDateChips();

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
      const editInput = document.getElementById('editingRevenueId');
      if (editInput) editInput.value = '';
      const titleEl = document.getElementById('revenueModalTitle');
      if (titleEl) titleEl.textContent = 'Enregistrer une Vente de Récolte';
      const btnText = document.getElementById('btnSubmitRevenueText');
      if (btnText) btnText.textContent = 'Encaisser la recette';

      modalRevenue.classList.remove('hidden');
      refreshRevenueLivePreview();
      renderCustomCalendar();
      if (revenueAmountInput) revenueAmountInput.focus();
    }
  }

  function openEditRevenueModal(revenueId) {
    if (!modalRevenue) return;
    const rev = (cachedRevenues || []).find(r => String(r.id) === String(revenueId));
    if (!rev) {
      showToast('️ Vente introuvable', 'Impossible de charger la vente à modifier.');
      return;
    }

    const editInput = document.getElementById('editingRevenueId');
    if (editInput) editInput.value = rev.id;
    const titleEl = document.getElementById('revenueModalTitle');
    if (titleEl) titleEl.textContent = 'Modifier la Vente de Récolte';
    const btnText = document.getElementById('btnSubmitRevenueText');
    if (btnText) btnText.textContent = 'Enregistrer les modifications';

    if (revenueAmountInput) {
      revenueAmountInput.value = Math.round(parseFloat(rev.amount) || 0);
    }

    if (rev.is_custom_crop) {
      setCropMode(true);
      if (revenueCustomCropInput) revenueCustomCropInput.value = rev.crop_name || '';
      if (revenueCustomOrigin && rev.custom_origin) revenueCustomOrigin.value = rev.custom_origin;
    } else {
      setCropMode(false);
      const cycleSelect = document.getElementById('revenueCycle');
      if (cycleSelect) cycleSelect.value = rev.crop_cycle_id || '';
    }

    if (revenuePaymentVal && rev.payment_method) {
      revenuePaymentVal.value = rev.payment_method;
      payCardOptions.forEach(card => {
        if (card.getAttribute('data-pay') === rev.payment_method) card.classList.add('active');
        else card.classList.remove('active');
      });
    }

    const qtyInput = document.getElementById('revenueQty');
    if (qtyInput) qtyInput.value = rev.quantity || '';

    const buyerInput = document.getElementById('revenueBuyer');
    if (buyerInput) buyerInput.value = rev.buyer_name || '';

    if (revenueDateInput && rev.revenue_date) {
      revenueDateInput.value = rev.revenue_date;
      if (dateFormattedText) {
        const d = new Date(rev.revenue_date);
        dateFormattedText.textContent = formatDateEnToutesLettres(d);
      }
    }

    modalRevenue.classList.remove('hidden');
    refreshRevenueLivePreview();
    if (revenueAmountInput) revenueAmountInput.focus();
  }

  function closeRevenueModal() {
    if (modalRevenue) {
      modalRevenue.classList.add('hidden');
      closeCalendarPopover();
      if (formAddRevenue) formAddRevenue.reset();
      const editInput = document.getElementById('editingRevenueId');
      if (editInput) editInput.value = '';
      const titleEl = document.getElementById('revenueModalTitle');
      if (titleEl) titleEl.textContent = 'Enregistrer une Vente de Récolte';
      const btnText = document.getElementById('btnSubmitRevenueText');
      if (btnText) btnText.textContent = 'Encaisser la recette';
      setCropMode(false);
    }
  }

  if (btnHeaderRevenue) {
    btnHeaderRevenue.addEventListener('click', (e) => {
      e.stopPropagation();
      openRevenueModal();
    });
  }
  if (btnCloseModalRevenue) {
    btnCloseModalRevenue.addEventListener('click', (e) => {
      e.stopPropagation();
      closeRevenueModal();
    });
  }
  if (btnCancelRevenue) {
    btnCancelRevenue.addEventListener('click', (e) => {
      e.stopPropagation();
      closeRevenueModal();
    });
  }
  if (modalRevenue) {
    modalRevenue.addEventListener('click', (e) => {
      if (e.target === modalRevenue) closeRevenueModal();
    });
  }

  // Soumission et enregistrement de la recette
  if (formAddRevenue) {
    formAddRevenue.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editingId = document.getElementById('editingRevenueId') ? document.getElementById('editingRevenueId').value : '';
      const amountVal = revenueAmountInput ? revenueAmountInput.value : '0';
      const numericAmount = parseInt(amountVal, 10) || 0;

      // Déterminer le libellé du produit
      let finalCropName = 'Récolte';
      let originVal = 'garden';
      let revenueCropCycleId = null;
      if (isCustomCropMode) {
        const customVal = revenueCustomCropInput ? revenueCustomCropInput.value.trim() : '';
        const originSelect = document.getElementById('revenueCustomOrigin');
        originVal = originSelect ? originSelect.value : 'garden';
        const originText = originSelect ? originSelect.options[originSelect.selectedIndex].text.split('/')[0].trim() : 'Hors parcelle';
        finalCropName = customVal ? `${customVal} (${originText})` : `Autre vente libre (${originText})`;
      } else {
        const cycleSelect = document.getElementById('revenueCycle');
        const cycleVal = cycleSelect ? cycleSelect.value : '';
        if (cycleVal && cycleVal !== 'custom') {
          revenueCropCycleId = cycleVal;
          finalCropName = cycleSelect.options[cycleSelect.selectedIndex].text.split('(')[0].trim();
        } else {
          finalCropName = 'Récolte hors parcelle';
        }
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
          if (editingId) {
            // Mode Modification
            const { error } = await supabaseClient.from('revenues').update({
              crop_cycle_id: revenueCropCycleId,
              amount: numericAmount,
              crop_name: finalCropName,
              is_custom_crop: isCustomCropMode,
              custom_origin: isCustomCropMode ? originVal : null,
              payment_method: currentPayMethod,
              quantity: qty,
              buyer_name: buyer,
              revenue_date: rawDate
            }).eq('id', editingId);

            if (error) {
              console.error('Erreur Supabase update revenue:', error);
            } else {
              console.log(' Recette mise à jour dans Supabase');
            }
          } else {
            // Mode Ajout
            const { error } = await supabaseClient.from('revenues').insert([{
              profile_id: currentProfileKey,
              crop_cycle_id: revenueCropCycleId,
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
              console.log(' Recette enregistrée dans Supabase');
            }
          }
        } catch (err) {
          console.warn('Erreur réseau enregistrement recette :', err);
        }
      }

      await syncFinancialsFromSupabase(currentProfileKey);
      const { formattedMargin, formattedRev } = updateFinancialMetrics();

      closeRevenueModal();
      showToast(
        editingId ? 'Vente modifiée' : 'Vente ajoutée',
        `+${new Intl.NumberFormat('fr-FR').format(numericAmount)} F CFA • Recettes : ${formattedRev} F • Marge : ${formattedMargin}.`
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

  if (roleSelector) {
    roleSelector.addEventListener('change', async (e) => {
      const newRole = e.target.value;
      userManualCommuneKey = null;
      renderProfile(newRole);
      syncFinancialsFromSupabase(newRole);
      syncCropCyclesFromSupabase(newRole);
      syncSubscriptionStatusFromSupabase(newRole);
      fetchFinancements();
      fetchConseils();
      fetchModelesCultures().catch(() => {});
      fetchUserParcels(newRole).catch(() => {});
      loadAndRenderWeather();
      showToast('Profil actualisé', `Bascule vers le profil : ${PROFILES_DATA[newRole]?.name || newRole}`);
    });
  }

  if (stateSelector) {
    stateSelector.addEventListener('change', (e) => {
      applyUIState(e.target.value);
    });
  }

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

  // ==========================================
  // MODULE MÉTÉO AGRICOLE RÉELLE (OPEN-METEO)
  // ==========================================
  const COMMUNE_COORDS = {
    ouagadougou: { name: 'Ouagadougou', region: 'Centre (Kadiogo)', lat: 12.37, lon: -1.52 },
    'bobo-dioulasso': { name: 'Bobo-Dioulasso', region: 'Hauts-Bassins (Houet)', lat: 11.18, lon: -4.29 },
    koudougou: { name: 'Koudougou', region: 'Centre-Ouest (Boulkiemdé)', lat: 12.25, lon: -2.36 },
    ouahigouya: { name: 'Ouahigouya', region: 'Nord (Yatenga)', lat: 13.58, lon: -2.42 },
    dedougou: { name: 'Dédougou', region: 'Boucle du Mouhoun (Mouhoun)', lat: 12.46, lon: -3.46 },
    banfora: { name: 'Banfora', region: 'Cascades (Comoé)', lat: 10.63, lon: -4.76 },
    kaya: { name: 'Kaya', region: 'Centre-Nord (Sanmatenga)', lat: 13.09, lon: -1.08 },
    'fada-ngourma': { name: "Fada N'Gourma", region: 'Est (Gourma)', lat: 12.06, lon: 0.36 }
  };

  function getProfileCommuneKey(pKey) {
    const key = pKey || currentProfileKey;
    let loc = PROFILES_DATA[key]?.location || '';
    if (!loc) {
      try {
        const saved = JSON.parse(localStorage.getItem('revolution_session_user') || '{}');
        loc = saved.location || '';
      } catch (e) {}
    }
    const clean = (loc || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (clean.includes('koudougou')) return 'koudougou';
    if (clean.includes('bobo') || clean.includes('dioulasso')) return 'bobo-dioulasso';
    if (clean.includes('ouahigouya')) return 'ouahigouya';
    if (clean.includes('dedougou')) return 'dedougou';
    if (clean.includes('banfora')) return 'banfora';
    if (clean.includes('kaya')) return 'kaya';
    if (clean.includes('fada') || clean.includes('ngourma')) return 'fada-ngourma';
    if (clean.includes('ouaga')) return 'ouagadougou';
    return 'ouagadougou';
  }

  function findCommuneKey(locationStr) {
    if (userManualCommuneKey && COMMUNE_COORDS[userManualCommuneKey]) {
      return userManualCommuneKey;
    }
    if (locationStr) {
      const clean = locationStr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (clean.includes('koudougou')) return 'koudougou';
      if (clean.includes('bobo') || clean.includes('dioulasso')) return 'bobo-dioulasso';
      if (clean.includes('ouahigouya')) return 'ouahigouya';
      if (clean.includes('dedougou')) return 'dedougou';
      if (clean.includes('banfora')) return 'banfora';
      if (clean.includes('kaya')) return 'kaya';
      if (clean.includes('fada') || clean.includes('ngourma')) return 'fada-ngourma';
      if (clean.includes('ouaga')) return 'ouagadougou';
    }
    return getProfileCommuneKey();
  }

  function getWindCompass(deg) {
    if (deg === undefined || deg === null) return 'Variable';
    const directions = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  }

  function getWeatherMeta(code) {
    const c = Number(code);
    if (c === 0) return { icon: '️', label: 'Ciel dégagé / Ensoleillé' };
    if (c === 1 || c === 2) return { icon: '️', label: 'Éclaircies' };
    if (c === 3) return { icon: '️', label: 'Couvert' };
    if (c === 45 || c === 48) return { icon: '️', label: 'Brume / Poussière' };
    if (c >= 51 && c <= 57) return { icon: '️', label: 'Bruine légère' };
    if (c >= 61 && c <= 67) return { icon: '️', label: 'Pluie' };
    if (c >= 71 && c <= 77) return { icon: '️', label: 'Grêle / Neige' };
    if (c >= 80 && c <= 82) return { icon: '️', label: 'Averses' };
    if (c >= 95 && c <= 99) return { icon: '️', label: 'Orage violent' };
    return { icon: '', label: 'Partiellement nuageux' };
  }

  function computeWeatherAlerts(current, todayDaily) {
    const alerts = [];
    if (!current && !todayDaily) return alerts;

    const rainSum = todayDaily ? (Number(todayDaily.rainSum) || 0) : 0;
    const rainProb = todayDaily ? (Number(todayDaily.rainProb) || 0) : 0;
    const tempCurrent = current ? (Number(current.temperature) || 0) : 0;
    const tempMax = todayDaily ? (Number(todayDaily.tempMax) || tempCurrent) : tempCurrent;
    const gusts = current ? (Number(current.gusts) || 0) : 0;
    const gustsMax = todayDaily ? (Number(todayDaily.gustsMax) || gusts) : gusts;

    // 1. Forte pluie : plus de 20 mm prévus dans la journée, ou probabilité de pluie de 70 % ou plus
    if (rainSum > 20 || rainProb >= 70) {
      alerts.push({
        type: 'danger',
        level: 'Forte pluie',
        icon: '️',
        message: "Pluie prévue : reportez les traitements et l'irrigation."
      });
    }

    // 2. Forte chaleur : 40 °C ou plus
    if (tempCurrent >= 40 || tempMax >= 40) {
      alerts.push({
        type: 'warning',
        level: 'Forte chaleur',
        icon: '️',
        message: "Forte chaleur : arrosez tôt le matin ou le soir, protégez les jeunes plants."
      });
    }

    // 3. Vent fort : rafales de 40 km/h ou plus (wind_gusts_10m_max)
    if (gusts >= 40 || gustsMax >= 40) {
      alerts.push({
        type: 'warning',
        level: 'Vent fort',
        icon: '',
        message: "Vent fort : évitez les pulvérisations."
      });
    }

    return alerts;
  }

  // 1. « CE QUE ÇA VEUT DIRE POUR VOUS » — Interprétation agronomique simple
  function computeFarmerInterpretation(current, daily) {
    const today = (daily && daily[0]) || {};

    const rainProb = Number(today.rainProb ?? 0);
    const rainSum = Number(today.rainSum ?? 0);
    const tempMax = Number(today.tempMax ?? (current?.temperature ?? 30));
    const gustsMax = Number(today.gustsMax ?? (current?.gusts ?? 0));
    const currentGusts = Number(current?.gusts ?? 0);
    const humidity = Number(current?.humidity ?? 40);

    const redReasons = [];
    const orangeReasons = [];
    const adviceList = [];

    // PLUIE
    if (rainSum >= 30) {
      redReasons.push('très forte pluie');
      adviceList.push({
        icon: '️',
        category: 'Pluie',
        text: 'Très forte pluie : protégez les semis et vérifiez que l\'eau s\'écoule bien.'
      });
    } else if (rainProb >= 60 || rainSum >= 10) {
      orangeReasons.push('bonne pluie attendue');
      adviceList.push({
        icon: '️',
        category: 'Pluie',
        text: 'Bonne pluie attendue : pas besoin d\'arroser. Ne traitez pas et n\'épandez pas d\'engrais juste avant la pluie.'
      });
    } else if ((rainProb >= 20 && rainProb <= 59) || (rainSum >= 1 && rainSum <= 9)) {
      adviceList.push({
        icon: '️',
        category: 'Pluie',
        text: 'Petite pluie possible, pas assez pour remplacer l\'arrosage.'
      });
    } else {
      adviceList.push({
        icon: '️',
        category: 'Pluie',
        text: 'Pas de pluie attendue : prévoyez d\'arroser.'
      });
    }

    // CHALEUR
    if (tempMax >= 40) {
      redReasons.push(`forte chaleur (${tempMax} °C)`);
      adviceList.push({
        icon: '',
        category: 'Chaleur',
        text: 'Très forte chaleur : arrosez matin et soir, paillez le sol, protégez les jeunes plants.'
      });
    } else if (tempMax >= 35 && tempMax <= 39) {
      orangeReasons.push(`chaleur (${tempMax} °C)`);
      adviceList.push({
        icon: '️',
        category: 'Chaleur',
        text: 'Il fera chaud : arrosez tôt le matin (avant 9 h) ou après 17 h.'
      });
    }

    // VENT
    const maxGust = Math.max(gustsMax, currentGusts);
    if (maxGust >= 40) {
      redReasons.push(`vent fort (rafales ${maxGust} km/h)`);
      adviceList.push({
        icon: '',
        category: 'Vent',
        text: 'Vent fort : ne pulvérisez pas, attachez les tuteurs et les bâches.'
      });
    } else if (maxGust >= 25 && maxGust <= 39) {
      orangeReasons.push('vent gênant pour pulvériser');
      adviceList.push({
        icon: '',
        category: 'Vent',
        text: 'Vent : évitez de pulvériser les produits.'
      });
    }

    // HUMIDITÉ
    const isHumid2Days = humidity >= 80 || (daily && daily.length > 1 && (daily[0].rainProb >= 50 || humidity >= 75) && (daily[1].rainProb >= 50 || daily[1].rainSum >= 5));
    if (humidity >= 80 || isHumid2Days) {
      orangeReasons.push('temps humide');
      adviceList.push({
        icon: '',
        category: 'Humidité',
        text: 'Temps humide : surveillez les taches et moisissures sur les feuilles.'
      });
    }

    // S'assurer d'avoir au moins 2 conseils
    if (adviceList.length < 2) {
      if (maxGust < 25) {
        adviceList.push({
          icon: '',
          category: 'Travaux',
          text: 'Temps calme : conditions idéales pour le sarclage et l\'entretien.'
        });
      } else {
        adviceList.push({
          icon: '',
          category: 'Travaux',
          text: 'Conditions favorables pour les travaux du sol.'
        });
      }
    }

    // Résolution du voyant et de la phrase
    let level = 'green';
    let headline = 'Bonne journée pour travailler au champ.';

    if (redReasons.length > 0) {
      level = 'red';
      headline = `Journée difficile : ${redReasons.join(', ')}.`;
    } else if (orangeReasons.length > 0) {
      level = 'orange';
      headline = `Journée à surveiller : ${orangeReasons.join(', ')}.`;
    }

    return {
      level,
      headline,
      adviceList
    };
  }

  // 2. CONSEIL DE LA SEMAINE
  function computeWeeklyAdvice(daily) {
    if (!daily || daily.length === 0) return 'Organisez vos travaux en fonction des prévisions quotidiennes.';

    // Le meilleur jour pour traiter = pluie < 20 % et rafales < 25 km/h
    const treatDays = [];
    daily.slice(0, 7).forEach((d) => {
      const pRain = Number(d.rainProb ?? 0);
      const sRain = Number(d.rainSum ?? 0);
      const gWind = Number(d.gustsMax ?? d.windMax ?? 0);
      if (pRain < 20 && sRain < 1 && gWind < 25) {
        treatDays.push(d.dayName.toLowerCase());
      }
    });

    const totalRain = daily.reduce((sum, d) => sum + Number(d.rainSum || 0), 0);
    const maxRainProb = Math.max(...daily.map(d => Number(d.rainProb || 0)));

    if (treatDays.length >= 1 && treatDays.length <= 3) {
      return `Meilleurs jours pour traiter : ${treatDays.join(' et ')} (pas de pluie, peu de vent).`;
    } else if (treatDays.length > 3) {
      if (totalRain < 1 && maxRainProb < 20) {
        return 'Pas de pluie prévue cette semaine : organisez votre arrosage.';
      }
      return `Meilleurs jours pour traiter : ${treatDays.slice(0, 2).join(', ')} et ${treatDays[2]} (temps calme et sec).`;
    } else {
      if (totalRain >= 10 || maxRainProb >= 60) {
        return 'Semaine pluvieuse attendue : évitez les traitements et surveillez l\'écoulement de l\'eau.';
      }
      return 'Vent fréquent cette semaine : surveillez les créneaux très calmes à l\'aube pour traiter.';
    }
  }

  // 3. BADGES DES PRÉVISIONS (Harmonisés avec « Ce que ça veut dire pour vous »)
  function computeForecastDayBadge(day, idx, todayInterp) {
    // Règle 1 : Aujourd'hui (idx === 0) doit avoir la même couleur et statut que l'encadré
    if (idx === 0 && todayInterp) {
      const lvl = todayInterp.level; // 'green', 'orange', 'red'
      let text = 'Travaux favorables';
      if (lvl === 'red') text = 'Journée difficile';
      else if (lvl === 'orange') text = 'À surveiller';
      return {
        level: lvl,
        text: text,
        badgeClass: `recom-${lvl}`
      };
    }

    const rainSum = Number(day?.rainSum ?? 0);
    const rainProb = Number(day?.rainProb ?? 0);
    const tempMax = Number(day?.tempMax ?? 30);
    const gusts = Number(day?.gustsMax ?? day?.windMax ?? 0);

    // ROUGE : très forte pluie (≥ 30 mm), forte chaleur (≥ 40 °C), vent fort (≥ 40 km/h)
    if (rainSum >= 30 || tempMax >= 40 || gusts >= 40) {
      return {
        level: 'red',
        text: 'Journée difficile',
        badgeClass: 'recom-red'
      };
    }

    // ORANGE : bonne pluie (≥ 60 % ou ≥ 10 mm), chaleur (35–39 °C), vent gênant (25–39 km/h)
    if (rainProb >= 60 || rainSum >= 10 || (tempMax >= 35 && tempMax <= 39) || (gusts >= 25 && gusts <= 39)) {
      return {
        level: 'orange',
        text: 'À surveiller',
        badgeClass: 'recom-orange'
      };
    }

    // VERT : Travaux favorables
    return {
      level: 'green',
      text: 'Travaux favorables',
      badgeClass: 'recom-green'
    };
  }

  // 4. SYNTHÈSE VOCALE (speechSynthesis)
  let activeWeatherSpeechBtn = null;

  function stopWeatherSpeech() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    if (activeWeatherSpeechBtn) {
      activeWeatherSpeechBtn.innerHTML = ' <span>Écouter</span>';
      activeWeatherSpeechBtn.classList.remove('speaking');
      activeWeatherSpeechBtn = null;
    }
  }

  function speakWeatherInterpretation(interp, btnElement) {
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking && activeWeatherSpeechBtn === btnElement) {
      stopWeatherSpeech();
      return;
    }

    stopWeatherSpeech();

    const adviceTexts = (interp.adviceList || []).map(a => a.text).join('. ');
    const speechText = `Météo agricole. ${interp.headline}. ${adviceTexts}.`;

    try {
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9; // Vitesse lente 0.9

      utterance.onstart = () => {
        activeWeatherSpeechBtn = btnElement;
        btnElement.innerHTML = '⏹️ <span>Arrêter</span>';
        btnElement.classList.add('speaking');
      };

      utterance.onend = () => {
        stopWeatherSpeech();
      };

      utterance.onerror = () => {
        stopWeatherSpeech();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Erreur synthèse vocale :', err);
      stopWeatherSpeech();
    }
  }

  function getWeatherInterpretationBoxHtml(interp, btnId) {
    const speechSupported = ('speechSynthesis' in window);
    return `
      <div class="wi-header-row">
        <div class="wi-title-wrap">
          <span class="wi-status-light light-${interp.level}"></span>
          <span class="wi-title">Ce que ça veut dire pour vous</span>
        </div>
        ${speechSupported ? `
          <button type="button" class="wi-listen-btn" id="${btnId}" aria-label="Écouter les conseils météo" title="Écouter à voix haute">
             <span>Écouter</span>
          </button>
        ` : ''}
      </div>
      <div class="wi-headline">${interp.headline}</div>
      <ul class="wi-advice-list">
        ${interp.adviceList.map(a => `
          <li class="wi-advice-item">
            <span class="wi-advice-icon">${a.icon}</span>
            <span>${a.text}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  async function fetchOpenMeteoData(communeKey, forceRefresh = false) {
    const cacheKey = `revolution_weather_cache_v4_${communeKey}`;
    const cachedRaw = localStorage.getItem(cacheKey);

    if (!forceRefresh && cachedRaw) {
      try {
        const parsed = JSON.parse(cachedRaw);
        // Cache de 1 heure (3600000 ms)
        if (Date.now() - parsed.timestamp < 3600000 && parsed.daily && parsed.daily.length > 0) {
          parsed.isFromCache = true;
          cachedWeatherResult = parsed;
          return parsed;
        }
      } catch (e) {}
    }

    const coord = COMMUNE_COORDS[communeKey] || COMMUNE_COORDS.ouagadougou;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=Africa%2FOuagadougou`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const now = new Date();
      const updateTimeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      const weatherRes = {
        communeKey: communeKey,
        communeName: coord.name,
        regionName: coord.region,
        updateTime: updateTimeStr,
        timestamp: Date.now(),
        isFromCache: false,
        current: {
          temperature: Math.round(json.current?.temperature_2m ?? 31),
          humidity: Math.round(json.current?.relative_humidity_2m ?? 42),
          windSpeed: Math.round(json.current?.wind_speed_10m ?? 14),
          windDirection: getWindCompass(json.current?.wind_direction_10m),
          windDegrees: json.current?.wind_direction_10m ?? 0,
          gusts: Math.round(json.current?.wind_gusts_10m ?? 18),
          weatherCode: json.current?.weather_code ?? 1,
          meta: getWeatherMeta(json.current?.weather_code ?? 1)
        },
        daily: (json.daily?.time || []).map((dateStr, idx) => {
          const [y, m, d] = dateStr.split('-').map(Number);
          const dayDate = new Date(y, m - 1, d);
          return {
            dateStr: dateStr,
            dayName: idx === 0 ? "Aujourd'hui" : DAY_NAMES_FR[dayDate.getDay()],
            shortDay: idx === 0 ? "Auj." : SHORT_DAYS_FR[dayDate.getDay()],
            formattedDate: `${dayDate.getDate()} ${SHORT_MONTHS_FR[dayDate.getMonth()]}`,
            weatherCode: json.daily.weather_code[idx],
            meta: getWeatherMeta(json.daily.weather_code[idx]),
            tempMax: Math.round(json.daily.temperature_2m_max[idx]),
            tempMin: Math.round(json.daily.temperature_2m_min[idx]),
            rainSum: Number(json.daily.precipitation_sum[idx] || 0),
            rainProb: Math.round(json.daily.precipitation_probability_max[idx] || 0),
            windMax: Math.round(json.daily.wind_speed_10m_max[idx] || 0),
            gustsMax: Math.round(json.daily.wind_gusts_10m_max[idx] || 0)
          };
        })
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify(weatherRes));
      } catch (e) {}

      cachedWeatherResult = weatherRes;
      return weatherRes;
    } catch (err) {
      console.warn('️ Erreur Open-Meteo, chargement du cache hors-ligne :', err);
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw);
          parsed.isFallback = true;
          cachedWeatherResult = parsed;
          return parsed;
        } catch (e) {}
      }

      // Secours gracieux si aucune donnée en cache
      const now = new Date();
      const updateTimeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const fallbackRes = {
        communeKey: communeKey,
        communeName: coord.name,
        regionName: coord.region,
        updateTime: updateTimeStr,
        timestamp: Date.now(),
        isFallback: true,
        current: {
          temperature: 32,
          humidity: 40,
          windSpeed: 14,
          windDirection: 'Nord-Est',
          gusts: 20,
          weatherCode: 1,
          meta: getWeatherMeta(1)
        },
        daily: [0, 1, 2, 3, 4, 5, 6].map(i => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return {
            dateStr: d.toISOString().split('T')[0],
            dayName: i === 0 ? "Aujourd'hui" : DAY_NAMES_FR[d.getDay()],
            shortDay: i === 0 ? "Auj." : SHORT_DAYS_FR[d.getDay()],
            formattedDate: `${d.getDate()} ${SHORT_MONTHS_FR[d.getMonth()]}`,
            weatherCode: 1,
            meta: getWeatherMeta(1),
            tempMax: 34,
            tempMin: 23,
            rainSum: 0,
            rainProb: 10,
            windMax: 16,
            gustsMax: 22
          };
        })
      };
      cachedWeatherResult = fallbackRes;
      return fallbackRes;
    }
  }

  function renderDashboardWeatherCard(weatherRes) {
    if (!weatherRes) return;

    const subEl = document.getElementById('dashWeatherCommuneSub');
    if (subEl) {
      subEl.textContent = `Commune de ${weatherRes.communeName}${weatherRes.isFallback ? ' (Hors-ligne)' : ''}`;
    }

    const iconEl = document.getElementById('dashWeatherIcon');
    if (iconEl) iconEl.textContent = weatherRes.current.meta.icon;

    const tempEl = document.getElementById('dashWeatherTemp');
    if (tempEl) tempEl.textContent = `${weatherRes.current.temperature} °C`;

    const descEl = document.getElementById('dashWeatherDesc');
    if (descEl) descEl.textContent = weatherRes.current.meta.label;

    const rainMetric = document.getElementById('dashWeatherMetricRain');
    if (rainMetric) {
      const todayDaily = weatherRes.daily[0];
      rainMetric.textContent = `${todayDaily?.rainProb ?? 0} % (${todayDaily?.rainSum ?? 0} mm)`;
    }

    const windMetric = document.getElementById('dashWeatherMetricWind');
    if (windMetric) {
      windMetric.textContent = `${weatherRes.current.windSpeed} km/h • ${weatherRes.current.windDirection}`;
    }

    const humidityMetric = document.getElementById('dashWeatherMetricHumidity');
    if (humidityMetric) {
      humidityMetric.textContent = `${weatherRes.current.humidity} %`;
    }

    const sourceTag = document.getElementById('dashWeatherSourceTag');
    if (sourceTag) {
      sourceTag.textContent = `Source : Open-Meteo • ${weatherRes.communeName} (${weatherRes.regionName})`;
    }

    const syncTime = document.getElementById('dashWeatherSyncTime');
    if (syncTime) {
      syncTime.textContent = `MAJ ${weatherRes.updateTime}`;
    }

    // Gestion du bandeau d'alerte automatique (forte pluie, chaleur, vent)
    const alerts = computeWeatherAlerts(weatherRes.current, weatherRes.daily[0]);
    const alertBanner = document.getElementById('dashWeatherAlertBanner');
    const alertText = document.getElementById('dashWeatherAlertText');
    if (alertBanner && alertText) {
      if (alerts.length > 0) {
        const topAlert = alerts[0];
        alertBanner.className = `weather-alert-banner alert-${topAlert.type}`;
        alertText.textContent = `${topAlert.icon} ${topAlert.message}`;
        alertBanner.classList.remove('hidden');
      } else {
        alertBanner.classList.add('hidden');
      }
    }

    // Encadré « Ce que ça veut dire pour vous » (Tableau de bord)
    const interp = computeFarmerInterpretation(weatherRes.current, weatherRes.daily);
    const interpBox = document.getElementById('dashWeatherInterpretation');
    if (interpBox) {
      interpBox.className = `weather-interpretation-box level-${interp.level}`;
      interpBox.innerHTML = getWeatherInterpretationBoxHtml(interp, 'btnListenDashWeather');
      const b = document.getElementById('btnListenDashWeather');
      if (b) {
        b.onclick = (e) => {
          e.stopPropagation();
          speakWeatherInterpretation(interp, b);
        };
      }
    }

    // Conseil de la semaine (Tableau de bord)
    const weeklyAdvice = computeWeeklyAdvice(weatherRes.daily);
    const weeklyBox = document.getElementById('dashWeatherWeeklyAdvice');
    if (weeklyBox) {
      weeklyBox.innerHTML = `
        <span class="wab-icon"></span>
        <div><strong>Conseil de la semaine :</strong> <span>${weeklyAdvice}</span></div>
      `;
    }

    // Grille prévisions 7 jours du tableau de bord
    const grid = document.getElementById('dashWeatherForecastGrid');
    if (grid && weatherRes.daily) {
      grid.innerHTML = weatherRes.daily.slice(0, 7).map((d, i) => `
        <div class="forecast-day-cell ${i === 0 ? 'today' : ''}" style="text-align: center; padding: 6px 4px; border-radius: 8px; background: ${i === 0 ? '#EAF4E6' : '#F6F8F4'}; min-width: 50px;">
          <span class="day-name" style="font-size: 11px; font-weight: 800; color: #1E2822; display: block;">${d.shortDay}</span>
          <span class="day-icon" style="font-size: 20px; display: block; margin: 2px 0;">${d.meta.icon}</span>
          <span class="day-temp" style="font-size: 11.5px; display: block;"><strong>${d.tempMax}°</strong> <small style="color: #7C8781;">${d.tempMin}°</small></span>
          <span class="day-rain" style="font-size: 10px; color: ${d.rainProb >= 40 ? '#0A66C2' : '#2E7D32'}; font-weight: 700; display: block;">${d.rainProb}%</span>
          <span style="font-size: 9px; color: #8C998F; display: block;">${d.rainSum}mm</span>
        </div>
      `).join('');
    }

    // Mise à jour dynamique de la carte météo courte d'accueil (Point 2)
    const homeTemp = document.getElementById('homeWeatherTemp');
    if (homeTemp) homeTemp.textContent = `${weatherRes.current.temperature} °C`;

    const homeCity = document.getElementById('homeWeatherCity');
    if (homeCity) homeCity.textContent = weatherRes.communeName;

    const homeTomorrow = document.getElementById('homeWeatherTomorrowVal');
    if (homeTomorrow && weatherRes.daily && weatherRes.daily[1]) {
      const tom = weatherRes.daily[1];
      homeTomorrow.textContent = `${tom.tempMax} °C • ${tom.meta?.label || 'Ensoleillé'}`;
    }

    const homeAdvice = document.getElementById('homeWeatherAdvice');
    if (homeAdvice) {
      homeAdvice.textContent = getAgronomicWeatherSentence(weatherRes);
    }
  }

  function renderMeteoPage(weatherRes) {
    if (!weatherRes) return;

    const locSub = document.getElementById('meteoPageLocationSub');
    if (locSub) {
      locSub.textContent = `Commune de ${weatherRes.communeName} • Région ${weatherRes.regionName} • Fuseau Africa/Ouagadougou`;
    }

    const select = document.getElementById('selectMeteoCommune');
    if (select) {
      select.value = weatherRes.communeKey;
    }

    // Bandeau d'alerte sur la page météo
    const alerts = computeWeatherAlerts(weatherRes.current, weatherRes.daily[0]);
    const alertBanner = document.getElementById('meteoPageAlertBanner');
    const alertText = document.getElementById('meteoPageAlertText');
    if (alertBanner && alertText) {
      if (alerts.length > 0) {
        const topAlert = alerts[0];
        alertBanner.className = `weather-alert-banner alert-${topAlert.type}`;
        alertText.textContent = `${topAlert.icon} ${topAlert.message}`;
        alertBanner.classList.remove('hidden');
      } else {
        alertBanner.classList.add('hidden');
      }
    }

    // Hero Card
    const heroIcon = document.getElementById('meteoHeroIcon');
    if (heroIcon) heroIcon.textContent = weatherRes.current.meta.icon;

    const heroTemp = document.getElementById('meteoHeroTemp');
    if (heroTemp) heroTemp.textContent = `${weatherRes.current.temperature} °C`;

    const heroDesc = document.getElementById('meteoHeroDesc');
    if (heroDesc) heroDesc.textContent = weatherRes.current.meta.label;

    const heroUpdate = document.getElementById('meteoHeroUpdateInfo');
    if (heroUpdate) {
      heroUpdate.textContent = `Dernière mise à jour réelle : ${weatherRes.updateTime}${weatherRes.isFallback ? ' (Hors-ligne)' : ''}`;
    }

    const today = weatherRes.daily[0] || {};
    const tRange = document.getElementById('meteoMetricTempRange');
    if (tRange) tRange.textContent = `${today.tempMax ?? weatherRes.current.temperature}° / ${today.tempMin ?? 22}°`;

    const mHum = document.getElementById('meteoMetricHumidity');
    if (mHum) mHum.textContent = `${weatherRes.current.humidity} %`;

    const gusts = today.gustsMax || weatherRes.current.gusts || 0;
    const mWind = document.getElementById('meteoMetricWind');
    if (mWind) mWind.textContent = `Vent ${weatherRes.current.windSpeed} km/h • Rafales ${gusts} km/h`;

    const mGusts = document.getElementById('meteoMetricGusts');
    if (mGusts) mGusts.textContent = `Direction : ${weatherRes.current.windDirection}`;

    const mRain = document.getElementById('meteoMetricRain');
    if (mRain) mRain.textContent = `${today.rainSum ?? 0} mm`;

    const mRainProb = document.getElementById('meteoMetricRainProb');
    if (mRainProb) mRainProb.textContent = `Probabilité : ${today.rainProb ?? 0} %`;

    // Encadré « Ce que ça veut dire pour vous » (Page Météo)
    const interp = computeFarmerInterpretation(weatherRes.current, weatherRes.daily);
    const interpBox = document.getElementById('meteoPageInterpretation');
    if (interpBox) {
      interpBox.className = `weather-interpretation-box level-${interp.level}`;
      interpBox.innerHTML = getWeatherInterpretationBoxHtml(interp, 'btnListenMeteoPage');
      const b = document.getElementById('btnListenMeteoPage');
      if (b) {
        b.onclick = (e) => {
          e.stopPropagation();
          speakWeatherInterpretation(interp, b);
        };
      }
    }

    // Conseil de la semaine (Page Météo)
    const weeklyAdvice = computeWeeklyAdvice(weatherRes.daily);
    const weeklyBox = document.getElementById('meteoPageWeeklyAdvice');
    if (weeklyBox) {
      weeklyBox.innerHTML = `
        <span class="wab-icon"></span>
        <div><strong>Conseil de la semaine :</strong> <span>${weeklyAdvice}</span></div>
      `;
    }

    // Grille 7 jours détaillée
    const grid7 = document.getElementById('meteoPage7DaysGrid');
    if (grid7 && weatherRes.daily) {
      grid7.innerHTML = weatherRes.daily.map((d, idx) => {
        const badge = computeForecastDayBadge(d, idx, interp);

        return `
          <div class="meteo-day-card ${idx === 0 ? 'today' : ''}">
            <div class="meteo-day-header">
              <span class="meteo-day-title">${d.dayName}</span>
              <span class="meteo-day-date">${d.formattedDate}</span>
            </div>
            <div class="meteo-day-icon">${d.meta.icon}</div>
            <div class="meteo-day-temps">
              <span class="meteo-t-max">${d.tempMax}°</span>
              <span class="meteo-t-min">${d.tempMin}°</span>
            </div>
            <div class="meteo-day-rain ${d.rainProb >= 40 ? 'has-rain' : ''}">
               ${d.rainProb}% (${d.rainSum} mm)
            </div>
            <div class="meteo-day-wind">
               ${d.windMax} km/h
            </div>
            <div class="badge-agri-recom ${badge.badgeClass}">
              ${badge.text}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  async function loadAndRenderWeather(forceRefresh = false) {
    // La météo du tableau de bord utilise par défaut la commune du profil de l'utilisateur
    const dashCommuneKey = getProfileCommuneKey();
    const meteoPageCommuneKey = userManualCommuneKey || dashCommuneKey;

    const dashWeather = await fetchOpenMeteoData(dashCommuneKey, forceRefresh);
    cachedWeatherResult = dashWeather;
    renderDashboardWeatherCard(dashWeather);

    if (meteoPageCommuneKey !== dashCommuneKey) {
      const meteoWeather = await fetchOpenMeteoData(meteoPageCommuneKey, forceRefresh);
      if (currentRoutePage === 'meteo') {
        renderMeteoPage(meteoWeather);
      }
    } else {
      if (currentRoutePage === 'meteo') {
        renderMeteoPage(dashWeather);
      }
    }

    if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
      renderMobileView();
    }
    return dashWeather;
  }

  // Écouteurs Météo Bureau
  const selectMeteoCommune = document.getElementById('selectMeteoCommune');
  if (selectMeteoCommune) {
    selectMeteoCommune.addEventListener('change', async (e) => {
      userManualCommuneKey = e.target.value;
      await loadAndRenderWeather(true);
      showToast('Commune actualisée', `Météo chargée pour ${COMMUNE_COORDS[userManualCommuneKey]?.name}`);
    });
  }

  const btnRefreshMeteoPage = document.getElementById('btnRefreshMeteoPage');
  if (btnRefreshMeteoPage) {
    btnRefreshMeteoPage.addEventListener('click', async () => {
      await loadAndRenderWeather(true);
      showToast('Météo actualisée', 'Données Open-Meteo synchronisées en direct.');
    });
  }

  const btnQuickRefreshDashWeather = document.getElementById('btnQuickRefreshDashWeather');
  if (btnQuickRefreshDashWeather) {
    btnQuickRefreshDashWeather.addEventListener('click', async () => {
      await loadAndRenderWeather(true);
      showToast('Météo actualisée', 'Données Open-Meteo synchronisées en direct.');
    });
  }

  // ==========================================
  // MODULE FINANCEMENTS & ADMINISTRATION (SUPABASE CONNECTÉ)
  // ==========================================

  // 1. Navigation & Routing (Système Unifié Multi-Plateforme)
  const ROUTE_ALIASES = {
    '': 'dashboard',
    'dashboard': 'dashboard',
    'synthese': 'synthese',
    'exploitation-synthese': 'synthese',
    'toutes-echeances': 'synthese',
    'parcelles': 'parcelles',
    'exploitation-parcelles': 'parcelles',
    'cycles': 'cycles',
    'exploitation-cycles': 'cycles',
    'finances': 'finances',
    'exploitation-finances': 'finances',
    'opportunites': 'opportunites',
    'financements': 'opportunites',
    'conseils': 'conseils',
    'meteo': 'meteo',
    'meteo-details': 'meteo',
    'marche': 'marche',
    'annonces': 'marche',
    'materiel-services': 'materiel-services',
    'materiel': 'materiel-services',
    'mes-annonces': 'mes-annonces',
    'notifications': 'notifications',
    'admin-financements': 'admin-financements',
    'admin-conseils': 'admin-conseils',
    'admin-utilisateurs': 'admin-utilisateurs',
    'admin-users': 'admin-utilisateurs',
    'utilisateurs': 'admin-utilisateurs',
    'admin-modeles': 'admin-modeles',
    'admin-etapes': 'admin-etapes',
    'plans-suivi': 'admin-etapes',
    'admin-materiels': 'admin-materiels',
    'admin-queue': 'admin-queue',
    'admin-moderation': 'admin-queue',
    'admin-verif': 'admin-verif',
    'admin-audit': 'admin-audit',
    'formations': 'formations',
    'profil': 'profil',
    'parametres': 'parametres',
    'settings': 'parametres',
    'abonnements': 'abonnements',
    'pricing': 'abonnements',
    'installer': 'installer',
    'install': 'installer',
    'reset-password': 'reset-password',
    'nouveau-mot-de-passe': 'reset-password'
  };

  const VALID_PAGES = new Set([
    'dashboard', 'synthese', 'parcelles', 'cycles', 'finances',
    'opportunites', 'admin-financements', 'conseils', 'admin-conseils', 'admin-utilisateurs', 'admin-modeles',
    'admin-etapes', 'materiel-services', 'admin-materiels', 'marche', 'mes-annonces', 'admin-queue',
    'meteo', 'notifications', 'profil', 'parametres'
  ]);

  function navigateToPage(page) {
    if (!VALID_PAGES.has(page)) {
      console.warn('⚠️ [Navigation] Page inconnue demandée dans navigateToPage :', page);
      page = 'dashboard';
    }

    currentRoutePage = page;

    const pageProfilEl = document.getElementById('pageProfil');
    const pageParametresEl = document.getElementById('pageParametres');
    if (pageProfilEl) pageProfilEl.classList.toggle('hidden', page !== 'profil');
    if (pageParametresEl) pageParametresEl.classList.toggle('hidden', page !== 'parametres');

    if (pageSynthese) pageSynthese.classList.toggle('hidden', page !== 'synthese');
    if (pageParcelles) pageParcelles.classList.toggle('hidden', page !== 'parcelles');
    if (pageCycles) pageCycles.classList.toggle('hidden', page !== 'cycles');
    if (pageFinances) pageFinances.classList.toggle('hidden', page !== 'finances');
    if (pageFinancements) pageFinancements.classList.toggle('hidden', page !== 'opportunites');
    if (pageAdminFinancements) pageAdminFinancements.classList.toggle('hidden', page !== 'admin-financements');
    if (pageConseils) pageConseils.classList.toggle('hidden', page !== 'conseils');
    if (pageAdminConseils) pageAdminConseils.classList.toggle('hidden', page !== 'admin-conseils');
    if (pageAdminUtilisateurs) pageAdminUtilisateurs.classList.toggle('hidden', page !== 'admin-utilisateurs');
    if (pageAdminModeles) pageAdminModeles.classList.toggle('hidden', page !== 'admin-modeles');
    if (pageAdminEtapes) pageAdminEtapes.classList.toggle('hidden', page !== 'admin-etapes');
    if (pageMaterielServices) pageMaterielServices.classList.toggle('hidden', page !== 'materiel-services');
    if (pageAdminMateriels) pageAdminMateriels.classList.toggle('hidden', page !== 'admin-materiels');
    if (pageMeteo) pageMeteo.classList.toggle('hidden', page !== 'meteo');
    if (pageNotifications) pageNotifications.classList.toggle('hidden', page !== 'notifications');
    if (pageMarche) pageMarche.classList.toggle('hidden', page !== 'marche');
    if (pageMesAnnonces) pageMesAnnonces.classList.toggle('hidden', page !== 'mes-annonces');
    if (pageAdminQueue) pageAdminQueue.classList.toggle('hidden', page !== 'admin-queue' && page !== 'admin-moderation');
    if (dashboardContent) dashboardContent.classList.toggle('hidden', page !== 'dashboard');

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      const itemPage = item.getAttribute('data-page');
      const href = (item.getAttribute('href') || '').replace(/^#/, '');
      if (itemPage === page || href === page || (page === 'dashboard' && itemPage === 'dashboard') || ((page === 'admin-queue' || page === 'admin-moderation') && itemPage === 'admin-queue')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
      renderMobileView();
    }

    if (page === 'synthese') {
      renderSynthesePage();
    } else if (page === 'parcelles') {
      renderParcellesPage();
    } else if (page === 'cycles') {
      renderCyclesPage(cyclesActiveStatusFilter || 'all');
    } else if (page === 'finances') {
      renderFinancesPage();
    } else if (page === 'opportunites') {
      renderUserFinancements();
    } else if (page === 'admin-financements') {
      renderAdminFinancements();
    } else if (page === 'conseils') {
      renderUserConseils();
    } else if (page === 'admin-conseils') {
      renderAdminConseils();
    } else if (page === 'admin-utilisateurs') {
      if (cachedAdminUsers.length === 0) {
        fetchAdminUtilisateurs();
      } else {
        renderAdminUtilisateurs();
      }
    } else if (page === 'admin-modeles') {
      renderAdminModeles();
    } else if (page === 'admin-etapes') {
      renderAdminEtapes();
    } else if (page === 'materiel-services') {
      renderUserMateriels();
    } else if (page === 'admin-materiels') {
      renderAdminMateriels();
    } else if (page === 'marche') {
      renderMarchePage();
    } else if (page === 'mes-annonces') {
      renderMesAnnoncesPage();
    } else if (page === 'admin-queue' || page === 'admin-moderation') {
      renderAdminQueuePage();
    } else if (page === 'meteo') {
      if (cachedWeatherResult) {
        renderMeteoPage(cachedWeatherResult);
      } else {
        loadAndRenderWeather();
      }
    } else if (page === 'notifications') {
      renderNotificationsPage();
    } else if (page === 'profil') {
      renderProfilPage();
    } else if (page === 'parametres') {
      renderParametresPage();
    }

    // Mise à jour de l'onglet actif dans la barre fixe mobile du bas
    const bDash = document.getElementById('bottomNavDashboard');
    const bExploit = document.getElementById('bottomNavExploitation');
    const bMarche = document.getElementById('bottomNavMarche');
    const bProfil = document.getElementById('bottomNavProfil');
    if (bDash && bExploit && bMarche && bProfil) {
      [bDash, bExploit, bMarche, bProfil].forEach(el => el.classList.remove('active'));
      if (page === 'dashboard') {
        bDash.classList.add('active');
      } else if (page === 'parcelles' || page === 'synthese' || page === 'cycles' || page === 'finances') {
        bExploit.classList.add('active');
      } else if (page === 'marche' || page === 'materiel-services' || page === 'mes-annonces') {
        bMarche.classList.add('active');
      } else if (page === 'profil' || page === 'parametres') {
        bProfil.classList.add('active');
      }
    }

    // Rendu automatique de toutes les icônes au trait Lucide
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRoute() {
    // Si nous sommes dans un flux de récupération de mot de passe, ne jamais écraser l'adresse ni forcer dashboard
    if (isRecoveryMode || 
        window.location.search.includes('reset=1') || 
        window.location.search.includes('type=recovery') || 
        window.location.hash.includes('type=recovery') ||
        window.location.hash.includes('access_token=') ||
        window.location.hash.includes('error=')) {
      return;
    }

    const rawHash = (window.location.hash || '').replace(/^#/, '');
    const cleanHash = rawHash.split('?')[0];

    const resolved = ROUTE_ALIASES[cleanHash];

    if (!resolved) {
      // Si le hash contient des jetons d'auth ou des paramètres Supabase, ne pas forcer dashboard
      if (rawHash.includes('access_token=') || rawHash.includes('error=') || rawHash.includes('type=recovery')) {
        return;
      }
      console.warn('⚠️ [Navigation] Adresse inconnue demandée :', '#' + rawHash);
      window.location.hash = 'dashboard';
      navigateToPage('dashboard');
      return;
    }

    // Contrôle d'accès strict : les pages d'administration sont réservées aux profils administrateurs
    if (resolved.startsWith('admin-')) {
      const isCurAdmin = Boolean(PROFILES_DATA[currentProfileKey]?.isAdmin);
      if (!isCurAdmin) {
        showToast('Accès restreint', 'Cette section est réservée aux administrateurs de la plateforme.');
        window.location.hash = 'dashboard';
        navigateToPage('dashboard');
        return;
      }
    }

    if (resolved === 'abonnements') {
      openPricingModal();
      return;
    }

    if (resolved === 'formations') {
      showToast('Formations agricoles', 'Espace Formations bientôt disponible avec nos agronomes partenaires !');
      return;
    }

    if (resolved === 'admin-verif') {
      showToast('Vérification (+90j)', 'Module de vérification réservé aux agents de terrain assermentés.');
      return;
    }

    if (resolved === 'admin-audit') {
      showToast('Journal d\'audit', 'Toutes les actions d\'administration sont journalisées et sécurisées.');
      return;
    }

    if (resolved === 'installer') {
      triggerPwaInstallFlow();
      return;
    }

    if (resolved === 'reset-password') {
      showResetPasswordScreen();
      return;
    }

    navigateToPage(resolved);
  }

  window.addEventListener('hashchange', handleRoute);

  // Écouteurs de navigation sur la sidebar bureau
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = href.replace(/^#/, '');
        window.location.hash = target;
        handleRoute();
      }
    });
  });

  // Liens retour au tableau de bord (Desktop)
  document.querySelectorAll('.breadcrumb-back-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'dashboard';
      handleRoute();
    });
  });

  // Raccourcis du tableau de bord bureau
  // 1. Les 4 Cartes Pastel de Statistiques
  const statCard1 = document.getElementById('statCard1');
  if (statCard1) {
    statCard1.style.cursor = 'pointer';
    statCard1.setAttribute('title', 'Voir les finances et marges');
    statCard1.addEventListener('click', () => {
      window.location.hash = 'finances';
      handleRoute();
    });
  }

  const statCard2 = document.getElementById('statCard2');
  if (statCard2) {
    statCard2.style.cursor = 'pointer';
    statCard2.setAttribute('title', 'Voir les finances et marges');
    statCard2.addEventListener('click', () => {
      window.location.hash = 'finances';
      handleRoute();
    });
  }

  const statCard3 = document.getElementById('statCard3');
  if (statCard3) {
    statCard3.style.cursor = 'pointer';
    statCard3.setAttribute('title', 'Voir les cycles culturaux');
    statCard3.addEventListener('click', () => {
      window.location.hash = 'cycles';
      handleRoute();
    });
  }

  const statCard4 = document.getElementById('statCard4');
  if (statCard4) {
    statCard4.style.cursor = 'pointer';
    statCard4.setAttribute('title', 'Voir les opportunités de financement');
    statCard4.addEventListener('click', () => {
      window.location.hash = 'opportunites';
      handleRoute();
    });
  }

  // Écouteur pour la grande carte verte Saison 2026 (redirige vers les finances)
  const homeSeasonCard = document.getElementById('homeSeasonCard');
  if (homeSeasonCard) {
    homeSeasonCard.style.cursor = 'pointer';
    homeSeasonCard.addEventListener('click', () => {
      window.location.hash = 'finances';
      handleRoute();
    });
  }

  // Écouteur vocal du conseil du jour sur bureau
  const btnListenHomeDailyAdvice = document.getElementById('btnListenHomeDailyAdvice');
  if (btnListenHomeDailyAdvice) {
    btnListenHomeDailyAdvice.addEventListener('click', (e) => {
      e.stopPropagation();
      speakLatestDailyConseil();
    });
  }

  const cardHomeDailyAdvice = document.getElementById('homeDailyAdviceCard');
  if (cardHomeDailyAdvice) {
    cardHomeDailyAdvice.addEventListener('click', (e) => {
      if (e.target.closest('#btnListenHomeDailyAdvice')) return;
      const published = (cachedConseils || [])
        .filter(c => c.statut === 'publie')
        .sort((a, b) => new Date(b.date_publication || b.created_at) - new Date(a.date_publication || a.created_at));
      const latest = published[0];
      if (latest && typeof openConseilDetailsModal === 'function') {
        openConseilDetailsModal(latest);
      }
    });
  }

  // Écouteurs pour la barre de navigation mobile fixe en bas (Accueil, Exploitation, Marché, Profil)
  const bNavDash = document.getElementById('bottomNavDashboard');
  const bNavExploit = document.getElementById('bottomNavExploitation');
  const bNavMarche = document.getElementById('bottomNavMarche');
  const bNavProfil = document.getElementById('bottomNavProfil');

  if (bNavDash) {
    bNavDash.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'dashboard';
      handleRoute();
    });
  }
  if (bNavExploit) {
    bNavExploit.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'parcelles';
      handleRoute();
    });
  }
  if (bNavMarche) {
    bNavMarche.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'marche';
      handleRoute();
    });
  }
  if (bNavProfil) {
    bNavProfil.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'profil';
      handleRoute();
    });
  }

  const btnShortcutOpps = document.getElementById('btnShortcutOpps');
  if (btnShortcutOpps) {
    btnShortcutOpps.addEventListener('click', () => {
      window.location.hash = 'opportunites';
      handleRoute();
    });
  }

  // 2. Lien "Voir tout" des échéances urgentes (Desktop)
  const linkAllDeadlines = document.getElementById('linkAllDeadlines');
  if (linkAllDeadlines) {
    linkAllDeadlines.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'synthese';
      handleRoute();
    });
  }

  // 3. Lien "Voir toutes les parcelles →" (Desktop)
  const linkToParcellesPage = document.getElementById('linkToParcellesPage');
  if (linkToParcellesPage) {
    linkToParcellesPage.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'parcelles';
      handleRoute();
    });
  }

  // 4. Lien "Prévisions 7j →" météo (Desktop)
  const linkToMeteoPage = document.getElementById('linkToMeteoPage');
  if (linkToMeteoPage) {
    linkToMeteoPage.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'meteo';
      handleRoute();
    });
  }

  // 2. Synchronisation Supabase des opportunités (fetchFinancements)

  async function fetchFinancements() {
    if (!supabaseClient) return;

    try {
      const { data, error } = await supabaseClient
        .from('financements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('️ Erreur fetchFinancements Supabase :', error);
        return;
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Auto-expiration : si date limite passée sur fiche publiée (admin uniquement)
      const toExpire = [];
      (data || []).forEach(item => {
        if (item.statut === 'publie' && item.date_limite && String(item.date_limite).trim() !== '') {
          const itemDeadline = parseLocalDate(item.date_limite);
          if (itemDeadline) {
            itemDeadline.setHours(23, 59, 59, 999);
            if (itemDeadline < now) {
              item.statut = 'expire';
              toExpire.push(item.id);
            }
          }
        }
      });

      if (toExpire.length > 0 && PROFILES_DATA[currentProfileKey]?.isAdmin) {
        try {
          await supabaseClient
            .from('financements')
            .update({ statut: 'expire', updated_at: new Date().toISOString() })
            .in('id', toExpire);
          console.log(`⏱️ [Auto-Expire] ${toExpire.length} offre(s) expirée(s) mise(s) à jour.`);
        } catch (e) {
          console.warn('Auto-expire update error :', e);
        }
      }

      cachedFinancements = data || [];
      updateFinancementsCounters();

      // Toujours mettre à jour le rendu utilisateur dès réception des fiches
      renderUserFinancements();
      if (currentRoutePage === 'admin-financements') {
        renderAdminFinancements();
      }

      if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
        renderMobileView();
      }
    } catch (err) {
      console.warn('️ Erreur réseau fetchFinancements :', err);
    }
  }

  // 3. Mise à jour des compteurs et badges
  function updateFinancementsCounters() {
    const openForUsers = filterOpenFinancementsForUsers(cachedFinancements);
    const pending = cachedFinancements.filter(f => f.statut === 'en_attente');
    const expired = cachedFinancements.filter(f => f.statut === 'expire');
    const published = cachedFinancements.filter(f => f.statut === 'publie');

    // Badge Administration
    const navAdminBadge = document.getElementById('navAdminPendingBadge');
    if (navAdminBadge) {
      navAdminBadge.textContent = pending.length;
      navAdminBadge.style.display = pending.length > 0 ? 'inline-block' : 'none';
    }

    const adminBanner = document.getElementById('adminPendingBanner');
    const pendingAlertCount = document.getElementById('adminPendingAlertCount');
    if (adminBanner) {
      if (pending.length > 0) {
        adminBanner.classList.remove('hidden');
        if (pendingAlertCount) {
          pendingAlertCount.textContent = `${pending.length} fiche${pending.length > 1 ? 's' : ''} en attente de validation`;
        }
      } else {
        adminBanner.classList.add('hidden');
      }
    }

    const bPending = document.getElementById('badgeCountEnAttente');
    const bPublie = document.getElementById('badgeCountPublie');
    const bExpire = document.getElementById('badgeCountExpire');
    const bAll = document.getElementById('badgeCountAll');
    if (bPending) bPending.textContent = pending.length;
    if (bPublie) bPublie.textContent = published.length;
    if (bExpire) bExpire.textContent = expired.length;
    if (bAll) bAll.textContent = cachedFinancements.length;

    // Badges Utilisateur (Menu Desktop & Mobile Drawer) - Strictement la liste ouverte
    const navUserBadge = document.getElementById('navUserFinancementsBadge');
    if (navUserBadge) navUserBadge.textContent = openForUsers.length;

    const drawerUserBadge = document.getElementById('mobileDrawerFinancementsBadge');
    if (drawerUserBadge) drawerUserBadge.textContent = openForUsers.length;

    const countText = document.getElementById('userFinancementsCountText');
    if (countText) {
      countText.textContent = `${openForUsers.length} opportunité${openForUsers.length > 1 ? 's' : ''} ouverte${openForUsers.length > 1 ? 's' : ''}`;
    }

    // Synchroniser l'objet de profil en mémoire pour mobile et futur renderProfile
    Object.keys(PROFILES_DATA).forEach(pk => {
      if (PROFILES_DATA[pk]?.stats?.[3]) {
        PROFILES_DATA[pk].stats[3].value = String(openForUsers.length);
        PROFILES_DATA[pk].stats[3].unit = 'disponibles';
      }
    });

    // Carte 4 Dashboard (Opportunités ouvertes pour profil non-admin)
    const isCurrentAdmin = Boolean(PROFILES_DATA[currentProfileKey]?.isAdmin);
    if (!isCurrentAdmin) {
      const statLabel4 = document.getElementById('statLabel4');
      if (statLabel4) statLabel4.textContent = 'Opportunités ouvertes';

      const statVal4 = document.getElementById('statValue4');
      if (statVal4) {
        statVal4.innerHTML = `${openForUsers.length} <small>disponibles</small>`;
      }

      const statCard4Footer = document.querySelector('#statCard4 .stat-footer');
      if (statCard4Footer) {
        let closingSoon = 0;
        let minDiffDays = Infinity;
        openForUsers.forEach(p => {
          if (p.date_limite && String(p.date_limite).trim() !== '') {
            const diffDays = getDiffDaysFromToday(p.date_limite);
            if (diffDays !== null && diffDays >= 0) {
              if (diffDays <= 7) closingSoon++;
              if (diffDays < minDiffDays) minDiffDays = diffDays;
            }
          }
        });

        if (closingSoon > 0) {
          statCard4Footer.innerHTML = `
            <span class="urgent-pill">
              <span class="clock-icon">⏳</span> ${closingSoon} clôture${closingSoon > 1 ? 'nt' : ''} &lt; 7 j
            </span>
            <span class="comparison-text">Ministère & PReCA</span>
          `;
        } else if (minDiffDays < Infinity) {
          statCard4Footer.innerHTML = `
            <span class="urgent-pill" style="background: #EAF4E6; color: #1E5E2A; border-color: #D2E7CC;">
              <span class="clock-icon">⏳</span> Prochaine dans ${minDiffDays} j
            </span>
            <span class="comparison-text">Offres disponibles</span>
          `;
        } else {
          statCard4Footer.innerHTML = `
            <span class="urgent-pill" style="background: #F4F6F2; color: #5B6660; border-color: #E6EAE3;">
              <span></span> Aucune urgence
            </span>
            <span class="comparison-text">À jour</span>
          `;
        }
      }
    }

    // Synchroniser les échéances dynamiques du tableau de bord
    renderDashboardDeadlines();
  }

  // 4. Rendu de la grille Utilisateur (Desktop)
  function renderUserFinancements() {
    const grid = document.getElementById('financementsGrid');
    const emptyState = document.getElementById('financementsEmptyState');
    if (!grid) return;

    // Filtre officiel utilisateur : statut === 'publie' et date_limite vide ou >= aujourd'hui
    const openForUsers = filterOpenFinancementsForUsers(cachedFinancements);
    let filtered = openForUsers;

    // Filtre par catégorie/type si l'utilisateur en clique un spécifiquement
    if (userSelectedType && userSelectedType !== 'all') {
      filtered = filtered.filter(f => f.type && f.type.toLowerCase().trim() === userSelectedType.toLowerCase().trim());
    }

    // Filtre par région : ne jamais exclure « Tout le Burkina Faso »
    if (userSelectedRegion && userSelectedRegion !== 'all') {
      const reg = userSelectedRegion.toLowerCase().trim();
      filtered = filtered.filter(f => {
        if (!f.region || String(f.region).trim() === '') return true;
        const r = f.region.toLowerCase().trim();
        return r.includes(reg) || r.includes('tout le burkina') || r.includes('national');
      });
    }

    // Mettre à jour le texte du compteur d'en-tête de la page
    const countText = document.getElementById('userFinancementsCountText');
    if (countText) {
      countText.textContent = `${openForUsers.length} opportunité${openForUsers.length > 1 ? 's' : ''} ouverte${openForUsers.length > 1 ? 's' : ''}`;
    }

    filtered.sort((a, b) => {
      const aHas = Boolean(a.date_limite && String(a.date_limite).trim() !== '');
      const bHas = Boolean(b.date_limite && String(b.date_limite).trim() !== '');
      if (aHas && bHas) return new Date(a.date_limite) - new Date(b.date_limite);
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return 0;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    function renderFinancementCard(item) {
      const hasDeadline = Boolean(item.date_limite && String(item.date_limite).trim() !== '');
      const diffDays = hasDeadline ? getDiffDaysFromToday(item.date_limite) : null;
      const dl = hasDeadline ? parseLocalDate(item.date_limite) : null;
      const formattedDate = dl ? dl.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      const isUrgent = diffDays !== null && diffDays >= 0 && diffDays <= 7;
      const typeClass = (item.type || 'subvention').toLowerCase().replace(/[\s']/g, '-');

      return `
        <article class="financement-card" data-id="${item.id}">
          <div class="fin-card-top-meta">
            <span class="fin-badge-type ${typeClass}">${item.type}</span>
            <span class="fin-badge-region"> ${item.region || 'Tout le Burkina'}</span>
          </div>

          <div class="fin-card-org">${item.organisme}</div>
          <h3 class="fin-card-title">${item.titre}</h3>

          <div class="fin-card-amount-box">
            <span class="fin-amount-label">MONTANT</span>
            <div class="fin-amount-val">${item.montant || 'Non spécifié'}</div>
          </div>

          <p class="fin-card-desc">${item.description_courte || ''}</p>

          <div class="fin-card-footer">
            <div class="fin-card-deadline">
              ${hasDeadline ? `
                <span>Date limite : ${formattedDate}</span>
                ${isUrgent ? `<span class="badge-urgent-closing">⏳ ${diffDays === 0 ? "Clôture aujourd'hui" : `Clôture dans ${formatDaysLeftBadge(diffDays)}`}</span>` : ''}
              ` : `
                <span class="badge-guichet-permanent">Guichet permanent</span>
              `}
            </div>
            <button type="button" class="fin-card-link-btn">Voir les détails →</button>
          </div>
        </article>
      `;
    }

    const userTerms = getUserRegionTerms();

    if (userTerms && userTerms.length > 0) {
      const groupUserRegion = [];
      const groupNational = [];
      const groupOther = [];

      filtered.forEach(item => {
        const group = getItemRegionGroup(item.region, userTerms);
        if (group === 'user_region') groupUserRegion.push(item);
        else if (group === 'national') groupNational.push(item);
        else groupOther.push(item);
      });

      let html = '';
      if (groupUserRegion.length > 0) {
        html += `
          <div class="region-section-divider">
            <h3 class="region-section-title"> Pour votre région</h3>
            <span class="region-section-badge">${groupUserRegion.length} opportunité${groupUserRegion.length > 1 ? 's' : ''}</span>
          </div>
          ${groupUserRegion.map(renderFinancementCard).join('')}
        `;
      }

      if (groupNational.length > 0) {
        html += `
          <div class="region-section-divider" style="border-left-color: #2E7D32;">
            <h3 class="region-section-title"> Tout le Burkina Faso</h3>
            <span class="region-section-badge" style="background: #E8F5E9; color: #1B5E20;">${groupNational.length} opportunité${groupNational.length > 1 ? 's' : ''}</span>
          </div>
          ${groupNational.map(renderFinancementCard).join('')}
        `;
      }

      if (groupOther.length > 0) {
        html += `
          <div class="region-section-divider" style="border-left-color: #78909C;">
            <h3 class="region-section-title"> Autres régions</h3>
            <span class="region-section-badge" style="background: #ECEFF1; color: #455A64;">${groupOther.length} opportunité${groupOther.length > 1 ? 's' : ''}</span>
          </div>
          ${groupOther.map(renderFinancementCard).join('')}
        `;
      }

      grid.innerHTML = html;
    } else {
      // Aucune région définie sur les parcelles de l'utilisateur : affichage classique
      grid.innerHTML = filtered.map(renderFinancementCard).join('');
    }

    grid.querySelectorAll('.financement-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = cachedFinancements.find(f => String(f.id) === String(id));
        if (item) openFinancementDetailsModal(item);
      });
    });
  }

  // 5. Rendu de la liste Administration (Desktop)
  function renderAdminFinancements() {
    const listContainer = document.getElementById('adminFinancementsList');
    const emptyState = document.getElementById('adminFinancementsEmpty');
    if (!listContainer) return;

    const pending = cachedFinancements.filter(f => f.statut === 'en_attente');
    const published = cachedFinancements.filter(f => f.statut === 'publie');
    const expired = cachedFinancements.filter(f => f.statut === 'expire');

    let list = cachedFinancements;
    if (adminActiveStatusTab === 'en_attente') list = pending;
    else if (adminActiveStatusTab === 'publie') list = published;
    else if (adminActiveStatusTab === 'expire') list = expired;

    // Fiches en attente en premier
    list.sort((a, b) => {
      if (a.statut === 'en_attente' && b.statut !== 'en_attente') return -1;
      if (b.statut === 'en_attente' && a.statut !== 'en_attente') return 1;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    if (list.length === 0) {
      listContainer.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    listContainer.innerHTML = list.map(item => {
      const dl = item.date_limite ? new Date(item.date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Non précisée';

      return `
        <div class="admin-fin-item status-${item.statut}" data-id="${item.id}">
          <div class="admin-fin-content">
            <div class="admin-fin-header-row">
              <span class="admin-status-pill ${item.statut}">
                ${item.statut === 'en_attente' ? '⏳ En attente' : (item.statut === 'publie' ? ' Publié' : '⏹️ Expiré')}
              </span>
              <span class="fin-badge-type ${(item.type || '').toLowerCase().replace(/[\s']/g, '-')}">${item.type}</span>
              <span style="font-size: 11.5px; color: var(--text-dim);"> ${item.region}</span>
            </div>
            <h4 class="admin-fin-title">${item.titre}</h4>
            <div class="admin-fin-meta-row">
              <span><strong>Organisme :</strong> ${item.organisme}</span>
              <span>•</span>
              <span><strong>Montant :</strong> ${item.montant || 'N/C'}</span>
              <span>•</span>
              <span><strong>Date limite :</strong> ${dl}</span>
            </div>
          </div>
          <div class="admin-actions-group">
            ${item.statut !== 'publie' ? `
              <button type="button" class="btn-admin-action btn-admin-publish btn-action-publish" data-id="${item.id}" title="Publier immédiatement cette fiche pour tous les utilisateurs">
                 Publier
              </button>
            ` : ''}
            <button type="button" class="btn-admin-action btn-admin-edit btn-action-edit" data-id="${item.id}" title="Modifier les champs de l'offre">
              ️ Modifier
            </button>
            ${item.statut !== 'expire' ? `
              <button type="button" class="btn-admin-action btn-admin-withdraw btn-action-withdraw" data-id="${item.id}" title="Retirer l'offre du public">
                 Retirer
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.btn-action-publish').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await updateFinancementStatus(id, 'publie');
      });
    });

    listContainer.querySelectorAll('.btn-action-withdraw').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await updateFinancementStatus(id, 'expire');
      });
    });

    listContainer.querySelectorAll('.btn-action-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = cachedFinancements.find(f => String(f.id) === String(id));
        if (item) openManageFinancementModal(item);
      });
    });
  }

  // 6. Mise à jour de statut (Publier / Retirer)
  async function updateFinancementStatus(id, newStatus) {
    if (!supabaseClient) return;

    try {
      const { error } = await supabaseClient
        .from('financements')
        .update({ statut: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        showToast('️ Erreur', error.message || 'Impossible de mettre à jour le statut.');
        return;
      }

      const statusLabels = {
        publie: 'publié en ligne et visible par tous les producteurs !',
        expire: 'retiré du catalogue (statut expiré).',
        en_attente: 'remis en attente de validation.'
      };

      showToast('Statut mis à jour', `Le financement a été ${statusLabels[newStatus] || newStatus}`);
      await fetchFinancements();
    } catch (e) {
      showToast('Erreur', e.message);
    }
  }

  // 7. Modale Détails du financement (Utilisateur)
  function openFinancementDetailsModal(item) {
    if (!modalFinancementDetails) return;

    const bType = document.getElementById('finDetailTypeBadge');
    const bRegion = document.getElementById('finDetailRegionBadge');
    const dOrg = document.getElementById('finDetailOrganisme');
    const dTitre = document.getElementById('finDetailTitre');
    const dMontant = document.getElementById('finDetailMontant');
    const dDateLimite = document.getElementById('finDetailDateLimite');
    const dUrgent = document.getElementById('finDetailUrgentBadge');
    const dDesc = document.getElementById('finDetailDescription');
    const dPublic = document.getElementById('finDetailPublicVise');
    const dCond = document.getElementById('finDetailConditions');
    const dContact = document.getElementById('finDetailContact');
    const dSource = document.getElementById('finDetailSource');
    const btnApply = document.getElementById('btnApplyFinancement');

    if (bType) bType.textContent = item.type;
    if (bRegion) bRegion.textContent = ` ${item.region || 'Tout le Burkina'}`;
    if (dOrg) dOrg.textContent = item.organisme;
    if (dTitre) dTitre.textContent = item.titre;
    if (dMontant) dMontant.textContent = item.montant || 'Non spécifié';

    const hasDeadline = Boolean(item.date_limite && String(item.date_limite).trim() !== '');
    const diffDays = hasDeadline ? getDiffDaysFromToday(item.date_limite) : null;
    const dl = hasDeadline ? parseLocalDate(item.date_limite) : null;

    const dDateLimiteLabel = document.getElementById('finDetailDateLimiteLabel');
    if (dDateLimiteLabel) {
      dDateLimiteLabel.textContent = hasDeadline ? 'Date limite' : 'Disponibilité';
    }

    if (dDateLimite) {
      if (hasDeadline && dl) {
        dDateLimite.textContent = dl.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      } else {
        dDateLimite.innerHTML = '<span class="badge-guichet-permanent">Guichet permanent</span>';
      }
    }

    if (dUrgent) {
      if (hasDeadline && diffDays !== null && diffDays >= 0 && diffDays <= 7) {
        dUrgent.textContent = `⏳ ${diffDays === 0 ? "Clôture aujourd'hui" : `Clôture dans ${formatDaysLeftBadge(diffDays)}`}`;
        dUrgent.style.display = 'inline-block';
      } else {
        dUrgent.style.display = 'none';
      }
    }

    if (dDesc) dDesc.textContent = item.description_courte || '';
    if (dPublic) dPublic.textContent = item.public_vise || 'Tout public agropastoral';
    if (dCond) dCond.textContent = item.conditions_eligibilite || 'Consultez les termes détaillés.';
    if (dContact) dContact.textContent = item.contact || 'Non précisé';

    const sourceRow = document.getElementById('finDetailSourceRow');
    if (dSource && sourceRow) {
      if (item.source) {
        dSource.href = item.source;
        sourceRow.style.display = 'flex';
      } else {
        sourceRow.style.display = 'none';
      }
    }

    if (btnApply) {
      btnApply.href = item.lien_postuler || item.source || '#';
      if (!item.lien_postuler && !item.source) {
        btnApply.textContent = 'Contact direct nécessaire';
        btnApply.removeAttribute('target');
      } else {
        btnApply.innerHTML = '<span>Postuler en ligne</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';
        btnApply.setAttribute('target', '_blank');
      }
    }

    // Synergie Matériel : Le matériel dont vous avez besoin
    const synergyCard = document.getElementById('finDetailMaterielSynergy');
    const btnGoMateriel = document.getElementById('btnGoToMaterielFromFin');
    const synergyDesc = document.getElementById('finDetailMaterielSynergyDesc');
    const btnGoMaterielText = document.getElementById('btnGoToMaterielText');

    if (synergyCard) {
      const contentText = `${item.titre || ''} ${item.description_courte || ''} ${item.conditions_eligibilite || ''} ${item.public_vise || ''}`.toLowerCase();
      const mentionsIrrigation = contentText.includes('pompe') || contentText.includes('forage') || contentText.includes('irrigation') || contentText.includes('motopompe') || contentText.includes('goutte-à-goutte') || contentText.includes('bassin');
      const mentionsSolar = contentText.includes('solaire') || contentText.includes('panneau') || contentText.includes('photovolta');
      const mentionsGeneralEquip = contentText.includes('matériel') || contentText.includes('equipement') || contentText.includes('équipement') || contentText.includes('intrant') || contentText.includes('motoculteur') || contentText.includes('tracteur');

      if (mentionsIrrigation || mentionsSolar || mentionsGeneralEquip) {
        synergyCard.classList.remove('hidden');
        if (mentionsSolar) {
          if (synergyDesc) synergyDesc.textContent = 'Cette opportunité soutient les investissements solaires et forages. Retrouvez les kits de pompage solaire et techniciens agréés au Burkina Faso.';
          if (btnGoMaterielText) btnGoMaterielText.textContent = 'Voir l\'énergie solaire & pompes disponibles →';
        } else if (mentionsIrrigation) {
          if (synergyDesc) synergyDesc.textContent = 'Cette subvention couvre l\'achat de motopompes, forages ou systèmes d\'irrigation. Trouvez des équipements vérifiés auprès de fournisseurs certifiés au Burkina Faso.';
          if (btnGoMaterielText) btnGoMaterielText.textContent = 'Voir les pompes & forages disponibles →';
        } else {
          if (synergyDesc) synergyDesc.textContent = 'Équipez votre exploitation avec du matériel agricole certifié (pompes, kits de maraîchage, intrants vérifiés) éligible aux financements.';
          if (btnGoMaterielText) btnGoMaterielText.textContent = 'Voir le matériel & services disponibles →';
        }
        if (btnGoMateriel) {
          btnGoMateriel.onclick = (e) => {
            e.preventDefault();
            closeFinancementDetailsModal();
            window.location.hash = 'materiel-services';
            navigateToPage('materiel-services');
          };
        }
      } else {
        synergyCard.classList.add('hidden');
      }
    }

    modalFinancementDetails.classList.remove('hidden');
  }

  function closeFinancementDetailsModal() {
    if (modalFinancementDetails) modalFinancementDetails.classList.add('hidden');
  }

  const btnCloseFinDetails = document.getElementById('btnCloseFinancementDetails');
  const btnCloseDetailsBottom = document.getElementById('btnCloseDetailsBottom');
  if (btnCloseFinDetails) btnCloseFinDetails.addEventListener('click', closeFinancementDetailsModal);
  if (btnCloseDetailsBottom) btnCloseDetailsBottom.addEventListener('click', closeFinancementDetailsModal);
  if (modalFinancementDetails) {
    modalFinancementDetails.addEventListener('click', (e) => {
      if (e.target === modalFinancementDetails) closeFinancementDetailsModal();
    });
  }

  // 8. Modale Gestion / Formulaire Financement (Admin)
  function openManageFinancementModal(item = null) {
    if (!modalManageFinancement) return;

    const modalTitle = document.getElementById('manageFinancementModalTitle');
    const fId = document.getElementById('financementId');
    const fTitre = document.getElementById('finTitre');
    const fOrganisme = document.getElementById('finOrganisme');
    const fType = document.getElementById('finType');
    const fMontant = document.getElementById('finMontant');
    const fDateLimite = document.getElementById('finDateLimite');
    const fRegion = document.getElementById('finRegion');
    const fPublicVise = document.getElementById('finPublicVise');
    const fDescription = document.getElementById('finDescription');
    const fConditions = document.getElementById('finConditions');
    const fContact = document.getElementById('finContact');
    const fStatut = document.getElementById('finStatut');
    const fLienPostuler = document.getElementById('finLienPostuler');
    const fSource = document.getElementById('finSource');

    if (item) {
      if (modalTitle) modalTitle.textContent = 'Modifier le financement';
      if (fId) fId.value = item.id;
      if (fTitre) fTitre.value = item.titre || '';
      if (fOrganisme) fOrganisme.value = item.organisme || '';
      if (fType) fType.value = item.type || 'subvention';
      if (fMontant) fMontant.value = item.montant || '';
      if (fDateLimite) fDateLimite.value = item.date_limite ? item.date_limite.split('T')[0] : '';
      if (fRegion) fRegion.value = item.region || 'Tout le Burkina Faso';
      if (fPublicVise) fPublicVise.value = item.public_vise || '';
      if (fDescription) fDescription.value = item.description_courte || '';
      if (fConditions) fConditions.value = item.conditions_eligibilite || '';
      if (fContact) fContact.value = item.contact || '';
      if (fStatut) fStatut.value = item.statut || 'publie';
      if (fLienPostuler) fLienPostuler.value = item.lien_postuler || '';
      if (fSource) fSource.value = item.source || '';
    } else {
      if (modalTitle) modalTitle.textContent = 'Ajouter un financement';
      if (formManageFinancement) formManageFinancement.reset();
      if (fId) fId.value = '';
      if (fRegion) fRegion.value = 'Tout le Burkina Faso';
      if (fStatut) fStatut.value = 'publie';
      if (fDateLimite) {
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 20);
        fDateLimite.value = nextMonth.toISOString().split('T')[0];
      }
    }

    modalManageFinancement.classList.remove('hidden');
  }

  function closeManageFinancementModal() {
    if (modalManageFinancement) modalManageFinancement.classList.add('hidden');
    if (formManageFinancement) formManageFinancement.reset();
  }

  const btnOpenAddFinancementModal = document.getElementById('btnOpenAddFinancementModal');
  const btnCloseManageFinancement = document.getElementById('btnCloseManageFinancement');
  const btnCancelManageFinancement = document.getElementById('btnCancelManageFinancement');

  if (btnOpenAddFinancementModal) btnOpenAddFinancementModal.addEventListener('click', () => openManageFinancementModal());
  if (btnCloseManageFinancement) btnCloseManageFinancement.addEventListener('click', closeManageFinancementModal);
  if (btnCancelManageFinancement) btnCancelManageFinancement.addEventListener('click', closeManageFinancementModal);
  if (modalManageFinancement) {
    modalManageFinancement.addEventListener('click', (e) => {
      if (e.target === modalManageFinancement) closeManageFinancementModal();
    });
  }

  // 9. Enregistrement (Création / Modification) dans Supabase
  if (formManageFinancement) {
    formManageFinancement.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fId = document.getElementById('financementId').value;
      const fTitre = document.getElementById('finTitre').value.trim();
      const fOrganisme = document.getElementById('finOrganisme').value.trim();
      const fType = document.getElementById('finType').value;
      const fMontant = document.getElementById('finMontant').value.trim();
      const fDateLimite = document.getElementById('finDateLimite').value;
      const fRegion = document.getElementById('finRegion').value.trim();
      const fPublicVise = document.getElementById('finPublicVise').value.trim();
      const fDescription = document.getElementById('finDescription').value.trim();
      const fConditions = document.getElementById('finConditions').value.trim();
      const fContact = document.getElementById('finContact').value.trim();
      const fStatut = document.getElementById('finStatut').value;
      const fLienPostuler = document.getElementById('finLienPostuler').value.trim();
      const fSource = document.getElementById('finSource').value.trim();

      const saveBtn = document.getElementById('btnSaveFinancement');
      const saveBtnText = document.getElementById('btnSaveFinancementText');
      if (saveBtn) saveBtn.disabled = true;
      if (saveBtnText) saveBtnText.textContent = 'Enregistrement en cours…';

      const payload = {
        titre: fTitre,
        organisme: fOrganisme,
        type: fType,
        montant: fMontant || null,
        date_limite: fDateLimite,
        region: fRegion,
        public_vise: fPublicVise,
        description_courte: fDescription,
        conditions_eligibilite: fConditions,
        contact: fContact || null,
        statut: fStatut,
        lien_postuler: fLienPostuler || null,
        source: fSource || null,
        updated_at: new Date().toISOString()
      };

      try {
        if (fId) {
          const { error } = await supabaseClient.from('financements').update(payload).eq('id', fId);
          if (error) throw error;
          showToast('Financement modifié', `« ${fTitre} » a été mis à jour avec succès.`);
        } else {
          const { error } = await supabaseClient.from('financements').insert([payload]);
          if (error) throw error;
          showToast('Financement créé', `« ${fTitre} » a été ajouté (statut : ${fStatut}).`);
        }

        closeManageFinancementModal();
        await fetchFinancements();
        if (typeof fetchNotifications === 'function') fetchNotifications().catch(() => {});
      } catch (err) {
        showToast('️ Erreur', err.message || 'Impossible d\'enregistrer le financement.');
      } finally {
        if (saveBtn) saveBtn.disabled = false;
        if (saveBtnText) saveBtnText.textContent = 'Enregistrer le financement';
      }
    });
  }

  // 10. Filtres Utilisateur Desktop
  const filterChips = document.querySelectorAll('#filterTypesContainer .type-filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      userSelectedType = chip.getAttribute('data-type');
      renderUserFinancements();
    });
  });

  const selectRegion = document.getElementById('selectFilterRegion');
  if (selectRegion) {
    selectRegion.addEventListener('change', (e) => {
      userSelectedRegion = e.target.value;
      renderUserFinancements();
    });
  }

  const btnResetFilters = document.getElementById('btnResetFinancementFilters');
  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      userSelectedType = 'all';
      userSelectedRegion = 'all';
      filterChips.forEach(c => c.classList.remove('active'));
      const allChip = document.querySelector('#filterTypesContainer .type-filter-chip[data-type="all"]');
      if (allChip) allChip.classList.add('active');
      if (selectRegion) selectRegion.value = 'all';
      renderUserFinancements();
    });
  }

  // 11. Onglets Statut Admin Desktop
  const adminTabs = document.querySelectorAll('#adminStatusTabsGroup .admin-status-tab');
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      adminActiveStatusTab = tab.getAttribute('data-status');
      renderAdminFinancements();
    });
  });

  const btnQuickFilterPending = document.getElementById('btnQuickFilterPending');
  if (btnQuickFilterPending) {
    btnQuickFilterPending.addEventListener('click', () => {
      adminActiveStatusTab = 'en_attente';
      adminTabs.forEach(t => t.classList.remove('active'));
      const pendingTab = document.getElementById('tabStatusEnAttente');
      if (pendingTab) pendingTab.classList.add('active');
      renderAdminFinancements();
    });
  }

  // ==========================================
  // MODULE CONSEILS AGRONOMIQUES (SUPABASE)
  // ==========================================

  async function fetchConseils() {
    if (!supabaseClient) {
      const homeTitle = document.getElementById('homeDailyAdviceTitle');
      if (homeTitle) homeTitle.textContent = 'Conseil indisponible pour le moment';
      const mobTitle = document.getElementById('mobileDailyAdviceTitle');
      if (mobTitle) mobTitle.textContent = 'Conseil indisponible pour le moment';
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from('conseils')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Erreur fetchConseils Supabase :', error);
        const homeTitle = document.getElementById('homeDailyAdviceTitle');
        if (homeTitle) homeTitle.textContent = 'Conseil indisponible pour le moment';
        const mobTitle = document.getElementById('mobileDailyAdviceTitle');
        if (mobTitle) mobTitle.textContent = 'Conseil indisponible pour le moment';
        return;
      }

      cachedConseils = data || [];
      updateConseilsCounters();

      renderUserConseils();
      if (currentRoutePage === 'admin-conseils') {
        renderAdminConseils();
      }

      if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
        renderMobileView();
      }
    } catch (err) {
      console.warn('⚠️ Erreur réseau fetchConseils :', err);
      const homeTitle = document.getElementById('homeDailyAdviceTitle');
      if (homeTitle) homeTitle.textContent = 'Conseil indisponible pour le moment';
      const mobTitle = document.getElementById('mobileDailyAdviceTitle');
      if (mobTitle) mobTitle.textContent = 'Conseil indisponible pour le moment';
    }
  }

  function updateConseilsCounters() {
    const published = cachedConseils.filter(c => c.statut === 'publie');
    const pending = cachedConseils.filter(c => c.statut === 'en_attente');
    const archived = cachedConseils.filter(c => c.statut === 'archive');

    // Conseils publiés depuis moins de 7 jours (calcul sécurisé)
    const recentNewCount = getNewConseilsCount();

    // Badges Utilisateur (Desktop Sidebar & Mobile Drawer) : « X nvx »
    const navUserBadge = document.getElementById('navUserConseilsBadge');
    if (navUserBadge) {
      navUserBadge.textContent = recentNewCount > 0 ? `${recentNewCount} nvx` : '0 nvx';
      navUserBadge.style.display = recentNewCount > 0 ? 'inline-block' : 'none';
    }

    const drawerUserBadge = document.getElementById('mobileDrawerConseilsBadge');
    if (drawerUserBadge) {
      drawerUserBadge.textContent = recentNewCount > 0 ? `${recentNewCount} nvx` : '';
      drawerUserBadge.style.display = recentNewCount > 0 ? 'inline-block' : 'none';
    }

    // Badges Administration
    const navAdminBadge = document.getElementById('navAdminConseilsPendingBadge');
    if (navAdminBadge) {
      navAdminBadge.textContent = pending.length;
      navAdminBadge.style.display = pending.length > 0 ? 'inline-block' : 'none';
    }

    const drawerAdminBadge = document.getElementById('mobileDrawerConseilsPendingBadge');
    if (drawerAdminBadge) {
      drawerAdminBadge.textContent = pending.length;
      drawerAdminBadge.style.display = pending.length > 0 ? 'inline-block' : 'none';
    }

    const adminBanner = document.getElementById('adminConseilsPendingBanner');
    const pendingAlertCount = document.getElementById('adminConseilsPendingAlertCount');
    if (adminBanner) {
      if (pending.length > 0) {
        adminBanner.classList.remove('hidden');
        if (pendingAlertCount) {
          pendingAlertCount.textContent = `${pending.length} conseil${pending.length > 1 ? 's' : ''} en attente de validation`;
        }
      } else {
        adminBanner.classList.add('hidden');
      }
    }

    const bPending = document.getElementById('badgeConseilsEnAttente');
    const bPublie = document.getElementById('badgeConseilsPublie');
    const bArchive = document.getElementById('badgeConseilsArchive');
    const bAll = document.getElementById('badgeConseilsAll');
    if (bPending) bPending.textContent = pending.length;
    if (bPublie) bPublie.textContent = published.length;
    if (bArchive) bArchive.textContent = archived.length;
    if (bAll) bAll.textContent = cachedConseils.length;

    const countText = document.getElementById('userConseilsCountText');
    if (countText) {
      countText.textContent = `${published.length} fiche${published.length > 1 ? 's' : ''} pratique${published.length > 1 ? 's' : ''} vérifiée${published.length > 1 ? 's' : ''}`;
    }

    updateDashboardAdviceCard();
  }

  function updateDashboardAdviceCard() {
    const published = (cachedConseils || [])
      .filter(c => c.statut === 'publie')
      .sort((a, b) => new Date(b.date_publication || b.created_at) - new Date(a.date_publication || a.created_at));

    const latest = published[0];

    // Mise à jour de la carte "Conseil du jour" de l'accueil (Desktop & Mobile)
    const homeTitle = document.getElementById('homeDailyAdviceTitle');
    const homeText = document.getElementById('homeDailyAdviceText');
    const mobileTitle = document.getElementById('mobileDailyAdviceTitle');
    const mobileText = document.getElementById('mobileDailyAdviceText');

    if (!latest) {
      if (homeTitle) homeTitle.textContent = 'Conseil indisponible pour le moment';
      if (homeText) homeText.textContent = '';
      if (mobileTitle) mobileTitle.textContent = 'Conseil indisponible pour le moment';
      if (mobileText) mobileText.textContent = '';
      return;
    }

    const adviceSummary = getConseilCardText(latest);
    if (homeTitle) homeTitle.textContent = latest.titre;
    if (homeText) homeText.textContent = adviceSummary;
    if (mobileTitle) mobileTitle.textContent = latest.titre;
    if (mobileText) mobileText.textContent = adviceSummary;

    const catEl = document.getElementById('dashAdviceCategory');
    const timeEl = document.getElementById('dashAdviceReadTime');
    const titleEl = document.getElementById('dashAdviceTitle');
    const summaryEl = document.getElementById('dashAdviceSummary');
    const authorEl = document.getElementById('dashAdviceAuthor');
    const linkEl = document.getElementById('dashAdviceLink');
    const cardEl = document.getElementById('dashAdviceCard');

    if (catEl) catEl.textContent = latest.categorie ? latest.categorie.charAt(0).toUpperCase() + latest.categorie.slice(1) : 'Conseil agronomique';
    if (timeEl) timeEl.textContent = `Lecture ${latest.duree_lecture || 3} min`;
    if (titleEl) titleEl.textContent = latest.titre;
    if (summaryEl) summaryEl.textContent = latest.resume || adviceSummary;
    if (authorEl) authorEl.textContent = latest.source ? `Par ${latest.source}` : 'Par INERA / DGPV';

    if (linkEl) {
      linkEl.onclick = (e) => {
        e.preventDefault();
        openConseilDetailsModal(latest);
      };
    }

    if (cardEl) {
      cardEl.style.cursor = 'pointer';
      cardEl.onclick = (e) => {
        if (e.target.tagName.toLowerCase() === 'a') return;
        openConseilDetailsModal(latest);
      };
    }
  }

  function renderUserConseils() {
    const grid = document.getElementById('userConseilsGrid');
    const emptyState = document.getElementById('userConseilsEmptyState');
    if (!grid) return;

    let published = cachedConseils.filter(c => c.statut === 'publie');

    // Filtre par catégorie
    if (userSelectedConseilCategory && userSelectedConseilCategory !== 'all') {
      const targetCat = userSelectedConseilCategory.toLowerCase().trim();
      published = published.filter(c => {
        if (!c.categorie) return false;
        const cat = c.categorie.toLowerCase().trim();
        if (targetCat === 'maraichage') return cat.includes('maraîch') || cat.includes('maraich');
        if (targetCat === 'cereales') return cat.includes('céréal') || cat.includes('cereal');
        if (targetCat === 'elevage') return cat.includes('élev') || cat.includes('elev');
        if (targetCat === 'irrigation') return cat.includes('irrig');
        if (targetCat === 'sol-fertilisation') return cat.includes('sol') || cat.includes('fertil');
        if (targetCat === 'maladies-ravageurs') return cat.includes('malad') || cat.includes('ravage');
        if (targetCat === 'recolte-conservation') return cat.includes('récolt') || cat.includes('recolt') || cat.includes('conserv');
        return cat.includes(targetCat);
      });
    }

    // Plus récents en premier
    published.sort((a, b) => new Date(b.date_publication || b.created_at || 0) - new Date(a.date_publication || a.created_at || 0));

    if (published.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    function renderConseilCard(item) {
      const catClass = getConseilCategoryBadgeClass(item.categorie);
      return `
        <article class="conseil-card" data-id="${item.id}">
          <div class="conseil-card-top-meta">
            <span class="conseil-badge-category ${catClass}">${item.categorie || 'Conseil'}</span>
            <span class="conseil-badge-season">⏱️ ${item.duree_lecture || 3} min</span>
          </div>

          <div class="conseil-card-source">${item.source || 'INERA / DGPV Burkina Faso'}</div>
          <h3 class="conseil-card-title">${item.titre}</h3>

          ${item.cultures ? `<div class="conseil-cultures-tag"> ${item.cultures}</div>` : ''}

          <p class="conseil-card-resume">${item.resume || ''}</p>

          <div class="conseil-card-footer">
            <span class="conseil-season-tag"> ${item.saison || 'Toute l\'année'}</span>
            <button type="button" class="conseil-card-link-btn">Lire le conseil →</button>
          </div>
        </article>
      `;
    }

    const userCropTerms = getUserActiveCropTerms();
    const userTerms = getUserRegionTerms();

    let groupUserCrops = [];
    let remainingConseils = [...published];

    if (userCropTerms.length > 0) {
      groupUserCrops = published.filter(item => {
        if (!item.cultures) return false;
        return userCropTerms.some(term => matchesCropTerm(item.cultures, term));
      });
      const cropItemIds = new Set(groupUserCrops.map(item => item.id));
      remainingConseils = published.filter(item => !cropItemIds.has(item.id));
    }

    let html = '';

    // 1. Section « Pour vos cultures » en priorité absolue si le producteur a des cultures actives
    if (groupUserCrops.length > 0) {
      html += `
        <div class="region-section-divider" style="border-left-color: #1E5E2A;">
          <h3 class="region-section-title"> Pour vos cultures</h3>
          <span class="region-section-badge" style="background: #EAF4E6; color: #1E5E2A;">${groupUserCrops.length} conseil${groupUserCrops.length > 1 ? 's' : ''}</span>
        </div>
        ${groupUserCrops.map(renderConseilCard).join('')}
      `;
    }

    // 2. Sections régionales (Pour votre région, Tout le Burkina Faso, Autres régions)
    if (userTerms && userTerms.length > 0) {
      const groupUserRegion = [];
      const groupNational = [];
      const groupOther = [];

      remainingConseils.forEach(item => {
        const group = getItemRegionGroup(item.regions, userTerms);
        if (group === 'user_region') groupUserRegion.push(item);
        else if (group === 'national') groupNational.push(item);
        else groupOther.push(item);
      });

      if (groupUserRegion.length > 0) {
        html += `
          <div class="region-section-divider" style="border-left-color: #C8862A;">
            <h3 class="region-section-title"> Pour votre région</h3>
            <span class="region-section-badge" style="background: #FFF8E1; color: #8D5B15;">${groupUserRegion.length} conseil${groupUserRegion.length > 1 ? 's' : ''}</span>
          </div>
          ${groupUserRegion.map(renderConseilCard).join('')}
        `;
      }

      if (groupNational.length > 0) {
        html += `
          <div class="region-section-divider" style="border-left-color: #2E7D32;">
            <h3 class="region-section-title"> Tout le Burkina Faso</h3>
            <span class="region-section-badge" style="background: #E8F5E9; color: #1B5E20;">${groupNational.length} conseil${groupNational.length > 1 ? 's' : ''}</span>
          </div>
          ${groupNational.map(renderConseilCard).join('')}
        `;
      }

      if (groupOther.length > 0) {
        html += `
          <div class="region-section-divider" style="border-left-color: #78909C;">
            <h3 class="region-section-title"> Autres régions</h3>
            <span class="region-section-badge" style="background: #ECEFF1; color: #455A64;">${groupOther.length} conseil${groupOther.length > 1 ? 's' : ''}</span>
          </div>
          ${groupOther.map(renderConseilCard).join('')}
        `;
      }
    } else {
      // Aucune région définie sur les parcelles : afficher les conseils restants
      if (groupUserCrops.length > 0 && remainingConseils.length > 0) {
        html += `
          <div class="region-section-divider" style="border-left-color: #2E7D32;">
            <h3 class="region-section-title"> Autres conseils</h3>
            <span class="region-section-badge" style="background: #E8F5E9; color: #1B5E20;">${remainingConseils.length} conseil${remainingConseils.length > 1 ? 's' : ''}</span>
          </div>
          ${remainingConseils.map(renderConseilCard).join('')}
        `;
      } else if (groupUserCrops.length === 0) {
        html = remainingConseils.map(renderConseilCard).join('');
      }
    }

    grid.innerHTML = html;
  }

  function renderAdminConseils() {
    const list = document.getElementById('adminConseilsList');
    const emptyState = document.getElementById('adminConseilsEmptyState');
    if (!list) return;

    let items = [...cachedConseils];

    // En attente en premier, puis date décroissante
    items.sort((a, b) => {
      if (a.statut === 'en_attente' && b.statut !== 'en_attente') return -1;
      if (a.statut !== 'en_attente' && b.statut === 'en_attente') return 1;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    if (adminConseilActiveStatusTab !== 'all') {
      items = items.filter(c => c.statut === adminConseilActiveStatusTab);
    }

    if (items.length === 0) {
      list.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    list.innerHTML = items.map(c => {
      const isPending = c.statut === 'en_attente';
      const isPublie = c.statut === 'publie';
      const isArchive = c.statut === 'archive';
      const catClass = getConseilCategoryBadgeClass(c.categorie);

      return `
        <div class="admin-financement-item ${isPending ? 'pending-highlight' : ''}" data-id="${c.id}">
          <div class="admin-item-top">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span class="admin-status-pill status-${c.statut}">
                ${isPending ? '⏳ En attente' : (isPublie ? ' Publié' : ' Archivé')}
              </span>
              <span class="conseil-badge-category ${catClass}" style="font-size: 11px; padding: 2px 8px;">${c.categorie || 'Conseil'}</span>
            </div>
            <span class="admin-item-date">${c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
          </div>

          <h4 class="admin-item-title">${c.titre}</h4>
          ${c.cultures ? `<div style="font-size: 12px; color: #1E5E2A; margin: 4px 0 6px 0;"> Cultures : <strong>${c.cultures}</strong></div>` : ''}
          <p class="admin-item-desc">${c.resume || ''}</p>

          <div class="admin-item-footer">
            <div class="admin-item-meta-info">
              <span>⏱️ ${c.duree_lecture || 3} min</span> •
              <span> ${c.saison || 'Toute l\'année'}</span> •
              <span>️ ${c.source || 'INERA / DGPV'}</span>
            </div>
            <div class="admin-actions-group">
              <button type="button" class="btn-admin-action btn-admin-view" data-action="view" data-id="${c.id}">Lire</button>
              <button type="button" class="btn-admin-action btn-admin-edit" data-action="edit" data-id="${c.id}">Modifier</button>
              ${isPending || isArchive ? `<button type="button" class="btn-admin-action btn-admin-publish" data-action="publish" data-id="${c.id}">Publier</button>` : ''}
              ${!isArchive ? `<button type="button" class="btn-admin-action btn-admin-archive" data-action="archive" data-id="${c.id}">Archiver</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Modale de Gestion (Ajout / Modification)
  function openManageConseilModal(conseil = null) {
    if (!modalManageConseil) return;

    const modalTitle = document.getElementById('manageConseilModalTitle');
    const inputId = document.getElementById('conseilId');
    const inputTitre = document.getElementById('conseilTitre');
    const inputCat = document.getElementById('conseilCategorie');
    const inputCultures = document.getElementById('conseilCultures');
    const inputSaison = document.getElementById('conseilSaison');
    const inputRegions = document.getElementById('conseilRegions');
    const inputDuree = document.getElementById('conseilDuree');
    const inputSource = document.getElementById('conseilSource');
    const inputStatut = document.getElementById('conseilStatut');
    const inputResume = document.getElementById('conseilResume');
    const inputContenu = document.getElementById('conseilContenu');
    const btnSaveText = document.getElementById('btnSaveConseilText');

    if (conseil) {
      if (modalTitle) modalTitle.textContent = 'Modifier le conseil agronomique';
      if (inputId) inputId.value = conseil.id;
      if (inputTitre) inputTitre.value = conseil.titre || '';
      if (inputCat) inputCat.value = conseil.categorie || 'maraîchage';
      if (inputCultures) inputCultures.value = conseil.cultures || '';
      if (inputSaison) inputSaison.value = conseil.saison || 'toute l\'année';
      if (inputRegions) inputRegions.value = conseil.regions || 'Tout le Burkina Faso';
      if (inputDuree) inputDuree.value = conseil.duree_lecture || 3;
      if (inputSource) inputSource.value = conseil.source || '';
      if (inputStatut) inputStatut.value = conseil.statut || 'publie';
      if (inputResume) inputResume.value = conseil.resume || '';
      if (inputContenu) inputContenu.value = conseil.contenu || '';
      if (btnSaveText) btnSaveText.textContent = 'Mettre à jour le conseil';
    } else {
      if (modalTitle) modalTitle.textContent = 'Ajouter un conseil agronomique';
      if (formManageConseil) formManageConseil.reset();
      if (inputId) inputId.value = '';
      if (inputCat) inputCat.value = 'maraîchage';
      if (inputSaison) inputSaison.value = 'toute l\'année';
      if (inputRegions) inputRegions.value = 'Tout le Burkina Faso';
      if (inputDuree) inputDuree.value = 3;
      if (inputStatut) inputStatut.value = 'publie';
      if (btnSaveText) btnSaveText.textContent = 'Enregistrer le conseil';
    }

    modalManageConseil.classList.remove('hidden');
  }

  function closeManageConseilModal() {
    if (modalManageConseil) modalManageConseil.classList.add('hidden');
  }

  // Publication & Archivage rapides
  async function publishConseil(id) {
    if (!supabaseClient) return;
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabaseClient
        .from('conseils')
        .update({ statut: 'publie', date_publication: nowIso, updated_at: nowIso })
        .eq('id', id);
      if (error) throw error;
      showToast('Conseil publié', 'La fiche est désormais visible de tous les producteurs.');
      await fetchConseils();
    } catch (err) {
      console.error('Erreur publishConseil :', err);
      showToast('Erreur', 'Impossible de publier le conseil.', 'error');
    }
  }

  async function archiveConseil(id) {
    if (!supabaseClient) return;
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabaseClient
        .from('conseils')
        .update({ statut: 'archive', updated_at: nowIso })
        .eq('id', id);
      if (error) throw error;
      showToast('Conseil archivé', 'La fiche a été déplacée dans les archives.');
      await fetchConseils();
    } catch (err) {
      console.error('Erreur archiveConseil :', err);
      showToast('Erreur', "Impossible d'archiver le conseil.", 'error');
    }
  }

  // Synthèse vocale pour conseils agronomiques
  let currentReadingConseil = null;

  function stopConseilSpeech() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    if (activeConseilSpeechBtn) {
      activeConseilSpeechBtn.innerHTML = ' <span>Écouter le conseil</span>';
      activeConseilSpeechBtn.classList.remove('speaking');
      activeConseilSpeechBtn = null;
    }
  }

  function speakConseil(conseil, btnElement) {
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking && activeConseilSpeechBtn === btnElement) {
      stopConseilSpeech();
      return;
    }

    stopConseilSpeech();

    const defSource = "Ministère de l'Agriculture du Burkina Faso";
    const speechText = `Conseil agronomique : ${conseil.titre}. Catégorie : ${conseil.categorie || ''}. Cultures : ${conseil.cultures || 'cultures sahéliennes'}. Résumé : ${conseil.resume || ''}. Détails et étapes : ${conseil.contenu || ''}. Source : ${conseil.source || defSource}.`;

    try {
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.92;

      utterance.onstart = () => {
        activeConseilSpeechBtn = btnElement;
        btnElement.innerHTML = '⏹️ <span>Arrêter la lecture</span>';
        btnElement.classList.add('speaking');
      };

      utterance.onend = () => {
        stopConseilSpeech();
      };

      utterance.onerror = () => {
        stopConseilSpeech();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Erreur synthèse vocale conseil :', err);
      stopConseilSpeech();
    }
  }

  // Modale Détails du Conseil (Lecture complète)
  function openConseilDetailsModal(conseil) {
    if (!modalConseilDetails || !conseil) return;
    currentReadingConseil = conseil;

    const catEl = document.getElementById('conseilDetailCategory');
    const seasonEl = document.getElementById('conseilDetailSeason');
    const timeEl = document.getElementById('conseilDetailReadTime');
    const sourceEl = document.getElementById('conseilDetailSource');
    const titleEl = document.getElementById('conseilDetailTitle');
    const cultTag = document.getElementById('conseilDetailCulturesTag');
    const cultEl = document.getElementById('conseilDetailCultures');
    const resumeEl = document.getElementById('conseilDetailResume');
    const contentEl = document.getElementById('conseilDetailContent');
    const regEl = document.getElementById('conseilDetailRegions');
    const dateEl = document.getElementById('conseilDetailDate');

    if (catEl) {
      catEl.className = `conseil-badge-category ${getConseilCategoryBadgeClass(conseil.categorie)}`;
      catEl.textContent = conseil.categorie || 'Conseil';
    }
    if (seasonEl) seasonEl.textContent = ` ${conseil.saison || 'Toute l\'année'}`;
    if (timeEl) timeEl.textContent = `⏱️ ${conseil.duree_lecture || 3} min`;
    if (sourceEl) sourceEl.textContent = conseil.source || 'INERA / DGPV Burkina Faso';
    if (titleEl) titleEl.textContent = conseil.titre;

    if (cultTag) {
      if (conseil.cultures && conseil.cultures.trim() !== '') {
        cultTag.classList.remove('hidden');
        if (cultEl) cultEl.textContent = conseil.cultures;
      } else {
        cultTag.classList.add('hidden');
      }
    }

    if (resumeEl) resumeEl.textContent = conseil.resume || '';

    if (contentEl) {
      const lines = (conseil.contenu || '').split('\n').filter(l => l.trim() !== '');
      if (lines.length > 1) {
        contentEl.innerHTML = lines.map(line => {
          const trimmed = line.trim();
          if (/^\d+[\.\)]/.test(trimmed)) {
            const firstSpace = trimmed.indexOf(' ');
            if (firstSpace > -1) {
              return `<p style="margin-bottom: 10px; font-weight: 500;"><strong style="color: #1E5E2A;">${trimmed.substring(0, firstSpace)}</strong> ${trimmed.substring(firstSpace + 1)}</p>`;
            }
          }
          return `<p style="margin-bottom: 10px;">${trimmed}</p>`;
        }).join('');
      } else {
        contentEl.innerHTML = `<p>${conseil.contenu || ''}</p>`;
      }
    }

    if (regEl) regEl.textContent = conseil.regions || 'Tout le Burkina Faso';
    if (dateEl) {
      const d = conseil.date_publication ? new Date(conseil.date_publication) : (conseil.created_at ? new Date(conseil.created_at) : new Date());
      dateEl.textContent = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const listenBtn = document.getElementById('btnListenConseil');
    if (listenBtn) {
      listenBtn.innerHTML = ' <span>Écouter le conseil</span>';
      listenBtn.classList.remove('speaking');
    }

    modalConseilDetails.classList.remove('hidden');
  }

  function closeConseilDetailsModal() {
    stopConseilSpeech();
    currentReadingConseil = null;
    if (modalConseilDetails) modalConseilDetails.classList.add('hidden');
  }

  // Écouteurs d'événements du module Conseils
  if (formManageConseil) {
    formManageConseil.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!supabaseClient) return;

      const conseilId = document.getElementById('conseilId')?.value?.trim();
      const titre = document.getElementById('conseilTitre')?.value?.trim();
      const categorie = document.getElementById('conseilCategorie')?.value;
      const cultures = document.getElementById('conseilCultures')?.value?.trim() || null;
      const saison = document.getElementById('conseilSaison')?.value || 'toute l\'année';
      const regions = document.getElementById('conseilRegions')?.value?.trim() || 'Tout le Burkina Faso';
      const duree_lecture = parseInt(document.getElementById('conseilDuree')?.value, 10) || 3;
      const source = document.getElementById('conseilSource')?.value?.trim() || null;
      const statut = document.getElementById('conseilStatut')?.value || 'publie';
      const resume = document.getElementById('conseilResume')?.value?.trim();
      const contenu = document.getElementById('conseilContenu')?.value?.trim();

      const nowIso = new Date().toISOString();
      const payload = {
        titre,
        categorie,
        cultures,
        saison,
        regions,
        duree_lecture,
        source,
        statut,
        resume,
        contenu,
        updated_at: nowIso
      };

      const btnSave = document.getElementById('btnSaveConseil');
      const btnSaveText = document.getElementById('btnSaveConseilText');
      if (btnSave) btnSave.disabled = true;
      if (btnSaveText) btnSaveText.textContent = 'Enregistrement en cours...';

      try {
        if (conseilId) {
          if (statut === 'publie') {
            const existing = cachedConseils.find(c => c.id === conseilId);
            if (!existing || !existing.date_publication) {
              payload.date_publication = nowIso;
            }
          }
          const { error } = await supabaseClient
            .from('conseils')
            .update(payload)
            .eq('id', conseilId);
          if (error) throw error;
          showToast('Conseil mis à jour', `Le conseil « ${titre} » a été actualisé.`);
        } else {
          payload.created_at = nowIso;
          if (statut === 'publie') {
            payload.date_publication = nowIso;
          }
          const { error } = await supabaseClient
            .from('conseils')
            .insert([payload]);
          if (error) throw error;
          showToast('Conseil ajouté', `Le conseil « ${titre} » a été créé avec succès.`);
        }

        closeManageConseilModal();
        await fetchConseils();
        if (typeof fetchNotifications === 'function') fetchNotifications().catch(() => {});
      } catch (err) {
        console.error('Erreur enregistrement conseil :', err);
        showToast('Erreur', err.message || 'Impossible d\'enregistrer le conseil.', 'error');
      } finally {
        if (btnSave) btnSave.disabled = false;
        if (btnSaveText) btnSaveText.textContent = conseilId ? 'Mettre à jour le conseil' : 'Enregistrer le conseil';
      }
    });
  }

  const btnOpenAddConseilModal = document.getElementById('btnOpenAddConseilModal');
  if (btnOpenAddConseilModal) {
    btnOpenAddConseilModal.addEventListener('click', () => openManageConseilModal());
  }

  const btnCloseManageConseil = document.getElementById('btnCloseManageConseil');
  if (btnCloseManageConseil) {
    btnCloseManageConseil.addEventListener('click', closeManageConseilModal);
  }

  const btnCancelManageConseil = document.getElementById('btnCancelManageConseil');
  if (btnCancelManageConseil) {
    btnCancelManageConseil.addEventListener('click', closeManageConseilModal);
  }

  if (modalManageConseil) {
    modalManageConseil.addEventListener('click', (e) => {
      if (e.target === modalManageConseil) closeManageConseilModal();
    });
  }

  const btnCloseConseilDetails = document.getElementById('btnCloseConseilDetails');
  if (btnCloseConseilDetails) {
    btnCloseConseilDetails.addEventListener('click', closeConseilDetailsModal);
  }

  const btnCloseConseilDetailsBottom = document.getElementById('btnCloseConseilDetailsBottom');
  if (btnCloseConseilDetailsBottom) {
    btnCloseConseilDetailsBottom.addEventListener('click', closeConseilDetailsModal);
  }

  if (modalConseilDetails) {
    modalConseilDetails.addEventListener('click', (e) => {
      if (e.target === modalConseilDetails) closeConseilDetailsModal();
    });
  }

  const btnListenConseil = document.getElementById('btnListenConseil');
  if (btnListenConseil) {
    btnListenConseil.addEventListener('click', () => {
      if (currentReadingConseil) {
        speakConseil(currentReadingConseil, btnListenConseil);
      }
    });
  }

  const conseilCategoryChips = document.querySelectorAll('#conseilsCategoryFilters .type-filter-chip');
  conseilCategoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      conseilCategoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      userSelectedConseilCategory = chip.getAttribute('data-cat') || 'all';
      renderUserConseils();
    });
  });

  const adminConseilTabs = document.querySelectorAll('#adminConseilsStatusTabsGroup .admin-status-tab');
  adminConseilTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminConseilTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      adminConseilActiveStatusTab = tab.getAttribute('data-status') || 'all';
      renderAdminConseils();
    });
  });

  const btnQuickFilterPendingConseils = document.getElementById('btnQuickFilterPendingConseils');
  if (btnQuickFilterPendingConseils) {
    btnQuickFilterPendingConseils.addEventListener('click', () => {
      adminConseilActiveStatusTab = 'en_attente';
      adminConseilTabs.forEach(t => t.classList.remove('active'));
      const pendingTab = document.getElementById('tabConseilEnAttente');
      if (pendingTab) pendingTab.classList.add('active');
      renderAdminConseils();
    });
  }

  const userConseilsGrid = document.getElementById('userConseilsGrid');
  if (userConseilsGrid) {
    userConseilsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.conseil-card');
      if (!card) return;
      const id = card.getAttribute('data-id');
      const item = cachedConseils.find(c => c.id === id);
      if (item) {
        openConseilDetailsModal(item);
      }
    });
  }

  const adminConseilsList = document.getElementById('adminConseilsList');
  if (adminConseilsList) {
    adminConseilsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-admin-action');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      const item = cachedConseils.find(c => c.id === id);
      if (!item) return;

      if (action === 'view') {
        openConseilDetailsModal(item);
      } else if (action === 'edit') {
        openManageConseilModal(item);
      } else if (action === 'publish') {
        publishConseil(id);
      } else if (action === 'archive') {
        archiveConseil(id);
      }
    });
  }

  // ==========================================
  // MODULE MODÈLES DE CULTURES & PARCELLES (SUPABASE CONNECTÉ)
  // ==========================================

  async function fetchModelesCultures() {
    if (!supabaseClient) return cachedModelesCultures || [];
    try {
      const { data, error } = await supabaseClient
        .from('modeles_cultures')
        .select('*')
        .order('nom_culture', { ascending: true });

      if (!error && data) {
        cachedModelesCultures = data;
        updateModelesUI();
      }
    } catch (err) {
      console.warn('️ Erreur fetchModelesCultures :', err);
    }
    return cachedModelesCultures || [];
  }

  // ==========================================
  // RÉGIONS DU BURKINA FASO (17 RÉGIONS OFFICIELLES)
  // ==========================================

  async function fetchRegions() {
    if (cachedRegions && cachedRegions.length > 0) return cachedRegions;
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('regions')
        .select('id, nom, chef_lieu, anciens_noms, ordre')
        .order('nom', { ascending: true });

      if (!error && data) {
        cachedRegions = data;
        populateRegionsSelect();
        return data;
      }
    } catch (err) {
      console.warn('️ Erreur fetchRegions :', err);
    }
    return [];
  }

  function populateRegionsSelect() {
    const sel = document.getElementById('parcelRegionSelect');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">-- Choisissez votre région --</option>' +
      (cachedRegions || []).map(r => `<option value="${r.id}">${escapeHtml(r.nom)} (${escapeHtml(r.chef_lieu)})</option>`).join('');
    if (currentVal) sel.value = currentVal;
  }

  async function fetchUserParcels(profileId = currentProfileKey) {
    if (!supabaseClient || !profileId) return [];
    try {
      const { data, error } = await supabaseClient
        .from('parcels')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        cachedUserParcels = data;
        updateFinancialMetrics();
        if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
          renderMobileView();
        }
        return data;
      }
      return [];
    } catch (err) {
      console.warn('️ Erreur fetchUserParcels :', err);
      return [];
    }
  }

  function normalizeTextForComparison(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function matchesCropTerm(culturesText, cropTerm) {
    if (!culturesText || !cropTerm) return false;
    const cleanText = normalizeTextForComparison(culturesText);
    const cleanTerm = normalizeTextForComparison(cropTerm);
    if (!cleanText || !cleanTerm) return false;

    const escaped = escapeRegex(cleanTerm);
    const regex = new RegExp('(?:^|[^a-z0-9_\\-])' + escaped + 's?(?=$|[^a-z0-9_\\-])', 'i');
    return regex.test(cleanText);
  }

  function getUserActiveCropTerms() {
    const profileData = PROFILES_DATA[currentProfileKey] || {};
    const cycles = profileData.realCycles || cachedCropCycles || [];
    if (!cycles || cycles.length === 0) return [];

    const terms = new Set();
    cycles.forEach(c => {
      if (c.modele_id) {
        const m = (cachedModelesCultures || []).find(item => String(item.id) === String(c.modele_id));
        if (m && m.nom_culture && m.nom_culture.trim()) {
          terms.add(m.nom_culture.trim());
        }
      }
      if (c.crop_name && c.crop_name.trim()) {
        const rawName = c.crop_name.trim();
        const matchedM = (cachedModelesCultures || []).find(item => {
          if (!item.nom_culture) return false;
          return matchesCropTerm(rawName, item.nom_culture) || matchesCropTerm(item.nom_culture, rawName);
        });
        if (matchedM && matchedM.nom_culture) {
          terms.add(matchedM.nom_culture.trim());
        } else {
          const firstWord = rawName.split(/[\s\(\–\-,;]/)[0].trim();
          if (firstWord && firstWord.length >= 3) {
            terms.add(firstWord);
          }
          const base = rawName.split(/[\(\–\-]/)[0].trim();
          if (base) terms.add(base);
        }
      }
    });

    return Array.from(terms);
  }

  function getUserRegionTerms() {
    const parcels = cachedUserParcels || [];
    const terms = new Set();
    parcels.forEach(p => {
      if (!p.region_id) return;
      const region = (cachedRegions || []).find(r => r.id === p.region_id);
      if (region) {
        if (region.nom) terms.add(region.nom.trim());
        if (region.chef_lieu) terms.add(region.chef_lieu.trim());
        if (Array.isArray(region.anciens_noms)) {
          region.anciens_noms.forEach(an => {
            if (an && String(an).trim()) terms.add(String(an).trim());
          });
        }
      }
    });
    return Array.from(terms);
  }

  function escapeRegex(string) {
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function matchesWholeTerm(text, term) {
    if (!text || !term) return false;
    const str = String(text);
    const escaped = escapeRegex(String(term).trim());
    if (!escaped) return false;
    // Whole-word matching excluding letters, digits, accents, hyphens and underscores
    // \u00C0-\u00FF covers all Latin-1 accented characters (À to ÿ)
    // Escaped \- prevents "Range out of order" syntax errors
    const regex = new RegExp('(?:^|[^a-zA-Z0-9\\u00C0-\\u00FF_\\-])' + escaped + '(?=$|[^a-zA-Z0-9\\u00C0-\\u00FF_\\-])', 'i');
    return regex.test(str);
  }

  function getItemRegionGroup(itemRegionText, userTerms) {
    const text = String(itemRegionText || '').trim();

    // 1. Pour votre région : si l'un des termes de la région de l'utilisateur correspond
    if (userTerms && userTerms.length > 0) {
      for (const term of userTerms) {
        if (matchesWholeTerm(text, term)) {
          return 'user_region';
        }
      }
    }

    // 2. Tout le Burkina Faso
    if (
      matchesWholeTerm(text, 'Tout le Burkina Faso') ||
      matchesWholeTerm(text, 'Tout le Burkina') ||
      matchesWholeTerm(text, 'National') ||
      /tout\s+le\s+burkina/i.test(text) ||
      /national/i.test(text) ||
      text === '' ||
      text.toLowerCase() === 'toutes'
    ) {
      return 'national';
    }

    // 3. Autres régions
    return 'other_regions';
  }

  async function openAddParcelModal(parcelId = null) {
    if (!modalAddParcel) return;
    if (cachedRegions.length === 0) {
      await fetchRegions();
    } else {
      populateRegionsSelect();
    }

    const titleEl = document.getElementById('addParcelModalTitle');
    const submitBtnText = document.getElementById('btnSubmitAddParcelText');
    const pIdInput = document.getElementById('parcelId');
    const nameInput = document.getElementById('parcelName');
    const regionSelect = document.getElementById('parcelRegionSelect');
    const areaInput = document.getElementById('parcelArea');
    const villageInput = document.getElementById('parcelVillage') || document.getElementById('parcelLocation');
    const irrigationSelect = document.getElementById('parcelIrrigation');

    if (parcelId) {
      const p = (cachedUserParcels || []).find(item => String(item.id) === String(parcelId));
      if (p) {
        if (pIdInput) pIdInput.value = p.id;
        if (titleEl) titleEl.textContent = 'Modifier la parcelle';
        if (submitBtnText) submitBtnText.textContent = 'Enregistrer les modifications';
        if (nameInput) nameInput.value = p.name || '';
        if (regionSelect) regionSelect.value = p.region_id || '';
        if (areaInput) areaInput.value = p.area_ha || '';
        if (villageInput) villageInput.value = p.village || p.location || '';
        if (irrigationSelect) irrigationSelect.value = p.irrigation_type || 'goutte-à-goutte';
      }
    } else {
      if (pIdInput) pIdInput.value = '';
      if (titleEl) titleEl.textContent = 'Ajouter une parcelle';
      if (submitBtnText) submitBtnText.textContent = 'Enregistrer la parcelle';
      if (formAddParcel) formAddParcel.reset();
      if (irrigationSelect) irrigationSelect.value = 'goutte-à-goutte';
    }

    modalAddParcel.classList.remove('hidden');
  }

  function closeAddParcelModal() {
    if (modalAddParcel) modalAddParcel.classList.add('hidden');
    if (formAddParcel) formAddParcel.reset();
  }

  async function handleSaveParcel(e) {
    e.preventDefault();
    if (!supabaseClient) {
      showToast('Erreur', 'Connexion Supabase non initialisée.');
      return;
    }

    let authUser = null;
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      authUser = user;
    } catch (err) {
      console.warn('Erreur getUser :', err);
    }
    const profileId = authUser?.id || currentProfileKey;

    if (!profileId) {
      showToast('Erreur', 'Veuillez vous connecter pour gérer vos parcelles.');
      return;
    }

    const parcelId = document.getElementById('parcelId')?.value;
    const name = document.getElementById('parcelName')?.value?.trim();
    const regionId = document.getElementById('parcelRegionSelect')?.value;
    const area = parseFloat(document.getElementById('parcelArea')?.value);
    const village = (document.getElementById('parcelVillage')?.value || document.getElementById('parcelLocation')?.value || '').trim();
    const irrigation = document.getElementById('parcelIrrigation')?.value;
    const btnSubmit = document.getElementById('btnSubmitAddParcel');
    const btnText = document.getElementById('btnSubmitAddParcelText');

    if (!name) {
      alert('Veuillez donner un nom à votre parcelle.');
      return;
    }
    if (!regionId) {
      alert('Veuillez sélectionner la région de votre parcelle.');
      return;
    }
    if (isNaN(area) || area <= 0) {
      alert('Veuillez indiquer une superficie valide en hectares.');
      return;
    }

    try {
      if (btnSubmit) btnSubmit.disabled = true;
      if (btnText) btnText.textContent = 'Enregistrement...';

      const payload = {
        profile_id: profileId,
        name: name,
        region_id: regionId,
        area_ha: area,
        village: village || null,
        location: village || null,
        irrigation_type: irrigation || 'goutte-à-goutte'
      };

      if (parcelId) {
        const { error: updErr } = await supabaseClient
          .from('parcels')
          .update(payload)
          .eq('id', parcelId)
          .eq('profile_id', profileId);
        if (updErr) throw updErr;
        showToast('Parcelle modifiée', `La parcelle ${name} a été mise à jour.`);
      } else {
        const { error: insErr } = await supabaseClient
          .from('parcels')
          .insert([payload]);
        if (insErr) throw insErr;
        showToast('Parcelle enregistrée', `La parcelle ${name} a été ajoutée.`);
      }

      closeAddParcelModal();
      await fetchUserParcels(profileId);
      if (currentRoutePage === 'parcelles') {
        renderParcellesPage();
      } else if (currentRoutePage === 'synthese') {
        renderSynthesePage();
      }
      renderUserConseils();
      renderUserFinancements();
    } catch (err) {
      console.error('Erreur handleSaveParcel :', err);
      showToast('Erreur', err.message || 'Impossible d\'enregistrer la parcelle.');
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
      if (btnText) btnText.textContent = parcelId ? 'Enregistrer les modifications' : 'Enregistrer la parcelle';
    }
  }

  async function deleteParcel(parcelId) {
    if (!confirm('Voulez-vous vraiment supprimer cette parcelle ? Ses cultures associées perdront leur rattachement.')) {
      return;
    }
    if (!supabaseClient) return;

    let authUser = null;
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      authUser = user;
    } catch (err) {}
    const profileId = authUser?.id || currentProfileKey;

    try {
      const { error } = await supabaseClient
        .from('parcels')
        .delete()
        .eq('id', parcelId)
        .eq('profile_id', profileId);

      if (!error) {
        showToast('Parcelle supprimée', 'La parcelle a été supprimée avec succès.');
        await fetchUserParcels(profileId);
        if (currentRoutePage === 'parcelles') {
          renderParcellesPage();
        }
        renderUserConseils();
        renderUserFinancements();
      } else {
        showToast('Erreur', error.message || 'Impossible de supprimer la parcelle.');
      }
    } catch (err) {
      console.error('Erreur deleteParcel :', err);
      showToast('Erreur', 'Erreur lors de la suppression.');
    }
  }

  function formatFrancsCFA(num) {
    const val = Math.round(Math.abs(num) || 0);
    const parts = [];
    const str = String(val);
    let count = 0;
    for (let i = str.length - 1; i >= 0; i--) {
      parts.unshift(str[i]);
      count++;
      if (count % 3 === 0 && i > 0) {
        parts.unshift(' ');
      }
    }
    return `${parts.join('')} francs CFA`;
  }

  function listenParcelBalance(parcelId) {
    if (!('speechSynthesis' in window)) {
      alert('La synthèse vocale n\'est pas disponible sur votre navigateur.');
      return;
    }

    const btn = document.querySelector(`.btn-listen-parcel-balance[data-parcel-id="${parcelId}"]`);

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (activeParcelSpeechBtn) {
        activeParcelSpeechBtn.classList.remove('speaking');
        activeParcelSpeechBtn.innerHTML = ' <span>Écouter</span>';
        activeParcelSpeechBtn = null;
      }
      return;
    }

    const parcel = (cachedUserParcels || []).find(p => String(p.id) === String(parcelId));
    if (!parcel) return;

    const parcelCrops = (cachedCropCycles || []).filter(c => c.parcel_id === parcel.id);
    const parcelCropIds = new Set(parcelCrops.map(c => c.id));

    const parcelExpenses = (cachedExpenses || []).filter(e => e.crop_cycle_id && parcelCropIds.has(e.crop_cycle_id));
    const totalExpenses = parcelExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const parcelRevenues = (cachedRevenues || []).filter(r => r.crop_cycle_id && parcelCropIds.has(r.crop_cycle_id));
    const totalSales = parcelRevenues.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    const gain = totalSales - totalExpenses;

    let text = '';
    if (totalExpenses === 0 && totalSales === 0) {
      text = `Bilan de la parcelle ${parcel.name}. Ajoutez vos dépenses et vos ventes pour voir si cette parcelle vous fait gagner de l'argent.`;
    } else {
      text = `Bilan de la parcelle ${parcel.name}. Total des dépenses : ${formatFrancsCFA(totalExpenses)}. Total des ventes : ${formatFrancsCFA(totalSales)}. `;
      if (gain > 0) {
        text += `Vous avez gagné ${formatFrancsCFA(gain)}. `;
      } else if (gain < 0) {
        text += `Vous avez perdu ${formatFrancsCFA(Math.abs(gain))}. `;
      } else {
        text += `Votre résultat est à l'équilibre, zéro francs CFA. `;
      }

      if (parcelCrops.length > 0) {
        text += `Détail par culture : `;
        parcelCrops.forEach(c => {
          const cExp = (cachedExpenses || []).filter(e => e.crop_cycle_id === c.id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          const cRev = (cachedRevenues || []).filter(r => r.crop_cycle_id === c.id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
          const cGain = cRev - cExp;
          const plantingStr = c.planting_date ? `, semé le ${formatDateEnToutesLettres(new Date(c.planting_date))}` : '';
          const gStr = cGain > 0 
            ? `gain ${formatFrancsCFA(cGain)}` 
            : (cGain < 0 ? `perte ${formatFrancsCFA(Math.abs(cGain))}` : 'gain zéro francs CFA');
          text += `${c.crop_name}${plantingStr} : dépenses ${formatFrancsCFA(cExp)}, ventes ${formatFrancsCFA(cRev)}, ${gStr}. `;
        });
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.92;

    utterance.onstart = () => {
      if (btn) {
        btn.classList.add('speaking');
        btn.innerHTML = '⏹️ <span>Arrêter</span>';
        activeParcelSpeechBtn = btn;
      }
    };

    utterance.onend = utterance.onerror = () => {
      if (btn) {
        btn.classList.remove('speaking');
        btn.innerHTML = ' <span>Écouter</span>';
      }
      activeParcelSpeechBtn = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  function updateModelesUI() {
    const bDesk = document.getElementById('navAdminModelesBadge');
    if (bDesk) {
      bDesk.textContent = cachedModelesCultures.length;
      bDesk.style.display = cachedModelesCultures.length > 0 ? '' : 'none';
    }
    const bMobile = document.getElementById('mobileDrawerModelesBadge');
    if (bMobile) {
      bMobile.textContent = cachedModelesCultures.length;
      bMobile.style.display = cachedModelesCultures.length > 0 ? '' : 'none';
    }

    if (currentRoutePage === 'admin-modeles') {
      renderAdminModeles();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatSourceDisplay(rawSource) {
    if (!rawSource) return { org: '', url: '' };
    const str = String(rawSource).trim();
    // Extraire l'URL si présente
    const urlMatch = str.match(/https?:\/\/[^\s,)]+/i);
    const url = urlMatch ? urlMatch[0] : '';

    // Nom de l'organisme : texte avant la première virgule ou avant « http »
    let org = str;
    const httpIdx = org.search(/https?:\/\//i);
    if (httpIdx !== -1) {
      org = org.substring(0, httpIdx).trim();
    }
    const commaIdx = org.indexOf(',');
    if (commaIdx !== -1) {
      org = org.substring(0, commaIdx).trim();
    }
    // Nettoyer d'éventuels préfixes "Source :" ou séparateurs en fin
    org = org.replace(/^Source\s*:\s*/i, '').replace(/[,;:\s]+$/, '').trim();
    if (!org) org = 'Organisme officiel';
    return { org, url };
  }

  function updateCropCycleCalculations(model) {
    if (!model) return;
    const forecastBox = document.getElementById('cropCycleForecastBox');
    const repiqRow = document.getElementById('cropForecastRepiquageRow');
    const repiqText = document.getElementById('cropForecastRepiquageText');
    const harvestText = document.getElementById('cropForecastHarvestText');
    const harvestInput = document.getElementById('cropCycleHarvestDate');
    const adviceBox = document.getElementById('cropForecastAdviceBox');
    const adviceText = document.getElementById('cropForecastAdviceText');
    const sourceBox = document.getElementById('cropForecastSourceBox');
    const sourceText = document.getElementById('cropForecastSourceText');
    const plantingInput = document.getElementById('cropCyclePlantingDate');

    if (!plantingInput.value) {
      plantingInput.value = formatDateForInput(new Date());
    }

    const parts = plantingInput.value.split('-');
    const baseDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

    // 1. Pépinière & Repiquage
    if (model.mode_depart === 'pepiniere' && model.pepiniere_jours_min && model.pepiniere_jours_max) {
      const repiqMin = addDaysToDate(baseDate, model.pepiniere_jours_min);
      const repiqMax = addDaysToDate(baseDate, model.pepiniere_jours_max);
      const repiqMinFormatted = formatDateEnToutesLettres(repiqMin);
      const repiqMaxFormatted = formatDateEnToutesLettres(repiqMax);

      if (repiqMinFormatted === repiqMaxFormatted || repiqMin.getTime() === repiqMax.getTime()) {
        repiqText.textContent = `Repiquage prévu vers le ${repiqMinFormatted}`;
      } else {
        repiqText.textContent = `Repiquage prévu entre le ${repiqMinFormatted} et le ${repiqMaxFormatted}`;
      }
      repiqRow.classList.remove('hidden');
    } else {
      repiqRow.classList.add('hidden');
    }

    // 2. Récolte (comptée depuis le repiquage ou semis direct)
    if (model.recolte_jours_min != null && model.recolte_jours_min > 0) {
      const harvestMin = addDaysToDate(baseDate, model.recolte_jours_min);
      const harvestMax = model.recolte_jours_max ? addDaysToDate(baseDate, model.recolte_jours_max) : harvestMin;
      const harvestMinFormatted = formatDateEnToutesLettres(harvestMin);
      const harvestMaxFormatted = formatDateEnToutesLettres(harvestMax);
      
      harvestInput.value = formatDateForInput(harvestMin);
      if (!model.recolte_jours_max || harvestMinFormatted === harvestMaxFormatted || harvestMin.getTime() === harvestMax.getTime()) {
        harvestText.innerHTML = `Récolte prévue vers le <strong>${harvestMinFormatted}</strong>`;
      } else {
        harvestText.innerHTML = `Récolte prévue entre le <strong>${harvestMinFormatted}</strong> et le <strong>${harvestMaxFormatted}</strong>`;
      }
    } else {
      // Si recolte_jours est vide : ne rien calculer et afficher le message officiel
      harvestInput.value = '';
      harvestText.innerHTML = `<span class="forecast-warning-tag">Demandez la durée à l'agent d'agriculture de votre zone.</span>`;
    }

    // 3. Conseil court
    if (model.conseil_court && model.conseil_court.trim() !== '') {
      adviceText.textContent = model.conseil_court;
      adviceBox.classList.remove('hidden');
    } else {
      adviceBox.classList.add('hidden');
    }

    // 4. Source (nom de l'organisme seul et lien discret)
    if (model.source && model.source.trim() !== '') {
      const { org, url } = formatSourceDisplay(model.source);
      let html = escapeHtml(org);
      if (url) {
        html += ` <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="forecast-source-link">voir la source</a>`;
      }
      sourceText.innerHTML = html;
      sourceBox.classList.remove('hidden');
    } else {
      sourceBox.classList.add('hidden');
    }

    forecastBox.classList.remove('hidden');
  }

  function applySelectedModelToForm(model) {
    const nameInput = document.getElementById('cropCycleName');
    const catInput = document.getElementById('cropCycleCategory');
    const dateLabel = document.getElementById('cropCyclePlantingDateLabel');

    if (nameInput) {
      nameInput.value = model.variete ? `${model.nom_culture} (${model.variete})` : model.nom_culture;
    }
    if (catInput) {
      if (model.categorie) {
        const cleanNorm = (str) => (str || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim();

        const targetNorm = cleanNorm(model.categorie);
        let matched = false;

        for (let i = 0; i < catInput.options.length; i++) {
          const opt = catInput.options[i];
          if (cleanNorm(opt.value) === targetNorm || cleanNorm(opt.text) === targetNorm) {
            catInput.selectedIndex = i;
            catInput.value = opt.value;
            matched = true;
            break;
          }
        }

        if (!matched) {
          const opt = document.createElement('option');
          opt.value = model.categorie.toLowerCase();
          opt.textContent = model.categorie.charAt(0).toUpperCase() + model.categorie.slice(1);
          catInput.appendChild(opt);
          catInput.selectedIndex = catInput.options.length - 1;
          catInput.value = opt.value;
        }
      } else {
        catInput.value = 'maraîchage';
      }
    }
    if (dateLabel) {
      dateLabel.textContent = (model.mode_depart === 'pepiniere') ? 'Date de semis en pépinière' : 'Date de semis';
    }

    updateCropCycleCalculations(model);
  }

  async function openAddCropCycleModal(preselectedModelId = null) {
    if (!modalAddCropCycle) return;

    if (cachedModelesCultures.length === 0) {
      await fetchModelesCultures();
    }
    await fetchUserParcels(currentProfileKey);

    const modeleSelect = document.getElementById('cropCycleModeleSelect');
    if (modeleSelect) {
      const activeModeles = (cachedModelesCultures || []).filter(m => m.actif);
      modeleSelect.innerHTML = '<option value="">-- Choisir un modèle --</option>' +
        activeModeles.map(m => {
          const label = m.variete && m.variete.trim() ? `${m.nom_culture} – ${m.variete.trim()}` : m.nom_culture;
          return `<option value="${m.id}">${escapeHtml(label)}</option>`;
        }).join('') +
        '<option value="autre_culture">️ Autre culture (pas dans la liste)</option>';

      if (preselectedModelId) {
        modeleSelect.value = preselectedModelId;
      } else {
        modeleSelect.value = '';
      }
    }

    const parcelSelect = document.getElementById('cropCycleParcelSelect');
    const noParcelNotice = document.getElementById('cropModalNoParcelNotice');
    if (parcelSelect) {
      if (cachedUserParcels && cachedUserParcels.length > 0) {
        if (noParcelNotice) noParcelNotice.classList.add('hidden');
        parcelSelect.innerHTML = cachedUserParcels.map(p => {
          const region = (cachedRegions || []).find(r => r.id === p.region_id);
          const regText = region ? ` – ${escapeHtml(region.nom)}` : '';
          return `<option value="${p.id}">${escapeHtml(p.name)}${regText} (${p.area_ha || 1} ha)</option>`;
        }).join('');
      } else {
        if (noParcelNotice) noParcelNotice.classList.remove('hidden');
        parcelSelect.innerHTML = '<option value="">-- Aucune parcelle enregistrée --</option>';
      }
    }

    const plantingInput = document.getElementById('cropCyclePlantingDate');
    if (plantingInput) {
      plantingInput.value = formatDateForInput(new Date());
    }

    const nameInput = document.getElementById('cropCycleName');
    const catInput = document.getElementById('cropCycleCategory');
    const harvestInput = document.getElementById('cropCycleHarvestDate');
    const forecastBox = document.getElementById('cropCycleForecastBox');
    const dateLabel = document.getElementById('cropCyclePlantingDateLabel');

    if (nameInput) nameInput.value = '';
    if (catInput) catInput.value = 'maraîchage';
    if (harvestInput) harvestInput.value = '';
    if (dateLabel) dateLabel.textContent = 'Date de semis';
    if (forecastBox) forecastBox.classList.add('hidden');

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const btnListen = document.getElementById('btnListenCropForecast');
    if (btnListen) {
      btnListen.classList.remove('speaking');
      btnListen.innerHTML = ' <span>Écouter</span>';
    }

    if (preselectedModelId && modeleSelect) {
      const selectedModel = cachedModelesCultures.find(m => String(m.id) === String(preselectedModelId));
      if (selectedModel) {
        applySelectedModelToForm(selectedModel);
      }
    }

    modalAddCropCycle.classList.remove('hidden');
  }

  function handleListenCropForecast() {
    const btn = document.getElementById('btnListenCropForecast');
    if (!('speechSynthesis' in window)) {
      alert('La lecture vocale n\'est pas supportée par votre navigateur.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (btn) {
        btn.classList.remove('speaking');
        btn.innerHTML = ' <span>Écouter</span>';
      }
      return;
    }

    function cleanForSpeech(str) {
      if (!str) return '';
      return str
        .replace(/https?:\/\/[^\s]+/gi, '') // Supprimer tout lien ou URL
        .replace(/\p{Extended_Pictographic}/gu, '') // Supprimer tous les émojis
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
        .replace(/[•*–—_~#|/\\<>[\]{}]/g, ' ') // Supprimer puces et symboles
        .replace(/\s+/g, ' ')
        .trim();
    }

    const repiqEl = document.getElementById('cropForecastRepiquageText');
    const isRepiqVisible = !document.getElementById('cropForecastRepiquageRow')?.classList.contains('hidden');
    const harvestEl = document.getElementById('cropForecastHarvestText');
    const adviceEl = document.getElementById('cropForecastAdviceText');
    const isAdviceVisible = !document.getElementById('cropForecastAdviceBox')?.classList.contains('hidden');

    const sentences = [];

    // 1. Période de repiquage (si pépinière)
    if (isRepiqVisible && repiqEl) {
      const cleanRepiq = cleanForSpeech(repiqEl.innerText || repiqEl.textContent);
      if (cleanRepiq) {
        sentences.push(cleanRepiq.endsWith('.') ? cleanRepiq : cleanRepiq + '.');
      }
    }

    // 2. Période de récolte ou consigne zone
    if (harvestEl) {
      const cleanHarvest = cleanForSpeech(harvestEl.innerText || harvestEl.textContent);
      if (cleanHarvest) {
        sentences.push(cleanHarvest.endsWith('.') ? cleanHarvest : cleanHarvest + '.');
      }
    }

    // 3. À savoir (conseil pratique, jamais la source ni l'URL)
    if (isAdviceVisible && adviceEl) {
      const cleanAdvice = cleanForSpeech(adviceEl.innerText || adviceEl.textContent);
      if (cleanAdvice) {
        sentences.push(`À savoir : ${cleanAdvice}${cleanAdvice.endsWith('.') ? '' : '.'}`);
      }
    }

    const textToSpeak = sentences.join(' ');
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.92;

    utterance.onstart = () => {
      if (btn) {
        btn.classList.add('speaking');
        btn.innerHTML = '⏹️ <span>Arrêter</span>';
      }
    };

    utterance.onend = utterance.onerror = () => {
      if (btn) {
        btn.classList.remove('speaking');
        btn.innerHTML = ' <span>Écouter</span>';
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  async function handleSaveCropCycle(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const btnSubmit = document.getElementById('btnSaveCropCycle');
    const btnText = document.getElementById('btnSaveCropCycleText');
    const profileId = currentProfileKey;

    if (!profileId) {
      showToast('Erreur', 'Veuillez vous connecter pour enregistrer une culture.');
      return;
    }

    const cropName = document.getElementById('cropCycleName')?.value?.trim();
    const category = document.getElementById('cropCycleCategory')?.value;
    const plantingDate = document.getElementById('cropCyclePlantingDate')?.value;
    const harvestDate = document.getElementById('cropCycleHarvestDate')?.value || null;
    let parcelId = document.getElementById('cropCycleParcelSelect')?.value;
    const rawModelId = document.getElementById('cropCycleModeleSelect')?.value;
    const modeleId = (rawModelId && rawModelId.trim() !== '' && rawModelId !== 'autre_culture') ? rawModelId.trim() : null;

    if (!cropName) {
      alert('Veuillez renseigner le nom de la culture.');
      return;
    }
    if (!plantingDate) {
      alert('Veuillez renseigner la date de semis.');
      return;
    }

    try {
      if (btnSubmit) btnSubmit.disabled = true;
      if (btnText) btnText.textContent = 'Enregistrement...';

      if (!parcelId || parcelId === 'new_default') {
        const { data: newP, error: pErr } = await supabaseClient
          .from('parcels')
          .insert({
            profile_id: profileId,
            name: 'Parcelle 1',
            area_ha: 1.0,
            irrigation_type: 'Irrigué',
            location: PROFILES_DATA[profileId]?.location || 'Koudougou'
          })
          .select('id')
          .single();

        if (pErr) throw pErr;
        parcelId = newP.id;
        await fetchUserParcels(profileId);
      }

      let variete = null;
      let conseilCourt = null;
      let repiquageDate = null;
      let harvestDateMin = null;
      let harvestDateMax = null;

      if (modeleId) {
        const selectedModel = (cachedModelesCultures || []).find(m => String(m.id) === String(modeleId));
        if (selectedModel) {
          variete = selectedModel.variete || null;
          conseilCourt = selectedModel.conseil_court || null;
          const pParts = plantingDate.split('-');
          const pDate = new Date(Number(pParts[0]), Number(pParts[1]) - 1, Number(pParts[2]));

          if (selectedModel.mode_depart === 'pepiniere' && selectedModel.pepiniere_jours_min) {
            const rMin = addDaysToDate(pDate, selectedModel.pepiniere_jours_min);
            repiquageDate = formatDateForInput(rMin);
          }
          if (selectedModel.recolte_jours_min) {
            const hMin = addDaysToDate(pDate, selectedModel.recolte_jours_min);
            harvestDateMin = formatDateForInput(hMin);
          }
          if (selectedModel.recolte_jours_max) {
            const hMax = addDaysToDate(pDate, selectedModel.recolte_jours_max);
            harvestDateMax = formatDateForInput(hMax);
          } else if (harvestDateMin) {
            harvestDateMax = harvestDateMin;
          }
        }
      }

      if (!harvestDateMin && harvestDate) {
        harvestDateMin = harvestDate;
        harvestDateMax = harvestDate;
      }

      const initialStatus = repiquageDate ? 'En pépinière' : 'En croissance';

      const payload = {
        profile_id: profileId,
        parcel_id: parcelId,
        modele_id: modeleId,
        crop_name: cropName,
        category: category || 'maraîchage',
        planting_date: plantingDate,
        estimated_harvest_date: harvestDate || harvestDateMin,
        repiquage_date: repiquageDate,
        harvest_date_min: harvestDateMin,
        harvest_date_max: harvestDateMax,
        variete: variete,
        conseil_court: conseilCourt,
        status: initialStatus
      };

      const { data: newCycleData, error: cycleErr } = await supabaseClient
        .from('crop_cycles')
        .insert(payload)
        .select('id')
        .single();

      if (cycleErr) throw cycleErr;

      if (newCycleData && newCycleData.id) {
        try {
          await supabaseClient.rpc('generer_taches_cycle', { p_cycle_id: newCycleData.id });
          await fetchCycleTasks(profileId);
        } catch (rpcErr) {
          console.warn('Erreur generer_taches_cycle :', rpcErr);
        }
      }

      showToast('Culture enregistrée', `${cropName} a été ajouté avec succès à vos parcelles.`);
      modalAddCropCycle.classList.add('hidden');

      await syncCropCyclesFromSupabase(profileId);
      if (currentRoutePage === 'parcelles') {
        renderParcellesPage();
      } else if (currentRoutePage === 'cycles') {
        renderCyclesPage(cyclesActiveStatusFilter || 'all');
      } else if (currentRoutePage === 'synthese') {
        renderSynthesePage();
      }
    } catch (err) {
      console.error('Erreur handleSaveCropCycle :', err);
      showToast('Erreur', err.message || 'Impossible d\'enregistrer la culture.');
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
      if (btnText) btnText.textContent = 'Enregistrer la culture';
    }
  }

  async function deleteCropCycle(cycleId) {
    if (!confirm('Voulez-vous vraiment retirer cette culture de votre suivi ?')) return;
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('crop_cycles')
        .delete()
        .eq('id', cycleId);

      if (!error) {
        showToast('Culture retirée', 'La culture a été retirée avec succès.');
        await syncCropCyclesFromSupabase(currentProfileKey);
        renderParcellesPage();
      } else {
        showToast('Erreur', error.message || 'Impossible de retirer la culture.');
      }
    } catch (err) {
      console.error('Erreur deleteCropCycle :', err);
    }
  }

  function renderParcelBalanceHtml(p) {
    const parcelCrops = (cachedCropCycles || []).filter(c => c.parcel_id === p.id);
    const parcelCropIds = new Set(parcelCrops.map(c => c.id));

    const parcelExpenses = (cachedExpenses || []).filter(e => e.crop_cycle_id && parcelCropIds.has(e.crop_cycle_id));
    const totalExpenses = parcelExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const parcelRevenues = (cachedRevenues || []).filter(r => r.crop_cycle_id && parcelCropIds.has(r.crop_cycle_id));
    const totalSales = parcelRevenues.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    const gain = totalSales - totalExpenses;

    let balanceBodyHtml = '';
    if (totalExpenses === 0 && totalSales === 0) {
      balanceBodyHtml = `
        <p class="parcel-balance-empty">Ajoutez vos dépenses et vos ventes pour voir si cette parcelle vous fait gagner de l'argent.</p>
      `;
    } else {
      let gainBadgeClass = 'gain-neutral';
      let gainBadgeText = 'Résultat à l\'équilibre (0 francs CFA)';
      if (gain > 0) {
        gainBadgeClass = 'gain-positive';
        gainBadgeText = `Vous avez gagné ${formatFrancsCFA(gain)}`;
      } else if (gain < 0) {
        gainBadgeClass = 'gain-negative';
        gainBadgeText = `Vous avez perdu ${formatFrancsCFA(Math.abs(gain))}`;
      }

      let cropsDetailHtml = '';
      if (parcelCrops.length > 0) {
        const cropsItems = parcelCrops.map(c => {
          const cExp = (cachedExpenses || []).filter(e => e.crop_cycle_id === c.id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          const cRev = (cachedRevenues || []).filter(r => r.crop_cycle_id === c.id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
          const cGain = cRev - cExp;
          const plantingStr = c.planting_date ? `, semé le ${formatDateEnToutesLettres(new Date(c.planting_date))}` : '';
          let cGainFormatted = '';
          if (cGain > 0) {
            cGainFormatted = `<span style="color: #1B5E20; font-weight: 700;">gain ${formatFrancsCFA(cGain)}</span>`;
          } else if (cGain < 0) {
            cGainFormatted = `<span style="color: #C8862A; font-weight: 700;">perte ${formatFrancsCFA(Math.abs(cGain))}</span>`;
          } else {
            cGainFormatted = `<span style="color: #455A64; font-weight: 600;">gain 0 francs CFA</span>`;
          }
          return `
            <div class="parcel-crop-detail-card">
              <div class="parcel-crop-detail-title"> ${escapeHtml(c.crop_name)}${plantingStr}</div>
              <div class="parcel-crop-detail-stats">dépenses ${formatFrancsCFA(cExp)}, ventes ${formatFrancsCFA(cRev)}, ${cGainFormatted}</div>
            </div>
          `;
        }).join('');

        cropsDetailHtml = `
          <div class="parcel-crops-detail-list">
            <div class="parcel-crops-detail-heading">Détail par culture :</div>
            ${cropsItems}
          </div>
        `;
      }

      balanceBodyHtml = `
        <div class="parcel-balance-metrics">
          <div class="parcel-balance-metric">
            <span class="parcel-balance-metric-label">Dépenses</span>
            <div class="parcel-balance-metric-val">${formatFrancsCFA(totalExpenses)}</div>
          </div>
          <div class="parcel-balance-metric">
            <span class="parcel-balance-metric-label">Ventes</span>
            <div class="parcel-balance-metric-val">${formatFrancsCFA(totalSales)}</div>
          </div>
        </div>
        <div class="parcel-balance-gain-badge ${gainBadgeClass}">
          ${gainBadgeText}
        </div>
        ${cropsDetailHtml}
      `;
    }

    return `
      <div class="parcel-balance-box">
        <div class="parcel-balance-header">
          <div class="parcel-balance-title-wrap">
            <span> Bilan de cette parcelle</span>
          </div>
          <button type="button" class="btn-listen-parcel-balance" data-parcel-id="${p.id}" onclick="listenParcelBalance('${p.id}')">
             <span>Écouter</span>
          </button>
        </div>
        ${balanceBodyHtml}
      </div>
    `;
  }

  function renderParcellesPage() {
    const cropsCountEl = document.getElementById('parcellesCropsCount');
    const totalAreaEl = document.getElementById('parcellesTotalArea');
    const totalAreaSubEl = document.getElementById('parcellesTotalAreaSub');
    const nextHarvestEl = document.getElementById('parcellesNextHarvest');
    const cropsListEl = document.getElementById('parcellesCropsList');
    const emptyStateEl = document.getElementById('parcellesEmptyState');
    const parcellesCardsGrid = document.getElementById('parcellesCardsGrid');
    const parcellesEmptyNotice = document.getElementById('parcellesEmptyNotice');
    const parcellesCountBadge = document.getElementById('parcellesCountBadge');

    const profileData = PROFILES_DATA[currentProfileKey] || {};
    const cycles = profileData.realCycles || [];
    const parcels = cachedUserParcels || [];

    if (cropsCountEl) cropsCountEl.textContent = cycles.length;

    let totalHa = 0;
    if (parcels.length > 0) {
      totalHa = parcels.reduce((sum, p) => sum + (parseFloat(p.area_ha) || 0), 0);
    }
    if (totalAreaEl) totalAreaEl.textContent = `${totalHa.toFixed(1)} ha`;
    if (totalAreaSubEl) totalAreaSubEl.textContent = `${parcels.length} parcelle${parcels.length > 1 ? 's' : ''}`;
    if (parcellesCountBadge) parcellesCountBadge.textContent = parcels.length;

    // Rendu des cartes de parcelles
    if (parcellesCardsGrid) {
      if (parcels.length === 0) {
        parcellesCardsGrid.innerHTML = '';
        if (parcellesEmptyNotice) parcellesEmptyNotice.classList.remove('hidden');
      } else {
        if (parcellesEmptyNotice) parcellesEmptyNotice.classList.add('hidden');
        parcellesCardsGrid.innerHTML = parcels.map(p => {
          const region = (cachedRegions || []).find(r => r.id === p.region_id);
          const regionName = region ? `${region.nom} (${region.chef_lieu})` : 'Région non définie';
          const activeCropCount = cycles.filter(c => c.parcel_id === p.id).length;

          return `
            <div class="parcel-card">
              <div class="parcel-card-header">
                <div>
                  <h4 class="parcel-card-name"> ${escapeHtml(p.name)}</h4>
                  <span class="parcel-card-badge">${escapeHtml(p.area_ha)} ha</span>
                </div>
              </div>
              <div class="parcel-card-meta">
                <div><span>Région :</span> <strong>${escapeHtml(regionName)}</strong></div>
                ${p.location ? `<div><span>Village/Quartier :</span> ${escapeHtml(p.location)}</div>` : ''}
                <div><span>Irrigation :</span> ${escapeHtml(p.irrigation_type || 'Goutte-à-goutte')}</div>
                <div><span>Cultures actives :</span> ${activeCropCount} culture${activeCropCount > 1 ? 's' : ''}</div>
              </div>
              ${renderParcelBalanceHtml(p)}
              <div class="parcel-card-actions">
                <button type="button" class="btn-edit-parcel" onclick="openAddParcelModal('${p.id}')">
                  ️ Modifier
                </button>
                <button type="button" class="btn-delete-parcel" onclick="deleteParcel('${p.id}')">
                  ️ Supprimer
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    const upcoming = cycles
      .filter(c => c.estimated_harvest_date)
      .map(c => new Date(c.estimated_harvest_date))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a - b);

    if (nextHarvestEl) {
      if (upcoming.length > 0) {
        nextHarvestEl.textContent = formatDateEnToutesLettres(upcoming[0]);
      } else {
        nextHarvestEl.textContent = 'Aucune date';
      }
    }

    if (!cropsListEl) return;

    if (cycles.length === 0) {
      cropsListEl.innerHTML = '';
      if (emptyStateEl) emptyStateEl.classList.remove('hidden');
      return;
    }

    if (emptyStateEl) emptyStateEl.classList.add('hidden');

    cropsListEl.innerHTML = cycles.map(cycle => {
      const parcelObj = parcels.find(p => p.id === cycle.parcel_id);
      const pInfo = parcelObj ? `${parcelObj.name} (${parcelObj.area_ha} ha)` : (cycle.parcels ? `${cycle.parcels.name} (${cycle.parcels.area_ha} ha)` : 'Parcelle');
      const plantingDateFormatted = cycle.planting_date ? formatDateEnToutesLettres(new Date(cycle.planting_date)) : '-';
      const harvestDateFormatted = cycle.estimated_harvest_date ? formatDateEnToutesLettres(new Date(cycle.estimated_harvest_date)) : 'Non définie';

      return `
        <div class="admin-fin-card" style="border-left: 4px solid #1E5E2A;">
          <div class="admin-fin-card-header">
            <div>
              <div class="admin-fin-meta-row">
                <span class="fin-badge-type">${cycle.category || 'Culture'}</span>
                <span class="fin-badge-region"> ${pInfo}</span>
                <span class="fin-badge-status badge-status-publie">${cycle.status || 'En végétation'}</span>
              </div>
              <h3 class="admin-fin-title" style="margin-top: 4px;"> ${cycle.crop_name}</h3>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 12px 0; background: #F8FAF7; padding: 12px; border-radius: 8px;">
            <div>
              <span style="display: block; font-size: 11px; text-transform: uppercase; color: #5D6C63; font-weight: 700;">Date de semis</span>
              <strong style="font-size: 13.5px; color: #1E2822;">${plantingDateFormatted}</strong>
            </div>
            <div>
              <span style="display: block; font-size: 11px; text-transform: uppercase; color: #5D6C63; font-weight: 700;">Récolte prévue</span>
              <strong style="font-size: 13.5px; color: #1E5E2A;">${harvestDateFormatted}</strong>
            </div>
          </div>

          <div class="admin-fin-card-footer" style="display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn-table-action" onclick="deleteCropCycle('${cycle.id}')" style="color: #C62828; border-color: #F8B4B0; cursor: pointer;">
              ️ Retirer du suivi
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // MODULE CYCLES CULTURAUX, TÂCHES ET MARGES RÉELLES
  // ==========================================

  async function fetchCycleTasks(profileId = currentProfileKey) {
    if (!supabaseClient || !profileId) return [];
    try {
      const { data, error } = await supabaseClient
        .from('cycle_tasks')
        .select('*, etapes_culture(*)')
        .eq('profile_id', profileId)
        .order('date_prevue', { ascending: true });
      if (!error && data) {
        cachedCycleTasks = data;
        renderHomeTasksWeekCard();
        if (currentRoutePage === 'cycles') {
          renderCyclesPage(cyclesActiveStatusFilter || 'all');
        }
        return data;
      }
    } catch (err) {
      console.warn('⚠️ Erreur fetchCycleTasks :', err);
    }
    return [];
  }

  async function fetchEtapesCulture() {
    if (!supabaseClient) return cachedEtapesCulture || [];
    try {
      const { data, error } = await supabaseClient
        .from('etapes_culture')
        .select('*')
        .order('ordre', { ascending: true })
        .order('jour_debut', { ascending: true });
      if (!error && data) {
        cachedEtapesCulture = data;
        const badge = document.getElementById('navAdminEtapesBadge');
        if (badge) badge.textContent = data.length;
        const mobileBadge = document.getElementById('mobileDrawerEtapesBadge');
        if (mobileBadge) mobileBadge.textContent = data.length;
        if (currentRoutePage === 'cycles') {
          renderCyclesPage(cyclesActiveStatusFilter || 'all');
        }
        return data;
      }
    } catch (err) {
      console.warn('⚠️ Erreur fetchEtapesCulture :', err);
    }
    return cachedEtapesCulture || [];
  }

  function openAddCycleTaskModal(cycleId) {
    if (!modalAddCycleTask) return;
    const cycle = (cachedCropCycles || []).find(c => String(c.id) === String(cycleId));
    const cycleInfo = document.getElementById('taskModalCycleInfo');
    const inputCycleId = document.getElementById('taskCropCycleId');
    const inputTitre = document.getElementById('taskTitre');
    const inputDate = document.getElementById('taskDatePrevue');

    if (inputCycleId) inputCycleId.value = cycleId;
    if (cycleInfo && cycle) {
      cycleInfo.textContent = `Intervention pour : ${cycle.crop_name} (${cycle.parcels?.name || 'Parcelle'})`;
    }
    if (inputTitre) inputTitre.value = '';
    if (inputDate) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      inputDate.value = formatDateForInput(defaultDate);
    }
    modalAddCycleTask.classList.remove('hidden');
  }

  function closeAddCycleTaskModal() {
    if (modalAddCycleTask) modalAddCycleTask.classList.add('hidden');
    if (formAddCycleTask) formAddCycleTask.reset();
  }

  async function handleSaveCycleTask(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const profileId = currentProfileKey;
    const cropCycleId = document.getElementById('taskCropCycleId')?.value;
    const titre = document.getElementById('taskTitre')?.value?.trim();
    const datePrevue = document.getElementById('taskDatePrevue')?.value;
    const btnSubmit = document.getElementById('btnSubmitAddCycleTask');
    const btnText = document.getElementById('btnSubmitAddCycleTaskText');

    if (!titre) {
      alert('Veuillez indiquer le titre de la tâche.');
      return;
    }
    if (!datePrevue) {
      alert('Veuillez indiquer la date prévue.');
      return;
    }

    try {
      if (btnSubmit) btnSubmit.disabled = true;
      if (btnText) btnText.textContent = 'Enregistrement...';

      const { error } = await supabaseClient
        .from('cycle_tasks')
        .insert([{
          profile_id: profileId,
          crop_cycle_id: cropCycleId,
          titre: titre,
          date_prevue: datePrevue,
          statut: 'a_faire'
        }]);

      if (error) throw error;

      showToast('Rappel enregistré', `Le rappel « ${titre} » a été planifié.`);
      closeAddCycleTaskModal();
      await fetchCycleTasks(profileId);

      if (currentRoutePage === 'cycles') {
        renderCyclesPage(cyclesActiveStatusFilter || 'all');
      } else if (currentRoutePage === 'synthese') {
        renderSynthesePage();
      }
    } catch (err) {
      console.error('Erreur handleSaveCycleTask :', err);
      showToast('Erreur', err.message || 'Impossible d\'enregistrer la tâche.');
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
      if (btnText) btnText.textContent = 'Enregistrer le rappel';
    }
  }

  async function toggleCycleTaskStatus(taskId, currentStatus) {
    if (!supabaseClient) return;
    const newStatus = (currentStatus === 'fait') ? 'a_faire' : 'fait';

    try {
      const { error } = await supabaseClient
        .from('cycle_tasks')
        .update({ statut: newStatus })
        .eq('id', taskId);

      if (!error) {
        const t = (cachedCycleTasks || []).find(item => String(item.id) === String(taskId));
        if (t) t.statut = newStatus;
        if (newStatus === 'fait') {
          showToast('Tâche terminée', 'Bravo pour la réalisation de cette intervention !');
        }
        if (currentRoutePage === 'cycles') {
          renderCyclesPage(cyclesActiveStatusFilter || 'all');
        } else if (currentRoutePage === 'synthese') {
          renderSynthesePage();
        }
      }
    } catch (err) {
      console.error('Erreur toggleCycleTaskStatus :', err);
    }
  }

  async function deleteCycleTask(taskId) {
    if (!confirm('Voulez-vous supprimer ce rappel ?')) return;
    if (!supabaseClient) return;

    try {
      const { error } = await supabaseClient
        .from('cycle_tasks')
        .delete()
        .eq('id', taskId);

      if (!error) {
        showToast('Rappel supprimé', 'Le rappel a été retiré.');
        cachedCycleTasks = (cachedCycleTasks || []).filter(item => String(item.id) !== String(taskId));
        if (currentRoutePage === 'cycles') {
          renderCyclesPage(cyclesActiveStatusFilter || 'all');
        } else if (currentRoutePage === 'synthese') {
          renderSynthesePage();
        }
      }
    } catch (err) {
      console.error('Erreur deleteCycleTask :', err);
    }
  }

  async function markCropCycleHarvested(cycleId) {
    if (!confirm('Confirmez-vous que la récolte de ce cycle est entièrement terminée ? Le cycle passera au statut Archivé/Terminé.')) {
      return;
    }
    if (!supabaseClient) return;

    try {
      const { error } = await supabaseClient
        .from('crop_cycles')
        .update({ status: 'Terminé' })
        .eq('id', cycleId);

      if (!error) {
        showToast('Récolte clôturée', 'Le cycle cultural a été marqué comme terminé avec succès.');
        await syncCropCyclesFromSupabase(currentProfileKey);
        if (currentRoutePage === 'cycles') {
          renderCyclesPage(cyclesActiveStatusFilter || 'all');
        } else if (currentRoutePage === 'synthese') {
          renderSynthesePage();
        } else if (currentRoutePage === 'parcelles') {
          renderParcellesPage();
        }
      } else {
        showToast('Erreur', error.message || 'Impossible de mettre à jour le cycle.');
      }
    } catch (err) {
      console.error('Erreur markCropCycleHarvested :', err);
    }
  }

  async function editCycleHarvestDate(cycleId) {
    const cycle = (cachedCropCycles || []).find(c => String(c.id) === String(cycleId));
    if (!cycle) return;

    const cur = cycle.estimated_harvest_date || cycle.harvest_date_max || formatDateForInput(new Date());
    const newDate = prompt('Ajuster la date de récolte estimée (Format AAAA-MM-JJ) :', cur);
    if (!newDate || newDate.trim() === '' || newDate === cur) return;

    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('crop_cycles')
        .update({
          estimated_harvest_date: newDate.trim(),
          harvest_date_max: newDate.trim()
        })
        .eq('id', cycleId);

      if (!error) {
        showToast('Date ajustée', `La date de récolte a été mise à jour au ${newDate}.`);
        try {
          await supabaseClient.rpc('generer_taches_cycle', { p_cycle_id: cycleId });
          await fetchCycleTasks(currentProfileKey);
        } catch (rpcErr) {
          console.warn('Erreur generer_taches_cycle :', rpcErr);
        }
        await syncCropCyclesFromSupabase(currentProfileKey);
        if (currentRoutePage === 'cycles') {
          renderCyclesPage(cyclesActiveStatusFilter || 'all');
        } else if (currentRoutePage === 'synthese') {
          renderSynthesePage();
        }
      }
    } catch (err) {
      console.error('Erreur editCycleHarvestDate :', err);
    }
  }

  function calculateCycleStatus(cycle) {
    if (cycle.status === 'Terminé' || cycle.status === 'Récolté') {
      return { key: 'termine', label: 'Terminé', badgeClass: 'badge-status-termine', dotClass: 'dot-gray' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const planting = cycle.planting_date ? new Date(cycle.planting_date) : null;
    const repiquage = cycle.repiquage_date ? new Date(cycle.repiquage_date) : null;
    const harvestMin = cycle.harvest_date_min ? new Date(cycle.harvest_date_min) : (cycle.estimated_harvest_date ? new Date(cycle.estimated_harvest_date) : null);
    const harvestMax = cycle.harvest_date_max ? new Date(cycle.harvest_date_max) : harvestMin;

    if (repiquage && today < repiquage) {
      return { key: 'pepiniere', label: 'En pépinière', badgeClass: 'badge-status-pepiniere', dotClass: 'dot-blue' };
    }
    if (harvestMin && harvestMax && today >= harvestMin && today <= harvestMax) {
      return { key: 'recolte', label: 'À récolter', badgeClass: 'badge-status-recolte', dotClass: 'dot-orange' };
    }
    if (harvestMax && today > harvestMax) {
      return { key: 'recolte', label: 'À récolter (Récolte en cours)', badgeClass: 'badge-status-recolte', dotClass: 'dot-red' };
    }
    if (harvestMin) {
      const diffDays = Math.ceil((harvestMin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 15) {
        return { key: 'recolte_proche', label: `Récolte proche (${diffDays}j)`, badgeClass: 'badge-status-proche', dotClass: 'dot-amber' };
      }
    }
    return { key: 'croissance', label: 'En croissance', badgeClass: 'badge-status-croissance', dotClass: 'dot-green' };
  }

  function renderCycleTimelineHtml(cycle) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const planting = cycle.planting_date ? new Date(cycle.planting_date) : null;
    const repiquage = cycle.repiquage_date ? new Date(cycle.repiquage_date) : null;
    const harvestMin = cycle.harvest_date_min ? new Date(cycle.harvest_date_min) : (cycle.estimated_harvest_date ? new Date(cycle.estimated_harvest_date) : null);
    const harvestMax = cycle.harvest_date_max ? new Date(cycle.harvest_date_max) : harvestMin;

    if (!planting) return '';

    const startMs = planting.getTime();
    let endMs = harvestMax ? harvestMax.getTime() : (harvestMin ? harvestMin.getTime() : startMs + 90 * 86400000);
    if (endMs <= startMs) endMs = startMs + 60 * 86400000;
    const totalDuration = endMs - startMs;

    const repiqPct = repiquage ? Math.min(90, Math.max(10, ((repiquage.getTime() - startMs) / totalDuration) * 100)) : null;
    const harvestMinPct = harvestMin ? Math.min(95, Math.max(15, ((harvestMin.getTime() - startMs) / totalDuration) * 100)) : 100;
    const harvestMaxPct = harvestMax ? Math.min(100, Math.max(harvestMinPct, ((harvestMax.getTime() - startMs) / totalDuration) * 100)) : harvestMinPct;

    const todayMs = today.getTime();
    const todayPct = Math.min(100, Math.max(0, ((todayMs - startMs) / totalDuration) * 100));

    const plantingLabel = formatDateEnToutesLettres(planting);
    const repiquageLabel = repiquage ? formatDateEnToutesLettres(repiquage) : '';
    const harvestLabel = harvestMin ? formatDateEnToutesLettres(harvestMin) : '';

    return `
      <div class="crop-timeline-widget">
        <div class="crop-timeline-track">
          ${repiqPct ? `<div class="timeline-segment-pepiniere" style="left: 0; width: ${repiqPct}%;"></div>` : ''}
          <div class="timeline-segment-harvest" style="left: ${harvestMinPct}%; width: ${Math.max(4, harvestMaxPct - harvestMinPct)}%;"></div>

          <!-- Jalon Semis -->
          <div class="timeline-milestone" style="left: 0;">
            <div class="milestone-dot dot-start"></div>
            <span class="milestone-label">Semis<br><strong>${plantingLabel}</strong></span>
          </div>

          <!-- Jalon Repiquage -->
          ${repiquage ? `
            <div class="timeline-milestone" style="left: ${repiqPct}%;">
              <div class="milestone-dot dot-repiquage"></div>
              <span class="milestone-label">Repiquage<br><strong>${repiquageLabel}</strong></span>
            </div>
          ` : ''}

          <!-- Jalon Récolte -->
          <div class="timeline-milestone" style="left: ${harvestMinPct}%;">
            <div class="milestone-dot dot-harvest"></div>
            <span class="milestone-label">Récolte<br><strong>${harvestLabel}</strong></span>
          </div>

          <!-- Repère Aujourd'hui -->
          <div class="timeline-today-marker" style="left: ${todayPct}%;" title="Aujourd'hui (${formatDateEnToutesLettres(today)})">
            <span class="today-marker-pin">▼</span>
            <span class="today-marker-bubble">Aujourd'hui</span>
          </div>
        </div>
      </div>
    `;
  }

  function getCategoryIconName(cat) {
    switch ((cat || '').toLowerCase()) {
      case 'préparation': return 'layers';
      case 'semis': return 'sprout';
      case 'arrosage': return 'droplets';
      case 'désherbage': return 'scissors';
      case 'fumure': return 'leaf';
      case 'protection': return 'shield-check';
      case 'récolte': return 'wheat';
      case 'conservation': return 'archive';
      default: return 'calendar';
    }
  }

  function formatPeriodeEtape(d1Str, d2Str) {
    if (!d1Str) return 'Date libre';
    const d1 = new Date(d1Str);
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    if (!d2Str || d1Str === d2Str) {
      return `le ${d1.getDate()} ${months[d1.getMonth()]}`;
    }
    const d2 = new Date(d2Str);
    if (d1.getMonth() === d2.getMonth()) {
      return `du ${d1.getDate()} au ${d2.getDate()} ${months[d1.getMonth()]}`;
    }
    return `du ${d1.getDate()} ${months[d1.getMonth()]} au ${d2.getDate()} ${months[d2.getMonth()]}`;
  }

  function togglePlanStepDesc(taskId) {
    const box = document.getElementById(`descBox_${taskId}`);
    const chev = document.getElementById(`chevronDesc_${taskId}`);
    if (!box) return;
    const isHidden = box.classList.contains('hidden');
    box.classList.toggle('hidden', !isHidden);
    if (chev) {
      chev.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      chev.style.transition = 'transform 0.2s ease';
    }
  }

  function listenPlanStep(taskId) {
    const t = (cachedCycleTasks || []).find(item => String(item.id) === String(taskId));
    if (!t) return;
    if (window.speechSynthesis) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        return;
      }
      const desc = t.etapes_culture?.description || '';
      const period = formatPeriodeEtape(t.date_prevue, t.date_fin_prevue);
      const text = `Étape : ${t.titre}. Période prévue : ${period}. ${desc ? 'Conseils : ' + desc : ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  async function markCycleTaskDone(taskId) {
    if (!supabaseClient) return;
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabaseClient
        .from('cycle_tasks')
        .update({ statut: 'fait', fait_le: nowIso })
        .eq('id', taskId);

      if (!error) {
        const t = (cachedCycleTasks || []).find(item => String(item.id) === String(taskId));
        if (t) {
          t.statut = 'fait';
          t.fait_le = nowIso;
        }
        showToast('Étape validée', 'L\'étape a été marquée comme faite avec succès.');
        if (currentRoutePage === 'cycles') {
          renderCyclesPage(cyclesActiveStatusFilter || 'all');
        } else if (currentRoutePage === 'dashboard') {
          updateFinancialMetrics();
        }
        if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
          renderMobileView();
        }
        if (window.lucide && typeof lucide.createIcons === 'function') {
          lucide.createIcons();
        }
      } else {
        showToast('Erreur', error.message || 'Impossible de valider l\'étape.');
      }
    } catch (err) {
      console.error('Erreur markCycleTaskDone :', err);
      showToast('Erreur', 'Erreur lors de la validation.');
    }
  }

  function getCanonicalCropName(cycle) {
    if (!cycle) return '';
    if (cycle.modele_id && cachedModelesCultures && cachedModelesCultures.length > 0) {
      const m = cachedModelesCultures.find(item => String(item.id) === String(cycle.modele_id));
      if (m && m.nom_culture) return m.nom_culture.trim();
    }
    let name = (cycle.crop_name || '').trim();
    if (name.includes('(')) {
      name = name.split('(')[0].trim();
    }
    return name;
  }

  function renderCyclePlanDeSuiviHtml(cycle) {
    const cycleId = typeof cycle === 'object' && cycle ? cycle.id : cycle;
    const c = typeof cycle === 'object' && cycle ? cycle : (cachedCropCycles || []).find(item => String(item.id) === String(cycleId));
    if (!c) return '';

    const canonicalName = getCanonicalCropName(c);
    const stepsInCatalog = (cachedEtapesCulture || []).filter(e => e.actif && (e.nom_culture || '').toLowerCase() === canonicalName.toLowerCase());
    const tasks = (cachedCycleTasks || []).filter(t => String(t.crop_cycle_id) === String(c.id));

    // Si aucune étape n'existe dans le catalogue pour cette culture ET aucune tâche
    if (stepsInCatalog.length === 0 && tasks.length === 0) {
      return `
        <div class="plan-suivi-wrapper">
          <div class="plan-suivi-header">
            <div class="plan-suivi-title-group">
              <div class="home-tasks-week-icon-box" style="width: 32px; height: 32px;">
                <i data-lucide="clipboard-list" style="width: 17px; height: 17px;"></i>
              </div>
              <div>
                <h4 class="plan-suivi-title">Plan de suivi agronomique</h4>
                <p class="plan-suivi-subtitle">Calendrier du semis à la récolte</p>
              </div>
            </div>
            <button type="button" class="btn-plan-toggle" onclick="openAddCycleTaskModal('${c.id}')">
              + Ajouter un rappel
            </button>
          </div>
          <div style="text-align: center; padding: 22px 18px; background: #FAF7F0; border: 1.5px dashed #ECE6D9; border-radius: 16px;">
            <p style="font-size: 14.5px; font-weight: 800; color: #1A1A1A; margin: 0 0 4px;">Le plan de suivi de cette culture arrive bientôt</p>
            <p style="font-size: 12.5px; color: #4A4A4A; margin: 0;">L'équipe agronomique prépare les étapes de référence pour cette culture.</p>
          </div>
        </div>
      `;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    // 3 groupes : "À faire cette semaine", "À venir", "Déjà fait"
    const weekTasks = tasks.filter(t => t.statut !== 'fait' && (!t.date_prevue || new Date(t.date_prevue) <= endOfWeek))
      .sort((a, b) => new Date(a.date_prevue || 0) - new Date(b.date_prevue || 0));

    const upcomingTasks = tasks.filter(t => t.statut !== 'fait' && t.date_prevue && new Date(t.date_prevue) > endOfWeek)
      .sort((a, b) => new Date(a.date_prevue) - new Date(b.date_prevue));

    const doneTasks = tasks.filter(t => t.statut === 'fait')
      .sort((a, b) => new Date(b.fait_le || b.created_at || 0) - new Date(a.fait_le || a.created_at || 0));

    const renderTaskCard = (t) => {
      const isDone = t.statut === 'fait';
      const dPrevue = t.date_prevue ? new Date(t.date_prevue) : null;
      const isOverdue = !isDone && dPrevue && dPrevue < today;
      const etape = t.etapes_culture || {};
      const cat = etape.categorie || 'semis';
      const iconName = getCategoryIconName(cat);
      const desc = etape.description || '';
      const source = etape.source || '';
      const periodStr = formatPeriodeEtape(t.date_prevue, t.date_fin_prevue);

      return `
        <div class="plan-step-node">
          <div class="plan-step-dot ${isOverdue ? 'is-overdue' : (isDone ? 'is-done' : '')}">
            <i data-lucide="${isDone ? 'check' : iconName}" style="width: 13px; height: 13px;"></i>
          </div>
          <div class="plan-step-card ${isOverdue ? 'is-overdue' : (isDone ? 'is-done' : '')}">
            <div class="plan-step-header">
              <div class="plan-step-meta-row">
                <span class="plan-category-badge">
                  <i data-lucide="${iconName}" style="width: 12px; height: 12px;"></i>
                  <span>${escapeHtml(cat)}</span>
                </span>
                <span class="plan-period-text">${periodStr}</span>
                ${isOverdue ? `<span class="badge-overdue-tag">En retard</span>` : ''}
              </div>
            </div>

            <h4 class="plan-step-title">${escapeHtml(t.titre)}</h4>

            <div class="plan-step-actions-bar">
              <div class="plan-left-actions">
                ${desc ? `
                  <button type="button" class="btn-plan-toggle" onclick="togglePlanStepDesc('${t.id}')">
                    <i data-lucide="chevron-down" id="chevronDesc_${t.id}" style="width: 14px; height: 14px;"></i>
                    <span>Voir comment faire</span>
                  </button>
                ` : ''}
                <button type="button" class="btn-plan-listen" onclick="listenPlanStep('${t.id}')" title="Écouter l'étape">
                  <i data-lucide="volume-2" style="width: 14px; height: 14px;"></i>
                  <span>Écouter</span>
                </button>
              </div>

              ${!isDone ? `
                <button type="button" class="btn-plan-done" onclick="markCycleTaskDone('${t.id}')">
                  <i data-lucide="check" style="width: 15px; height: 15px;"></i>
                  <span>C'est fait</span>
                </button>
              ` : `
                <span class="plan-step-done-badge">
                  <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i>
                  <span>Validé</span>
                </span>
              `}
            </div>

            ${desc ? `
              <div class="plan-step-description-box hidden" id="descBox_${t.id}">
                ${escapeHtml(desc)}
                ${source ? `<div class="plan-step-source">Source : ${escapeHtml(source)}</div>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    };

    return `
      <div class="plan-suivi-wrapper">
        <div class="plan-suivi-header">
          <div class="plan-suivi-title-group">
            <div class="home-tasks-week-icon-box" style="width: 34px; height: 34px;">
              <i data-lucide="clipboard-list" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <h4 class="plan-suivi-title">Plan de suivi agronomique</h4>
              <p class="plan-suivi-subtitle">Calendrier chronologique du semis à la récolte</p>
            </div>
          </div>
          <button type="button" class="btn-plan-toggle" onclick="openAddCycleTaskModal('${c.id}')">
            + Ajouter un rappel
          </button>
        </div>

        <div class="plan-timeline-container">
          <!-- 1. Groupe À faire cette semaine -->
          <div class="plan-timeline-group">
            <div class="plan-timeline-group-header">
              <span class="plan-group-title week">À faire cette semaine</span>
              <span class="plan-group-count">${weekTasks.length}</span>
            </div>
            ${weekTasks.length === 0 ? `
              <p style="font-size: 12.5px; color: #4A4A4A; margin: 0 0 12px 14px; font-style: italic;">Aucune tâche urgente cette semaine.</p>
            ` : `
              <div class="plan-vertical-track">
                ${weekTasks.map(renderTaskCard).join('')}
              </div>
            `}
          </div>

          <!-- 2. Groupe À venir -->
          <div class="plan-timeline-group">
            <div class="plan-timeline-group-header">
              <span class="plan-group-title upcoming">À venir</span>
              <span class="plan-group-count">${upcomingTasks.length}</span>
            </div>
            ${upcomingTasks.length === 0 ? `
              <p style="font-size: 12.5px; color: #4A4A4A; margin: 0 0 12px 14px; font-style: italic;">Aucune tâche ultérieure programmée.</p>
            ` : `
              <div class="plan-vertical-track">
                ${upcomingTasks.map(renderTaskCard).join('')}
              </div>
            `}
          </div>

          <!-- 3. Groupe Déjà fait -->
          ${doneTasks.length > 0 ? `
            <div class="plan-timeline-group">
              <div class="plan-timeline-group-header">
                <span class="plan-group-title done">Déjà fait</span>
                <span class="plan-group-count">${doneTasks.length}</span>
              </div>
              <div class="plan-vertical-track">
                ${doneTasks.map(renderTaskCard).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderCycleTasksHtml(cycleId) {
    return renderCyclePlanDeSuiviHtml(cycleId);
  }

  function getHomeTasksWeekHtml() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekTasks = (cachedCycleTasks || [])
      .filter(t => t.statut !== 'fait' && (!t.date_prevue || new Date(t.date_prevue) <= endOfWeek))
      .sort((a, b) => new Date(a.date_prevue || 0) - new Date(b.date_prevue || 0));

    const next3 = weekTasks.slice(0, 3);
    const hasUrgent = weekTasks.some(t => t.date_prevue && new Date(t.date_prevue) < today);

    let contentHtml = '';
    if (next3.length === 0) {
      contentHtml = `
        <div class="home-tasks-empty">
          Toutes vos tâches sont à jour cette semaine ! Aucune intervention urgente requise.
        </div>
      `;
    } else {
      contentHtml = `
        <div class="home-tasks-list">
          ${next3.map(t => {
            const d = t.date_prevue ? new Date(t.date_prevue) : null;
            const isOverdue = d && d < today;
            const c = (cachedCropCycles || []).find(item => String(item.id) === String(t.crop_cycle_id));
            const cropName = c ? c.crop_name : 'Culture';
            const parcelName = c?.parcels?.name || 'Parcelle';
            const cat = t.etapes_culture?.categorie || 'semis';
            const catIcon = getCategoryIconName(cat);
            const periodStr = formatPeriodeEtape(t.date_prevue, t.date_fin_prevue);

            let badgeHtml = '';
            if (isOverdue) {
              badgeHtml = `<span class="task-due-badge badge-overdue">En retard (${periodStr})</span>`;
            } else if (d) {
              const diffTime = d.getTime() - today.getTime();
              const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
              if (diffDays === 0) {
                badgeHtml = `<span class="task-due-badge badge-today">Aujourd'hui</span>`;
              } else if (diffDays === 1) {
                badgeHtml = `<span class="task-due-badge badge-soon">Demain</span>`;
              } else {
                badgeHtml = `<span class="task-due-badge">Dans ${diffDays}j (${periodStr})</span>`;
              }
            } else {
              badgeHtml = `<span class="task-due-badge">Cette semaine</span>`;
            }

            return `
              <div class="home-task-item ${isOverdue ? 'is-overdue' : ''}">
                <div class="home-task-main">
                  <div class="home-task-cat-icon ${isOverdue ? 'is-overdue' : ''}">
                    <i data-lucide="${catIcon}" style="width: 18px; height: 18px;"></i>
                  </div>
                  <div class="home-task-info">
                    <div class="home-task-sub">${escapeHtml(cropName)} • ${escapeHtml(parcelName)}</div>
                    <div class="home-task-title">${escapeHtml(t.titre)}</div>
                    <div class="home-task-date-row">${badgeHtml}</div>
                  </div>
                </div>
                <button type="button" class="btn-task-quick-done" onclick="markCycleTaskDone('${t.id}')">
                  <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                  <span>C'est fait</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      <section class="home-tasks-week-card">
        <div class="home-tasks-week-header">
          <div class="home-tasks-week-title-row">
            <div class="home-tasks-week-icon-box">
              <i data-lucide="check-square" style="width: 18px; height: 18px;"></i>
            </div>
            <h3 class="home-tasks-week-title">
              <span>À faire cette semaine</span>
              <span class="home-tasks-week-badge ${hasUrgent ? 'is-urgent' : ''}">${weekTasks.length}</span>
            </h3>
          </div>
          <a href="#cycles" class="home-tasks-see-all" onclick="navigateToPage('cycles'); return false;">
            <span>Voir tout</span>
            <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
          </a>
        </div>
        ${contentHtml}
      </section>
    `;
  }

  function renderHomeTasksWeekCard() {
    if (!homeTasksWeekCard) return;
    homeTasksWeekCard.innerHTML = getHomeTasksWeekHtml();
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  async function renderAdminEtapes() {
    const listContainer = document.getElementById('adminEtapesList');
    const emptyEl = document.getElementById('adminEtapesEmpty');
    const cropSelect = document.getElementById('adminEtapesCropSelect');
    if (!listContainer) return;

    await fetchEtapesCulture();
    await fetchModelesCultures();

    const cropsMap = new Map();
    (cachedModelesCultures || []).forEach(m => {
      if (m.nom_culture) cropsMap.set(m.nom_culture.trim(), m.nom_culture.trim());
    });
    (cachedEtapesCulture || []).forEach(e => {
      if (e.nom_culture) cropsMap.set(e.nom_culture.trim(), e.nom_culture.trim());
    });

    const allCrops = Array.from(cropsMap.keys()).sort();

    if (!adminSelectedCropPlan && allCrops.length > 0) {
      adminSelectedCropPlan = allCrops.includes('Oignon') ? 'Oignon' : allCrops[0];
    }

    if (cropSelect) {
      cropSelect.innerHTML = allCrops.map(name => `
        <option value="${escapeHtml(name)}" ${name === adminSelectedCropPlan ? 'selected' : ''}>
          ${escapeHtml(name)}
        </option>
      `).join('');
    }

    const steps = (cachedEtapesCulture || []).filter(e => {
      const matchCrop = (e.nom_culture || '').toLowerCase() === (adminSelectedCropPlan || '').toLowerCase();
      if (!matchCrop) return false;
      if (adminSelectedPhasePlan === 'pepiniere') return e.phase === 'pepiniere';
      if (adminSelectedPhasePlan === 'champ') return e.phase === 'champ';
      return true;
    }).sort((a, b) => (a.ordre || 0) - (b.ordre || 0) || (a.jour_debut || 0) - (b.jour_debut || 0));

    if (steps.length === 0) {
      listContainer.innerHTML = '';
      if (emptyEl) {
        emptyEl.classList.remove('hidden');
        const titleEl = document.getElementById('adminEtapesEmptyTitle');
        if (titleEl) titleEl.textContent = `Aucune étape pour "${adminSelectedCropPlan || 'cette culture'}"`;
      }
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    listContainer.innerHTML = steps.map(s => {
      const isInactive = !s.actif;
      const catIcon = getCategoryIconName(s.categorie);
      const daysText = s.jour_fin && s.jour_fin !== s.jour_debut 
        ? `J+${s.jour_debut} à J+${s.jour_fin}` 
        : `J+${s.jour_debut}`;

      return `
        <div class="admin-etape-item-card ${isInactive ? 'is-inactive' : ''}">
          <div class="admin-etape-item-top">
            <div class="admin-etape-item-badges">
              <span class="admin-etape-order-badge">Étape ${s.ordre || 1}</span>
              <span class="admin-etape-phase-badge">${s.phase === 'pepiniere' ? 'Pépinière' : 'Champ'}</span>
              <span class="admin-etape-days-badge">${daysText}</span>
              <span class="plan-category-badge">
                <i data-lucide="${catIcon}" style="width: 12px; height: 12px;"></i>
                <span>${escapeHtml(s.categorie)}</span>
              </span>
              ${s.mode_depart ? `<span style="font-size: 11px; color: #4A4A4A; background: #FAF7F0; padding: 2px 7px; border-radius: 6px; border: 1px solid #ECE6D9;">${s.mode_depart}</span>` : ''}
              ${isInactive ? `<span style="font-size: 11px; background: #EEEEEE; color: #777; padding: 2px 8px; border-radius: 999px; font-weight: 700;">Désactivée</span>` : ''}
            </div>

            <div class="admin-etape-actions">
              <button type="button" class="btn-secondary" onclick="openEditEtapeModal('${s.id}')" style="padding: 6px 12px; font-size: 12px; font-weight: 700; border-radius: 8px;">
                Modifier
              </button>
              <button type="button" class="btn-secondary" onclick="toggleEtapeActive('${s.id}', ${s.actif})" style="padding: 6px 12px; font-size: 12px; font-weight: 700; border-radius: 8px;">
                ${s.actif ? 'Désactiver' : 'Activer'}
              </button>
              <button type="button" class="btn-secondary" onclick="deleteEtapeAdmin('${s.id}')" style="padding: 6px 12px; font-size: 12px; font-weight: 700; color: #C0392B; border-color: #F8B4B0; border-radius: 8px;">
                Supprimer
              </button>
            </div>
          </div>

          <div>
            <h4 style="font-size: 15.5px; font-weight: 800; color: #1A1A1A; margin: 0 0 6px;">${escapeHtml(s.titre)}</h4>
            ${s.description ? `<p style="font-size: 13px; color: #4A4A4A; line-height: 1.5; margin: 0 0 6px;">${escapeHtml(s.description)}</p>` : ''}
            ${s.source ? `<div style="font-size: 11.5px; font-weight: 600; color: #05507E; font-style: italic;">Source : ${escapeHtml(s.source)}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  function openAddEtapeModal() {
    currentEditingEtapeId = null;
    const title = document.getElementById('modalAdminEtapeTitle');
    const inputId = document.getElementById('adminEtapeId');
    const inputCulture = document.getElementById('adminEtapeNomCulture');
    const inputCat = document.getElementById('adminEtapeCategorie');
    const inputPhase = document.getElementById('adminEtapePhase');
    const inputMode = document.getElementById('adminEtapeModeDepart');
    const inputDebut = document.getElementById('adminEtapeJourDebut');
    const inputFin = document.getElementById('adminEtapeJourFin');
    const inputOrdre = document.getElementById('adminEtapeOrdre');
    const inputTitre = document.getElementById('adminEtapeTitre');
    const inputDesc = document.getElementById('adminEtapeDescription');
    const inputSource = document.getElementById('adminEtapeSource');
    const inputActif = document.getElementById('adminEtapeActif');

    if (title) title.textContent = `Ajouter une étape au plan (${adminSelectedCropPlan || 'Culture'})`;
    if (inputId) inputId.value = '';
    if (inputCulture) inputCulture.value = adminSelectedCropPlan || 'Oignon';
    if (inputCat) inputCat.value = 'semis';
    if (inputPhase) inputPhase.value = 'champ';
    if (inputMode) inputMode.value = '';
    if (inputDebut) inputDebut.value = 0;
    if (inputFin) inputFin.value = '';
    if (inputOrdre) {
      const existing = (cachedEtapesCulture || []).filter(e => e.nom_culture.toLowerCase() === (adminSelectedCropPlan || '').toLowerCase());
      inputOrdre.value = existing.length + 1;
    }
    if (inputTitre) inputTitre.value = '';
    if (inputDesc) inputDesc.value = '';
    if (inputSource) inputSource.value = 'Guide technique INERA';
    if (inputActif) inputActif.checked = true;

    if (modalAdminEtape) modalAdminEtape.classList.remove('hidden');
  }

  function openEditEtapeModal(etapeId) {
    const s = (cachedEtapesCulture || []).find(e => String(e.id) === String(etapeId));
    if (!s) return;
    currentEditingEtapeId = s.id;

    const title = document.getElementById('modalAdminEtapeTitle');
    const inputId = document.getElementById('adminEtapeId');
    const inputCulture = document.getElementById('adminEtapeNomCulture');
    const inputCat = document.getElementById('adminEtapeCategorie');
    const inputPhase = document.getElementById('adminEtapePhase');
    const inputMode = document.getElementById('adminEtapeModeDepart');
    const inputDebut = document.getElementById('adminEtapeJourDebut');
    const inputFin = document.getElementById('adminEtapeJourFin');
    const inputOrdre = document.getElementById('adminEtapeOrdre');
    const inputTitre = document.getElementById('adminEtapeTitre');
    const inputDesc = document.getElementById('adminEtapeDescription');
    const inputSource = document.getElementById('adminEtapeSource');
    const inputActif = document.getElementById('adminEtapeActif');

    if (title) title.textContent = `Modifier l'étape : ${s.titre}`;
    if (inputId) inputId.value = s.id;
    if (inputCulture) inputCulture.value = s.nom_culture;
    if (inputCat) inputCat.value = s.categorie;
    if (inputPhase) inputPhase.value = s.phase;
    if (inputMode) inputMode.value = s.mode_depart || '';
    if (inputDebut) inputDebut.value = s.jour_debut ?? 0;
    if (inputFin) inputFin.value = s.jour_fin ?? '';
    if (inputOrdre) inputOrdre.value = s.ordre ?? 1;
    if (inputTitre) inputTitre.value = s.titre || '';
    if (inputDesc) inputDesc.value = s.description || '';
    if (inputSource) inputSource.value = s.source || '';
    if (inputActif) inputActif.checked = s.actif !== false;

    if (modalAdminEtape) modalAdminEtape.classList.remove('hidden');
  }

  async function handleSaveAdminEtape(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const btnSubmit = document.getElementById('btnSaveAdminEtape');
    const btnText = document.getElementById('btnSaveAdminEtapeText');
    const id = document.getElementById('adminEtapeId')?.value;
    const nomCulture = document.getElementById('adminEtapeNomCulture')?.value?.trim();
    const categorie = document.getElementById('adminEtapeCategorie')?.value;
    const phase = document.getElementById('adminEtapePhase')?.value;
    const modeDepart = document.getElementById('adminEtapeModeDepart')?.value || null;
    const jourDebut = parseInt(document.getElementById('adminEtapeJourDebut')?.value || '0', 10);
    const rawFin = document.getElementById('adminEtapeJourFin')?.value;
    const jourFin = rawFin !== '' ? parseInt(rawFin, 10) : null;
    const ordre = parseInt(document.getElementById('adminEtapeOrdre')?.value || '1', 10);
    const titre = document.getElementById('adminEtapeTitre')?.value?.trim();
    const description = document.getElementById('adminEtapeDescription')?.value?.trim() || null;
    const source = document.getElementById('adminEtapeSource')?.value?.trim() || null;
    const actif = document.getElementById('adminEtapeActif')?.checked ?? true;

    if (!nomCulture || !titre) {
      alert('Veuillez renseigner le nom de la culture et le titre de l\'étape.');
      return;
    }

    const payload = {
      nom_culture: nomCulture,
      categorie: categorie,
      phase: phase,
      mode_depart: modeDepart,
      jour_debut: jourDebut,
      jour_fin: jourFin,
      ordre: ordre,
      titre: titre,
      description: description,
      source: source,
      actif: actif
    };

    try {
      if (btnSubmit) btnSubmit.disabled = true;
      if (btnText) btnText.textContent = 'Enregistrement...';

      let err = null;
      if (id) {
        const { error } = await supabaseClient.from('etapes_culture').update(payload).eq('id', id);
        err = error;
      } else {
        const { error } = await supabaseClient.from('etapes_culture').insert(payload);
        err = error;
      }

      if (err) throw err;

      showToast('Étape enregistrée', `${titre} a été enregistré dans le plan de suivi.`);
      if (modalAdminEtape) modalAdminEtape.classList.add('hidden');
      adminSelectedCropPlan = nomCulture;
      await fetchEtapesCulture();
      renderAdminEtapes();
    } catch (err) {
      console.error('Erreur handleSaveAdminEtape :', err);
      showToast('Erreur', err.message || 'Impossible d\'enregistrer l\'étape.');
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
      if (btnText) btnText.textContent = 'Enregistrer l\'étape';
    }
  }

  async function toggleEtapeActive(etapeId, currentActif) {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('etapes_culture').update({ actif: !currentActif }).eq('id', etapeId);
      if (!error) {
        showToast('Statut mis à jour', `L'étape est maintenant ${!currentActif ? 'active' : 'désactivée'}.`);
        await fetchEtapesCulture();
        renderAdminEtapes();
      }
    } catch (err) {
      console.error('Erreur toggleEtapeActive :', err);
    }
  }

  async function deleteEtapeAdmin(etapeId) {
    if (!confirm('Voulez-vous vraiment supprimer cette étape du plan de suivi ?')) return;
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('etapes_culture')
        .delete()
        .eq('id', etapeId);
      if (!error) {
        showToast('Étape supprimée', 'L\'étape a été retirée du plan de suivi.');
        await fetchEtapesCulture();
        renderAdminEtapes();
      }
    } catch (err) {
      console.error('Erreur deleteEtapeAdmin :', err);
    }
  }

  function closeModalAdminEtape() {
    if (modalAdminEtape) modalAdminEtape.classList.add('hidden');
  }

  // Écouteurs de la page d'administration des étapes de suivi
  const btnOpenAddEtapeModal = document.getElementById('btnOpenAddEtapeModal');
  if (btnOpenAddEtapeModal) {
    btnOpenAddEtapeModal.addEventListener('click', openAddEtapeModal);
  }
  const btnCloseModalAdminEtape = document.getElementById('btnCloseModalAdminEtape');
  if (btnCloseModalAdminEtape) {
    btnCloseModalAdminEtape.addEventListener('click', closeModalAdminEtape);
  }
  const btnCancelAdminEtape = document.getElementById('btnCancelAdminEtape');
  if (btnCancelAdminEtape) {
    btnCancelAdminEtape.addEventListener('click', closeModalAdminEtape);
  }
  if (modalAdminEtape) {
    modalAdminEtape.addEventListener('click', (e) => {
      if (e.target === modalAdminEtape) closeModalAdminEtape();
    });
  }
  if (formAdminEtape) {
    formAdminEtape.addEventListener('submit', handleSaveAdminEtape);
  }
  const adminEtapesCropSelect = document.getElementById('adminEtapesCropSelect');
  if (adminEtapesCropSelect) {
    adminEtapesCropSelect.addEventListener('change', (e) => {
      adminSelectedCropPlan = e.target.value;
      renderAdminEtapes();
    });
  }
  document.querySelectorAll('#adminEtapesPhaseFilterGroup .type-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#adminEtapesPhaseFilterGroup .type-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      adminSelectedPhasePlan = chip.getAttribute('data-phase') || 'all';
      renderAdminEtapes();
    });
  });

  function getMobileAdminEtapesHtml() {
    const cropsMap = new Map();
    (cachedModelesCultures || []).forEach(m => {
      if (m.nom_culture) cropsMap.set(m.nom_culture.trim(), m.nom_culture.trim());
    });
    (cachedEtapesCulture || []).forEach(e => {
      if (e.nom_culture) cropsMap.set(e.nom_culture.trim(), e.nom_culture.trim());
    });
    const allCrops = Array.from(cropsMap.keys()).sort();
    if (!adminSelectedCropPlan && allCrops.length > 0) {
      adminSelectedCropPlan = allCrops.includes('Oignon') ? 'Oignon' : allCrops[0];
    }

    const steps = (cachedEtapesCulture || []).filter(e => {
      const matchCrop = (e.nom_culture || '').toLowerCase() === (adminSelectedCropPlan || '').toLowerCase();
      if (!matchCrop) return false;
      if (adminSelectedPhasePlan === 'pepiniere') return e.phase === 'pepiniere';
      if (adminSelectedPhasePlan === 'champ') return e.phase === 'champ';
      return true;
    }).sort((a, b) => (a.ordre || 0) - (b.ordre || 0) || (a.jour_debut || 0) - (b.jour_debut || 0));

    return `
      <div style="margin-bottom: 14px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #05507E; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1A1A1A; margin: 0;">Plans de suivi</h2>
            <p style="font-size: 11.5px; color: #4A4A4A; margin: 2px 0 0;">Administration des étapes</p>
          </div>
          <button type="button" class="btn-primary" onclick="openAddEtapeModal()" style="padding: 7px 12px; font-size: 12px; border-radius: 8px; font-weight: 700;">
            + Ajouter
          </button>
        </div>
      </div>

      <!-- Sélecteur de culture mobile -->
      <div style="background: #FFFFFF; border: 1px solid #ECE6D9; border-radius: 12px; padding: 10px 12px; margin-bottom: 12px;">
        <label style="font-size: 11.5px; font-weight: 700; color: #4A4A4A; display: block; margin-bottom: 4px;">Choisir la culture :</label>
        <select onchange="adminSelectedCropPlan = this.value; renderMobileView();" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #ECE6D9; font-size: 13px; font-weight: 700;">
          ${allCrops.map(name => `<option value="${escapeHtml(name)}" ${name === adminSelectedCropPlan ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}
        </select>
      </div>

      <!-- Liste des étapes mobile -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
        ${steps.length === 0 ? `
          <div style="text-align: center; padding: 24px; background: #FFF; border-radius: 12px; border: 1px dashed #ECE6D9;">
            <p style="font-size: 13px; font-weight: 700; color: #1A1A1A; margin: 0 0 4px;">Aucune étape pour ${escapeHtml(adminSelectedCropPlan)}</p>
            <p style="font-size: 11.5px; color: #4A4A4A; margin: 0;">Appuyez sur « + Ajouter » pour créer la première étape.</p>
          </div>
        ` : steps.map(s => `
          <div style="background: #FFF; border: 1px solid #ECE6D9; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 800; background: #05507E; color: #FFF; padding: 2px 7px; border-radius: 6px;">Étape ${s.ordre || 1}</span>
              <span style="font-size: 11px; font-weight: 700; color: #A85A1C; background: #F6EADF; padding: 2px 7px; border-radius: 6px;">J+${s.jour_debut}${s.jour_fin ? ' à J+' + s.jour_fin : ''}</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 800; color: #1A1A1A; margin: 0 0 4px;">${escapeHtml(s.titre)}</h4>
            ${s.description ? `<p style="font-size: 12px; color: #4A4A4A; margin: 0 0 8px; line-height: 1.4;">${escapeHtml(s.description)}</p>` : ''}
            <div style="display: flex; gap: 6px; border-top: 1px solid #ECE6D9; padding-top: 8px;">
              <button type="button" class="btn-secondary" onclick="openEditEtapeModal('${s.id}')" style="flex: 1; justify-content: center; font-size: 11.5px; padding: 6px;">Modifier</button>
              <button type="button" class="btn-secondary" onclick="toggleEtapeActive('${s.id}', ${s.actif})" style="flex: 1; justify-content: center; font-size: 11.5px; padding: 6px;">${s.actif ? 'Désactiver' : 'Activer'}</button>
              <button type="button" class="btn-secondary" onclick="deleteEtapeAdmin('${s.id}')" style="color: #C0392B; border-color: #F8B4B0; font-size: 11.5px; padding: 6px;">Suppr.</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderCyclesPage(statusFilter = 'all') {
    cyclesActiveStatusFilter = statusFilter;
    const container = document.getElementById('cyclesCardsGrid');
    const emptyState = document.getElementById('cyclesEmptyState');
    if (!container) return;

    // Mise à jour de l'apparence des puces de filtre
    document.querySelectorAll('#filterCyclesStatusContainer .type-filter-chip').forEach(chip => {
      const f = chip.getAttribute('data-status');
      if (f === statusFilter) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    const cycles = cachedCropCycles || [];
    if (cycles.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    // Filtrer par statut calculé
    const itemsWithStatus = cycles.map(c => ({
      cycle: c,
      statusInfo: calculateCycleStatus(c)
    }));

    const filtered = itemsWithStatus.filter(item => {
      if (statusFilter === 'all') return true;
      return item.statusInfo.key === statusFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 36px 20px; background: #FFFFFF; border-radius: 12px; border: 1.5px dashed #D5E0D5;">
          <p style="font-size: 14px; font-weight: 700; color: #1E2922; margin: 0 0 4px;">Aucun cycle dans cette catégorie</p>
          <p style="font-size: 12px; color: #7C8781; margin: 0;">Changez le filtre ci-dessus ou démarrez un nouveau cycle.</p>
        </div>
      `;
      if (emptyState) emptyState.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = filtered.map(item => {
      const c = item.cycle;
      const s = item.statusInfo;
      const p = c.parcels;
      const parcelDesc = p ? `${escapeHtml(p.name)} (${p.area_ha || 1} ha)` : 'Parcelle';
      const varieteHtml = c.variete ? `<span class="cycle-variete-badge">Variété : ${escapeHtml(c.variete)}</span>` : '';

      // Calcul des finances de ce cycle
      const cycleExp = (cachedExpenses || []).filter(e => e.crop_cycle_id === c.id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const cycleRev = (cachedRevenues || []).filter(r => r.crop_cycle_id === c.id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
      const cycleMargin = cycleRev - cycleExp;

      let marginBadgeHtml = '';
      if (cycleMargin > 0) {
        marginBadgeHtml = `<span style="color: #1E5E2A; font-weight: 800; font-family: inherit;">+${formatFrancsCFA(cycleMargin)} (Bénéfice)</span>`;
      } else if (cycleMargin < 0) {
        marginBadgeHtml = `<span style="color: #C53030; font-weight: 800; font-family: inherit;">-${formatFrancsCFA(Math.abs(cycleMargin))} (Déficit)</span>`;
      } else {
        marginBadgeHtml = `<span style="color: #5D6C63; font-weight: 600; font-family: inherit;">0 F CFA (Équilibre)</span>`;
      }

      return `
        <div class="cycle-card-pro">
          <div class="cycle-card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
                <span class="cycle-badge-status ${s.badgeClass}">${s.label}</span>
                <span class="fin-badge-region"> ${parcelDesc}</span>
                ${varieteHtml}
              </div>
              <h3 class="cycle-card-title"> ${escapeHtml(c.crop_name)}</h3>
            </div>
            <div class="cycle-card-margin-chip">
              <span style="font-size: 11px; color: #5D6C63; text-transform: uppercase;">Marge dégagée</span>
              ${marginBadgeHtml}
            </div>
          </div>

          <!-- Frise chronologique visuelle -->
          ${renderCycleTimelineHtml(c)}

          <!-- Conseil agronomique court INERA -->
          ${c.conseil_court ? `
            <div class="cycle-advice-box">
              <span style="font-size: 15px;"></span>
              <div>
                <strong>Conseil agronomique INERA :</strong>
                <p style="margin: 2px 0 0; font-size: 12.5px; color: #2A362E;">${escapeHtml(c.conseil_court)}</p>
              </div>
            </div>
          ` : ''}

          <!-- Section des travaux et rappels -->
          ${renderCycleTasksHtml(c.id)}

          <!-- Actions sur le cycle -->
          <div class="cycle-card-footer">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${s.key !== 'termine' ? `
                <button type="button" class="btn-cycle-harvest-done" onclick="markCropCycleHarvested('${c.id}')">
                   Récolte terminée
                </button>
              ` : ''}
              <button type="button" class="btn-cycle-action" onclick="editCycleHarvestDate('${c.id}')">
                ️ Ajuster date récolte
              </button>
              <button type="button" class="btn-cycle-action" onclick="deleteCropCycle('${c.id}')" style="color: #C53030; border-color: #F8B4B0;">
                ️ Supprimer
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderFinancesPage() {
    const monthExpEl = document.getElementById('financesMonthExpenses');
    const monthRevEl = document.getElementById('financesMonthRevenues');
    const globalMarginEl = document.getElementById('financesGlobalMargin');
    const monthExpCountEl = document.getElementById('financesMonthExpensesCount');
    const monthRevCountEl = document.getElementById('financesMonthRevenuesCount');
    const barsContainer = document.getElementById('sixMonthsBarsContainer');
    const cyclesListEl = document.getElementById('financesCyclesList');
    const cyclesEmptyEl = document.getElementById('financesCyclesEmpty');

    const curExp = currentMonthExpenseTotal || 0;
    const curRev = currentMonthRevenueTotal || 0;
    const totalExp = currentExpenseTotal || 0;
    const totalRev = currentRevenueTotal || 0;
    const campaignMargin = totalRev - totalExp;

    if (monthExpEl) monthExpEl.textContent = `${new Intl.NumberFormat('fr-FR').format(curExp)} F CFA`;
    if (monthRevEl) monthRevEl.textContent = `${new Intl.NumberFormat('fr-FR').format(curRev)} F CFA`;
    if (globalMarginEl) {
      const sign = campaignMargin >= 0 ? '+' : '';
      globalMarginEl.textContent = `${sign}${new Intl.NumberFormat('fr-FR').format(campaignMargin)} F CFA`;
      globalMarginEl.style.color = campaignMargin >= 0 ? '#1E5E2A' : '#C53030';
    }

    if (monthExpCountEl) {
      const expCount = (cachedExpenses || []).filter(e => {
        if (!e.expense_date) return false;
        const d = new Date(e.expense_date);
        return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
      }).length;
      monthExpCountEl.textContent = `${expCount} dépense${expCount > 1 ? 's' : ''} ce mois`;
    }

    if (monthRevCountEl) {
      const revCount = (cachedRevenues || []).filter(r => {
        if (!r.revenue_date) return false;
        const d = new Date(r.revenue_date);
        return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
      }).length;
      monthRevCountEl.textContent = `${revCount} vente${revCount > 1 ? 's' : ''} ce mois`;
    }

    // Graphique sur les 6 derniers mois
    if (barsContainer) {
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      const today = new Date();
      const monthsData = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();

        const mExp = (cachedExpenses || []).filter(e => {
          if (!e.expense_date) return false;
          const ed = new Date(e.expense_date);
          return ed.getFullYear() === y && ed.getMonth() === m;
        }).reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

        const mRev = (cachedRevenues || []).filter(r => {
          if (!r.revenue_date) return false;
          const rd = new Date(r.revenue_date);
          return rd.getFullYear() === y && rd.getMonth() === m;
        }).reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

        monthsData.push({
          label: `${monthNames[m]} ${y !== today.getFullYear() ? "'" + String(y).slice(2) : ''}`,
          expense: mExp,
          revenue: mRev,
          isCurrent: i === 0
        });
      }

      const allAmounts = monthsData.flatMap(d => [d.expense, d.revenue]);
      const maxAmount = Math.max(...allAmounts, 50000);

      barsContainer.innerHTML = monthsData.map(m => {
        const revPct = Math.min(100, Math.max(m.revenue > 0 ? 8 : 2, Math.round((m.revenue / maxAmount) * 95)));
        const expPct = Math.min(100, Math.max(m.expense > 0 ? 8 : 2, Math.round((m.expense / maxAmount) * 95)));

        return `
          <div class="six-month-col ${m.isCurrent ? 'is-active-col' : ''}">
            <div class="bars-pair">
              <div class="bar-rev" style="height: ${revPct}%;" title="Recettes : ${formatFrancsCFA(m.revenue)}"></div>
              <div class="bar-exp" style="height: ${expPct}%;" title="Dépenses : ${formatFrancsCFA(m.expense)}"></div>
            </div>
            <span class="month-col-label">${m.label}</span>
          </div>
        `;
      }).join('');
    }

    // Fiches de rentabilité par cycle
    if (cyclesListEl) {
      const cycles = cachedCropCycles || [];
      if (cycles.length === 0 && (cachedExpenses.length === 0 && cachedRevenues.length === 0)) {
        cyclesListEl.innerHTML = '';
        if (cyclesEmptyEl) cyclesEmptyEl.classList.remove('hidden');
        return;
      }

      if (cyclesEmptyEl) cyclesEmptyEl.classList.add('hidden');

      // Ventes et dépenses hors cycles
      const unassignedExp = (cachedExpenses || []).filter(e => !e.crop_cycle_id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const unassignedRev = (cachedRevenues || []).filter(r => !r.crop_cycle_id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
      const unassignedMargin = unassignedRev - unassignedExp;

      let cyclesHtml = cycles.map(c => {
        const cExp = (cachedExpenses || []).filter(e => e.crop_cycle_id === c.id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const cRev = (cachedRevenues || []).filter(r => r.crop_cycle_id === c.id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        const cMargin = cRev - cExp;

        let marginColor = '#5D6C63';
        let marginLabel = 'À l\'équilibre';
        if (cMargin > 0) {
          marginColor = '#1E5E2A';
          marginLabel = `+${formatFrancsCFA(cMargin)} (Bénéfice net)`;
        } else if (cMargin < 0) {
          marginColor = '#C53030';
          marginLabel = `-${formatFrancsCFA(Math.abs(cMargin))} (Déficit)`;
        }

        const secondaryInfo = getCycleSecondaryInfo(c);

        return `
          <div class="finance-cycle-card">
            <div class="finance-cycle-info">
              <div>
                ${secondaryInfo ? `<span class="fin-badge-region"> ${escapeHtml(secondaryInfo)}</span>` : '<span class="fin-badge-region"> Cycle cultural</span>'}
                <h4 style="font-size: 16px; font-weight: 800; color: #1E2922; margin: 4px 0 2px;"> ${escapeHtml(c.crop_name)}</h4>
                <span style="font-size: 12px; color: #7C8781;">Semé le ${c.planting_date ? formatDateEnToutesLettres(new Date(c.planting_date)) : '-'}</span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 11px; text-transform: uppercase; color: #5D6C63; font-weight: 700; display: block;">Marge Nette</span>
                <strong style="font-size: 17px; font-weight: 800; color: ${marginColor};">${marginLabel}</strong>
              </div>
            </div>

            <div class="finance-cycle-bars-row">
              <div class="finance-flow-chip exp-chip">
                <span>Dépenses :</span>
                <strong>${formatFrancsCFA(cExp)}</strong>
              </div>
              <div class="finance-flow-chip rev-chip">
                <span>Recettes :</span>
                <strong>${formatFrancsCFA(cRev)}</strong>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Ajouter la carte des frais généraux / ventes libres
      if (unassignedExp > 0 || unassignedRev > 0) {
        cyclesHtml += `
          <div class="finance-cycle-card" style="border-left: 4px solid #8E44AD;">
            <div class="finance-cycle-info">
              <div>
                <span class="fin-badge-type">Général & Ventes ponctuelles</span>
                <h4 style="font-size: 16px; font-weight: 800; color: #1E2922; margin: 4px 0 2px;"> Frais généraux & Ventes libres</h4>
                <span style="font-size: 12px; color: #7C8781;">Opérations non affectées à une culture</span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 11px; text-transform: uppercase; color: #5D6C63; font-weight: 700; display: block;">Résultat Net</span>
                <strong style="font-size: 17px; font-weight: 800; color: ${unassignedMargin >= 0 ? '#1E5E2A' : '#C53030'};">
                  ${unassignedMargin >= 0 ? '+' : ''}${formatFrancsCFA(unassignedMargin)}
                </strong>
              </div>
            </div>
            <div class="finance-cycle-bars-row">
              <div class="finance-flow-chip exp-chip">
                <span>Dépenses :</span>
                <strong>${formatFrancsCFA(unassignedExp)}</strong>
              </div>
              <div class="finance-flow-chip rev-chip">
                <span>Recettes :</span>
                <strong>${formatFrancsCFA(unassignedRev)}</strong>
              </div>
            </div>
          </div>
        `;
      }

      cyclesListEl.innerHTML = cyclesHtml;
    }

    // Afficher la liste des transactions
    renderTransactionsList(currentTransFilter);
  }

  // ==========================================
  // GESTION DES TRANSACTIONS FINANCIÈRES (MODIFIER / SUPPRIMER)
  // ==========================================
  let currentTransFilter = 'all'; // 'all' | 'expenses' | 'revenues'
  let pendingDeleteType = null;   // 'expense' | 'revenue'
  let pendingDeleteId = null;

  function getCycleSecondaryInfo(c) {
    if (!c) return '';
    if (c.variete && c.variete.trim()) return c.variete.trim();
    if (c.variety && c.variety.trim()) return c.variety.trim();
    if (c.crop_name && c.crop_name.includes('(')) {
      const match = c.crop_name.match(/\((.*?)\)/);
      if (match && match[1] && match[1].trim()) return match[1].trim();
    }
    if (c.parcels && c.parcels.name && c.parcels.name.trim()) {
      const pName = c.parcels.name.trim();
      const pLower = pName.toLowerCase();
      const cropLower = (c.crop_name || '').toLowerCase();
      if (pLower.includes('maïs') && !cropLower.includes('maïs')) {
        return '';
      }
      return pName;
    }
    return '';
  }

  function _renderSingleTransContainer(filter, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isMobile = containerId === 'mobileFinancesTransactionsList';
    const emptyEl = document.getElementById(isMobile ? 'mobileFinancesTransactionsEmpty' : 'financesTransactionsEmpty');
    const countAllEl = document.getElementById(isMobile ? 'mobCountTransAll' : 'countTransAll');
    const countExpEl = document.getElementById(isMobile ? 'mobCountTransExp' : 'countTransExp');
    const countRevEl = document.getElementById(isMobile ? 'mobCountTransRev' : 'countTransRev');

    const expList = (cachedExpenses || []).map(e => ({
      type: 'expense',
      id: e.id,
      date: e.expense_date,
      amount: parseFloat(e.amount) || 0,
      title: e.notes || (e.category ? (e.category.charAt(0).toUpperCase() + e.category.slice(1)) : 'Dépense d\'exploitation'),
      sub: `${e.category ? 'Charge : ' + e.category : 'Dépense'} • ${e.expense_date ? formatDateEnToutesLettres(new Date(e.expense_date)) : '-'}`,
      icon: ''
    }));

    const revList = (cachedRevenues || []).map(r => ({
      type: 'revenue',
      id: r.id,
      date: r.revenue_date,
      amount: parseFloat(r.amount) || 0,
      title: r.crop_name || 'Vente de récolte',
      sub: `${r.buyer_name ? 'Acheteur : ' + r.buyer_name : 'Vente récolte'} • ${r.revenue_date ? formatDateEnToutesLettres(new Date(r.revenue_date)) : '-'}`,
      icon: ''
    }));

    if (countAllEl) countAllEl.textContent = expList.length + revList.length;
    if (countExpEl) countExpEl.textContent = expList.length;
    if (countRevEl) countRevEl.textContent = revList.length;

    let combined = [];
    if (filter === 'expenses') {
      combined = expList;
    } else if (filter === 'revenues') {
      combined = revList;
    } else {
      combined = [...expList, ...revList];
    }

    combined.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    if (combined.length === 0) {
      container.innerHTML = '';
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    container.innerHTML = combined.map(item => {
      const isExp = item.type === 'expense';
      const formattedAmtFCFA = `${new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA`;
      const amtDisplay = `${isExp ? '− ' : '+ '}${new Intl.NumberFormat('fr-FR').format(item.amount)} F CFA`;

      return `
        <div class="transaction-item-row ${isExp ? 'is-expense' : 'is-revenue'}">
          <div class="trans-icon-badge ${isExp ? 'is-expense' : 'is-revenue'}">
            ${item.icon}
          </div>
          <div class="trans-info-col">
            <h4 class="trans-title">${escapeHtml(item.title)}</h4>
            <span class="trans-meta">${escapeHtml(item.sub)}</span>
          </div>
          <div class="trans-amount-col">
            <span class="trans-amount-val ${isExp ? 'is-expense' : 'is-revenue'}">${amtDisplay}</span>
          </div>
          <div class="trans-actions-col">
            <button type="button" class="btn-trans-action btn-trans-edit" data-id="${item.id}" data-type="${item.type}" aria-label="Modifier cette ${isExp ? 'dépense' : 'vente'} de ${formattedAmtFCFA}" title="Modifier">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button type="button" class="btn-trans-action btn-trans-delete" data-id="${item.id}" data-type="${item.type}" aria-label="Supprimer cette ${isExp ? 'dépense' : 'vente'} de ${formattedAmtFCFA}" title="Supprimer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-trans-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        if (type === 'expense') openEditExpenseModal(id);
        else openEditRevenueModal(id);
      });
    });

    container.querySelectorAll('.btn-trans-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        confirmDeleteTransaction(type, id);
      });
    });
  }

  function renderTransactionsList(filter = currentTransFilter, containerId = 'financesTransactionsList') {
    currentTransFilter = filter;
    _renderSingleTransContainer(filter, containerId);

    // Synchronisation multi-vues
    if (containerId === 'financesTransactionsList' && document.getElementById('mobileFinancesTransactionsList')) {
      _renderSingleTransContainer(filter, 'mobileFinancesTransactionsList');
    }
    if (containerId === 'mobileFinancesTransactionsList' && document.getElementById('financesTransactionsList')) {
      _renderSingleTransContainer(filter, 'financesTransactionsList');
    }
  }

  function confirmDeleteTransaction(type, id) {
    pendingDeleteType = type;
    pendingDeleteId = id;
    const modal = document.getElementById('modalConfirmDeleteTransaction');
    const msgEl = document.getElementById('confirmDeleteTransactionMessage');

    const isExp = type === 'expense';
    let amtFormatted = '0 FCFA';
    if (isExp) {
      const item = (cachedExpenses || []).find(e => String(e.id) === String(id));
      const amt = item ? (parseFloat(item.amount) || 0) : 0;
      amtFormatted = `${new Intl.NumberFormat('fr-FR').format(amt)} FCFA`;
    } else {
      const item = (cachedRevenues || []).find(r => String(r.id) === String(id));
      const amt = item ? (parseFloat(item.amount) || 0) : 0;
      amtFormatted = `${new Intl.NumberFormat('fr-FR').format(amt)} FCFA`;
    }

    if (msgEl) {
      msgEl.textContent = isExp
        ? `Supprimer cette dépense de ${amtFormatted} ? Cette action est définitive.`
        : `Supprimer cette vente de ${amtFormatted} ? Cette action est définitive.`;
    }

    if (modal) modal.classList.remove('hidden');
  }

  function closeConfirmDeleteModal() {
    const modal = document.getElementById('modalConfirmDeleteTransaction');
    if (modal) modal.classList.add('hidden');
    pendingDeleteType = null;
    pendingDeleteId = null;
  }

  const btnConfirmDelTrans = document.getElementById('btnConfirmDeleteTransaction');
  const btnCancelDelTrans = document.getElementById('btnCancelDeleteTransaction');
  const modalConfirmDel = document.getElementById('modalConfirmDeleteTransaction');

  if (btnCancelDelTrans) btnCancelDelTrans.addEventListener('click', closeConfirmDeleteModal);
  if (modalConfirmDel) {
    modalConfirmDel.addEventListener('click', (e) => {
      if (e.target === modalConfirmDel) closeConfirmDeleteModal();
    });
  }

  if (btnConfirmDelTrans) {
    btnConfirmDelTrans.addEventListener('click', async () => {
      if (!pendingDeleteType || !pendingDeleteId) {
        closeConfirmDeleteModal();
        return;
      }

      const type = pendingDeleteType;
      const id = pendingDeleteId;
      closeConfirmDeleteModal();

      if (supabaseClient) {
        try {
          const table = type === 'expense' ? 'expenses' : 'revenues';
          const { error } = await supabaseClient.from(table).delete().eq('id', id);
          if (error) {
            console.error(`Erreur suppression ${table} :`, error);
            showToast('Erreur', 'Impossible de supprimer cette opération.');
            return;
          }
        } catch (err) {
          console.warn('Erreur réseau suppression transaction :', err);
        }
      }

      await syncFinancialsFromSupabase(currentProfileKey);
      const { formattedMargin } = updateFinancialMetrics();

      showToast(
        type === 'expense' ? 'Dépense supprimée' : 'Vente supprimée',
        `Opération supprimée avec succès. Marge nette : ${formattedMargin}.`
      );
    });
  }

  // Onglets de filtre des transactions bureau
  const fAll = document.getElementById('filterTransAll');
  const fExp = document.getElementById('filterTransExp');
  const fRev = document.getElementById('filterTransRev');

  function setTransFilter(filter) {
    [fAll, fExp, fRev].forEach(b => { if (b) b.classList.remove('active'); });
    if (filter === 'all' && fAll) fAll.classList.add('active');
    if (filter === 'expenses' && fExp) fExp.classList.add('active');
    if (filter === 'revenues' && fRev) fRev.classList.add('active');
    renderTransactionsList(filter);
  }

  if (fAll) fAll.addEventListener('click', () => setTransFilter('all'));
  if (fExp) fExp.addEventListener('click', () => setTransFilter('expenses'));
  if (fRev) fRev.addEventListener('click', () => setTransFilter('revenues'));

  function renderSynthesePage() {
    const surfaceEl = document.getElementById('syntheseSurfaceCultivee');
    const parcelsSubEl = document.getElementById('syntheseSurfaceTotalParcelles');
    const cyclesCountEl = document.getElementById('syntheseCyclesCount');
    const margeCampagneEl = document.getElementById('syntheseMargeCampagne');
    const topCropEl = document.getElementById('syntheseTopCrop');
    const topCropGainEl = document.getElementById('syntheseTopCropGain');
    const echeancesCountEl = document.getElementById('syntheseEcheancesCount');
    const echeancesListEl = document.getElementById('syntheseEcheancesList');
    const echeancesEmptyEl = document.getElementById('syntheseEcheancesEmpty');

    const parcels = cachedUserParcels || [];
    const cycles = cachedCropCycles || [];
    const tasks = cachedCycleTasks || [];

    // 1. Surface cultivée
    const totalHa = parcels.reduce((sum, p) => sum + (parseFloat(p.area_ha) || 0), 0);
    if (surfaceEl) surfaceEl.textContent = `${totalHa.toFixed(1)} ha`;
    if (parcelsSubEl) parcelsSubEl.textContent = `${parcels.length} parcelle${parcels.length > 1 ? 's' : ''} active${parcels.length > 1 ? 's' : ''}`;

    // 2. Cycles en cours
    const activeCycles = cycles.filter(c => c.status !== 'Terminé' && c.status !== 'Récolté');
    if (cyclesCountEl) cyclesCountEl.textContent = activeCycles.length;

    // 3. Marge de campagne
    const campaignMargin = (currentRevenueTotal || 0) - (currentExpenseTotal || 0);
    if (margeCampagneEl) {
      const sign = campaignMargin >= 0 ? '+' : '';
      margeCampagneEl.textContent = `${sign}${new Intl.NumberFormat('fr-FR').format(campaignMargin)} F CFA`;
      margeCampagneEl.style.color = campaignMargin >= 0 ? '#1E5E2A' : '#C53030';
    }

    // 4. Culture la plus rentable
    let bestCrop = null;
    let maxGain = 0;

    cycles.forEach(c => {
      const exp = (cachedExpenses || []).filter(e => e.crop_cycle_id === c.id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const rev = (cachedRevenues || []).filter(r => r.crop_cycle_id === c.id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
      const gain = rev - exp;
      if (gain > maxGain) {
        maxGain = gain;
        bestCrop = c;
      }
    });

    if (topCropEl) {
      if (bestCrop && maxGain > 0) {
        topCropEl.textContent = ` ${bestCrop.crop_name}`;
        if (topCropGainEl) topCropGainEl.textContent = `Bénéfice : +${formatFrancsCFA(maxGain)}`;
      } else {
        topCropEl.textContent = '--';
        if (topCropGainEl) topCropGainEl.textContent = 'Enregistrez vos récoltes';
      }
    }

    // 5. Prochaines échéances (30 prochains jours)
    if (echeancesListEl) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const horizon = new Date();
      horizon.setDate(horizon.getDate() + 30);

      const deadlines = [];

      // Échéances de tâches programmées
      tasks.filter(t => t.statut !== 'fait' && t.date_prevue).forEach(t => {
        const d = new Date(t.date_prevue);
        if (d >= today && d <= horizon) {
          const cycleObj = cycles.find(c => String(c.id) === String(t.crop_cycle_id));
          deadlines.push({
            date: d,
            type: 'tache',
            icon: '',
            title: t.titre,
            sub: cycleObj ? `Cycle : ${cycleObj.crop_name}` : 'Travail agricole',
            badge: 'Tâche'
          });
        }
      });

      // Échéances de repiquage
      activeCycles.filter(c => c.repiquage_date).forEach(c => {
        const d = new Date(c.repiquage_date);
        if (d >= today && d <= horizon) {
          deadlines.push({
            date: d,
            type: 'repiquage',
            icon: '',
            title: `Repiquage : ${c.crop_name}`,
            sub: c.parcels?.name || 'Parcelle',
            badge: 'Repiquage'
          });
        }
      });

      // Échéances de début de récolte
      activeCycles.filter(c => c.harvest_date_min || c.estimated_harvest_date).forEach(c => {
        const d = new Date(c.harvest_date_min || c.estimated_harvest_date);
        if (d >= today && d <= horizon) {
          deadlines.push({
            date: d,
            type: 'recolte',
            icon: '',
            title: `Début récolte : ${c.crop_name}`,
            sub: c.parcels?.name || 'Parcelle',
            badge: 'Récolte'
          });
        }
      });

      deadlines.sort((a, b) => a.date - b.date);

      if (echeancesCountEl) echeancesCountEl.textContent = deadlines.length;

      if (deadlines.length === 0) {
        echeancesListEl.innerHTML = '';
        if (echeancesEmptyEl) echeancesEmptyEl.classList.remove('hidden');
      } else {
        if (echeancesEmptyEl) echeancesEmptyEl.classList.add('hidden');
        echeancesListEl.innerHTML = deadlines.map(item => `
          <div class="synthese-echeance-row">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">${item.icon}</span>
              <div>
                <strong style="font-size: 13.5px; color: #1E2822; display: block;">${escapeHtml(item.title)}</strong>
                <span style="font-size: 12px; color: #7C8781;">${escapeHtml(item.sub)}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <span class="echeance-date-badge">${formatDateEnToutesLettres(item.date)}</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // ==========================================
  // COMPTE D'EXPLOITATION CERTIFIÉ & IMPRIMABLE
  // ==========================================

  function openCompteExploitationModal() {
    if (!modalCompteExploitation) return;

    const profileData = PROFILES_DATA[currentProfileKey] || {};
    const isPro = userSubscriptionStatus[currentProfileKey] === true || profileData.is_pro === true;
    const lockGate = document.getElementById('compteProLockGate');

    // Document header info
    const prodNameEl = document.getElementById('compteProducerName');
    const prodLocEl = document.getElementById('compteProducerLoc');
    const prodStatusEl = document.getElementById('compteProducerStatus');
    const dateEmissionEl = document.getElementById('compteDateEmission');
    const stampDateEl = document.getElementById('compteStampDate');
    const certifIdEl = document.getElementById('compteCertifId');

    const today = new Date();
    const dateFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    if (dateEmissionEl) dateEmissionEl.textContent = dateFormatted;
    if (stampDateEl) stampDateEl.textContent = `Vérifié le ${dateFormatted}`;
    if (certifIdEl) {
      certifIdEl.textContent = `RA-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (prodNameEl) prodNameEl.textContent = profileData.name || 'Fabrice ZOMAHOUN';
    if (prodLocEl) prodLocEl.textContent = `${profileData.location || 'Koudougou'} • ${profileData.phone || '+226 70 00 00 00'}`;
    if (prodStatusEl) {
      prodStatusEl.textContent = isPro ? '⭐ Forfait Pro Actif' : 'Compte Découverte (Gratuit)';
      prodStatusEl.style.color = isPro ? '#1E5E2A' : '#C8862A';
    }

    // Gestion du flou pour utilisateurs gratuits
    if (!isPro) {
      if (lockGate) lockGate.classList.remove('hidden');
    } else {
      if (lockGate) lockGate.classList.add('hidden');
    }

    // Remplissage des bilans financiers réels
    const totalExp = currentExpenseTotal || 0;
    const totalRev = currentRevenueTotal || 0;
    const netMarge = totalRev - totalExp;
    const rate = totalExp > 0 ? Math.round((netMarge / totalExp) * 100) : (totalRev > 0 ? 100 : 0);

    const revEl = document.getElementById('compteTotalRevenues');
    const expEl = document.getElementById('compteTotalExpenses');
    const marginEl = document.getElementById('compteNetMargin');
    const rateEl = document.getElementById('compteMarginRate');

    if (revEl) revEl.textContent = `${formatFrancsCFA(totalRev)}`;
    if (expEl) expEl.textContent = `${formatFrancsCFA(totalExp)}`;
    if (marginEl) {
      const sign = netMarge >= 0 ? '+' : '';
      marginEl.textContent = `${sign}${formatFrancsCFA(netMarge)}`;
      marginEl.style.color = netMarge >= 0 ? '#1E5E2A' : '#C53030';
    }
    if (rateEl) {
      rateEl.textContent = `${rate}%`;
      rateEl.style.color = rate >= 0 ? '#1E5E2A' : '#C53030';
    }

    // 2. Ventilation des dépenses par catégorie
    const expTbody = document.getElementById('compteExpenseCategoriesBody');
    if (expTbody) {
      const catMap = {};
      (cachedExpenses || []).forEach(e => {
        const cat = e.category || 'Autres charges';
        catMap[cat] = (catMap[cat] || 0) + (parseFloat(e.amount) || 0);
      });

      const catEntries = Object.entries(catMap);
      if (catEntries.length === 0) {
        expTbody.innerHTML = `<tr><td colspan="3" style="padding: 10px; text-align: center; color: #7C8781;">Aucune dépense enregistrée</td></tr>`;
      } else {
        expTbody.innerHTML = catEntries.map(([cat, amt]) => {
          const partPct = totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0;
          return `
            <tr style="border-bottom: 1px solid #E6EAE3;">
              <td style="padding: 8px 10px; font-weight: 600;">${escapeHtml(cat)}</td>
              <td style="padding: 8px 10px; text-align: right; font-family: 'JetBrains Mono', monospace;">${formatFrancsCFA(amt)}</td>
              <td style="padding: 8px 10px; text-align: right; color: #5D6C63;">${partPct}%</td>
            </tr>
          `;
        }).join('');
      }
    }

    // 3. Rentabilité par culture et parcelle
    const cropsTbody = document.getElementById('compteCropsBreakdownBody');
    if (cropsTbody) {
      const cycles = cachedCropCycles || [];
      if (cycles.length === 0) {
        cropsTbody.innerHTML = `<tr><td colspan="6" style="padding: 10px; text-align: center; color: #7C8781;">Aucun cycle cultural enregistré</td></tr>`;
      } else {
        cropsTbody.innerHTML = cycles.map(c => {
          const exp = (cachedExpenses || []).filter(e => e.crop_cycle_id === c.id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          const rev = (cachedRevenues || []).filter(r => r.crop_cycle_id === c.id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
          const marge = rev - exp;
          const status = c.status || 'En production';

          const secInfo = getCycleSecondaryInfo(c);
          return `
            <tr style="border-bottom: 1px solid #E6EAE3;">
              <td style="padding: 8px 10px;"><strong> ${escapeHtml(c.crop_name)}</strong>${secInfo ? `<br><small style="color: #7C8781;">${escapeHtml(secInfo)}</small>` : ''}</td>
              <td style="padding: 8px 10px;">${c.parcels?.area_ha || 1} ha</td>
              <td style="padding: 8px 10px; text-align: right; font-family: inherit;">${formatFrancsCFA(exp)}</td>
              <td style="padding: 8px 10px; text-align: right; font-family: inherit;">${formatFrancsCFA(rev)}</td>
              <td style="padding: 8px 10px; text-align: right; font-family: inherit; font-weight: 700; color: ${marge >= 0 ? '#1E5E2A' : '#C53030'};">
                ${marge >= 0 ? '+' : ''}${formatFrancsCFA(marge)}
              </td>
              <td style="padding: 8px 10px; text-align: center;"><span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: #EAF4E6; color: #1E5E2A;">${escapeHtml(status)}</span></td>
            </tr>
          `;
        }).join('');
      }
    }

    modalCompteExploitation.classList.remove('hidden');
  }

  function closeCompteExploitationModal() {
    if (modalCompteExploitation) modalCompteExploitation.classList.add('hidden');
  }

  // Écouteurs pour le compte d'exploitation et tâches
  const btnCloseCompte = document.getElementById('btnCloseCompteExploitation');
  if (btnCloseCompte) btnCloseCompte.addEventListener('click', closeCompteExploitationModal);

  const btnPrintCompte = document.getElementById('btnPrintCompteExploitation');
  if (btnPrintCompte) {
    btnPrintCompte.addEventListener('click', () => {
      window.print();
    });
  }

  const btnGateUpgrade = document.getElementById('btnGateUpgradeToPro');
  if (btnGateUpgrade) {
    btnGateUpgrade.addEventListener('click', () => {
      closeCompteExploitationModal();
      openPricingModal();
    });
  }

  const btnOpenComptePdf = document.getElementById('btnOpenExportCompteExploitation');
  if (btnOpenComptePdf) btnOpenComptePdf.addEventListener('click', openCompteExploitationModal);

  const btnCloseTaskModal = document.getElementById('btnCloseAddCycleTask');
  if (btnCloseTaskModal) btnCloseTaskModal.addEventListener('click', closeAddCycleTaskModal);
  const btnCancelTaskModal = document.getElementById('btnCancelAddCycleTask');
  if (btnCancelTaskModal) btnCancelTaskModal.addEventListener('click', closeAddCycleTaskModal);

  if (formAddCycleTask) formAddCycleTask.addEventListener('submit', handleSaveCycleTask);

  // Puces de suggestions de tâches en 1 clic
  document.querySelectorAll('.btn-task-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-task');
      const input = document.getElementById('taskTitre');
      if (input && val) {
        input.value = val;
        input.focus();
      }
    });
  });

  // Filtres de statut de cycles
  document.querySelectorAll('#filterCyclesStatusContainer .type-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const status = chip.getAttribute('data-status');
      renderCyclesPage(status);
    });
  });

  // Boutons d'ajout de cycle depuis la page cycles
  const btnAddCyclePage = document.getElementById('btnOpenAddCropCycleFromCycles');
  if (btnAddCyclePage) btnAddCyclePage.addEventListener('click', () => openAddCropCycleModal());
  const btnEmptyAddCycle = document.getElementById('btnEmptyStateAddCycle');
  if (btnEmptyAddCycle) btnEmptyAddCycle.addEventListener('click', () => openAddCropCycleModal());

  // Boutons sur la page finances
  const btnFinAddExp = document.getElementById('btnFinancesAddExpense');
  if (btnFinAddExp) btnFinAddExp.addEventListener('click', openExpenseModal);
  const btnFinAddRev = document.getElementById('btnFinancesAddRevenue');
  if (btnFinAddRev) btnFinAddRev.addEventListener('click', openRevenueModal);

  // Bouton de passage synthèse -> finances
  const btnSynthToFin = document.getElementById('btnSyntheseGoToFinances');
  if (btnSynthToFin) {
    btnSynthToFin.addEventListener('click', () => {
      window.location.hash = 'finances';
      navigateToPage('finances');
    });
  }

  // Exposition des fonctions sur window
  window.openAddCycleTaskModal = openAddCycleTaskModal;
  window.toggleCycleTaskStatus = toggleCycleTaskStatus;
  window.deleteCycleTask = deleteCycleTask;
  window.markCropCycleHarvested = markCropCycleHarvested;
  window.editCycleHarvestDate = editCycleHarvestDate;
  window.openCompteExploitationModal = openCompteExploitationModal;
  window.openExpenseModal = openExpenseModal;
  window.openRevenueModal = openRevenueModal;
  window.openEditExpenseModal = openEditExpenseModal;
  window.openEditRevenueModal = openEditRevenueModal;
  window.confirmDeleteTransaction = confirmDeleteTransaction;
  window.renderTransactionsList = renderTransactionsList;

  let cachedDeclaredCrops = [];

  async function fetchAndRenderDeclaredCrops() {
    const listEl = document.getElementById('declaredCropsList');
    const badgeEl = document.getElementById('declaredCropsCountBadge');
    if (!listEl) return;

    if (!supabaseClient) {
      listEl.innerHTML = '<p style="font-size: 13px; color: #6E7C74; margin: 8px 0;">Connexion non disponible.</p>';
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from('crop_cycles')
        .select('crop_name, profile_id')
        .is('modele_id', null);

      if (error) {
        console.warn('Cultures déclarées :', error);
        listEl.innerHTML = '<p style="font-size: 13px; color: #718096; margin: 8px 0;">Aucune culture déclarée disponible ou accès restreint.</p>';
        return;
      }

      const map = new Map();
      (data || []).forEach(row => {
        const rawName = (row.crop_name || '').trim();
        if (!rawName) return;
        const key = rawName.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            displayName: rawName,
            producers: new Set()
          });
        }
        if (row.profile_id) {
          map.get(key).producers.add(row.profile_id);
        }
      });

      const items = Array.from(map.values()).map(entry => ({
        name: entry.displayName,
        count: entry.producers.size || 1
      }));

      items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      cachedDeclaredCrops = items;

      if (badgeEl) {
        badgeEl.textContent = items.length;
      }

      if (items.length === 0) {
        listEl.innerHTML = `
          <div style="padding: 12px 14px; background: #F8FAF7; border-radius: 8px; color: #5D6C63; font-size: 13px; text-align: center;">
             Aucune culture déclarée sans modèle pour le moment.
          </div>
        `;
        return;
      }

      listEl.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; margin-top: 10px;">
          ${items.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; background: #F9FBFA; border: 1px solid #E1EBE2; border-radius: 8px; padding: 10px 14px;">
              <div>
                <strong style="display: block; font-size: 14px; color: #1E2822;"> ${escapeHtml(item.name)}</strong>
                <span style="font-size: 11.5px; color: #5D6C63;">
                   ${item.count} producteur${item.count > 1 ? 's' : ''}
                </span>
              </div>
              <button type="button" class="btn-table-action" onclick="window.openAddModeleWithName('${escapeHtml(item.name.replace(/'/g, "\\'"))}')" style="font-size: 11.5px; padding: 4px 10px; cursor: pointer; color: #1E5E2A; font-weight: 700; border-color: #B8D8B2;">
                 Créer modèle
              </button>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      console.error('Erreur fetchAndRenderDeclaredCrops :', err);
      listEl.innerHTML = '<p style="font-size: 13px; color: #E53E3E; margin: 8px 0;">Erreur lors du chargement des cultures déclarées.</p>';
    }
  }

  function openAddModeleWithName(cropName) {
    openManageModeleModal();
    const nomInput = document.getElementById('modeleNomCulture');
    if (nomInput && cropName) {
      nomInput.value = cropName;
      nomInput.focus();
    }
  }

  window.openAddModeleWithName = openAddModeleWithName;
  window.openManageModeleModal = openManageModeleModal;
  window.toggleModeleActive = toggleModeleActive;
  window.deleteCropCycle = deleteCropCycle;

  function renderAdminModeles() {
    fetchAndRenderDeclaredCrops();
    const listEl = document.getElementById('adminModelesList');
    const emptyEl = document.getElementById('adminModelesEmpty');
    const bAll = document.getElementById('badgeModeleCountAll');
    const bActif = document.getElementById('badgeModeleCountActif');
    const bInactif = document.getElementById('badgeModeleCountInactif');

    const allModeles = cachedModelesCultures || [];
    const actifs = allModeles.filter(m => m.actif);
    const inactifs = allModeles.filter(m => !m.actif);

    if (bAll) bAll.textContent = allModeles.length;
    if (bActif) bActif.textContent = actifs.length;
    if (bInactif) bInactif.textContent = inactifs.length;

    let items = allModeles;
    if (activeAdminModelesTab === 'actif') items = actifs;
    else if (activeAdminModelesTab === 'inactif') items = inactifs;

    if (!listEl) return;

    if (items.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    listEl.innerHTML = items.map(m => {
      const isActif = !!m.actif;
      const statusBadge = isActif
        ? '<span class="fin-badge-status badge-status-publie"> Actif</span>'
        : '<span class="fin-badge-status badge-status-expire">⏸️ Désactivé</span>';

      const modeBadge = getModeleModeBadge(m.mode_depart);
      const pepDuration = (m.mode_depart === 'pepiniere' && m.pepiniere_jours_min)
        ? `${m.pepiniere_jours_min} à ${m.pepiniere_jours_max} jours`
        : 'Non applicable (Semis direct)';

      const recolteDuration = (m.recolte_jours_min != null && m.recolte_jours_min > 0)
        ? `${m.recolte_jours_min} à ${m.recolte_jours_max} jours`
        : '<span style="color: #874D00; font-weight: 700;">Inconnue (Demandez à l\'agent de zone)</span>';

      return `
        <div class="admin-fin-card" style="border-left: 4px solid ${isActif ? '#1E5E2A' : '#A0AEC0'};">
          <div class="admin-fin-card-header">
            <div>
              <div class="admin-fin-meta-row">
                <span class="fin-badge-type">${m.categorie || 'Agriculture'}</span>
                ${modeBadge}
                ${statusBadge}
              </div>
              <h3 class="admin-fin-title" style="margin-top: 4px;">
                 ${m.nom_culture} ${m.variete ? `<small style="font-size: 13px; font-weight: 600; color: #5D6C63;">(variété ${m.variete})</small>` : '<small style="font-size: 13px; font-weight: 500; color: #5D6C63;">(toutes variétés)</small>'}
              </h3>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; background: #F8FAF7; padding: 12px; border-radius: 8px;">
            <div>
              <span style="display: block; font-size: 11px; text-transform: uppercase; color: #5D6C63; font-weight: 700;">Pépinière</span>
              <strong style="font-size: 13px; color: #1E2822;">${pepDuration}</strong>
            </div>
            <div>
              <span style="display: block; font-size: 11px; text-transform: uppercase; color: #5D6C63; font-weight: 700;">Récolte</span>
              <strong style="font-size: 13px; color: #1E5E2A;">${recolteDuration}</strong>
            </div>
          </div>

          ${m.conseil_court ? `
            <div style="background: #FFFFFF; border: 1px dashed #B8D8B2; border-radius: 8px; padding: 8px 12px; margin-bottom: 8px; font-size: 12.5px; color: #1E2822;">
               <strong>Conseil court :</strong> ${m.conseil_court}
            </div>
          ` : ''}

          <div style="font-size: 11px; color: #6E7C74; margin-bottom: 12px;">
            <strong>Source :</strong> ${m.source}
          </div>

          <div class="admin-fin-card-footer" style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #EDF3EB; padding-top: 10px;">
            <button type="button" class="btn-table-action" onclick="openManageModeleModal('${m.id}')" style="cursor: pointer;">
              ️ Modifier
            </button>
            <button type="button" class="btn-table-action" onclick="toggleModeleActive('${m.id}')" style="cursor: pointer; ${isActif ? 'color: #D97706;' : 'color: #1E5E2A;'}">
              ${isActif ? '️ Désactiver' : ' Activer'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function openManageModeleModal(modeleId = null) {
    if (!modalManageModele) return;

    const modalTitle = document.getElementById('manageModeleModalTitle');
    const idInput = document.getElementById('modeleId');
    const nomInput = document.getElementById('modeleNomCulture');
    const varInput = document.getElementById('modeleVariete');
    const catInput = document.getElementById('modeleCategorie');
    const modeInput = document.getElementById('modeleModeDepart');
    const pepMinInput = document.getElementById('modelePepiniereMin');
    const pepMaxInput = document.getElementById('modelePepiniereMax');
    const recMinInput = document.getElementById('modeleRecolteMin');
    const recMaxInput = document.getElementById('modeleRecolteMax');
    const conseilInput = document.getElementById('modeleConseilCourt');
    const srcInput = document.getElementById('modeleSource');
    const actifInput = document.getElementById('modeleActif');
    const pepRow = document.getElementById('modelePepiniereRow');

    if (modeleId) {
      const m = cachedModelesCultures.find(item => String(item.id) === String(modeleId));
      if (!m) return;
      modalTitle.textContent = `Modifier : ${m.nom_culture}`;
      idInput.value = m.id;
      nomInput.value = m.nom_culture || '';
      varInput.value = m.variete || '';
      catInput.value = m.categorie || 'maraîchage';
      modeInput.value = m.mode_depart || 'pepiniere';
      pepMinInput.value = m.pepiniere_jours_min != null ? m.pepiniere_jours_min : '';
      pepMaxInput.value = m.pepiniere_jours_max != null ? m.pepiniere_jours_max : '';
      recMinInput.value = m.recolte_jours_min != null ? m.recolte_jours_min : '';
      recMaxInput.value = m.recolte_jours_max != null ? m.recolte_jours_max : '';
      conseilInput.value = m.conseil_court || '';
      srcInput.value = m.source || '';
      actifInput.value = m.actif ? 'true' : 'false';
    } else {
      modalTitle.textContent = 'Ajouter un modèle de culture';
      idInput.value = '';
      nomInput.value = '';
      varInput.value = '';
      catInput.value = 'maraîchage';
      modeInput.value = 'pepiniere';
      pepMinInput.value = '';
      pepMaxInput.value = '';
      recMinInput.value = '';
      recMaxInput.value = '';
      conseilInput.value = '';
      srcInput.value = '';
      actifInput.value = 'true';
    }

    if (pepRow) {
      pepRow.style.display = (modeInput.value === 'pepiniere') ? '' : 'none';
    }

    modalManageModele.classList.remove('hidden');
  }

  async function toggleModeleActive(modeleId) {
    if (!supabaseClient) return;
    const m = cachedModelesCultures.find(item => String(item.id) === String(modeleId));
    if (!m) return;
    const newStatus = !m.actif;
    try {
      const { error } = await supabaseClient
        .from('modeles_cultures')
        .update({ actif: newStatus })
        .eq('id', modeleId);

      if (!error) {
        m.actif = newStatus;
        showToast('Modèle actualisé', `Le modèle « ${m.nom_culture} » est désormais ${newStatus ? 'actif' : 'désactivé'}.`);
        renderAdminModeles();
      } else {
        showToast('Erreur', error.message || 'Action impossible.');
      }
    } catch (e) {
      console.error('Erreur toggleModeleActive :', e);
    }
  }

  async function handleSaveModele(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const id = document.getElementById('modeleId')?.value;
    const nom = document.getElementById('modeleNomCulture')?.value?.trim();
    const variete = document.getElementById('modeleVariete')?.value?.trim() || null;
    const categorie = document.getElementById('modeleCategorie')?.value;
    const modeDepart = document.getElementById('modeleModeDepart')?.value;
    const pepMin = document.getElementById('modelePepiniereMin')?.value ? parseInt(document.getElementById('modelePepiniereMin').value, 10) : null;
    const pepMax = document.getElementById('modelePepiniereMax')?.value ? parseInt(document.getElementById('modelePepiniereMax').value, 10) : null;
    const recMin = document.getElementById('modeleRecolteMin')?.value ? parseInt(document.getElementById('modeleRecolteMin').value, 10) : null;
    const recMax = document.getElementById('modeleRecolteMax')?.value ? parseInt(document.getElementById('modeleRecolteMax').value, 10) : null;
    const conseil = document.getElementById('modeleConseilCourt')?.value?.trim() || null;
    const source = document.getElementById('modeleSource')?.value?.trim();
    const actif = document.getElementById('modeleActif')?.value === 'true';

    if (!nom) {
      alert('Veuillez spécifier le nom de la culture.');
      return;
    }
    if (!source) {
      alert('Veuillez indiquer la source officielle.');
      return;
    }

    const payload = {
      nom_culture: nom,
      variete: variete,
      categorie: categorie,
      mode_depart: modeDepart,
      pepiniere_jours_min: modeDepart === 'pepiniere' ? pepMin : null,
      pepiniere_jours_max: modeDepart === 'pepiniere' ? pepMax : null,
      recolte_jours_min: recMin,
      recolte_jours_max: recMax,
      conseil_court: conseil,
      source: source,
      actif: actif
    };

    try {
      if (id) {
        const { error } = await supabaseClient.from('modeles_cultures').update(payload).eq('id', id);
        if (error) throw error;
        showToast('Modèle modifié', `Le modèle « ${nom} » a été mis à jour.`);
      } else {
        const { error } = await supabaseClient.from('modeles_cultures').insert(payload);
        if (error) throw error;
        showToast('Modèle créé', `Le modèle « ${nom} » a été ajouté avec succès.`);
      }

      modalManageModele.classList.add('hidden');
      await fetchModelesCultures();
      renderAdminModeles();
    } catch (err) {
      console.error('Erreur handleSaveModele :', err);
      showToast('Erreur', err.message || 'Impossible d\'enregistrer le modèle.');
    }
  }

  function getMobileAdminModelesHtml() {
    const all = cachedModelesCultures || [];
    const actifs = all.filter(m => m.actif);
    const inactifs = all.filter(m => !m.actif);

    let list = all;
    if (activeAdminModelesTab === 'actif') list = actifs;
    else if (activeAdminModelesTab === 'inactif') list = inactifs;

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;">️ Administration</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">Gérer les modèles de cultures</p>
          </div>
          <button type="button" class="btn-primary" id="btnMobileOpenAddModele" style="padding: 8px 12px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer;">+ Ajouter</button>
        </div>
      </div>

      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; scrollbar-width: none;">
        <button type="button" class="mobile-admin-modele-tab" data-status="all" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${activeAdminModelesTab === 'all' ? '#EAF4E6' : '#FFF'}; color: ${activeAdminModelesTab === 'all' ? '#1E5E2A' : '#425247'}; cursor: pointer; white-space: nowrap;
        ">Tous (${all.length})</button>
        <button type="button" class="mobile-admin-modele-tab" data-status="actif" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${activeAdminModelesTab === 'actif' ? '#EAF4E6' : '#FFF'}; color: ${activeAdminModelesTab === 'actif' ? '#1E5E2A' : '#425247'}; cursor: pointer; white-space: nowrap;
        ">Actifs (${actifs.length})</button>
        <button type="button" class="mobile-admin-modele-tab" data-status="inactif" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${activeAdminModelesTab === 'inactif' ? '#EAF4E6' : '#FFF'}; color: ${activeAdminModelesTab === 'inactif' ? '#1E5E2A' : '#425247'}; cursor: pointer; white-space: nowrap;
        ">Désactivés (${inactifs.length})</button>
      </div>

      <div class="mobile-cards-list">
        ${list.map(m => `
          <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; margin-bottom: 10px; border-left: 4px solid ${m.actif ? '#1E5E2A' : '#A0AEC0'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: #1E5E2A; background: #EAF4E6; padding: 2px 6px; border-radius: 4px;">${m.categorie || 'Culture'}</span>
                <span style="font-size: 11px; font-weight: 600; color: #5D6C63; margin-left: 4px;">${m.mode_depart === 'pepiniere' ? ' Pépinière' : ' Semis direct'}</span>
              </div>
              <span style="font-size: 10.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px; ${m.actif ? 'background: #DEF7EC; color: #03543F;' : 'background: #F3F4F6; color: #6B7280;'}">
                ${m.actif ? 'Actif' : 'Désactivé'}
              </span>
            </div>
            <h4 style="font-size: 14.5px; font-weight: 800; color: #1E2822; margin: 4px 0 6px;">
               ${m.nom_culture} ${m.variete ? `(${m.variete})` : ''}
            </h4>
            <div style="font-size: 12px; color: #4F6456; line-height: 1.4; margin-bottom: 6px;">
              ${m.mode_depart === 'pepiniere' ? `Pépinière : ${m.pepiniere_jours_min || 0} à ${m.pepiniere_jours_max || 0}j • ` : ''}
              Récolte : ${m.recolte_jours_min ? `${m.recolte_jours_min} à ${m.recolte_jours_max}j` : '<span style="color:#C65D07;font-weight:700;">Inconnue (agent de zone)</span>'}
            </div>
            ${m.conseil_court ? `<div style="font-size: 11.5px; background: #F8FAF7; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px; color: #2D3A31;"> ${m.conseil_court}</div>` : ''}
            <div style="display: flex; justify-content: flex-end; gap: 6px; border-top: 1px solid #F0F4EF; padding-top: 8px;">
              <button type="button" onclick="openManageModeleModal('${m.id}')" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 6px; border: 1px solid #CBD5E1; background: #FFF; cursor: pointer;">Modifier</button>
              <button type="button" onclick="toggleModeleActive('${m.id}')" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 6px; border: 1px solid #CBD5E1; background: #FFF; cursor: pointer; ${m.actif ? 'color: #D97706;' : 'color: #1E5E2A;'}">${m.actif ? 'Désactiver' : 'Activer'}</button>
            </div>
          </div>
        `).join('')}
      </div>

      ${cachedDeclaredCrops && cachedDeclaredCrops.length > 0 ? `
        <div style="margin-top: 16px; background: #FFFFFF; border: 1px solid #E1EBE2; border-radius: 12px; padding: 14px 16px;">
          <h3 style="font-size: 14px; font-weight: 800; color: #1E2822; margin: 0 0 4px; display: flex; align-items: center; justify-content: space-between;">
            <span> Cultures déclarées par les producteurs</span>
            <span class="nav-pill-count" style="background: #EAF4E6; color: #1E5E2A;">${cachedDeclaredCrops.length}</span>
          </h3>
          <p style="font-size: 11.5px; color: #5D6C63; margin: 0 0 10px;">Cultures saisies librement sans modèle.</p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${cachedDeclaredCrops.map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: #F9FBFA; border: 1px solid #E1EBE2; border-radius: 8px; padding: 8px 12px;">
                <div>
                  <strong style="display: block; font-size: 13px; color: #1E2822;"> ${escapeHtml(item.name)}</strong>
                  <span style="font-size: 11px; color: #5D6C63;"> ${item.count} producteur${item.count > 1 ? 's' : ''}</span>
                </div>
                <button type="button" class="btn-table-action" onclick="openAddModeleWithName('${escapeHtml(item.name.replace(/'/g, "\\'"))}')" style="font-size: 11px; padding: 4px 8px; cursor: pointer; color: #1E5E2A; font-weight: 700; border-color: #B8D8B2;">
                   Créer
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  function getMobileParcellesHtml() {
    const profileData = PROFILES_DATA[currentProfileKey] || {};
    const cycles = profileData.realCycles || [];
    const parcels = cachedUserParcels || [];

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Parcelles & Bilan</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">${parcels.length} parcelle${parcels.length > 1 ? 's' : ''} • ${cycles.length} culture${cycles.length > 1 ? 's' : ''}</p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn-primary" onclick="openAddParcelModal()" style="padding: 6px 10px; font-size: 11.5px; font-weight: 700; border-radius: 8px; cursor: pointer;">+ Parcelle</button>
            <button type="button" class="btn-primary" id="btnMobileOpenAddCrop" style="padding: 6px 10px; font-size: 11.5px; font-weight: 700; border-radius: 8px; cursor: pointer;">+ Culture</button>
          </div>
        </div>
      </div>

      <!-- Parcelles & Bilan -->
      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #1E2822; margin: 0 0 8px;"> Vos Parcelles</h3>
        ${parcels.length === 0 ? `
          <div style="text-align: center; padding: 20px 14px; background: #fff; border-radius: 10px; border: 1px dashed #CBD5E1; margin-bottom: 12px;">
            <p style="font-size: 12px; color: #5D6C63; margin: 0 0 10px;">Vous n'avez pas encore de parcelle enregistrée.</p>
            <button type="button" class="btn-primary" onclick="openAddParcelModal()" style="padding: 6px 12px; font-size: 12px;">+ Ajouter ma première parcelle</button>
          </div>
        ` : parcels.map(p => {
          const region = (cachedRegions || []).find(r => r.id === p.region_id);
          const regionName = region ? `${region.nom} (${region.chef_lieu})` : 'Région non définie';
          const activeCropCount = cycles.filter(c => c.parcel_id === p.id).length;

          return `
            <div class="parcel-card" style="margin-bottom: 12px;">
              <div class="parcel-card-header">
                <div>
                  <h4 class="parcel-card-name"> ${escapeHtml(p.name)}</h4>
                  <span class="parcel-card-badge">${escapeHtml(p.area_ha)} ha</span>
                </div>
              </div>
              <div class="parcel-card-meta">
                <div><span>Région :</span> <strong>${escapeHtml(regionName)}</strong></div>
                ${p.location ? `<div><span>Village/Quartier :</span> ${escapeHtml(p.location)}</div>` : ''}
                <div><span>Irrigation :</span> ${escapeHtml(p.irrigation_type || 'Goutte-à-goutte')}</div>
                <div><span>Cultures actives :</span> ${activeCropCount} culture${activeCropCount > 1 ? 's' : ''}</div>
              </div>
              ${renderParcelBalanceHtml(p)}
              <div class="parcel-card-actions">
                <button type="button" class="btn-edit-parcel" onclick="openAddParcelModal('${p.id}')">
                  ️ Modifier
                </button>
                <button type="button" class="btn-delete-parcel" onclick="deleteParcel('${p.id}')">
                  ️ Supprimer
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Cultures -->
      <h3 style="font-size: 14px; font-weight: 800; color: #1E2822; margin: 0 0 8px;"> Vos Cultures en cours</h3>
      <div class="mobile-cards-list">
        ${cycles.length === 0 ? `
          <div style="text-align: center; padding: 24px 16px; background: #fff; border-radius: 12px; border: 1px dashed #CBD5E1;">
            <div style="font-size: 24px; margin-bottom: 4px;"></div>
            <strong style="font-size: 13.5px; color: #1E2822; display: block; margin-bottom: 4px;">Aucune culture en cours</strong>
            <p style="font-size: 11.5px; color: #5D6C63; margin: 0 0 10px;">Ajoutez votre première culture avec les modèles agronomiques.</p>
            <button type="button" class="btn-primary" id="btnMobileEmptyAddCrop" style="margin: 0 auto; padding: 7px 14px; font-size: 12px;">+ Ajouter une culture</button>
          </div>
        ` : cycles.map(c => `
          <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; margin-bottom: 10px; border-left: 4px solid #1E5E2A;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #1E5E2A; background: #EAF4E6; padding: 2px 6px; border-radius: 4px;">${c.category || 'Culture'}</span>
              <span style="font-size: 11px; font-weight: 600; color: #5D6C63;">${c.parcels?.name || 'Parcelle'}</span>
            </div>
            <h4 style="font-size: 15px; font-weight: 800; color: #1E2822; margin: 0 0 6px;"> ${c.crop_name}</h4>
            <div style="font-size: 12px; color: #4F6456; margin-bottom: 8px;">
              Semis : <strong>${c.planting_date ? formatDateEnToutesLettres(new Date(c.planting_date)) : '-'}</strong><br>
              Récolte prévue : <strong style="color: #1E5E2A;">${c.estimated_harvest_date ? formatDateEnToutesLettres(new Date(c.estimated_harvest_date)) : 'Non définie'}</strong>
            </div>
            <div style="display: flex; justify-content: flex-end;">
              <button type="button" onclick="deleteCropCycle('${c.id}')" style="padding: 4px 8px; font-size: 11px; color: #C62828; border: 1px solid #F8B4B0; background: #FFF; border-radius: 6px; cursor: pointer;">️ Retirer</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function getMobileSyntheseHtml() {
    const parcels = cachedUserParcels || [];
    const cycles = cachedCropCycles || [];
    const tasks = cachedCycleTasks || [];

    const totalHa = parcels.reduce((sum, p) => sum + (parseFloat(p.area_ha) || 0), 0);
    const activeCycles = cycles.filter(c => c.status !== 'Terminé' && c.status !== 'Récolté');
    const campaignMargin = (currentRevenueTotal || 0) - (currentExpenseTotal || 0);

    let bestCrop = null;
    let maxGain = 0;
    cycles.forEach(c => {
      const exp = (cachedExpenses || []).filter(e => e.crop_cycle_id === c.id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const rev = (cachedRevenues || []).filter(r => r.crop_cycle_id === c.id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
      const gain = rev - exp;
      if (gain > maxGain) {
        maxGain = gain;
        bestCrop = c;
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 30);

    const deadlines = [];
    tasks.filter(t => t.statut !== 'fait' && t.date_prevue).forEach(t => {
      const d = new Date(t.date_prevue);
      if (d >= today && d <= horizon) {
        const cycleObj = cycles.find(c => String(c.id) === String(t.crop_cycle_id));
        deadlines.push({
          date: d,
          icon: '',
          title: t.titre,
          sub: cycleObj ? `${cycleObj.crop_name} (${cycleObj.parcels?.name || 'Parcelle'})` : 'Travail agricole',
          badge: 'Tâche'
        });
      }
    });

    activeCycles.filter(c => c.repiquage_date).forEach(c => {
      const d = new Date(c.repiquage_date);
      if (d >= today && d <= horizon) {
        deadlines.push({
          date: d,
          icon: '',
          title: `Repiquage de ${c.crop_name}`,
          sub: `Parcelle : ${c.parcels?.name || 'Parcelle'}`,
          badge: 'Repiquage'
        });
      }
    });

    activeCycles.filter(c => c.harvest_date_min || c.estimated_harvest_date).forEach(c => {
      const dateHarvestStr = c.harvest_date_min || c.estimated_harvest_date;
      const d = new Date(dateHarvestStr);
      if (d >= today && d <= horizon) {
        deadlines.push({
          date: d,
          icon: '',
          title: `Récolte de ${c.crop_name}`,
          sub: `Parcelle : ${c.parcels?.name || 'Parcelle'}`,
          badge: 'Récolte'
        });
      }
    });

    deadlines.sort((a, b) => a.date - b.date);

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Synthèse de l'Exploitation</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">Vue consolidée parcelles & rentabilité</p>
          </div>
          <a href="#finances" class="btn-secondary" style="font-size: 11px; padding: 6px 10px; font-weight: 700; text-decoration: none; border-radius: 8px;"> Finances →</a>
        </div>
      </div>

      <!-- Grille 4 indicateurs mobile -->
      <div class="mobile-stat-grid" style="margin-bottom: 16px;">
        <div class="mobile-stat-card">
          <span class="mobile-stat-title">SURFACE CULTIVÉE</span>
          <div class="mobile-stat-val">${totalHa.toFixed(1)} <small style="font-size: 10px;">ha</small></div>
          <span class="mobile-stat-trend text-green">${parcels.length} parcelle${parcels.length > 1 ? 's' : ''}</span>
        </div>
        <div class="mobile-stat-card">
          <span class="mobile-stat-title">CYCLES ACTIFS</span>
          <div class="mobile-stat-val">${activeCycles.length}</div>
          <span class="mobile-stat-trend text-green">En production</span>
        </div>
        <div class="mobile-stat-card">
          <span class="mobile-stat-title">MARGE CAMPAGNE</span>
          <div class="mobile-stat-val" style="font-size: 15px; color: ${campaignMargin >= 0 ? '#1E5E2A' : '#C53030'};">${campaignMargin >= 0 ? '+' : ''}${formatFrancsCFA(campaignMargin)}</div>
          <span class="mobile-stat-trend ${campaignMargin >= 0 ? 'text-green' : 'text-red'}">Recettes − Dépenses</span>
        </div>
        <div class="mobile-stat-card">
          <span class="mobile-stat-title">TOP RENTABILITÉ</span>
          <div class="mobile-stat-val" style="font-size: 13.5px;">${bestCrop ? escapeHtml(bestCrop.crop_name) : '--'}</div>
          <span class="mobile-stat-trend text-green">${maxGain > 0 ? '+' + formatFrancsCFA(maxGain) : 'Aucun gain'}</span>
        </div>
      </div>

      <!-- Prochaines Échéances (30j) -->
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="font-size: 14px; font-weight: 800; color: #1E2822; margin: 0;"> Échéances sous 30 jours</h3>
          <span class="nav-pill-count">${deadlines.length}</span>
        </div>
        ${deadlines.length === 0 ? `
          <div style="text-align: center; padding: 20px 14px; background: #FFF; border-radius: 12px; border: 1px dashed #CBD5E1;">
            <p style="font-size: 12px; color: #5D6C63; margin: 0;">Aucune échéance prévue dans les 30 prochains jours.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${deadlines.map(d => {
              const diffDays = Math.round((d.date - today) / (1000 * 60 * 60 * 24));
              let countdownText = '';
              if (diffDays === 0) countdownText = "Aujourd'hui";
              else if (diffDays === 1) countdownText = "Demain";
              else countdownText = `Dans ${diffDays} jours`;

              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #FFF; border: 1px solid #E2E8F0; border-radius: 10px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">${d.icon}</span>
                    <div>
                      <strong style="font-size: 12.5px; display: block; color: #1E2822;">${escapeHtml(d.title)}</strong>
                      <span style="font-size: 11px; color: #5D6C63;">${escapeHtml(d.sub)}</span>
                    </div>
                  </div>
                  <span style="font-size: 10.5px; font-weight: 700; color: #1E5E2A; background: #EAF4E6; padding: 3px 8px; border-radius: 99px; white-space: nowrap;">${countdownText}</span>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  function getMobileCyclesHtml() {
    const cycles = cachedCropCycles || [];
    const statusFilter = cyclesActiveStatusFilter || 'all';

    const itemsWithStatus = cycles.map(c => ({
      cycle: c,
      statusInfo: calculateCycleStatus(c)
    }));

    const filtered = itemsWithStatus.filter(item => {
      if (statusFilter === 'all') return true;
      return item.statusInfo.key === statusFilter;
    });

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Cycles Culturaux</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">${cycles.length} cycle${cycles.length > 1 ? 's' : ''} au total</p>
          </div>
          <button type="button" class="btn-primary" onclick="openAddCropCycleModal()" style="padding: 6px 10px; font-size: 11.5px; font-weight: 700; border-radius: 8px; cursor: pointer;">+ Démarrer</button>
        </div>
      </div>

      <!-- Filtres horizontaux mobiles -->
      <div class="filter-types-scroll" style="margin-bottom: 12px; overflow-x: auto; white-space: nowrap; padding-bottom: 4px;">
        <button type="button" class="mobile-cycle-filter-chip ${statusFilter === 'all' ? 'active' : ''}" data-status="all" style="padding: 5px 10px; font-size: 11px; border-radius: 99px; margin-right: 6px; cursor: pointer;">Tous</button>
        <button type="button" class="mobile-cycle-filter-chip ${statusFilter === 'pepiniere' ? 'active' : ''}" data-status="pepiniere" style="padding: 5px 10px; font-size: 11px; border-radius: 99px; margin-right: 6px; cursor: pointer;"> Pépinière</button>
        <button type="button" class="mobile-cycle-filter-chip ${statusFilter === 'croissance' ? 'active' : ''}" data-status="croissance" style="padding: 5px 10px; font-size: 11px; border-radius: 99px; margin-right: 6px; cursor: pointer;"> Croissance</button>
        <button type="button" class="mobile-cycle-filter-chip ${statusFilter === 'recolte_proche' ? 'active' : ''}" data-status="recolte_proche" style="padding: 5px 10px; font-size: 11px; border-radius: 99px; margin-right: 6px; cursor: pointer;">⏳ Récolte proche</button>
        <button type="button" class="mobile-cycle-filter-chip ${statusFilter === 'recolte' ? 'active' : ''}" data-status="recolte" style="padding: 5px 10px; font-size: 11px; border-radius: 99px; margin-right: 6px; cursor: pointer;"> À récolter</button>
        <button type="button" class="mobile-cycle-filter-chip ${statusFilter === 'termine' ? 'active' : ''}" data-status="termine" style="padding: 5px 10px; font-size: 11px; border-radius: 99px; margin-right: 6px; cursor: pointer;"> Terminés</button>
      </div>

      <!-- Liste des cartes de cycles -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        ${filtered.length === 0 ? `
          <div style="text-align: center; padding: 24px 16px; background: #fff; border-radius: 12px; border: 1px dashed #CBD5E1;">
            <div style="font-size: 26px; margin-bottom: 4px;"></div>
            <strong style="font-size: 13.5px; color: #1E2822; display: block; margin-bottom: 4px;">Aucun cycle dans cette catégorie</strong>
            <p style="font-size: 11.5px; color: #5D6C63; margin: 0 0 10px;">Lancez une nouvelle culture avec un modèle agronomique.</p>
            <button type="button" class="btn-primary" onclick="openAddCropCycleModal()" style="margin: 0 auto; padding: 7px 14px; font-size: 12px;">+ Démarrer un cycle</button>
          </div>
        ` : filtered.map(item => {
          const c = item.cycle;
          const s = item.statusInfo;
          const exp = (cachedExpenses || []).filter(e => e.crop_cycle_id === c.id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          const rev = (cachedRevenues || []).filter(r => r.crop_cycle_id === c.id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
          const gain = rev - exp;

          return `
            <div style="background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 14px; border-left: 4px solid #1E5E2A;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <div>
                  <h4 style="font-size: 15px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> ${escapeHtml(c.crop_name)}</h4>
                  <span style="font-size: 11px; color: #5D6C63;"> ${escapeHtml(c.parcels?.name || 'Parcelle')} ${c.variete ? '• ' + escapeHtml(c.variete) : ''}</span>
                </div>
                <span class="badge-state ${s.badgeClass}" style="font-size: 10px;">${s.label}</span>
              </div>

              <!-- Dates clés -->
              <div style="font-size: 11.5px; color: #4F6456; background: #F8FAF7; padding: 8px 10px; border-radius: 8px; margin: 8px 0;">
                <div>Semis : <strong>${c.planting_date ? formatDateEnToutesLettres(new Date(c.planting_date)) : '-'}</strong></div>
                ${c.repiquage_date ? `<div>Repiquage : <strong>${formatDateEnToutesLettres(new Date(c.repiquage_date))}</strong></div>` : ''}
                <div>Récolte : <strong style="color: #1E5E2A;">${c.harvest_date_min ? formatDateEnToutesLettres(new Date(c.harvest_date_min)) : (c.estimated_harvest_date ? formatDateEnToutesLettres(new Date(c.estimated_harvest_date)) : 'Non définie')}</strong></div>
              </div>

              <!-- Marge du cycle -->
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; border-top: 1px solid #EEE; padding-top: 8px;">
                <span style="color: #5D6C63;">Marge nette :</span>
                <strong style="font-family: inherit; font-weight: 800; color: ${gain >= 0 ? '#1E5E2A' : '#C53030'};">${gain >= 0 ? '+' : ''}${formatFrancsCFA(gain)}</strong>
              </div>

              <!-- Plan de suivi agronomique du cycle -->
              ${renderCycleTasksHtml(c.id)}

              <!-- Actions du cycle -->
              <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px;">
                <button type="button" onclick="openAddCycleTaskModal('${c.id}')" style="padding: 4px 8px; font-size: 11px; background: #EAF4E6; color: #1E5E2A; border: 1px solid #C4DFC0; border-radius: 6px; font-weight: 700; cursor: pointer;"> + Tâche</button>
                <button type="button" onclick="deleteCropCycle('${c.id}')" style="padding: 4px 8px; font-size: 11px; color: #C62828; border: 1px solid #F8B4B0; background: #FFF; border-radius: 6px; cursor: pointer;">️ Supprimer</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function getMobileFinancesHtml() {
    const curExp = currentMonthExpenseTotal || 0;
    const curRev = currentMonthRevenueTotal || 0;
    const totalExp = currentExpenseTotal || 0;
    const totalRev = currentRevenueTotal || 0;
    const campaignMargin = totalRev - totalExp;
    const cycles = cachedCropCycles || [];

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Finances & Marges</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">Trésorerie & Rentabilité réelle</p>
          </div>
          <button type="button" class="btn-secondary" onclick="openCompteExploitationModal()" style="font-size: 11px; padding: 6px 10px; font-weight: 800; border-color: #C8862A; color: #8A4F00; border-radius: 8px;"> Bilan PDF</button>
        </div>
      </div>

      <!-- 3 cartes financières mobile -->
      <div class="mobile-stat-grid" style="margin-bottom: 14px;">
        <div class="mobile-stat-card">
          <span class="mobile-stat-title">DÉPENSES DU MOIS</span>
          <div class="mobile-stat-val" style="font-size: 15px; color: #C53030;">${formatFrancsCFA(curExp)}</div>
          <span class="mobile-stat-trend text-red">Charges réelles</span>
        </div>
        <div class="mobile-stat-card">
          <span class="mobile-stat-title">RECETTES DU MOIS</span>
          <div class="mobile-stat-val" style="font-size: 15px; color: #1E5E2A;">${formatFrancsCFA(curRev)}</div>
          <span class="mobile-stat-trend text-green">Ventes récoltes</span>
        </div>
        <div class="mobile-stat-card" style="grid-column: 1 / -1;">
          <span class="mobile-stat-title">MARGE NETTE DE CAMPAGNE (RECETTES − DÉPENSES)</span>
          <div class="mobile-stat-val" style="font-size: 18px; color: ${campaignMargin >= 0 ? '#1E5E2A' : '#C53030'};">${campaignMargin >= 0 ? '+' : ''}${formatFrancsCFA(campaignMargin)}</div>
          <span class="mobile-stat-trend ${campaignMargin >= 0 ? 'text-green' : 'text-red'}">${campaignMargin >= 0 ? 'Bénéfice net consolidé' : 'Déficit d\'exploitation'}</span>
        </div>
      </div>

      <!-- Actions rapides mobile -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button type="button" class="btn-primary" id="btnMobFinAddExpense" onclick="openExpenseModal()" style="flex: 1; padding: 9px; font-size: 12px; font-weight: 700;"> + Dépense</button>
        <button type="button" class="btn-revenue-action" id="btnMobFinAddRevenue" onclick="openRevenueModal()" style="flex: 1; padding: 9px; font-size: 12px; font-weight: 700;"> + Vente récolte</button>
      </div>

      <!-- Détail de rentabilité par culture -->
      <h3 style="font-size: 14px; font-weight: 800; color: #1E2822; margin: 0 0 8px;"> Rentabilité par Culture</h3>
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        ${cycles.length === 0 ? `
          <div style="text-align: center; padding: 20px; background: #FFF; border-radius: 12px; border: 1px dashed #CBD5E1;">
            <p style="font-size: 12px; color: #5D6C63; margin: 0;">Aucune culture enregistrée pour le calcul de rentabilité.</p>
          </div>
        ` : cycles.map(c => {
          const exp = (cachedExpenses || []).filter(e => e.crop_cycle_id === c.id).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          const rev = (cachedRevenues || []).filter(r => r.crop_cycle_id === c.id).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
          const gain = rev - exp;
          const secondaryInfo = getCycleSecondaryInfo(c);

          return `
            <div style="background: #FFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="font-size: 13.5px; color: #1E2822;"> ${escapeHtml(c.crop_name)}</strong>
                ${secondaryInfo ? `<span style="font-size: 11px; color: #5D6C63;">${escapeHtml(secondaryInfo)}</span>` : ''}
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #5D6C63; margin-bottom: 4px;">
                <span>Dépenses : <strong style="color: #C53030;">${formatFrancsCFA(exp)}</strong></span>
                <span>Ventes : <strong style="color: #1E5E2A;">${formatFrancsCFA(rev)}</strong></span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #EEE; padding-top: 6px; margin-top: 4px;">
                <span style="font-size: 11px; font-weight: 700; color: #1E2822;">Gain net :</span>
                <strong style="font-size: 13px; font-family: inherit; font-weight: 800; color: ${gain >= 0 ? '#1E5E2A' : '#C53030'};">${gain >= 0 ? '+' : ''}${formatFrancsCFA(gain)}</strong>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Historique des Dépenses & Ventes Mobile -->
      <div style="background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; padding: 14px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="font-size: 14px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Historique des Opérations</h3>
            <p style="font-size: 11px; color: #7C8781; margin: 0;">Modifier ou supprimer une charge ou vente</p>
          </div>
          <div class="finances-filter-pills" style="display: flex; gap: 4px;">
            <button type="button" class="fin-tab-filter ${currentTransFilter === 'all' ? 'active' : ''}" data-filter="all" id="mobFilterTransAll" style="padding: 4px 8px; font-size: 11px;">Toutes</button>
            <button type="button" class="fin-tab-filter ${currentTransFilter === 'expenses' ? 'active' : ''}" data-filter="expenses" id="mobFilterTransExp" style="padding: 4px 8px; font-size: 11px;"> Dépenses</button>
            <button type="button" class="fin-tab-filter ${currentTransFilter === 'revenues' ? 'active' : ''}" data-filter="revenues" id="mobFilterTransRev" style="padding: 4px 8px; font-size: 11px;"> Ventes</button>
          </div>
        </div>
        <div id="mobileFinancesTransactionsList" class="finances-transactions-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
        <div id="mobileFinancesTransactionsEmpty" class="hidden" style="text-align: center; padding: 16px; color: #7C8781; font-size: 12px;">
          Aucune opération enregistrée pour le moment.
        </div>
      </div>
    `;
  }

  // Écouteurs Gestion des Parcelles
  const btnOpenAddParcelPage = document.getElementById('btnOpenAddParcelPage');
  if (btnOpenAddParcelPage) {
    btnOpenAddParcelPage.addEventListener('click', () => openAddParcelModal());
  }

  const btnQuickAddParcelSection = document.getElementById('btnQuickAddParcelSection');
  if (btnQuickAddParcelSection) {
    btnQuickAddParcelSection.addEventListener('click', () => openAddParcelModal());
  }

  const btnEmptyNoticeAddParcel = document.getElementById('btnEmptyNoticeAddParcel');
  if (btnEmptyNoticeAddParcel) {
    btnEmptyNoticeAddParcel.addEventListener('click', () => openAddParcelModal());
  }

  const btnOpenAddParcelFromCropModal = document.getElementById('btnOpenAddParcelFromCropModal');
  if (btnOpenAddParcelFromCropModal) {
    btnOpenAddParcelFromCropModal.addEventListener('click', () => {
      modalAddCropCycle.classList.add('hidden');
      openAddParcelModal();
    });
  }

  const btnCloseAddParcel = document.getElementById('btnCloseAddParcel');
  if (btnCloseAddParcel) {
    btnCloseAddParcel.addEventListener('click', closeAddParcelModal);
  }

  const btnCancelAddParcel = document.getElementById('btnCancelAddParcel');
  if (btnCancelAddParcel) {
    btnCancelAddParcel.addEventListener('click', closeAddParcelModal);
  }

  if (formAddParcel) {
    formAddParcel.addEventListener('submit', handleSaveParcel);
  }

  if (modalAddParcel) {
    modalAddParcel.addEventListener('click', (e) => {
      if (e.target === modalAddParcel) closeAddParcelModal();
    });
  }

  // Écouteurs Modèles de Cultures & Parcelles
  const btnOpenAddCropCyclePage = document.getElementById('btnOpenAddCropCyclePage');
  if (btnOpenAddCropCyclePage) {
    btnOpenAddCropCyclePage.addEventListener('click', () => openAddCropCycleModal());
  }

  const btnEmptyStateAddCrop = document.getElementById('btnEmptyStateAddCrop');
  if (btnEmptyStateAddCrop) {
    btnEmptyStateAddCrop.addEventListener('click', () => openAddCropCycleModal());
  }

  const btnDashAddCropCycle = document.getElementById('btnDashAddCropCycle');
  if (btnDashAddCropCycle) {
    btnDashAddCropCycle.addEventListener('click', () => openAddCropCycleModal());
  }

  const btnEmptyStateAddCropCycle = document.getElementById('btnEmptyStateAddCropCycle');
  if (btnEmptyStateAddCropCycle) {
    btnEmptyStateAddCropCycle.addEventListener('click', () => openAddCropCycleModal());
  }

  const btnCloseAddCropCycle = document.getElementById('btnCloseAddCropCycle');
  if (btnCloseAddCropCycle) {
    btnCloseAddCropCycle.addEventListener('click', () => {
      modalAddCropCycle.classList.add('hidden');
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });
  }

  const btnCancelAddCropCycle = document.getElementById('btnCancelAddCropCycle');
  if (btnCancelAddCropCycle) {
    btnCancelAddCropCycle.addEventListener('click', () => {
      modalAddCropCycle.classList.add('hidden');
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });
  }

  const cropCycleModeleSelect = document.getElementById('cropCycleModeleSelect');
  if (cropCycleModeleSelect) {
    cropCycleModeleSelect.addEventListener('change', (e) => {
      const modelId = e.target.value;
      if (!modelId) {
        document.getElementById('cropCycleForecastBox')?.classList.add('hidden');
        const dateLabel = document.getElementById('cropCyclePlantingDateLabel');
        if (dateLabel) dateLabel.textContent = 'Date de semis';
        return;
      }
      if (modelId === 'autre_culture') {
        const nameInput = document.getElementById('cropCycleName');
        const harvestInput = document.getElementById('cropCycleHarvestDate');
        const forecastBox = document.getElementById('cropCycleForecastBox');
        const repiqRow = document.getElementById('cropForecastRepiquageRow');
        const harvestText = document.getElementById('cropForecastHarvestText');
        const adviceBox = document.getElementById('cropForecastAdviceBox');
        const sourceBox = document.getElementById('cropForecastSourceBox');
        const dateLabel = document.getElementById('cropCyclePlantingDateLabel');

        if (dateLabel) dateLabel.textContent = 'Date de semis';
        if (repiqRow) repiqRow.classList.add('hidden');
        if (adviceBox) adviceBox.classList.add('hidden');
        if (sourceBox) sourceBox.classList.add('hidden');
        if (harvestInput) harvestInput.value = '';
        if (nameInput) {
          nameInput.value = '';
          nameInput.placeholder = 'Tapez le nom de votre culture...';
          nameInput.focus();
        }
        if (harvestText) {
          harvestText.innerHTML = `<span class="forecast-warning-tag" style="display: block; color: #8D5B15; background: #FFF8E1; padding: 8px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; line-height: 1.45;">Nous ne connaissons pas encore la durée de cette culture. Indiquez vous-même la date de récolte prévue.</span>`;
        }
        if (forecastBox) forecastBox.classList.remove('hidden');
        return;
      }
      const model = cachedModelesCultures.find(m => String(m.id) === String(modelId));
      if (model) {
        applySelectedModelToForm(model);
      }
    });
  }

  const cropCyclePlantingDate = document.getElementById('cropCyclePlantingDate');
  if (cropCyclePlantingDate) {
    cropCyclePlantingDate.addEventListener('input', () => {
      const modelId = document.getElementById('cropCycleModeleSelect')?.value;
      if (modelId && modelId !== 'autre_culture') {
        const model = cachedModelesCultures.find(m => String(m.id) === String(modelId));
        if (model) updateCropCycleCalculations(model);
      }
    });
  }

  const btnListenCropForecast = document.getElementById('btnListenCropForecast');
  if (btnListenCropForecast) {
    btnListenCropForecast.addEventListener('click', handleListenCropForecast);
  }

  if (formAddCropCycle) {
    formAddCropCycle.addEventListener('submit', handleSaveCropCycle);
  }

  // Écouteurs Admin Modèles
  const btnOpenAddModeleModal = document.getElementById('btnOpenAddModeleModal');
  if (btnOpenAddModeleModal) {
    btnOpenAddModeleModal.addEventListener('click', () => openManageModeleModal());
  }

  const btnCloseManageModele = document.getElementById('btnCloseManageModele');
  if (btnCloseManageModele) {
    btnCloseManageModele.addEventListener('click', () => modalManageModele.classList.add('hidden'));
  }

  const btnCancelManageModele = document.getElementById('btnCancelManageModele');
  if (btnCancelManageModele) {
    btnCancelManageModele.addEventListener('click', () => modalManageModele.classList.add('hidden'));
  }

  const modeleModeDepart = document.getElementById('modeleModeDepart');
  if (modeleModeDepart) {
    modeleModeDepart.addEventListener('change', (e) => {
      const pepRow = document.getElementById('modelePepiniereRow');
      if (pepRow) pepRow.style.display = (e.target.value === 'pepiniere') ? '' : 'none';
    });
  }

  if (formManageModele) {
    formManageModele.addEventListener('submit', handleSaveModele);
  }

  const adminModeleTabs = document.querySelectorAll('#adminModelesStatusTabsGroup .admin-status-tab');
  adminModeleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminModeleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeAdminModelesTab = tab.getAttribute('data-status') || 'all';
      renderAdminModeles();
    });
  });

  // Mobile écouteurs délégués pour parcelles et modèles
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btnMobileOpenAddCrop') || e.target.closest('#btnMobileEmptyAddCrop')) {
      openAddCropCycleModal();
    } else if (e.target.closest('#btnMobileOpenAddModele')) {
      openManageModeleModal();
    } else if (e.target.closest('.mobile-admin-modele-tab')) {
      const btn = e.target.closest('.mobile-admin-modele-tab');
      activeAdminModelesTab = btn.getAttribute('data-status') || 'all';
      renderMobileView();
    }
  });

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
  // MODALE COMPTE UTILISATEUR & GESTION DU PROFIL
  // ==========================================
  function openAuthModal() {
    if (!modalAuth) return;
    const currentData = PROFILES_DATA[currentProfileKey] || {
      name: 'Exploitant',
      metaRole: 'Maraîcher & Céréalier',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
    };

    if (modalAccountName) modalAccountName.textContent = currentData.name;
    if (modalAccountRole) modalAccountRole.textContent = currentData.metaRole;
    if (modalAccountAvatar) modalAccountAvatar.src = currentData.avatar;
    if (modalAccountEmail) {
      modalAccountEmail.textContent = currentData.phone || (currentAuthUser ? currentAuthUser.email : 'Compte connecté');
    }

    if (typeof loadUserNotifPrefs === 'function') {
      loadUserNotifPrefs();
    }

    modalAuth.classList.remove('hidden');
  }

  function closeAuthModal() {
    if (modalAuth) modalAuth.classList.add('hidden');
  }

  if (btnOpenAuth) {
    btnOpenAuth.addEventListener('click', (e) => {
      e.stopPropagation();
      openAuthModal();
    });
  }
  if (btnCloseModalAuth) {
    btnCloseModalAuth.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAuthModal();
    });
  }
  if (modalAuth) {
    modalAuth.addEventListener('click', (e) => {
      if (e.target === modalAuth) closeAuthModal();
    });
  }

  if (btnEditProfileFromModal) {
    btnEditProfileFromModal.addEventListener('click', () => {
      closeAuthModal();
      openOnboardingModal();
    });
  }

  if (btnModalLogout) {
    btnModalLogout.addEventListener('click', () => {
      closeAuthModal();
      performLogout();
    });
  }

  // ==========================================
  // MODALE ONBOARDING / COMPLÉTION DU PROFIL
  // ==========================================
  let currentAuthUser = null;

  function openOnboardingModal(userData = null) {
    if (!modalOnboarding) return;
    const currentData = userData || PROFILES_DATA[currentProfileKey] || {};

    if (onboardingFullName) {
      onboardingFullName.value = currentData.name || (currentAuthUser ? (currentAuthUser.user_metadata?.full_name || currentAuthUser.user_metadata?.name || currentAuthUser.email?.split('@')[0]) : '');
    }
    if (onboardingPhone) {
      const cleanPhone = (currentData.phone || '').replace(/^\+226\s*/, '');
      onboardingPhone.value = cleanPhone;
    }
    if (onboardingLocation) {
      if (currentData.location) {
        const pureLoc = currentData.location.replace(/^\s*/, '');
        for (let opt of onboardingLocation.options) {
          if (opt.value.includes(pureLoc) || pureLoc.includes(opt.value)) {
            onboardingLocation.value = opt.value;
            break;
          }
        }
      }
    }

    modalOnboarding.classList.remove('hidden');
  }

  function closeOnboardingModal() {
    if (modalOnboarding) modalOnboarding.classList.add('hidden');
  }

  // Cartes radio d'activité
  const onboardingRoleCards = document.querySelectorAll('.onboarding-modal-dialog .role-card-opt');
  onboardingRoleCards.forEach(card => {
    card.addEventListener('click', () => {
      onboardingRoleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Soumission Onboarding
  if (formOnboarding) {
    formOnboarding.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawFullName = onboardingFullName ? onboardingFullName.value.trim() : 'Exploitant';
      const rawPhone = onboardingPhone ? onboardingPhone.value.trim() : '';
      const rawLocation = onboardingLocation ? onboardingLocation.value : 'Koudougou (Boulkiemdé)';
      const selectedRadio = document.querySelector('input[name="onboardingRole"]:checked');
      const selectedRole = selectedRadio ? selectedRadio.value : 'producer';

      let metaRole = 'Maraîcher & Céréalier';
      let actionLabel = 'Ajouter une dépense';
      let hasExploitation = true;
      let avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80';

      if (selectedRole === 'supplier') {
        metaRole = 'Fournisseur d\'Équipements & Intrants';
        actionLabel = 'Publier une annonce';
        hasExploitation = false;
        avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80';
      } else if (selectedRole === 'buyer') {
        metaRole = 'Acheteur & Grossiste Céréalier';
        actionLabel = 'Publier une demande d\'achat';
        hasExploitation = false;
        avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80';
      }

      const submitBtn = document.getElementById('btnSubmitOnboarding');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Enregistrement du profil…</span>';
      }

      const userId = currentAuthUser ? currentAuthUser.id : ('user_' + Date.now());
      const formattedPhone = rawPhone.startsWith('+226') ? rawPhone : ('+226 ' + rawPhone.replace(/^\+226\s*/, ''));

      // Sauvegarde dans Supabase
      if (supabaseClient && currentAuthUser) {
        try {
          await supabaseClient.from('profiles').update({
            full_name: rawFullName,
            phone: formattedPhone,
            location: rawLocation,
            role: selectedRole,
            meta_role: metaRole,
            avatar_url: (currentAuthUser?.user_metadata?.avatar_url || currentAuthUser?.user_metadata?.picture) || avatar,
            is_onboarded: true,
            updated_at: new Date().toISOString()
          }).eq('id', currentAuthUser.id);
          console.log(' Profil complété avec succès dans Supabase !');
        } catch (err) {
          console.warn('️ Erreur mise à jour profil Supabase :', err);
        }
      }

      closeOnboardingModal();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Valider mon profil & Accéder</span>';
      }

      await activateUserSession({
        id: userId,
        name: rawFullName,
        phone: formattedPhone,
        location: ` ${rawLocation}`,
        role: selectedRole,
        metaRole: metaRole,
        actionLabel: actionLabel,
        hasExploitation: hasExploitation,
        avatar: (currentAuthUser?.user_metadata?.avatar_url || currentAuthUser?.user_metadata?.picture) || avatar
      });

      const firstName = rawFullName.split(' ')[0] || rawFullName;
      showToast(' Profil configuré avec succès !', `Bienvenue ${firstName} ! Votre tableau de bord est prêt.`);
    });
  }

  // ==========================================
  // FONCTION : DÉCONNEXION RÉELLE
  // ==========================================
  async function performLogout() {
    currentSessionInitializedUserId = null;
    isSessionInitializing = false;
    currentProfileKey = 'guest';
    currentAuthUser = null;
    closeAuthModal();

    const d = document.getElementById('mobileDrawer');
    const o = document.getElementById('mobileDrawerOverlay');
    if (d) d.classList.remove('open');
    if (o) o.classList.remove('open');
    document.body.classList.remove('drawer-open');
    document.body.style.overflow = '';

    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {}
    }

    try {
      localStorage.removeItem('revolution_session_user');
    } catch (e) {}

    currentExpenseTotal = 0;
    currentRevenueTotal = 0;
    currentProfileKey = null;

    // Masquer le tableau de bord et afficher le portail d'authentification
    const authPortalScreen = document.getElementById('authPortalScreen');
    const loadingScreen = document.getElementById('appLoadingScreen');
    if (loadingScreen) loadingScreen.classList.add('hidden');
    if (viewportContainer) viewportContainer.classList.add('hidden');
    if (authPortalScreen) {
      authPortalScreen.classList.remove('hidden');
      const pLogin = document.getElementById('portalLoginForm');
      const pReg = document.getElementById('portalRegisterForm');
      if (pLogin) {
        pLogin.reset();
        pLogin.classList.remove('hidden');
      }
      if (pReg) {
        pReg.reset();
        pReg.classList.add('hidden');
      }
      const tLogin = document.getElementById('btnPortalTabLogin');
      const tReg = document.getElementById('btnPortalTabRegister');
      if (tLogin) tLogin.classList.add('active');
      if (tReg) tReg.classList.remove('active');
    }

    if (btnAuthText) btnAuthText.textContent = 'Connexion';
    showToast('Session fermée', 'Déconnexion effectuée.');
  }
  window.performLogout = performLogout;

  // Déconnexion Bureau
  if (btnLogout) {
    btnLogout.addEventListener('click', performLogout);
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
          console.log(' Abonnement Mobile Money enregistré dans Supabase !');
        } catch (err) {
          console.warn('️ Erreur enregistrement abonnement Supabase :', err);
        }
      }

      setTimeout(() => {
        if (submitBtn) submitBtn.disabled = false;
        closeCheckoutModal();

        // Activer l'abonnement pour le profil courant
        userSubscriptionStatus[currentProfileKey] = true;
        renderProfile(currentProfileKey);

        showToast(
          ' Abonnement Pro activé sur Supabase !',
          `Paiement de ${currentCheckoutPlan.formattedPrice} validé par ${opName} (+226 ${phoneVal}). Statut PRO enregistré dans la base.`
        );
      }, 1000);
    });
  }

  // ==========================================
  // INITIALISATION DU SYSTÈME & PORTAIL OBLIGATOIRE
  // ==========================================

  // 1. Détection des paramètres d'URL pour le mode démo ou force mobile
  const urlParams = new URLSearchParams(window.location.search);

  // 2. Éléments du Portail d'Authentification obligatoire
  const authPortalScreen = document.getElementById('authPortalScreen');
  const btnPortalTabLogin = document.getElementById('btnPortalTabLogin');
  const btnPortalTabRegister = document.getElementById('btnPortalTabRegister');
  const portalLoginForm = document.getElementById('portalLoginForm');
  const portalRegisterForm = document.getElementById('portalRegisterForm');
  const portalLoginEmail = document.getElementById('portalLoginEmail');
  const portalLoginPass = document.getElementById('portalLoginPass');
  const portalRegEmail = document.getElementById('portalRegEmail');
  const portalRegPassword = document.getElementById('portalRegPassword');
  const linkToRegister = document.getElementById('linkToRegister');
  const linkToLogin = document.getElementById('linkToLogin');
  const btnGoogleAuth = document.getElementById('btnGoogleAuth');

  // Formulaires et boutons de récupération de mot de passe
  const portalForgotPasswordForm = document.getElementById('portalForgotPasswordForm');
  const portalResetPasswordForm = document.getElementById('portalResetPasswordForm');
  const linkForgotPassword = document.getElementById('linkForgotPassword');
  const btnBannerForgotPassword = document.getElementById('btnBannerForgotPassword');
  const btnBannerGoogleAuth = document.getElementById('btnBannerGoogleAuth');
  const linkBackFromForgot = document.getElementById('linkBackFromForgot');
  const linkBackToLoginFromReset = document.getElementById('linkBackToLoginFromReset');

  // Bascule entre Se connecter, Créer un compte, Mot de passe oublié et Nouveau mot de passe
  function switchPortalTab(tab) {
    const tabsContainer = document.querySelector('.portal-tabs');
    const dividerContainer = document.querySelector('.portal-divider');
    const googleBtn = document.getElementById('btnGoogleAuth');

    // Cacher les alertes existantes
    const loginErrorBanner = document.getElementById('portalLoginErrorBanner');
    if (loginErrorBanner) loginErrorBanner.classList.add('hidden');
    const forgotAlert = document.getElementById('forgotPasswordAlert');
    if (forgotAlert) forgotAlert.classList.add('hidden');
    const forgotSuccess = document.getElementById('forgotPasswordSuccess');
    if (forgotSuccess) forgotSuccess.classList.add('hidden');
    const resetAlert = document.getElementById('resetPasswordAlert');
    if (resetAlert) resetAlert.classList.add('hidden');
    const resetSuccess = document.getElementById('resetPasswordSuccess');
    if (resetSuccess) resetSuccess.classList.add('hidden');

    if (tab === 'login') {
      if (tabsContainer) tabsContainer.classList.remove('hidden');
      if (dividerContainer) dividerContainer.classList.remove('hidden');
      if (googleBtn) googleBtn.classList.remove('hidden');
      if (btnPortalTabLogin) btnPortalTabLogin.classList.add('active');
      if (btnPortalTabRegister) btnPortalTabRegister.classList.remove('active');
      if (portalLoginForm) portalLoginForm.classList.remove('hidden');
      if (portalRegisterForm) portalRegisterForm.classList.add('hidden');
      if (portalForgotPasswordForm) portalForgotPasswordForm.classList.add('hidden');
      if (portalResetPasswordForm) portalResetPasswordForm.classList.add('hidden');
      if (portalLoginEmail) portalLoginEmail.focus();
    } else if (tab === 'register') {
      if (tabsContainer) tabsContainer.classList.remove('hidden');
      if (dividerContainer) dividerContainer.classList.remove('hidden');
      if (googleBtn) googleBtn.classList.remove('hidden');
      if (btnPortalTabRegister) btnPortalTabRegister.classList.add('active');
      if (btnPortalTabLogin) btnPortalTabLogin.classList.remove('active');
      if (portalRegisterForm) portalRegisterForm.classList.remove('hidden');
      if (portalLoginForm) portalLoginForm.classList.add('hidden');
      if (portalForgotPasswordForm) portalForgotPasswordForm.classList.add('hidden');
      if (portalResetPasswordForm) portalResetPasswordForm.classList.add('hidden');
      if (portalRegEmail) portalRegEmail.focus();
    } else if (tab === 'forgot') {
      if (tabsContainer) tabsContainer.classList.add('hidden');
      if (dividerContainer) dividerContainer.classList.add('hidden');
      if (googleBtn) googleBtn.classList.add('hidden');
      if (portalLoginForm) portalLoginForm.classList.add('hidden');
      if (portalRegisterForm) portalRegisterForm.classList.add('hidden');
      if (portalForgotPasswordForm) portalForgotPasswordForm.classList.remove('hidden');
      if (portalResetPasswordForm) portalResetPasswordForm.classList.add('hidden');
      const forgotEmail = document.getElementById('portalForgotEmail');
      if (forgotEmail) {
        if (portalLoginEmail && portalLoginEmail.value.includes('@')) {
          forgotEmail.value = portalLoginEmail.value.trim();
        }
        forgotEmail.focus();
      }
    } else if (tab === 'reset') {
      if (tabsContainer) tabsContainer.classList.add('hidden');
      if (dividerContainer) dividerContainer.classList.add('hidden');
      if (googleBtn) googleBtn.classList.add('hidden');
      if (portalLoginForm) portalLoginForm.classList.add('hidden');
      if (portalRegisterForm) portalRegisterForm.classList.add('hidden');
      if (portalForgotPasswordForm) portalForgotPasswordForm.classList.add('hidden');
      if (portalResetPasswordForm) portalResetPasswordForm.classList.remove('hidden');
      const newPass = document.getElementById('portalNewPassword');
      if (newPass) newPass.focus();
    }
  }

  function showResetPasswordScreen() {
    isRecoveryMode = true;
    const loadingScreen = document.getElementById('appLoadingScreen');
    if (loadingScreen) loadingScreen.classList.add('hidden');
    const authPortalScreen = document.getElementById('authPortalScreen');
    if (authPortalScreen) authPortalScreen.classList.remove('hidden');
    if (viewportContainer) viewportContainer.classList.add('hidden');
    switchPortalTab('reset');
    const newPassInput = document.getElementById('portalNewPassword');
    if (newPassInput) {
      newPassInput.value = '';
      setTimeout(() => newPassInput.focus(), 150);
    }
    const confirmPassInput = document.getElementById('portalConfirmPassword');
    if (confirmPassInput) confirmPassInput.value = '';
    const resetAlert = document.getElementById('resetPasswordAlert');
    if (resetAlert) resetAlert.classList.add('hidden');
    const resetSuccess = document.getElementById('resetPasswordSuccess');
    if (resetSuccess) resetSuccess.classList.add('hidden');
  }

  // Exposition pour accès direct
  window.showResetPasswordScreen = showResetPasswordScreen;
  window.switchPortalTab = switchPortalTab;

  // Détection immédiate du mode récupération dès l'évaluation du portail
  if (urlParams.get('reset') === '1' || urlParams.get('type') === 'recovery' || 
      window.location.hash.includes('reset-password') || window.location.hash.includes('type=recovery')) {
    isRecoveryMode = true;
    showResetPasswordScreen();
  }

  if (btnPortalTabLogin) btnPortalTabLogin.addEventListener('click', () => switchPortalTab('login'));
  if (btnPortalTabRegister) btnPortalTabRegister.addEventListener('click', () => switchPortalTab('register'));
  if (linkToRegister) linkToRegister.addEventListener('click', () => switchPortalTab('register'));
  if (linkToLogin) linkToLogin.addEventListener('click', () => switchPortalTab('login'));
  if (linkForgotPassword) linkForgotPassword.addEventListener('click', () => switchPortalTab('forgot'));
  if (btnBannerForgotPassword) btnBannerForgotPassword.addEventListener('click', () => switchPortalTab('forgot'));
  if (btnBannerGoogleAuth) {
    btnBannerGoogleAuth.addEventListener('click', () => {
      if (btnGoogleAuth) btnGoogleAuth.click();
    });
  }
  if (linkBackFromForgot) linkBackFromForgot.addEventListener('click', () => switchPortalTab('login'));
  if (linkBackToLoginFromReset) {
    linkBackToLoginFromReset.addEventListener('click', () => {
      isRecoveryMode = false;
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {}
      switchPortalTab('login');
    });
  }

  // Disparition de la bannière d'erreur lors de la saisie
  if (portalLoginEmail) {
    portalLoginEmail.addEventListener('input', () => {
      const banner = document.getElementById('portalLoginErrorBanner');
      if (banner) banner.classList.add('hidden');
    });
  }
  if (portalLoginPass) {
    portalLoginPass.addEventListener('input', () => {
      const banner = document.getElementById('portalLoginErrorBanner');
      if (banner) banner.classList.add('hidden');
    });
  }

  // Détection automatique plein écran mobile vs bureau
  function autoDetectResponsiveMode() {
    const isMobileDevice = window.innerWidth < 1024;
    switchViewMode(isMobileDevice ? 'mobile' : 'desktop');
  }
  window.addEventListener('resize', autoDetectResponsiveMode);

  // Verrou d'initialisation de session utilisateur pour prévenir les exécutions multiples concurrentes
  let currentSessionInitializedUserId = null;
  let isSessionInitializing = false;

  // Fonction centrale de vérification du profil utilisateur & redirection
  async function checkUserProfileAndProceed(user, force = false) {
    if (!user || !user.id) return;

    // Garde-fou 1 : Si une initialisation est déjà en cours pour cet utilisateur, on évite le doublon
    if (isSessionInitializing && currentSessionInitializedUserId === user.id && !force) {
      console.log(' Initialisation déjà en cours pour cet utilisateur, saut du doublon.');
      return;
    }

    // Garde-fou 2 : Si l'utilisateur est déjà complètement initialisé et actif
    if (currentSessionInitializedUserId === user.id && currentProfileKey === user.id && !force) {
      console.log(' Utilisateur déjà actif et initialisé, mise à jour des métadonnées uniquement.');
      currentAuthUser = user;
      return;
    }

    isSessionInitializing = true;
    currentSessionInitializedUserId = user.id;
    currentAuthUser = user;
    let profile = null;

    try {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (data) {
            profile = data;
          }
        } catch (err) {
          console.warn('️ Erreur recherche profil Supabase :', err);
        }
      }

      // Si le profil n'existe pas ou n'est pas encore complété (is_onboarded false ou sans téléphone)
      if (!profile || !profile.is_onboarded || !profile.phone) {
        if (authPortalScreen) authPortalScreen.classList.add('hidden');
        const loadingScreen = document.getElementById('appLoadingScreen');
        if (loadingScreen) loadingScreen.classList.add('hidden');
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
        openOnboardingModal({
          id: user.id,
          name: profile?.full_name || googleName,
          phone: profile?.phone || '',
          location: profile?.location || 'Koudougou (Boulkiemdé)',
          role: profile?.role || 'producer'
        });
      } else {
        // Déjà complété -> Entrée directe dans le tableau de bord
        await activateUserSession({
          id: profile.id,
          name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          role: profile.role,
          metaRole: profile.meta_role,
          avatar: profile.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture,
          isAdmin: !!profile.is_admin,
          isPro: !!profile.is_pro
        });
      }
    } finally {
      isSessionInitializing = false;
    }
  }
  window.checkUserProfileAndProceed = checkUserProfileAndProceed;

  // Fonction centrale d'activation de session utilisateur
  async function activateUserSession(userData) {
    const pKey = userData.id || ('user_' + Date.now());
    const fullName = userData.name || userData.full_name || 'Exploitant';
    const cleanFirstName = fullName.trim().split(' ')[0] || fullName;
    const phoneOrContact = userData.phone || userData.contact || '+226 70 12 34 56';
    const loc = userData.location || ' Koudougou (Boulkiemdé)';

    // Création ou mise à jour du profil dans PROFILES_DATA
    PROFILES_DATA[pKey] = {
      id: pKey,
      name: fullName,
      metaRole: userData.metaRole || userData.meta_role || 'Maraîcher & Céréalier',
      location: loc.startsWith('') ? loc : ` ${loc}`,
      avatar: userData.avatar || userData.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      actionLabel: 'Ajouter une dépense',
      greeting: `Bonjour, ${cleanFirstName} <span class="greeting-emoji"></span>`,
      subtitle: 'Voici l\'essentiel pour votre exploitation aujourd\'hui.',
      isAdmin: !!userData.isAdmin || !!userData.is_admin,
      hasExploitation: userData.hasExploitation !== false,
      stats: [
        { module: 'Exploitation', label: 'Dépenses du mois', value: '0', unit: 'F CFA', trendText: '0 dépense', trendType: 'favorable', comp: 'Données réelles', color: 'green' },
        { module: 'Recettes', label: 'Recettes du mois', value: '0', unit: 'F CFA', trendText: '0 encaissement', trendType: 'favorable', comp: 'Données réelles', color: 'blue' },
        { module: 'Production', label: 'Cycles en cours', value: '0', unit: 'actifs', badge: 'En direct', comp: 'Parcelles connectées', color: 'yellow' },
        { module: 'Financements', label: 'Opportunités ouvertes', value: String(filterOpenFinancementsForUsers(cachedFinancements).length || 0), unit: 'disponibles', badge: '', comp: 'Financements actifs', color: 'purple' }
      ],
      chartTitle: 'Dépenses et recettes',
      chartSubtitle: 'Vos flux de trésorerie réels enregistrés sur Supabase',
      marginOct: '0 F CFA',
      deadlines: [],
      tableTitle: 'Mes cycles en cours',
      tableSubtitle: 'Suivi de vos parcelles',
      tableHeaders: ['CULTURE & VARIÉTÉ', 'PARCELLE', 'DATE SEMIS', 'RÉCOLTE ESTIMÉE', 'STATUT', 'ACTIONS'],
      tableRows: []
    };

    if (roleSelector) {
      if (!roleSelector.querySelector(`option[value="${pKey}"]`)) {
        const opt = document.createElement('option');
        opt.value = pKey;
        opt.textContent = ` ${fullName}`;
        roleSelector.appendChild(opt);
      }
      roleSelector.value = pKey;
    }

    // Persistance dans localStorage
    try {
      localStorage.setItem('revolution_session_user', JSON.stringify({
        id: pKey,
        name: fullName,
        metaRole: PROFILES_DATA[pKey].metaRole,
        location: PROFILES_DATA[pKey].location,
        avatar: PROFILES_DATA[pKey].avatar,
        actionLabel: 'Ajouter une dépense',
        isAdmin: PROFILES_DATA[pKey].isAdmin,
        hasExploitation: true,
        phone: phoneOrContact
      }));
    } catch (e) {}

    // Masquage du portail et affichage du tableau de bord
    if (authPortalScreen) authPortalScreen.classList.add('hidden');
    if (viewportContainer) viewportContainer.classList.remove('hidden');
    const loadingScreen = document.getElementById('appLoadingScreen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    currentProfileKey = pKey;
    currentExpenseTotal = 0;
    currentRevenueTotal = 0;

    // Rendu complet avec salutation personnalisée ("Bonjour, Fabrice ")
    renderProfile(pKey);
    await fetchFinancements();
    await syncFinancialsFromSupabase(pKey);
    await syncCropCyclesFromSupabase(pKey);
    await syncSubscriptionStatusFromSupabase(pKey);
    loadAndRenderWeather().catch(() => {});
    fetchConseils().catch(() => {});
    fetchModelesCultures().catch(() => {});
    fetchRegions().catch(() => {});
    fetchUserParcels(pKey).catch(() => {});
    await fetchEtapesCulture();
    await fetchCycleTasks(pKey);
    renderHomeTasksWeekCard();
    autoDetectResponsiveMode();
  }
  window.PROFILES_DATA = PROFILES_DATA;
  window.getCurrentProfileKey = () => currentProfileKey;
  window.fetchFinancements = fetchFinancements;
  window.fetchConseils = fetchConseils;
  window.openConseilDetailsModal = openConseilDetailsModal;
  window.openManageConseilModal = openManageConseilModal;
  window.getNewConseilsCount = getNewConseilsCount;
  window.getConseilCategoryBadge = getConseilCategoryBadge;
  window.getConseilCategoryBadgeClass = getConseilCategoryBadgeClass;
  window.updateConseilStatus = updateConseilStatus;
  window.filterOpenFinancementsForUsers = filterOpenFinancementsForUsers;
  window.fetchModelesCultures = fetchModelesCultures;
  window.fetchRegions = fetchRegions;
  window.fetchUserParcels = fetchUserParcels;
  window.openAddParcelModal = openAddParcelModal;
  window.closeAddParcelModal = closeAddParcelModal;
  window.deleteParcel = deleteParcel;
  window.openAddCropCycleModal = openAddCropCycleModal;
  window.applySelectedModelToForm = applySelectedModelToForm;
  window.updateCropCycleCalculations = updateCropCycleCalculations;
  window.openManageModeleModal = openManageModeleModal;
  window.toggleModeleActive = toggleModeleActive;
  window.deleteCropCycle = deleteCropCycle;
  window.listenParcelBalance = listenParcelBalance;
  window.formatFrancsCFA = formatFrancsCFA;
  window.renderParcellesPage = renderParcellesPage;
  window.renderUserConseils = renderUserConseils;
  window.getUserActiveCropTerms = getUserActiveCropTerms;
  window.togglePlanStepDesc = togglePlanStepDesc;
  window.listenPlanStep = listenPlanStep;
  window.markCycleTaskDone = markCycleTaskDone;
  window.renderHomeTasksWeekCard = renderHomeTasksWeekCard;
  window.renderAdminEtapes = renderAdminEtapes;
  window.openAddEtapeModal = openAddEtapeModal;
  window.openEditEtapeModal = openEditEtapeModal;
  window.toggleEtapeActive = toggleEtapeActive;
  window.deleteEtapeAdmin = deleteEtapeAdmin;
  window.closeModalAdminEtape = closeModalAdminEtape;
  window.fetchEtapesCulture = fetchEtapesCulture;
  window.fetchCycleTasks = fetchCycleTasks;
  window.setTestCaches = function(p, c, e, r, reg, mod) {
    if (p) cachedUserParcels = p;
    if (c) {
      cachedCropCycles = c;
      if (PROFILES_DATA[currentProfileKey]) {
        PROFILES_DATA[currentProfileKey].realCycles = c;
      }
    }
    if (e) cachedExpenses = e;
    if (r) cachedRevenues = r;
    if (reg) cachedRegions = reg;
    if (mod) cachedModelesCultures = mod;
  };

  // 3. Helper : conversion d'un numéro burkinabè ou contact en email technique Supabase
  function convertContactToTechnicalEmail(contact) {
    const trimmed = (contact || '').trim();
    if (trimmed.includes('@')) {
      return trimmed.toLowerCase();
    }
    let digits = trimmed.replace(/\D/g, '');
    if (!digits.startsWith('226')) {
      digits = '226' + digits;
    }
    return `tel${digits}@revolution-agricole.app`;
  }
  window.convertContactToTechnicalEmail = convertContactToTechnicalEmail;

  // 4. Bouton Continuer avec Google (Supabase Auth)
  if (btnGoogleAuth) {
    btnGoogleAuth.addEventListener('click', async () => {
      if (!supabaseClient) {
        showToast('️ Service indisponible', 'Connexion Supabase non initialisée.');
        return;
      }
      try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) {
          showToast('Erreur Google Sign-In', error.message);
        }
      } catch (err) {
        showToast('Erreur', 'Impossible de lancer la connexion Google.');
      }
    });
  }

  // 5. Formulaire Inscription par Téléphone (+226) ou Email (Supabase Auth)
  if (portalRegisterForm) {
    portalRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawContact = portalRegEmail ? portalRegEmail.value.trim() : '';
      const password = portalRegPassword ? portalRegPassword.value : '';

      if (!rawContact || !password) {
        showToast('️ Champs requis', 'Veuillez saisir votre numéro (+226) ou email et un mot de passe.');
        return;
      }

      if (password.length < 6) {
        showToast('️ Mot de passe court', 'Le mot de passe doit comporter au moins 6 caractères.');
        return;
      }

      const technicalEmail = convertContactToTechnicalEmail(rawContact);
      const formattedPhone = rawContact.includes('@') ? '' : (rawContact.startsWith('+226') ? rawContact : ('+226 ' + rawContact.replace(/^\+226\s*/, '')));

      const submitBtn = document.getElementById('btnSubmitPortalRegister');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Création du compte en cours…</span>';
      }

      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.auth.signUp({
            email: technicalEmail,
            password: password,
            options: {
              data: {
                phone: formattedPhone
              }
            }
          });

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Créer mon compte</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
          }

          if (error) {
            showToast('️ Erreur création', error.message || 'Impossible de créer ce compte.');
            return;
          }

          if (data?.session && data?.user) {
            await checkUserProfileAndProceed(data.user);
            showToast('Compte créé avec succès', 'Bienvenue sur Révolution Agricole !');
          } else if (data?.user) {
            // Tenter la connexion immédiate au cas où l'auto-confirmation est active
            const loginRes = await supabaseClient.auth.signInWithPassword({
              email: technicalEmail,
              password: password
            });
            if (loginRes.data?.user) {
              await checkUserProfileAndProceed(loginRes.data.user);
            } else {
              showToast('Compte créé', 'Connectez-vous avec vos identifiants.');
              switchPortalTab('login');
              if (portalLoginEmail) portalLoginEmail.value = rawContact;
              if (portalLoginPass) portalLoginPass.focus();
            }
          }
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Créer mon compte</span>';
          }
          showToast('Erreur', err.message || 'Une erreur est survenue.');
        }
      }
    });
  }

  // 6. Formulaire Connexion Téléphone (+226) ou Email (Supabase Auth)
  if (portalLoginForm) {
    portalLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawContact = portalLoginEmail ? portalLoginEmail.value.trim() : '';
      const password = portalLoginPass ? portalLoginPass.value : '';

      if (!rawContact || !password) {
        showToast('️ Champs requis', 'Veuillez renseigner votre numéro ou email et votre mot de passe.');
        return;
      }

      const technicalEmail = convertContactToTechnicalEmail(rawContact);

      const submitBtn = document.getElementById('btnSubmitPortalLogin');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Connexion en cours…</span>';
      }

      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: technicalEmail,
            password: password
          });

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Se connecter</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';
          }

          if (error) {
            const errMsg = error.message || '';
            const isInvalidCreds = errMsg.toLowerCase().includes('invalid login credentials') ||
                                   errMsg.toLowerCase().includes('invalid credentials') ||
                                   errMsg.toLowerCase().includes('invalid_grant') ||
                                   error.status === 400;

            const errorBanner = document.getElementById('portalLoginErrorBanner');
            const errorText = document.getElementById('portalLoginErrorMessage');
            const frenchMessage = "Connexion impossible. Si vous vous êtes inscrit avec Google, cliquez sur « Continuer avec Google » ci-dessous. Sinon, utilisez « Mot de passe oublié » pour en créer un.";

            if (isInvalidCreds) {
              if (errorBanner && errorText) {
                errorText.textContent = frenchMessage;
                errorBanner.classList.remove('hidden');
              }
              showToast('Connexion impossible', frenchMessage);
            } else {
              if (errorBanner && errorText) {
                errorText.textContent = errMsg || 'Identifiant ou mot de passe incorrect.';
                errorBanner.classList.remove('hidden');
              }
              showToast('⚠️ Erreur connexion', errMsg || 'Identifiant ou mot de passe incorrect.');
            }
            return;
          }

          if (data?.user) {
            await checkUserProfileAndProceed(data.user);
            showToast('Connexion réussie', 'Bienvenue sur votre exploitation !');
          }
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Se connecter</span>';
          }
          showToast('Erreur', err.message || 'Une erreur est survenue.');
        }
      }
    });
  }

  // 6b. Formulaire Mot de passe oublié (resetPasswordForEmail)
  if (portalForgotPasswordForm) {
    portalForgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('portalForgotEmail');
      const rawEmail = emailInput ? emailInput.value.trim() : '';
      const alertBox = document.getElementById('forgotPasswordAlert');
      const successBox = document.getElementById('forgotPasswordSuccess');
      const submitBtn = document.getElementById('btnSubmitForgotPassword');

      if (alertBox) alertBox.classList.add('hidden');
      if (successBox) successBox.classList.add('hidden');

      if (!rawEmail || !rawEmail.includes('@')) {
        if (alertBox) {
          alertBox.textContent = 'Veuillez saisir une adresse email valide.';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Envoi en cours…</span>';
      }

      try {
        if (supabaseClient) {
          // Utilisation d'une URL de redirection propre SANS dièse (#) : https://r2volution-agricole.vercel.app/?reset=1
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const baseUrl = isLocal 
            ? `${window.location.origin}/` 
            : 'https://r2volution-agricole.vercel.app/';
          const redirectUrl = `${baseUrl}?reset=1`;

          console.log('[Auth] resetPasswordForEmail avec redirectTo :', redirectUrl);

          const { error } = await supabaseClient.auth.resetPasswordForEmail(rawEmail, {
            redirectTo: redirectUrl
          });

          if (error) {
            let errorMsg = error.message || 'Impossible d\'envoyer l\'email de réinitialisation.';
            if (errorMsg.includes('rate limit') || errorMsg.includes('over_email_send_rate_limit')) {
              errorMsg = 'Trop de tentatives rapprochées. Veuillez patienter un instant avant de redemander un lien.';
            }
            if (alertBox) {
              alertBox.textContent = errorMsg;
              alertBox.classList.remove('hidden');
            }
            showToast('⚠️ Erreur', errorMsg);
          } else {
            if (successBox) {
              successBox.innerHTML = `Un lien de réinitialisation a été envoyé à <strong>${rawEmail}</strong>. Veuillez vérifier votre boîte de réception (et vos spams). Cliquez sur le lien reçu pour choisir votre nouveau mot de passe.`;
              successBox.classList.remove('hidden');
            }
            if (emailInput) emailInput.value = '';
            showToast('Email envoyé', 'Consultez votre boîte mail pour réinitialiser votre mot de passe.');
          }
        }
      } catch (err) {
        if (alertBox) {
          alertBox.textContent = err.message || 'Une erreur inattendue est survenue.';
          alertBox.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Envoyer le lien de réinitialisation</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';
        }
      }
    });
  }

  // 6c. Formulaire Choix du Nouveau mot de passe (updateUser)
  if (portalResetPasswordForm) {
    portalResetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassInput = document.getElementById('portalNewPassword');
      const confirmPassInput = document.getElementById('portalConfirmPassword');
      const newPassword = newPassInput ? newPassInput.value : '';
      const confirmPassword = confirmPassInput ? confirmPassInput.value : '';
      const alertBox = document.getElementById('resetPasswordAlert');
      const successBox = document.getElementById('resetPasswordSuccess');
      const submitBtn = document.getElementById('btnSubmitResetPassword');

      if (alertBox) alertBox.classList.add('hidden');
      if (successBox) successBox.classList.add('hidden');

      if (!newPassword || newPassword.length < 6) {
        if (alertBox) {
          alertBox.textContent = 'Le mot de passe doit comporter au moins 6 caractères.';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      if (newPassword !== confirmPassword) {
        if (alertBox) {
          alertBox.textContent = 'Les deux mots de passe ne correspondent pas.';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Enregistrement en cours…</span>';
      }

      try {
        if (supabaseClient) {
          const { data, error } = await supabaseClient.auth.updateUser({
            password: newPassword
          });

          if (error) {
            console.warn('[Auth Reset] Erreur updateUser :', error);
            let userFriendlyMsg = error.message || '';
            if (!userFriendlyMsg || 
                userFriendlyMsg.includes('Auth session missing') || 
                userFriendlyMsg.includes('session missing') ||
                userFriendlyMsg.includes('User not found') ||
                userFriendlyMsg.includes('recovery')) {
              userFriendlyMsg = "Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.";
            } else if (userFriendlyMsg.includes('Password should be at least')) {
              userFriendlyMsg = "Le mot de passe doit comporter au moins 6 caractères.";
            } else if (userFriendlyMsg.includes('different from the old')) {
              userFriendlyMsg = "Le nouveau mot de passe doit être différent de l'ancien.";
            }

            if (alertBox) {
              alertBox.textContent = userFriendlyMsg;
              alertBox.classList.remove('hidden');
            }
            showToast('⚠️ Réinitialisation', userFriendlyMsg);
          } else {
            // Nettoyage de l'URL pour ne plus rejouer les paramètres de récupération
            isRecoveryMode = false;
            try {
              window.history.replaceState(null, '', window.location.pathname);
            } catch (e) {}

            if (successBox) {
              successBox.textContent = 'Votre mot de passe a été mis à jour avec succès ! Connexion en cours…';
              successBox.classList.remove('hidden');
            }
            showToast('Mot de passe mis à jour', 'Votre nouveau mot de passe est enregistré.');

            setTimeout(async () => {
              if (data?.user) {
                await checkUserProfileAndProceed(data.user);
              } else {
                switchPortalTab('login');
              }
            }, 1200);
          }
        } else {
          throw new Error('Client Supabase non initialisé.');
        }
      } catch (err) {
        let userFriendlyMsg = err.message || '';
        if (userFriendlyMsg.includes('Auth session missing') || userFriendlyMsg.includes('session missing')) {
          userFriendlyMsg = "Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.";
        }
        if (alertBox) {
          alertBox.textContent = userFriendlyMsg || 'Une erreur inattendue est survenue.';
          alertBox.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Enregistrer le nouveau mot de passe</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';
        }
      }
    });
  }

  // 7. Écouteur des changements d'état d'authentification Supabase (OAuth redirect etc.)
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log(' [Supabase Auth Event]', event, session?.user?.email);
      if (event === 'PASSWORD_RECOVERY') {
        isRecoveryMode = true;
        showResetPasswordScreen();
        return;
      }
      if (isRecoveryMode) {
        // En mode réinitialisation de mot de passe, rester sur le formulaire de nouveau mot de passe
        if (event === 'SIGNED_IN') {
          showResetPasswordScreen();
          return;
        }
      }
      if (event === 'SIGNED_OUT') {
        currentSessionInitializedUserId = null;
        isSessionInitializing = false;
        currentAuthUser = null;
        return;
      }
      if (event === 'TOKEN_REFRESHED') {
        // Ne relance pas toute l'initialisation pour TOKEN_REFRESHED : met seulement à jour les données de l'utilisateur
        if (session?.user) {
          currentAuthUser = session.user;
        }
        return;
      }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (!session?.user) return;
        // Si l'utilisateur est en cours de réinitialisation de mot de passe, ne pas forcer l'entrée sur le tableau de bord
        if (isRecoveryMode || 
            window.location.search.includes('reset=1') || 
            window.location.search.includes('type=recovery') || 
            window.location.hash.includes('reset-password') || 
            window.location.hash.includes('type=recovery')) {
          isRecoveryMode = true;
          showResetPasswordScreen();
          return;
        }
        // Si c'est un SIGNED_IN répété pour le même utilisateur déjà initialisé :
        if (currentSessionInitializedUserId === session.user.id && currentProfileKey === session.user.id) {
          currentAuthUser = session.user;
          return;
        }
        if (isSessionInitializing && currentSessionInitializedUserId === session.user.id) {
          currentAuthUser = session.user;
          return;
        }
        await checkUserProfileAndProceed(session.user);
      }
    });
  }

  // ==========================================
  // MODULE NOTIFICATIONS AUTOMATIQUES SUPABASE
  // ==========================================
  let currentNotifications = [];
  let currentReadNotifIds = new Set();
  let currentNotifPrefs = { financement: true, date_limite: true, conseil: true, meteo: true, info: true, cultures: true };

  function loadUserNotifPrefs() {
    const profileKey = currentAuthUser ? currentAuthUser.id : (currentProfileKey || 'default');
    try {
      const stored = localStorage.getItem('revolution_notif_prefs_' + profileKey);
      if (stored) {
        currentNotifPrefs = Object.assign({ financement: true, date_limite: true, conseil: true, meteo: true, info: true, cultures: true }, JSON.parse(stored));
      } else {
        currentNotifPrefs = { financement: true, date_limite: true, conseil: true, meteo: true, info: true, cultures: true };
      }
    } catch (e) {
      currentNotifPrefs = { financement: true, date_limite: true, conseil: true, meteo: true, info: true, cultures: true };
    }
    syncNotifPrefCheckboxes();
  }

  function saveUserNotifPrefs() {
    const profileKey = currentAuthUser ? currentAuthUser.id : (currentProfileKey || 'default');
    try {
      localStorage.setItem('revolution_notif_prefs_' + profileKey, JSON.stringify(currentNotifPrefs));
    } catch (e) {}
  }

  function syncNotifPrefCheckboxes() {
    const chkFin = document.getElementById('prefNotifFinancement');
    const chkDate = document.getElementById('prefNotifDateLimite');
    const chkCons = document.getElementById('prefNotifConseil');
    const chkMet = document.getElementById('prefNotifMeteo');
    const chkCult = document.getElementById('prefNotifCultures');

    if (chkFin) chkFin.checked = currentNotifPrefs.financement !== false;
    if (chkDate) chkDate.checked = currentNotifPrefs.date_limite !== false;
    if (chkCons) chkCons.checked = currentNotifPrefs.conseil !== false;
    if (chkMet) chkMet.checked = currentNotifPrefs.meteo !== false;
    if (chkCult) chkCult.checked = currentNotifPrefs.cultures !== false;
  }

  ['prefNotifFinancement', 'prefNotifDateLimite', 'prefNotifConseil', 'prefNotifMeteo', 'prefNotifCultures'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        const keyMap = {
          prefNotifFinancement: 'financement',
          prefNotifDateLimite: 'date_limite',
          prefNotifConseil: 'conseil',
          prefNotifMeteo: 'meteo',
          prefNotifCultures: 'cultures'
        };
        const prefKey = keyMap[id];
        if (prefKey) {
          currentNotifPrefs[prefKey] = el.checked;
          saveUserNotifPrefs();
          updateNotificationBadges();
          if (currentRoutePage === 'notifications') {
            renderNotificationsPage();
          }
        }
      });
    }
  });

  function getFilteredNotifications() {
    return (currentNotifications || []).filter(n => {
      if (n.type === 'financement' && currentNotifPrefs.financement === false) return false;
      if (n.type === 'date_limite' && currentNotifPrefs.date_limite === false) return false;
      if (n.type === 'conseil' && currentNotifPrefs.conseil === false) return false;
      if (n.type === 'meteo' && currentNotifPrefs.meteo === false) return false;
      if ((n.type === 'agronomique' || n.type === 'tache') && currentNotifPrefs.cultures === false) return false;
      return true;
    });
  }

  function formatRelativeTime(dateInput) {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      const now = new Date();
      const diffSec = Math.floor((now - d) / 1000);

      if (diffSec < 60) return "À l'instant";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `Il y a ${diffDays} j`;

      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch (e) {
      return '';
    }
  }

  function updateNotificationBadges() {
    const filtered = getFilteredNotifications();
    const unreadCount = filtered.filter(n => !currentReadNotifIds.has(n.id)).length;

    const notifBadge = document.getElementById('notifBadgeCount');
    if (notifBadge) {
      if (unreadCount > 0) {
        notifBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        notifBadge.classList.remove('hidden');
      } else {
        notifBadge.classList.add('hidden');
      }
    }

    const mobileNotifBadge = document.getElementById('mobileNotifBadgeCount');
    if (mobileNotifBadge) {
      if (unreadCount > 0) {
        mobileNotifBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        mobileNotifBadge.classList.remove('hidden');
      } else {
        mobileNotifBadge.classList.add('hidden');
      }
    }
  }

  async function checkAndGenerateWeatherAlert() {
    if (!cachedWeatherResult) return;
    try {
      const current = cachedWeatherResult.current;
      const todayDaily = cachedWeatherResult.daily?.[0];
      const tomorrowDaily = cachedWeatherResult.daily?.[1];

      const alertsToday = computeWeatherAlerts(current, todayDaily);
      const alertsTomorrow = tomorrowDaily ? computeWeatherAlerts(null, tomorrowDaily) : [];
      const allAlerts = [...alertsToday, ...alertsTomorrow];

      if (allAlerts.length === 0) return;

      const topAlert = allAlerts[0];
      const todayStr = (new Date()).toISOString().slice(0, 10);

      const alreadyExists = currentNotifications.some(n => 
        n.type === 'meteo' && 
        n.created_at && 
        n.created_at.slice(0, 10) === todayStr
      );

      if (!alreadyExists) {
        const notifTitle = `Alerte météo : ${topAlert.level}`;
        const notifMsg = `${topAlert.icon} ${topAlert.message}`;

        const userId = currentAuthUser?.id || (currentProfileKey !== 'invite' ? currentProfileKey : null);
        if (userId && supabaseClient) {
          const { data, error } = await supabaseClient.from('notifications').insert({
            type: 'meteo',
            titre: notifTitle,
            message: notifMsg,
            lien: '#meteo',
            profile_id: userId
          }).select().single();

          if (!error && data) {
            currentNotifications.unshift(data);
          }
        }
      }
    } catch (e) {
      console.warn('️ checkAndGenerateWeatherAlert :', e);
    }
  }

  async function fetchNotifications() {
    if (!supabaseClient) return;

    try {
      const { data: notifs, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('️ Erreur fetchNotifications :', error);
        return;
      }

      currentNotifications = notifs || [];

      const userId = currentAuthUser?.id || (currentProfileKey !== 'invite' ? currentProfileKey : null);
      if (userId) {
        const { data: lues, error: luesErr } = await supabaseClient
          .from('notifications_lues')
          .select('notification_id')
          .eq('profile_id', userId);

        if (!luesErr && lues) {
          currentReadNotifIds = new Set(lues.map(l => l.notification_id));
        }
      } else {
        currentReadNotifIds = new Set();
      }

      loadUserNotifPrefs();
      await checkAndGenerateWeatherAlert();
      updateNotificationBadges();

      if (currentRoutePage === 'notifications') {
        renderNotificationsPage();
      }
    } catch (err) {
      console.error('Erreur chargement notifications :', err);
    }
  }

  async function markNotificationAsRead(notifId) {
    if (!notifId || currentReadNotifIds.has(notifId)) return;

    currentReadNotifIds.add(notifId);
    updateNotificationBadges();
    if (currentRoutePage === 'notifications') {
      renderNotificationsPage();
    }

    const userId = currentAuthUser?.id || (currentProfileKey !== 'invite' ? currentProfileKey : null);
    if (userId && supabaseClient) {
      try {
        await supabaseClient.from('notifications_lues').upsert({
          profile_id: userId,
          notification_id: notifId,
          lu_le: new Date().toISOString()
        });
      } catch (e) {
        console.warn('️ Erreur marquage notif lue :', e);
      }
    }
  }

  async function markAllNotificationsAsRead() {
    const filtered = getFilteredNotifications();
    const unread = filtered.filter(n => !currentReadNotifIds.has(n.id));

    if (unread.length === 0) {
      showToast('Notifications', 'Toutes vos notifications sont déjà lues.');
      return;
    }

    unread.forEach(n => currentReadNotifIds.add(n.id));
    updateNotificationBadges();
    if (currentRoutePage === 'notifications') {
      renderNotificationsPage();
    }
    showToast('Tout marqué comme lu', `${unread.length} notification(s) marquée(s) comme lue(s).`);

    const userId = currentAuthUser?.id || (currentProfileKey !== 'invite' ? currentProfileKey : null);
    if (userId && supabaseClient) {
      try {
        const rows = unread.map(n => ({
          profile_id: userId,
          notification_id: n.id,
          lu_le: new Date().toISOString()
        }));
        await supabaseClient.from('notifications_lues').upsert(rows);
      } catch (e) {
        console.warn('️ Erreur markAllNotificationsAsRead Supabase :', e);
      }
    }
  }

  function renderNotificationsPage() {
    const container = document.getElementById('notificationsListContainer');
    if (!container) return;

    const filtered = getFilteredNotifications();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="notif-empty-state">
          <div class="notif-empty-icon"></div>
          <h3 class="notif-empty-title">Aucune notification pour le moment</h3>
          <p class="notif-empty-sub">Vous recevrez ici les nouvelles subventions ministérielles, les échéances de dépôt, les conseils de saison et les alertes météo en direct.</p>
        </div>
      `;
      return;
    }

    const iconsByType = {
      financement: '',
      date_limite: '⏳',
      conseil: '',
      meteo: '️',
      info: '',
      agronomique: '',
      tache: ''
    };

    const labelsByType = {
      financement: 'Opportunité',
      date_limite: 'Échéance',
      conseil: 'Conseil',
      meteo: 'Météo',
      info: 'Info',
      agronomique: 'Rappel culture',
      tache: 'Travail agricole'
    };

    container.innerHTML = filtered.map(notif => {
      const isRead = currentReadNotifIds.has(notif.id);
      const icon = iconsByType[notif.type] || '';
      const tag = labelsByType[notif.type] || notif.type;
      const timeStr = formatRelativeTime(notif.created_at);

      return `
        <div class="notif-card ${isRead ? 'read' : 'unread'} type-${notif.type}" data-notif-id="${notif.id}" data-lien="${notif.lien || '#dashboard'}">
          <div class="notif-icon-box type-${notif.type}">
            ${icon}
          </div>
          <div class="notif-body">
            <div class="notif-header-line">
              <h4 class="notif-title">${escapeHtml(notif.titre)}</h4>
              <span class="notif-time">${timeStr}</span>
            </div>
            <p class="notif-message">${escapeHtml(notif.message)}</p>
            <div class="notif-footer">
              <span class="notif-badge-tag">${tag}</span>
              ${!isRead ? '<span class="notif-unread-dot" title="Non lu"></span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.notif-card').forEach(card => {
      card.addEventListener('click', async () => {
        const notifId = card.getAttribute('data-notif-id');
        const lien = card.getAttribute('data-lien') || '#dashboard';

        await markNotificationAsRead(notifId);

        const targetRoute = lien.replace(/^#/, '');
        if (targetRoute) {
          window.location.hash = targetRoute;
          handleRoute();
        }
      });
    });
  }

  function getMobileNotificationsHtml() {
    const filtered = getFilteredNotifications();
    const iconsByType = {
      financement: '',
      date_limite: '⏳',
      conseil: '',
      meteo: '️',
      info: '',
      agronomique: '',
      tache: ''
    };

    const labelsByType = {
      financement: 'Opportunité',
      date_limite: 'Échéance',
      conseil: 'Conseil',
      meteo: 'Météo',
      info: 'Info',
      agronomique: 'Rappel culture',
      tache: 'Travail agricole'
    };

    return `
      <div style="padding: 12px 14px 40px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--primary-900); margin: 0;"> Notifications</h2>
            <span style="font-size: 11.5px; color: var(--text-dim);">Alertes & Opportunités réelles</span>
          </div>
          <button type="button" class="btn-secondary" id="btnMobileMarkAllRead" style="font-size: 11.5px; padding: 6px 10px;">
            Tout lire
          </button>
        </div>

        ${filtered.length === 0 ? `
          <div class="notif-empty-state" style="padding: 40px 16px;">
            <div class="notif-empty-icon" style="font-size: 36px;"></div>
            <h3 class="notif-empty-title" style="font-size: 15px;">Aucune notification</h3>
            <p class="notif-empty-sub" style="font-size: 12px;">Vos alertes de financements, météo et conseils apparaîtront ici.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${filtered.map(notif => {
              const isRead = currentReadNotifIds.has(notif.id);
              const icon = iconsByType[notif.type] || '';
              const tag = labelsByType[notif.type] || notif.type;
              const timeStr = formatRelativeTime(notif.created_at);
              return `
                <div class="notif-card ${isRead ? 'read' : 'unread'} type-${notif.type} mobile-notif-card" data-notif-id="${notif.id}" data-lien="${notif.lien || '#dashboard'}" style="padding: 12px 14px;">
                  <div class="notif-icon-box type-${notif.type}" style="width: 36px; height: 36px; font-size: 17px;">
                    ${icon}
                  </div>
                  <div class="notif-body">
                    <div class="notif-header-line">
                      <h4 class="notif-title" style="font-size: 13.5px;">${escapeHtml(notif.titre)}</h4>
                      <span class="notif-time" style="font-size: 10.5px;">${timeStr}</span>
                    </div>
                    <p class="notif-message" style="font-size: 12px; margin-bottom: 4px;">${escapeHtml(notif.message)}</p>
                    <div class="notif-footer">
                      <span class="notif-badge-tag" style="font-size: 9.5px;">${tag}</span>
                      ${!isRead ? '<span class="notif-unread-dot"></span>' : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  if (btnNotifications) {
    btnNotifications.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.hash = 'notifications';
      navigateToPage('notifications');
    });
  }

  if (btnMarkAllNotifsRead) {
    btnMarkAllNotifsRead.addEventListener('click', (e) => {
      e.stopPropagation();
      markAllNotificationsAsRead();
    });
  }

  // ==========================================
  // MODULE MATÉRIEL & SERVICES (CONNECTÉ SUPABASE)
  // ==========================================

  const MATERIEL_CATEGORIES_META = {
    'pompes-forages': { label: 'Pompes & Forages', icon: '' },
    'energie-solaire': { label: 'Énergie Solaire', icon: '️' },
    'irrigation': { label: 'Irrigation', icon: '' },
    'kits-maraichage': { label: 'Kits Maraîchage', icon: '' },
    'outils-accessoires': { label: 'Outils & Accessoires', icon: '' },
    'intrants': { label: 'Intrants certifiés', icon: '' },
    'services': { label: 'Services & Réparations', icon: '️' }
  };

  const MATERIEL_TYPES_META = {
    vente: { label: 'Vente', icon: '️' },
    location: { label: 'Location', icon: '⏱️' },
    installation: { label: 'Installation', icon: '' },
    reparation: { label: 'Réparation', icon: '' }
  };

  // Nettoyage et normalisation des numéros WhatsApp burkinabè (évite tout doublon avec l'indicatif 226)
  function sanitizeBurkinaPhone(raw) {
    let digits = String(raw || '').trim().replace(/[^0-9]/g, '');
    while (digits.startsWith('00226')) {
      digits = digits.slice(5);
    }
    while (digits.startsWith('226')) {
      digits = digits.slice(3);
    }
    return digits;
  }

  // Auto-agrandissement dynamique des zones de texte (Description & Caractéristiques)
  function autoExpandTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight, 180) + 'px';
  }

  // Compression d'image côté client via Canvas uniquement pour JPG et PNG (1200x1200 max, qualité 0.8)
  async function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error(`Impossible de lire le fichier « ${file?.name || 'image'} »`));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error(`Impossible de décoder l'image « ${file?.name || 'photo'} » pour compression.`));
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Erreur de compression d\'image (Canvas toBlob vide)'));
            },
            'image/jpeg',
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Upload d'une photo ou d'un fichier animé (GIF, WebP) vers le bucket Storage 'materiels'
  async function uploadMaterielPhoto(blobOrFile, contentType = 'image/jpeg', ext = 'jpg') {
    if (!supabaseClient) throw new Error('Connexion Supabase non disponible');
    const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `photos/${cleanName}`;

    // S'assurer que le blob envoyé vers Supabase Storage a toujours le bon Content-Type strict
    let uploadPayload = blobOrFile;
    try {
      if (typeof blobOrFile.arrayBuffer === 'function') {
        const arrayBuf = await blobOrFile.arrayBuffer();
        uploadPayload = new Blob([arrayBuf], { type: contentType });
      } else if (blobOrFile instanceof Blob && blobOrFile.type !== contentType) {
        uploadPayload = new Blob([blobOrFile], { type: contentType });
      }
    } catch (conversionErr) {
      console.warn('️ Conversion Blob uploadMaterielPhoto :', conversionErr);
      uploadPayload = blobOrFile;
    }

    const { error } = await supabaseClient.storage
      .from('materiels')
      .upload(filePath, uploadPayload, { contentType: contentType, upsert: true });

    if (error) {
      console.error('Erreur Supabase Storage upload :', error);
      const errDetail = error.message || error.error_description || error.error || JSON.stringify(error);
      throw new Error(`Erreur Storage (${errDetail})`);
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from('materiels')
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error(`Impossible d'obtenir l'URL publique de la photo ${filePath}`);
    }

    return publicUrlData.publicUrl;
  }

  // Récupération des matériels depuis Supabase
  async function fetchMateriels() {
    if (!supabaseClient) return;
    try {
      const { data, error } = await supabaseClient
        .from('materiels')
        .select('*')
        .order('mis_en_avant', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('️ Erreur fetchMateriels Supabase :', error);
        return;
      }

      cachedMateriels = data || [];
      updateMaterielsCounters();
      renderUserMateriels();
      if (currentRoutePage === 'admin-materiels') {
        renderAdminMateriels();
      }
      if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
        renderMobileView();
      }
    } catch (err) {
      console.warn('️ Erreur réseau fetchMateriels :', err);
    }
  }

  // Mise à jour des compteurs et badges
  function updateMaterielsCounters() {
    const published = cachedMateriels.filter(m => m.statut === 'publie');
    const pending = cachedMateriels.filter(m => m.statut === 'en_attente');

    const countBadgeText = document.getElementById('userMaterielsCountText');
    if (countBadgeText) {
      countBadgeText.textContent = `${published.length} offre${published.length > 1 ? 's' : ''} disponible${published.length > 1 ? 's' : ''}`;
    }

    const navAdminBadge = document.getElementById('navAdminMaterielsBadge');
    if (navAdminBadge) {
      navAdminBadge.textContent = pending.length;
      navAdminBadge.classList.toggle('hidden', pending.length === 0);
    }

    const drawerAdminBadge = document.getElementById('mobileDrawerMaterielsBadge');
    if (drawerAdminBadge) {
      drawerAdminBadge.textContent = pending.length;
      drawerAdminBadge.style.display = pending.length > 0 ? 'inline-block' : 'none';
    }
  }

  // Rendu de la grille des matériels pour les utilisateurs (Desktop)
  function renderUserMateriels() {
    const grid = document.getElementById('materielsGrid');
    const emptyState = document.getElementById('materielsEmptyState');
    if (!grid) return;

    let list = cachedMateriels.filter(m => m.statut === 'publie');

    // Filtre par catégorie
    if (userSelectedMaterielCategory && userSelectedMaterielCategory !== 'all') {
      list = list.filter(m => m.categorie === userSelectedMaterielCategory);
    }

    // Filtre par type d'offre
    if (userSelectedMaterielTypeOffre && userSelectedMaterielTypeOffre !== 'all') {
      list = list.filter(m => m.type_offre === userSelectedMaterielTypeOffre);
    }

    // Filtre par recherche textuelle
    if (userMaterielSearchQuery && userMaterielSearchQuery.trim() !== '') {
      const q = userMaterielSearchQuery.toLowerCase().trim();
      list = list.filter(m => {
        const nom = (m.nom || '').toLowerCase();
        const desc = (m.description || '').toLowerCase();
        const caract = (m.caracteristiques || '').toLowerCase();
        const fn = (m.fournisseur_nom || '').toLowerCase();
        const fv = (m.fournisseur_ville || '').toLowerCase();
        return nom.includes(q) || desc.includes(q) || caract.includes(q) || fn.includes(q) || fv.includes(q);
      });
    }

    if (list.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = list.map(item => {
      const catMeta = MATERIEL_CATEGORIES_META[item.categorie] || { label: item.categorie || 'Matériel', icon: '' };
      const typeMeta = MATERIEL_TYPES_META[item.type_offre] || { label: item.type_offre || 'Offre', icon: '️' };
      const photos = Array.isArray(item.photos) ? item.photos : [];
      const mainPhoto = photos.length > 0 ? photos[0] : '';

      let priceDisplay = 'Prix sur demande';
      if (item.prix_texte && item.prix_texte.trim() !== '') {
        priceDisplay = escapeHtml(item.prix_texte);
      } else if (item.prix !== null && item.prix !== undefined && !isNaN(Number(item.prix))) {
        priceDisplay = `${new Intl.NumberFormat('fr-FR').format(Number(item.prix))} F CFA`;
      }

      return `
        <div class="materiel-card" data-id="${item.id}">
          <div class="materiel-card-image-wrap">
            ${mainPhoto ? `
              <img src="${mainPhoto}" alt="${escapeHtml(item.nom)}" class="materiel-card-img" loading="lazy">
            ` : `
              <div class="materiel-card-img-placeholder">${catMeta.icon}</div>
            `}
            ${item.mis_en_avant ? `
              <span class="materiel-badge-pinned">⭐ Mis en avant</span>
            ` : ''}
            <span class="materiel-badge-type">${typeMeta.icon} ${typeMeta.label}</span>
            ${photos.length > 1 ? `
              <span class="materiel-badge-photo-count"> ${photos.length}</span>
            ` : ''}
          </div>
          <div class="materiel-card-body">
            <div class="materiel-card-cat-line">
              <span class="materiel-card-cat">${catMeta.icon} ${catMeta.label}</span>
              ${item.badge_certifie ? `
                <span class="materiel-badge-cert">️ Fournisseur certifié</span>
              ` : ''}
            </div>
            <h3 class="materiel-card-title">${escapeHtml(item.nom)}</h3>
            <p class="materiel-card-desc">${escapeHtml(item.description || '')}</p>
            <div class="materiel-card-footer">
              <div class="materiel-card-price-group">
                <span class="materiel-card-price">${priceDisplay}</span>
                ${item.unite ? `<span class="materiel-card-unit">${escapeHtml(item.unite)}</span>` : ''}
              </div>
              <span class="materiel-card-loc" title="${escapeHtml(item.fournisseur_ville || 'Burkina Faso')}">
                 ${escapeHtml(item.fournisseur_ville || 'Burkina Faso')}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.materiel-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = cachedMateriels.find(m => String(m.id) === String(id));
        if (item) openMaterielDetailsModal(item);
      });
    });
  }

  // Ouverture de la modale de détails d'un matériel (Utilisateur)
  function openMaterielDetailsModal(item) {
    if (!modalMaterielDetails) return;

    const bType = document.getElementById('matDetailBadgeType');
    const bCert = document.getElementById('matDetailBadgeCertifie');
    const dCat = document.getElementById('matDetailCategoryTag');
    const dNom = document.getElementById('matDetailNom');
    const dPrix = document.getElementById('matDetailPrix');
    const dUnite = document.getElementById('matDetailUnite');
    const dDesc = document.getElementById('matDetailDescription');
    const dCaract = document.getElementById('matDetailCaracteristiques');
    const dCaractSec = document.getElementById('matDetailCaractSection');
    const dFournisseur = document.getElementById('matDetailFournisseur');
    const dVille = document.getElementById('matDetailVille');
    const btnWa = document.getElementById('btnMatWhatsappOrder');
    const btnPhone = document.getElementById('btnMatPhoneCall');
    const phoneText = document.getElementById('matDetailPhoneText');

    const catMeta = MATERIEL_CATEGORIES_META[item.categorie] || { label: item.categorie || 'Matériel', icon: '' };
    const typeMeta = MATERIEL_TYPES_META[item.type_offre] || { label: item.type_offre || 'Vente', icon: '️' };

    if (bType) bType.textContent = `${typeMeta.icon} ${typeMeta.label}`;
    if (bCert) {
      if (item.badge_certifie) {
        bCert.textContent = '️ Fournisseur certifié';
        bCert.classList.remove('hidden');
      } else {
        bCert.classList.add('hidden');
      }
    }

    if (dCat) dCat.textContent = `${catMeta.icon} ${catMeta.label}`;
    if (dNom) dNom.textContent = item.nom;

    let priceDisplay = 'Prix sur demande';
    if (item.prix_texte && item.prix_texte.trim() !== '') {
      priceDisplay = item.prix_texte;
    } else if (item.prix !== null && item.prix !== undefined && !isNaN(Number(item.prix))) {
      priceDisplay = `${new Intl.NumberFormat('fr-FR').format(Number(item.prix))} F CFA`;
    }
    if (dPrix) dPrix.textContent = priceDisplay;
    if (dUnite) dUnite.textContent = item.unite ? `(${item.unite})` : '';

    if (dDesc) dDesc.textContent = item.description || '';

    if (dCaractSec && dCaract) {
      if (item.caracteristiques && item.caracteristiques.trim() !== '') {
        dCaract.textContent = item.caracteristiques;
        dCaractSec.classList.remove('hidden');
      } else {
        dCaractSec.classList.add('hidden');
      }
    }

    if (dFournisseur) dFournisseur.textContent = item.fournisseur_nom || 'Fournisseur vérifié';
    if (dVille) {
      const reg = item.regions_livraison ? ` • Livraison : ${item.regions_livraison}` : '';
      dVille.textContent = `${item.fournisseur_ville || 'Burkina Faso'}${reg}`;
    }

    // Gestion du Carrousel de Photos
    currentDetailMaterielPhotos = Array.isArray(item.photos) ? item.photos.filter(p => Boolean(p)) : [];
    currentDetailPhotoIndex = 0;
    renderDetailCarousel();

    // Boutons Contact WhatsApp et Téléphone
    const rawPhone = String(item.fournisseur_whatsapp || '').trim();
    const cleanDigits = sanitizeBurkinaPhone(rawPhone);

    if (btnWa) {
      const waMessage = `Bonjour ${item.fournisseur_nom || ''}, je vous contacte depuis Révolution Agricole concernant votre offre : « ${item.nom} » (${priceDisplay}). Est-elle toujours disponible ?`;
      btnWa.href = `https://wa.me/226${cleanDigits}?text=${encodeURIComponent(waMessage)}`;
    }

    if (btnPhone) {
      btnPhone.href = `tel:+226${cleanDigits}`;
      if (phoneText) phoneText.textContent = `Appeler (+226 ${cleanDigits.replace(/(\d{2})(?=\d)/g, '$1 ')})`;
    }

    modalMaterielDetails.classList.remove('hidden');
  }

  function renderDetailCarousel() {
    const mainImg = document.getElementById('matDetailMainPhoto');
    const prevBtn = document.getElementById('matCarouselPrev');
    const nextBtn = document.getElementById('matCarouselNext');
    const counter = document.getElementById('matCarouselCounter');
    const thumbs = document.getElementById('matDetailThumbs');

    if (currentDetailMaterielPhotos.length === 0) {
      if (mainImg) mainImg.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80';
      if (prevBtn) prevBtn.classList.add('hidden');
      if (nextBtn) nextBtn.classList.add('hidden');
      if (counter) counter.classList.add('hidden');
      if (thumbs) thumbs.innerHTML = '';
      return;
    }

    function showPhotoAtIndex(idx) {
      currentDetailPhotoIndex = idx;
      if (mainImg) mainImg.src = currentDetailMaterielPhotos[idx];
      if (counter) counter.textContent = `${idx + 1} / ${currentDetailMaterielPhotos.length}`;

      if (thumbs) {
        thumbs.querySelectorAll('.carousel-thumb-btn').forEach((btn, i) => {
          btn.classList.toggle('active', i === idx);
        });
      }
    }

    showPhotoAtIndex(0);

    const hasMultiple = currentDetailMaterielPhotos.length > 1;
    if (prevBtn) prevBtn.classList.toggle('hidden', !hasMultiple);
    if (nextBtn) nextBtn.classList.toggle('hidden', !hasMultiple);
    if (counter) counter.classList.toggle('hidden', !hasMultiple);

    if (hasMultiple) {
      if (prevBtn) {
        prevBtn.onclick = (e) => {
          e.stopPropagation();
          const prevIdx = (currentDetailPhotoIndex - 1 + currentDetailMaterielPhotos.length) % currentDetailMaterielPhotos.length;
          showPhotoAtIndex(prevIdx);
        };
      }
      if (nextBtn) {
        nextBtn.onclick = (e) => {
          e.stopPropagation();
          const nextIdx = (currentDetailPhotoIndex + 1) % currentDetailMaterielPhotos.length;
          showPhotoAtIndex(nextIdx);
        };
      }

      if (thumbs) {
        thumbs.innerHTML = currentDetailMaterielPhotos.map((url, i) => `
          <button type="button" class="carousel-thumb-btn ${i === 0 ? 'active' : ''}" data-idx="${i}">
            <img src="${url}" alt="Aperçu ${i + 1}">
          </button>
        `).join('');

        thumbs.querySelectorAll('.carousel-thumb-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            showPhotoAtIndex(idx);
          });
        });
      }
    } else if (thumbs) {
      thumbs.innerHTML = '';
    }
  }

  function closeMaterielDetailsModal() {
    if (modalMaterielDetails) modalMaterielDetails.classList.add('hidden');
  }

  // Rendu de la liste admin des matériels (Desktop)
  function renderAdminMateriels() {
    const listContainer = document.getElementById('adminMaterielsList');
    if (!listContainer) return;

    let list = cachedMateriels;
    if (adminMaterielActiveStatusTab && adminMaterielActiveStatusTab !== 'all') {
      list = list.filter(m => m.statut === adminMaterielActiveStatusTab);
    }

    if (list.length === 0) {
      listContainer.innerHTML = `
        <div class="financements-empty-state" style="padding: 30px;">
          <div class="empty-state-icon"></div>
          <h3>Aucun produit trouvé</h3>
          <p>Cliquez sur « + Ajouter un produit » pour enregistrer une offre de matériel ou service.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = list.map(item => {
      const photos = Array.isArray(item.photos) ? item.photos : [];
      const thumb = photos.length > 0 ? photos[0] : '';
      const catMeta = MATERIEL_CATEGORIES_META[item.categorie] || { label: item.categorie || 'Matériel', icon: '' };
      const typeMeta = MATERIEL_TYPES_META[item.type_offre] || { label: item.type_offre || 'Vente', icon: '️' };

      let priceDisplay = 'Prix sur demande';
      if (item.prix_texte && item.prix_texte.trim() !== '') {
        priceDisplay = item.prix_texte;
      } else if (item.prix !== null && item.prix !== undefined && !isNaN(Number(item.prix))) {
        priceDisplay = `${new Intl.NumberFormat('fr-FR').format(Number(item.prix))} F CFA`;
      }

      return `
        <div class="admin-materiel-card status-${item.statut}" data-id="${item.id}">
          ${thumb ? `
            <img src="${thumb}" alt="${escapeHtml(item.nom)}" class="admin-materiel-thumb">
          ` : `
            <div class="admin-materiel-thumb">${catMeta.icon}</div>
          `}
          <div class="admin-materiel-info">
            <div class="admin-materiel-header">
              <span class="admin-status-pill ${item.statut}">
                ${item.statut === 'en_attente' ? '⏳ En attente' : (item.statut === 'publie' ? ' Publié' : ' Retiré')}
              </span>
              <span class="fin-badge-type">${typeMeta.icon} ${typeMeta.label}</span>
              <span style="font-size: 11.5px; color: var(--text-dim);">${catMeta.icon} ${catMeta.label}</span>
              ${item.mis_en_avant ? '<span class="badge-urgent-pulse" style="font-size: 10px;">⭐ Mis en avant</span>' : ''}
              ${item.badge_certifie ? '<span class="materiel-badge-cert" style="font-size: 10px;">️ Certifié</span>' : ''}
            </div>
            <h4 class="admin-materiel-title">${escapeHtml(item.nom)}</h4>
            <div class="admin-materiel-meta">
              <span><strong>Prix :</strong> ${priceDisplay}</span>
              <span>•</span>
              <span><strong>Fournisseur :</strong> ${escapeHtml(item.fournisseur_nom)} ( ${escapeHtml(item.fournisseur_ville)})</span>
              <span>•</span>
              <span><strong>WhatsApp :</strong> +226 ${escapeHtml(sanitizeBurkinaPhone(item.fournisseur_whatsapp))}</span>
            </div>
          </div>
          <div class="admin-materiel-actions">
            ${item.statut !== 'publie' ? `
              <button type="button" class="btn-admin-action btn-admin-publish btn-mat-publish" data-id="${item.id}" title="Publier immédiatement cette fiche">
                 Publier
              </button>
            ` : ''}
            <button type="button" class="btn-admin-action btn-admin-edit btn-mat-edit" data-id="${item.id}" title="Modifier cette fiche">
              ️ Modifier
            </button>
            ${item.statut !== 'retire' ? `
              <button type="button" class="btn-admin-action btn-admin-withdraw btn-mat-withdraw" data-id="${item.id}" title="Retirer cette fiche du public">
                 Retirer
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.btn-mat-publish').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await updateMaterielStatus(id, 'publie');
      });
    });

    listContainer.querySelectorAll('.btn-mat-withdraw').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await updateMaterielStatus(id, 'retire');
      });
    });

    listContainer.querySelectorAll('.btn-mat-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = cachedMateriels.find(m => String(m.id) === String(id));
        if (item) openManageMaterielModal(item);
      });
    });
  }

  // Changement de statut d'un matériel (Publié, Retiré)
  async function updateMaterielStatus(id, newStatus) {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('materiels')
        .update({ statut: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        showToast('️ Erreur', error.message || 'Impossible de mettre à jour le statut.');
        return;
      }

      const labels = {
        publie: 'publié et visible de tous les producteurs !',
        retire: 'retiré du catalogue (archivé).',
        en_attente: 'remis en attente de validation.'
      };
      showToast('Statut mis à jour', `Le produit a été ${labels[newStatus] || newStatus}`);
      await fetchMateriels();
    } catch (e) {
      showToast('Erreur', e.message);
    }
  }

  // Modale d'ajout / modification de matériel (Admin)
  function openManageMaterielModal(item = null) {
    if (!modalManageMateriel) return;
    currentEditingMaterielId = item ? item.id : null;
    pendingMaterielPhotos = [];

    const titleEl = document.getElementById('manageMaterielModalTitle');
    const submitBtnText = document.getElementById('btnSaveMaterielText');
    const idInput = document.getElementById('materielId');
    const nomInput = document.getElementById('materielNom');
    const catSelect = document.getElementById('materielCategorie');
    const typeSelect = document.getElementById('materielTypeOffre');
    const prixInput = document.getElementById('materielPrix');
    const uniteInput = document.getElementById('materielUnite');
    const prixTexteInput = document.getElementById('materielPrixTexte');
    const descInput = document.getElementById('materielDescription');
    const caractInput = document.getElementById('materielCaracteristiques');
    const fnNomInput = document.getElementById('materielFournisseurNom');
    const fnWaInput = document.getElementById('materielFournisseurWhatsapp');
    const fnVilleInput = document.getElementById('materielFournisseurVille');
    const regInput = document.getElementById('materielRegionsLivraison');
    const misEnAvantChk = document.getElementById('materielMisEnAvant');
    const badgeCertChk = document.getElementById('materielBadgeCertifie');
    const statutSelect = document.getElementById('materielStatut');
    const dispoChk = document.getElementById('materielDisponible');

    if (item) {
      if (titleEl) titleEl.textContent = 'Modifier le produit ou service';
      if (submitBtnText) submitBtnText.textContent = 'Enregistrer les modifications';
      if (idInput) idInput.value = item.id;
      if (nomInput) nomInput.value = item.nom || '';
      if (catSelect) catSelect.value = item.categorie || 'pompes-forages';
      if (typeSelect) typeSelect.value = item.type_offre || 'vente';
      if (prixInput) prixInput.value = item.prix !== null && item.prix !== undefined ? item.prix : '';
      if (uniteInput) uniteInput.value = item.unite || '';
      if (prixTexteInput) prixTexteInput.value = item.prix_texte || '';
      if (descInput) descInput.value = item.description || '';
      if (caractInput) caractInput.value = item.caracteristiques || '';
      if (fnNomInput) fnNomInput.value = item.fournisseur_nom || '';
      if (fnWaInput) fnWaInput.value = sanitizeBurkinaPhone(item.fournisseur_whatsapp);
      if (fnVilleInput) fnVilleInput.value = item.fournisseur_ville || '';
      if (regInput) regInput.value = item.regions_livraison || '';
      if (misEnAvantChk) misEnAvantChk.checked = Boolean(item.mis_en_avant);
      if (badgeCertChk) badgeCertChk.checked = item.badge_certifie !== false;
      if (statutSelect) statutSelect.value = item.statut || 'publie';
      if (dispoChk) dispoChk.checked = item.disponible !== false;

      // Charger les photos existantes
      if (Array.isArray(item.photos)) {
        pendingMaterielPhotos = item.photos.map(url => ({
          url: url,
          previewUrl: url,
          id: Math.random().toString(36).substring(2, 9)
        }));
      }
    } else {
      if (titleEl) titleEl.textContent = 'Ajouter un produit ou service';
      if (submitBtnText) submitBtnText.textContent = 'Enregistrer le produit';
      if (formManageMateriel) formManageMateriel.reset();
      if (idInput) idInput.value = '';
      if (catSelect) catSelect.value = 'pompes-forages';
      if (typeSelect) typeSelect.value = 'vente';
      if (statutSelect) statutSelect.value = 'publie';
      if (badgeCertChk) badgeCertChk.checked = true;
      if (dispoChk) dispoChk.checked = true;
    }

    renderPhotoPreviews();
    modalManageMateriel.classList.remove('hidden');

    setTimeout(() => {
      autoExpandTextarea(descInput);
      autoExpandTextarea(caractInput);
    }, 50);
  }

  function renderPhotoPreviews() {
    const container = document.getElementById('materielPhotoPreviews');
    if (!container) return;

    container.innerHTML = pendingMaterielPhotos.map((p, idx) => `
      <div class="materiel-photo-preview-item" data-id="${p.id}">
        <img src="${p.previewUrl}" alt="Photo ${idx + 1}">
        <button type="button" class="materiel-photo-preview-del" data-id="${p.id}" title="Supprimer cette photo">&times;</button>
      </div>
    `).join('');

    container.querySelectorAll('.materiel-photo-preview-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        pendingMaterielPhotos = pendingMaterielPhotos.filter(p => p.id !== id);
        renderPhotoPreviews();
      });
    });
  }

  function closeManageMaterielModal() {
    if (modalManageMateriel) modalManageMateriel.classList.add('hidden');
    pendingMaterielPhotos = [];
    currentEditingMaterielId = null;
  }

  // Soumission du formulaire d'enregistrement de matériel
  async function handleSaveMateriel(e) {
    e.preventDefault();
    if (!supabaseClient) {
      showToast('️ Erreur', 'Connexion Supabase non disponible.');
      return;
    }

    const submitBtn = document.getElementById('btnSaveMateriel');
    const submitBtnText = document.getElementById('btnSaveMaterielText');
    const prevText = submitBtnText ? submitBtnText.textContent : 'Enregistrer';

    try {
      if (submitBtn) submitBtn.disabled = true;
      if (submitBtnText) submitBtnText.textContent = 'Traitement des photos…';

      // Traiter et uploader chaque nouvelle photo via Storage
      const finalPhotoUrls = [];
      for (const item of pendingMaterielPhotos) {
        if (item.url) {
          finalPhotoUrls.push(item.url);
        } else if (item.file) {
          const file = item.file;
          const fileName = (file.name || '').toLowerCase();
          const fileType = (file.type || '').toLowerCase();

          const isGif = fileType === 'image/gif' || fileName.endsWith('.gif');
          const isWebp = fileType === 'image/webp' || fileName.endsWith('.webp');

          if (isGif) {
            // Fichier GIF (animé ou fixe) : envoi tel quel sans re-compression pour préserver toutes les frames animées
            if (submitBtnText) submitBtnText.textContent = 'Envoi du GIF animé…';
            const uploadedUrl = await uploadMaterielPhoto(file, 'image/gif', 'gif');
            finalPhotoUrls.push(uploadedUrl);
          } else if (isWebp) {
            // Fichier WebP (animé ou fixe) : envoi tel quel sans compression Canvas pour préserver l'animation native
            if (submitBtnText) submitBtnText.textContent = 'Envoi du WebP animé…';
            const uploadedUrl = await uploadMaterielPhoto(file, 'image/webp', 'webp');
            finalPhotoUrls.push(uploadedUrl);
          } else {
            // Photos normales (JPG, PNG) : compression Canvas
            if (submitBtnText) submitBtnText.textContent = 'Compression photo…';
            const compressedBlob = await compressImageFile(file);
            const uploadedUrl = await uploadMaterielPhoto(compressedBlob, 'image/jpeg', 'jpg');
            finalPhotoUrls.push(uploadedUrl);
          }
        }
      }

      if (submitBtnText) submitBtnText.textContent = 'Enregistrement en base…';

      const nom = document.getElementById('materielNom').value.trim();
      const categorie = document.getElementById('materielCategorie').value;
      const type_offre = document.getElementById('materielTypeOffre').value;
      const rawPrix = document.getElementById('materielPrix').value.trim();
      const prix = rawPrix !== '' ? Number(rawPrix) : null;
      const unite = document.getElementById('materielUnite').value.trim() || null;
      const rawPrixTexte = document.getElementById('materielPrixTexte').value.trim();
      let prix_texte = rawPrixTexte;
      if (!prix_texte && prix !== null) {
        prix_texte = `${new Intl.NumberFormat('fr-FR').format(prix)} F CFA${unite ? ' / ' + unite : ''}`;
      } else if (!prix_texte && prix === null) {
        prix_texte = 'Prix sur demande';
      }

      const description = document.getElementById('materielDescription').value.trim();
      const caracteristiques = document.getElementById('materielCaracteristiques').value.trim() || null;
      const fournisseur_nom = document.getElementById('materielFournisseurNom').value.trim();
      const rawWa = document.getElementById('materielFournisseurWhatsapp').value.trim();
      const fournisseur_whatsapp = sanitizeBurkinaPhone(rawWa);
      const fournisseur_ville = document.getElementById('materielFournisseurVille').value.trim();
      const regions_livraison = document.getElementById('materielRegionsLivraison').value.trim() || null;
      const mis_en_avant = document.getElementById('materielMisEnAvant').checked;
      const badge_certifie = document.getElementById('materielBadgeCertifie').checked;
      const statut = document.getElementById('materielStatut').value;
      const disponible = document.getElementById('materielDisponible').checked;

      const payload = {
        nom,
        categorie,
        type_offre,
        prix,
        prix_texte,
        unite,
        description,
        caracteristiques,
        fournisseur_nom,
        fournisseur_whatsapp,
        fournisseur_ville,
        regions_livraison,
        mis_en_avant,
        badge_certifie,
        statut,
        disponible,
        photos: finalPhotoUrls,
        updated_at: new Date().toISOString()
      };

      if (currentEditingMaterielId) {
        const { error } = await supabaseClient
          .from('materiels')
          .update(payload)
          .eq('id', currentEditingMaterielId);

        if (error) throw error;
        showToast('Produit mis à jour', `« ${nom} » a été mis à jour avec succès.`);
      } else {
        payload.created_at = new Date().toISOString();
        const { error } = await supabaseClient
          .from('materiels')
          .insert([payload]);

        if (error) throw error;
        showToast('Produit ajouté', `« ${nom} » a été enregistré dans le catalogue.`);
      }

      closeManageMaterielModal();
      await fetchMateriels();
    } catch (err) {
      console.error('Erreur handleSaveMateriel :', err);
      let errorDetail = '';
      if (err instanceof Event) {
        errorDetail = 'Erreur lors du traitement d\'une image locale (lecture ou compression)';
      } else if (typeof err === 'string') {
        errorDetail = err;
      } else if (err && typeof err === 'object') {
        errorDetail = err.message || err.error_description || err.details || err.hint || (err.error ? (err.error.message || JSON.stringify(err.error)) : JSON.stringify(err));
      }
      const fullErrorMsg = errorDetail 
        ? `Impossible d'enregistrer le produit : ${errorDetail}`
        : 'Impossible d\'enregistrer le produit.';
      showToast('️ Erreur', fullErrorMsg);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitBtnText) submitBtnText.textContent = prevText;
    }
  }

  // HTML pour mobile : Matériel & services utilisateur
  function getMobileMaterielsHtml() {
    let list = cachedMateriels.filter(m => m.statut === 'publie');
    if (userSelectedMaterielCategory && userSelectedMaterielCategory !== 'all') {
      list = list.filter(m => m.categorie === userSelectedMaterielCategory);
    }
    if (userSelectedMaterielTypeOffre && userSelectedMaterielTypeOffre !== 'all') {
      list = list.filter(m => m.type_offre === userSelectedMaterielTypeOffre);
    }

    const categoriesList = [
      { key: 'all', label: 'Toutes' },
      { key: 'pompes-forages', label: ' Pompes' },
      { key: 'energie-solaire', label: '️ Solaire' },
      { key: 'irrigation', label: ' Irrigation' },
      { key: 'kits-maraichage', label: ' Kits' },
      { key: 'outils-accessoires', label: ' Outils' },
      { key: 'intrants', label: ' Intrants' },
      { key: 'services', label: '️ Services' }
    ];

    return `
      <div style="margin-bottom: 14px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <h2 style="font-size: 20px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Matériel & Services</h2>
        <p style="font-size: 12px; color: #5B6660; margin: 0;">${list.length} équipement${list.length > 1 ? 's' : ''} et service${list.length > 1 ? 's' : ''} vérifié${list.length > 1 ? 's' : ''}</p>
      </div>

      <!-- Puces de catégories horizontales -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; scrollbar-width: none;">
        ${categoriesList.map(cat => `
          <button type="button" class="mobile-materiel-cat-chip ${userSelectedMaterielCategory === cat.key ? 'active' : ''}" data-cat="${cat.key}" style="
            padding: 6px 12px; border-radius: 99px; font-size: 11.5px; font-weight: 700; border: 1px solid ${userSelectedMaterielCategory === cat.key ? '#1E5E2A' : '#E0E5DC'};
            background: ${userSelectedMaterielCategory === cat.key ? '#1E5E2A' : '#FFF'}; color: ${userSelectedMaterielCategory === cat.key ? '#FFF' : '#4A5750'}; white-space: nowrap; cursor: pointer;
          ">${cat.label}</button>
        `).join('')}
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${list.length === 0 ? `
          <div style="text-align: center; padding: 32px 16px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
            <p style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1E2822;">Aucun matériel disponible</p>
            <p style="font-size: 12px; color: #7C8781; margin: 0;">Sélectionnez « Toutes » pour voir le catalogue complet.</p>
          </div>
        ` : list.map(item => {
          const photos = Array.isArray(item.photos) ? item.photos : [];
          const thumb = photos.length > 0 ? photos[0] : '';
          const catMeta = MATERIEL_CATEGORIES_META[item.categorie] || { label: item.categorie || 'Matériel', icon: '' };
          const typeMeta = MATERIEL_TYPES_META[item.type_offre] || { label: item.type_offre || 'Vente', icon: '️' };

          let priceDisplay = 'Prix sur demande';
          if (item.prix_texte && item.prix_texte.trim() !== '') {
            priceDisplay = item.prix_texte;
          } else if (item.prix !== null && item.prix !== undefined && !isNaN(Number(item.prix))) {
            priceDisplay = `${new Intl.NumberFormat('fr-FR').format(Number(item.prix))} F CFA`;
          }

          return `
            <div class="mobile-materiel-card" data-id="${item.id}" style="background: #FFF; border: 1px solid #E6EAE3; border-radius: 12px; padding: 12px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
              <div style="display: flex; gap: 12px;">
                ${thumb ? `
                  <img src="${thumb}" alt="${escapeHtml(item.nom)}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #F0F4EE;">
                ` : `
                  <div style="width: 80px; height: 80px; border-radius: 8px; background: #F0F4EE; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0;">${catMeta.icon}</div>
                `}
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <span style="font-size: 10.5px; font-weight: 700; color: #1E5E2A;">${catMeta.icon} ${typeMeta.label}</span>
                    ${item.badge_certifie ? '<span style="font-size: 9.5px; font-weight: 700; color: #1E5E2A; background: #EAF4E6; padding: 1px 5px; border-radius: 4px;">️ Certifié</span>' : ''}
                  </div>
                  <h4 style="font-size: 13.5px; font-weight: 800; color: #141A15; margin: 2px 0 4px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(item.nom)}</h4>
                  <div style="font-size: 13.5px; font-weight: 800; color: #1E5E2A; font-family: 'JetBrains Mono', monospace;">${priceDisplay}</div>
                  <div style="font-size: 11px; color: #6B776D; margin-top: 2px;"> ${escapeHtml(item.fournisseur_ville || 'Burkina Faso')}</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // HTML pour mobile : Gérer le matériel (Admin)
  function getMobileAdminMaterielsHtml() {
    const pending = cachedMateriels.filter(m => m.statut === 'en_attente');
    const published = cachedMateriels.filter(m => m.statut === 'publie');
    const retired = cachedMateriels.filter(m => m.statut === 'retire');

    let list = cachedMateriels;
    if (adminMaterielActiveStatusTab === 'en_attente') list = pending;
    else if (adminMaterielActiveStatusTab === 'publie') list = published;
    else if (adminMaterielActiveStatusTab === 'retire') list = retired;

    return `
      <div style="margin-bottom: 14px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;">️ Administration</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">Gérer le matériel & services</p>
          </div>
          <button type="button" class="btn-primary" id="btnMobileOpenAddMateriel" style="padding: 8px 12px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer;">+ Ajouter</button>
        </div>
      </div>

      <!-- Onglets statuts admin mobile -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; scrollbar-width: none;">
        <button type="button" class="mobile-admin-mat-tab" data-status="all" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${adminMaterielActiveStatusTab === 'all' ? '#E8ECE5' : '#FFF'}; color: #425247; cursor: pointer; white-space: nowrap;
        ">Tous (${cachedMateriels.length})</button>
        <button type="button" class="mobile-admin-mat-tab" data-status="publie" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${adminMaterielActiveStatusTab === 'publie' ? '#E6F4EA' : '#FFF'}; color: ${adminMaterielActiveStatusTab === 'publie' ? '#137333' : '#425247'}; cursor: pointer; white-space: nowrap;
        ">Publiés (${published.length})</button>
        <button type="button" class="mobile-admin-mat-tab" data-status="en_attente" style="
          padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #DDD;
          background: ${adminMaterielActiveStatusTab === 'en_attente' ? '#FEF3D6' : '#FFF'}; color: ${adminMaterielActiveStatusTab === 'en_attente' ? '#8A4F00' : '#425247'}; cursor: pointer; white-space: nowrap;
        ">En attente (${pending.length})</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${list.length === 0 ? `
          <div style="text-align: center; padding: 24px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
            <p style="font-weight: 700; font-size: 13px; margin: 0; color: #1E2822;">Aucun produit dans cet état</p>
          </div>
        ` : list.map(item => `
          <div class="admin-fin-item status-${item.statut}" style="padding: 12px 14px; background: #FFF; border-radius: 12px;">
            <div class="admin-fin-content">
              <div class="admin-fin-header-row">
                <span class="admin-status-pill ${item.statut}">
                  ${item.statut === 'en_attente' ? '⏳ En attente' : (item.statut === 'publie' ? ' Publié' : ' Retiré')}
                </span>
                <span style="font-size: 11px; color: #1E5E2A; font-weight: 700;">${item.type_offre}</span>
              </div>
              <h4 class="admin-fin-title" style="font-size: 13.5px; margin: 4px 0;">${escapeHtml(item.nom)}</h4>
              <div class="admin-fin-meta-row" style="font-size: 11px; color: #6C7A72;">
                <span>${escapeHtml(item.fournisseur_nom)}</span>
                <span>•</span>
                <span>${escapeHtml(item.fournisseur_ville)}</span>
              </div>
            </div>
            <div class="admin-actions-group" style="margin-top: 8px; display: flex; gap: 6px; width: 100%;">
              <button type="button" class="btn-admin-action btn-admin-edit btn-mobile-mat-edit" data-id="${item.id}" style="flex: 1; justify-content: center;">️ Modifier</button>
              ${item.statut !== 'publie' ? `
                <button type="button" class="btn-admin-action btn-admin-publish btn-mobile-mat-publish" data-id="${item.id}" style="flex: 1; justify-content: center;"> Publier</button>
              ` : ''}
              ${item.statut !== 'retire' ? `
                <button type="button" class="btn-admin-action btn-admin-archive btn-mobile-mat-withdraw" data-id="${item.id}" style="flex: 1; justify-content: center;"> Retirer</button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Écouteurs d'événements pour le matériel
  const btnOpenAddMaterielModal = document.getElementById('btnOpenAddMaterielModal');
  if (btnOpenAddMaterielModal) {
    btnOpenAddMaterielModal.addEventListener('click', () => openManageMaterielModal());
  }

  const btnCloseManageMateriel = document.getElementById('btnCloseManageMateriel');
  if (btnCloseManageMateriel) {
    btnCloseManageMateriel.addEventListener('click', closeManageMaterielModal);
  }

  const btnCancelManageMateriel = document.getElementById('btnCancelManageMateriel');
  if (btnCancelManageMateriel) {
    btnCancelManageMateriel.addEventListener('click', closeManageMaterielModal);
  }

  if (formManageMateriel) {
    formManageMateriel.addEventListener('submit', handleSaveMateriel);
  }

  const btnTriggerMaterielPhoto = document.getElementById('btnTriggerMaterielPhoto');
  const materielPhotoInput = document.getElementById('materielPhotoInput');
  if (btnTriggerMaterielPhoto && materielPhotoInput) {
    btnTriggerMaterielPhoto.addEventListener('click', () => {
      materielPhotoInput.click();
    });
    materielPhotoInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        if (pendingMaterielPhotos.length >= 4) {
          showToast('Limite atteinte', 'Vous pouvez ajouter au maximum 4 photos par produit.');
          break;
        }
        pendingMaterielPhotos.push({
          file: file,
          previewUrl: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(2, 9)
        });
      }
      renderPhotoPreviews();
      materielPhotoInput.value = '';
    });
  }

  const btnCloseMaterielDetails = document.getElementById('btnCloseMaterielDetails');
  if (btnCloseMaterielDetails) {
    btnCloseMaterielDetails.addEventListener('click', closeMaterielDetailsModal);
  }

  const btnCloseMaterielDetailsBottom = document.getElementById('btnCloseMaterielDetailsBottom');
  if (btnCloseMaterielDetailsBottom) {
    btnCloseMaterielDetailsBottom.addEventListener('click', closeMaterielDetailsModal);
  }

  if (modalMaterielDetails) {
    modalMaterielDetails.addEventListener('click', (e) => {
      if (e.target === modalMaterielDetails) closeMaterielDetailsModal();
    });
  }

  if (modalManageMateriel) {
    modalManageMateriel.addEventListener('click', (e) => {
      if (e.target === modalManageMateriel) closeManageMaterielModal();
    });
  }

  // Écouteurs de saisie pour l'agrandissement dynamique des textareas
  const matDesc = document.getElementById('materielDescription');
  const matCaract = document.getElementById('materielCaracteristiques');
  if (matDesc) {
    matDesc.addEventListener('input', () => autoExpandTextarea(matDesc));
  }
  if (matCaract) {
    matCaract.addEventListener('input', () => autoExpandTextarea(matCaract));
  }

  // Recherche textuelle
  const searchMaterielsInput = document.getElementById('searchMaterielsInput');
  if (searchMaterielsInput) {
    searchMaterielsInput.addEventListener('input', (e) => {
      userMaterielSearchQuery = e.target.value;
      renderUserMateriels();
    });
  }

  // Filtres par catégorie
  const filterCatChips = document.querySelectorAll('#filterMaterielCategoryContainer .type-filter-chip');
  filterCatChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterCatChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      userSelectedMaterielCategory = chip.getAttribute('data-cat') || 'all';
      renderUserMateriels();
    });
  });

  // Filtres par type d'offre
  const filterTypePills = document.querySelectorAll('#filterMaterielTypeOffreContainer .type-offre-pill');
  filterTypePills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterTypePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      userSelectedMaterielTypeOffre = pill.getAttribute('data-type') || 'all';
      renderUserMateriels();
    });
  });

  // Bouton Réinitialiser les filtres
  const btnResetMaterielFilters = document.getElementById('btnResetMaterielFilters');
  if (btnResetMaterielFilters) {
    btnResetMaterielFilters.addEventListener('click', () => {
      userSelectedMaterielCategory = 'all';
      userSelectedMaterielTypeOffre = 'all';
      userMaterielSearchQuery = '';
      if (searchMaterielsInput) searchMaterielsInput.value = '';
      filterCatChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-cat') === 'all'));
      filterTypePills.forEach(p => p.classList.toggle('active', p.getAttribute('data-type') === 'all'));
      renderUserMateriels();
    });
  }

  // Filtres statut Admin
  const adminFilterStatusChips = document.querySelectorAll('#adminFilterMaterielStatus .type-filter-chip');
  adminFilterStatusChips.forEach(chip => {
    chip.addEventListener('click', () => {
      adminFilterStatusChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      adminMaterielActiveStatusTab = chip.getAttribute('data-status') || 'all';
      renderAdminMateriels();
    });
  });

  // Écouteurs délégués pour les événements mobiles de Matériel & Services
  document.addEventListener('click', async (e) => {
    // Clic sur carte mobile de matériel
    const mobMatCard = e.target.closest('.mobile-materiel-card');
    if (mobMatCard) {
      const id = mobMatCard.getAttribute('data-id');
      const item = cachedMateriels.find(m => String(m.id) === String(id));
      if (item) openMaterielDetailsModal(item);
      return;
    }

    // Puce catégorie mobile
    const mobCatChip = e.target.closest('.mobile-materiel-cat-chip');
    if (mobCatChip) {
      userSelectedMaterielCategory = mobCatChip.getAttribute('data-cat') || 'all';
      renderMobileView();
      return;
    }

    // Bouton mobile ajouter matériel
    if (e.target.closest('#btnMobileOpenAddMateriel')) {
      openManageMaterielModal();
      return;
    }

    // Onglet statut admin mobile
    const mobAdminTab = e.target.closest('.mobile-admin-mat-tab');
    if (mobAdminTab) {
      adminMaterielActiveStatusTab = mobAdminTab.getAttribute('data-status') || 'all';
      renderMobileView();
      return;
    }

    // Bouton modifier fiche admin mobile
    const mobEditBtn = e.target.closest('.btn-mobile-mat-edit');
    if (mobEditBtn) {
      const id = mobEditBtn.getAttribute('data-id');
      const item = cachedMateriels.find(m => String(m.id) === String(id));
      if (item) openManageMaterielModal(item);
      return;
    }

    // Bouton publier fiche admin mobile
    const mobPubBtn = e.target.closest('.btn-mobile-mat-publish');
    if (mobPubBtn) {
      const id = mobPubBtn.getAttribute('data-id');
      await updateMaterielStatus(id, 'publie');
      return;
    }

  });

  // ==========================================
  // MODULE MARCHÉ AGRICOLE, MES ANNONCES & MODÉRATION (SUPABASE CONNECTÉ)
  // ==========================================

  const ANNONCES_CATEGORIES_META = {
    'cereales': { label: 'Céréales', icon: '' },
    'legumes': { label: 'Légumes & Maraîchage', icon: '' },
    'fruits': { label: 'Fruits', icon: '' },
    'oleagineux': { label: 'Oléagineux', icon: '' },
    'betail-volaille': { label: 'Bétail & Volaille', icon: '' },
    'autres': { label: 'Autres produits', icon: '' }
  };

  function formatAnnonceRelativeDate(dateStr) {
    if (!dateStr) return 'Récemment';
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return 'À l\'instant';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function formatAnnonceExpiryInfo(dateExpStr, statut) {
    if (statut === 'vendue') return 'Vendue';
    if (statut === 'retiree par la modération') return 'Retirée par la modération';
    if (!dateExpStr) return 'Active';
    const exp = new Date(dateExpStr);
    const now = new Date();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0 || statut === 'expiree') return 'Expirée';
    if (diffDays === 1) return 'Expire demain';
    return `Expire dans ${diffDays} jours`;
  }

  function cleanBurkinaPhone(raw) {
    if (!raw) return '';
    let digits = String(raw).replace(/[^0-9]/g, '');
    if (digits.startsWith('226') && digits.length >= 11) {
      return digits;
    }
    if (digits.length === 8) {
      return '226' + digits;
    }
    return digits;
  }

  // Téléversement d'une photo d'annonce vers le Storage Supabase 'annonces'
  async function uploadAnnoncePhoto(fileBlob, mimeType, extension) {
    if (!supabaseClient) throw new Error('Supabase non disponible');
    const authSession = (await supabaseClient.auth.getSession())?.data?.session;
    const userId = authSession?.user?.id || currentProfileKey;
    if (!userId) {
      throw new Error('Vous devez être connecté pour téléverser une photo.');
    }
    const ext = extension || 'jpg';
    const cleanMime = mimeType || 'image/jpeg';
    const fileName = `${userId}/annonce_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error } = await supabaseClient
      .storage
      .from('annonces')
      .upload(fileName, fileBlob, {
        contentType: cleanMime,
        upsert: true
      });

    if (error) {
      throw new Error(error.message || 'Échec du téléversement de la photo');
    }

    const { data: publicUrlData } = supabaseClient
      .storage
      .from('annonces')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  // Récupération des annonces réelles depuis Supabase
  async function fetchAnnonces() {
    if (!supabaseClient) return;
    try {
      const { data, error } = await supabaseClient
        .from('annonces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('️ Erreur fetchAnnonces Supabase :', error);
        return;
      }

      cachedAnnonces = data || [];
      updateAnnoncesCounters();
      renderMarchePage();
      renderMesAnnoncesPage();
      if (currentRoutePage === 'admin-queue' || currentRoutePage === 'admin-moderation') {
        renderAdminQueuePage();
      }
      if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
        renderMobileView();
      }
    } catch (err) {
      console.warn('️ Erreur fetchAnnonces :', err);
    }
  }

  // Récupération des signalements pour les administrateurs
  async function fetchSignalements() {
    if (!supabaseClient) return;
    const profile = PROFILES_DATA[currentProfileKey];
    if (!profile?.isAdmin) return;

    try {
      const { data, error } = await supabaseClient
        .from('signalements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('️ Erreur fetchSignalements Supabase :', error);
        return;
      }

      cachedSignalements = data || [];
      updateSignalementsCounters();
      if (currentRoutePage === 'admin-queue' || currentRoutePage === 'admin-moderation') {
        renderAdminQueuePage();
      }
    } catch (err) {
      console.warn('️ Erreur fetchSignalements :', err);
    }
  }

  // Mise à jour de tous les compteurs d'annonces
  function updateAnnoncesCounters() {
    const activeAds = cachedAnnonces.filter(a => a.statut === 'active');
    const venteAds = activeAds.filter(a => a.type === 'vente');
    const achatAds = activeAds.filter(a => a.type === 'achat');

    const cntVenteEl = document.getElementById('countMarcheVente');
    const cntAchatEl = document.getElementById('countMarcheAchat');
    if (cntVenteEl) cntVenteEl.textContent = venteAds.length;
    if (cntAchatEl) cntAchatEl.textContent = achatAds.length;

    const navMarcheBadge = document.getElementById('navMarcheBadge');
    if (navMarcheBadge) {
      navMarcheBadge.textContent = activeAds.length;
      navMarcheBadge.classList.toggle('hidden', activeAds.length === 0);
    }

    const drawerMarcheBadge = document.getElementById('mobileDrawerMarcheBadge');
    if (drawerMarcheBadge) {
      drawerMarcheBadge.textContent = activeAds.length;
      drawerMarcheBadge.classList.toggle('hidden', activeAds.length === 0);
    }

    // Mes annonces
    const myAds = cachedAnnonces.filter(a => String(a.profile_id) === String(currentProfileKey));
    const myActiveAds = myAds.filter(a => a.statut === 'active');

    const navMesBadge = document.getElementById('navMesAnnoncesBadge');
    if (navMesBadge) {
      navMesBadge.textContent = myActiveAds.length;
      navMesBadge.classList.toggle('hidden', myActiveAds.length === 0);
    }

    const drawerMesBadge = document.getElementById('mobileDrawerMesAnnoncesBadge');
    if (drawerMesBadge) {
      drawerMesBadge.textContent = myActiveAds.length;
      drawerMesBadge.classList.toggle('hidden', myActiveAds.length === 0);
    }

    const countMesEl = document.getElementById('countMesAnnoncesTotal');
    if (countMesEl) {
      countMesEl.textContent = `${myAds.length} annonce${myAds.length > 1 ? 's' : ''}`;
    }
  }

  // Mise à jour des compteurs de signalement modération
  function updateSignalementsCounters() {
    const pending = cachedSignalements.filter(s => s.statut === 'en_attente');
    const badge = document.getElementById('navAdminQueueBadge');
    if (badge) {
      badge.textContent = pending.length;
      badge.classList.toggle('hidden', pending.length === 0);
    }
    const drawerBadge = document.getElementById('mobileDrawerAdminQueueBadge');
    if (drawerBadge) {
      drawerBadge.textContent = pending.length;
      drawerBadge.classList.toggle('hidden', pending.length === 0);
    }
    const countQueueEl = document.getElementById('countAdminQueuePending');
    if (countQueueEl) {
      countQueueEl.textContent = pending.length;
    }
  }

  // Rendu de la page Marché agricole (Desktop)
  function renderMarchePage() {
    const grid = document.getElementById('annoncesCardsGrid');
    const emptyState = document.getElementById('annoncesEmptyState');
    if (!grid) return;

    let list = cachedAnnonces.filter(a => a.statut === 'active');

    // Filtre vente / achat
    list = list.filter(a => a.type === marcheActiveType);

    // Filtre catégorie
    if (marcheSelectedCategory && marcheSelectedCategory !== 'all') {
      list = list.filter(a => a.categorie === marcheSelectedCategory);
    }

    // Filtre région
    if (marcheSelectedRegion && marcheSelectedRegion !== 'all') {
      list = list.filter(a => a.region === marcheSelectedRegion);
    }

    // Recherche textuelle
    if (marcheSearchQuery && marcheSearchQuery.trim() !== '') {
      const q = marcheSearchQuery.toLowerCase().trim();
      list = list.filter(a => {
        const prod = (a.produit || '').toLowerCase();
        const desc = (a.description || '').toLowerCase();
        const com = (a.commune || '').toLowerCase();
        const reg = (a.region || '').toLowerCase();
        return prod.includes(q) || desc.includes(q) || com.includes(q) || reg.includes(q);
      });
    }

    if (list.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = list.map(item => {
      const catMeta = ANNONCES_CATEGORIES_META[item.categorie] || { label: item.categorie || 'Autre', icon: '' };
      const photos = Array.isArray(item.photos) ? item.photos : [];
      const mainPhoto = photos.length > 0 ? photos[0] : '';

      let priceDisplay = 'Prix à discuter';
      if (item.prix !== null && item.prix !== undefined && !isNaN(Number(item.prix)) && Number(item.prix) > 0) {
        priceDisplay = `${new Intl.NumberFormat('fr-FR').format(Number(item.prix))} F CFA`;
        if (item.prix_unite) {
          priceDisplay += ` <small style="font-size: 11.5px; font-weight: 600; color: #556358;">/${escapeHtml(item.prix_unite)}</small>`;
        }
      }

      return `
        <div class="annonce-card" data-id="${item.id}">
          <div class="annonce-card-img-wrap">
            ${mainPhoto ? `
              <img src="${mainPhoto}" alt="${escapeHtml(item.produit)}" class="annonce-card-img" loading="lazy">
            ` : `
              <div class="annonce-placeholder-icon">${catMeta.icon}</div>
            `}
            <span class="annonce-card-type-badge ${item.type === 'vente' ? 'annonce-type-vente' : 'annonce-type-achat'}">
              ${item.type === 'vente' ? ' Vente' : ' Recherche'}
            </span>
            <span class="annonce-card-cat-pill">${catMeta.icon} ${catMeta.label}</span>
            ${photos.length > 1 ? `
              <span class="annonce-card-photos-count"> ${photos.length}</span>
            ` : ''}
          </div>
          <div class="annonce-card-body">
            <h3 class="annonce-card-title">${escapeHtml(item.produit)}</h3>
            <div class="annonce-card-price-row">
              <span class="annonce-card-price">${priceDisplay}</span>
              ${item.prix_negociable ? '<span class="annonce-card-nego-tag">Négociable</span>' : ''}
            </div>
            <div class="annonce-card-qty-row">
              <span> Quantité :</span>
              <strong>${item.quantite} ${escapeHtml(item.unite || '')}</strong>
            </div>
            <div class="annonce-card-footer">
              <span class="annonce-card-location"> ${escapeHtml(item.commune || 'Burkina Faso')} (${escapeHtml(item.region || '')})</span>
              <span>${formatAnnonceRelativeDate(item.created_at)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.annonce-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = cachedAnnonces.find(a => String(a.id) === String(id));
        if (item) openAnnonceDetailsModal(item);
      });
    });
  }

  // Rendu de la page Mes annonces (Desktop)
  function renderMesAnnoncesPage() {
    const listContainer = document.getElementById('mesAnnoncesList');
    const emptyState = document.getElementById('mesAnnoncesEmptyState');
    if (!listContainer) return;

    const myAds = cachedAnnonces.filter(a => String(a.profile_id) === String(currentProfileKey));

    if (myAds.length === 0) {
      listContainer.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    listContainer.innerHTML = myAds.map(item => {
      const catMeta = ANNONCES_CATEGORIES_META[item.categorie] || { label: item.categorie || 'Autre', icon: '' };
      const photos = Array.isArray(item.photos) ? item.photos : [];
      const thumb = photos.length > 0 ? photos[0] : '';

      let priceDisplay = 'Prix à discuter';
      if (item.prix !== null && item.prix !== undefined && !isNaN(Number(item.prix)) && Number(item.prix) > 0) {
        priceDisplay = `${new Intl.NumberFormat('fr-FR').format(Number(item.prix))} F CFA`;
      }

      let statusBadgeClass = 'status-active';
      let statusLabel = 'Active';
      if (item.statut === 'vendue') {
        statusBadgeClass = 'status-vendue';
        statusLabel = 'Vendue';
      } else if (item.statut === 'expiree') {
        statusBadgeClass = 'status-expiree';
        statusLabel = 'Expirée';
      } else if (item.statut === 'retiree par la modération') {
        statusBadgeClass = 'status-retiree';
        statusLabel = 'Retirée modération';
      }

      return `
        <div class="mes-annonce-card" data-id="${item.id}">
          ${thumb ? `
            <img src="${thumb}" alt="${escapeHtml(item.produit)}" class="mes-annonce-thumb">
          ` : `
            <div class="mes-annonce-thumb">${catMeta.icon}</div>
          `}
          <div class="mes-annonce-info">
            <div class="mes-annonce-title-row">
              <span class="status-badge ${statusBadgeClass}">${statusLabel}</span>
              <span style="font-size: 11.5px; font-weight: 700; color: #1E5E2A;">${item.type === 'vente' ? ' Vente' : ' Recherche'}</span>
              <h4 class="mes-annonce-title">${escapeHtml(item.produit)}</h4>
            </div>
            <div class="mes-annonce-meta">
              <span><strong>${item.quantite} ${escapeHtml(item.unite || '')}</strong></span>
              <span>•</span>
              <span style="color: var(--primary-700); font-weight: 700;">${priceDisplay}</span>
              <span>•</span>
              <span> ${escapeHtml(item.commune || '')} (${escapeHtml(item.region || '')})</span>
              <span>•</span>
              <span style="font-style: italic;">${formatAnnonceExpiryInfo(item.date_expiration, item.statut)}</span>
            </div>
          </div>
          <div class="mes-annonce-actions">
            <button type="button" class="btn-secondary btn-mes-edit" data-id="${item.id}" style="padding: 6px 12px; font-size: 12px;">️ Modifier</button>
            ${item.statut === 'active' ? `
              <button type="button" class="btn-secondary btn-mes-sold" data-id="${item.id}" style="padding: 6px 12px; font-size: 12px; color: #5B21B6; border-color: #DDD6FE;"> Marquer vendue</button>
            ` : ''}
            ${item.statut === 'expiree' || item.statut === 'vendue' ? `
              <button type="button" class="btn-primary btn-mes-renew" data-id="${item.id}" style="padding: 6px 12px; font-size: 12px;"> Renouveler (30j)</button>
            ` : ''}
            <button type="button" class="btn-secondary btn-mes-del" data-id="${item.id}" style="padding: 6px 10px; font-size: 12px; color: #C53030; border-color: #F8D7DA;" title="Supprimer définitivement">️</button>
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.btn-mes-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cachedAnnonces.find(a => String(a.id) === String(id));
        if (item) openPublishAnnonceModal(item);
      });
    });

    listContainer.querySelectorAll('.btn-mes-sold').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await handleMarkAnnonceSold(id);
      });
    });

    listContainer.querySelectorAll('.btn-mes-renew').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await handleRenewAnnonce(id);
      });
    });

    listContainer.querySelectorAll('.btn-mes-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await handleDeleteAnnonce(id);
      });
    });
  }

  // Rendu de la page Files de modération (Administration)
  function renderAdminQueuePage() {
    const listContainer = document.getElementById('adminQueueList');
    const emptyState = document.getElementById('adminQueueEmptyState');
    if (!listContainer) return;

    let list = cachedSignalements;
    if (adminQueueActiveStatusTab === 'en_attente') {
      list = list.filter(s => s.statut === 'en_attente');
    } else if (adminQueueActiveStatusTab === 'traite') {
      list = list.filter(s => s.statut === 'traite' || s.statut === 'ignore');
    }

    if (list.length === 0) {
      listContainer.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    listContainer.innerHTML = list.map(sig => {
      const annonce = cachedAnnonces.find(a => String(a.id) === String(sig.annonce_id));
      const photos = Array.isArray(annonce?.photos) ? annonce.photos : [];
      const thumb = photos.length > 0 ? photos[0] : '';

      return `
        <div class="signalement-card ${sig.statut !== 'en_attente' ? 'status-traite' : ''}" data-id="${sig.id}">
          <div class="signalement-card-header">
            <div>
              <span class="signalement-motif-badge"> Motif : ${escapeHtml(sig.motif || 'Signalement')}</span>
              <span style="font-size: 12px; color: #7C8781; margin-left: 8px;">Reçu ${formatAnnonceRelativeDate(sig.created_at)}</span>
            </div>
            <span class="status-badge ${sig.statut === 'en_attente' ? 'status-retiree' : 'status-active'}">
              ${sig.statut === 'en_attente' ? '⏳ En attente de modération' : (sig.statut === 'traite' ? ' Traité (Annonce retirée)' : 'ℹ️ Signalement ignoré')}
            </span>
          </div>

          ${sig.commentaire ? `
            <div style="background: #FFF8F8; border-left: 3px solid #E19898; padding: 8px 12px; border-radius: 4px; font-size: 13px; color: #6A2424;">
              <strong>Commentaire de l'utilisateur :</strong> ${escapeHtml(sig.commentaire)}
            </div>
          ` : ''}

          <div class="signalement-target-preview">
            ${thumb ? `
              <img src="${thumb}" alt="Aperçu" style="width: 56px; height: 56px; border-radius: 8px; object-fit: cover;">
            ` : `
              <div style="width: 56px; height: 56px; border-radius: 8px; background: #E8ECE6; display: flex; align-items: center; justify-content: center; font-size: 22px;"></div>
            `}
            <div style="flex: 1; min-width: 0;">
              <strong style="font-size: 14px; color: #141A15; display: block;">${escapeHtml(annonce?.produit || 'Annonce supprimée ou introuvable')}</strong>
              <div style="font-size: 12px; color: #556358; margin-top: 2px;">
                ${annonce ? `Quantité : ${annonce.quantite} ${annonce.unite || ''} • Prix : ${annonce.prix ? annonce.prix + ' F CFA' : 'À discuter'} • Localisation : ${annonce.commune || ''} (${annonce.region || ''})` : ''}
              </div>
              <div style="font-size: 11.5px; color: #7C8781; margin-top: 2px;">
                Statut actuel de l'annonce : <strong>${annonce?.statut || 'N/A'}</strong>
              </div>
            </div>
          </div>

          <div class="signalement-actions-bar">
            ${annonce ? `
              <button type="button" class="btn-secondary btn-sig-view" data-ann-id="${annonce.id}" style="padding: 6px 12px; font-size: 12px;">️ Voir l'annonce</button>
            ` : ''}
            ${sig.statut === 'en_attente' ? `
              <button type="button" class="btn-secondary btn-sig-ignore" data-sig-id="${sig.id}" style="padding: 6px 12px; font-size: 12px; color: #556358;">Ignorer le signalement</button>
              <button type="button" class="btn-primary btn-sig-withdraw" data-sig-id="${sig.id}" data-ann-id="${sig.annonce_id}" style="padding: 6px 14px; font-size: 12px; background: #C53030; border-color: #C53030;">
                <span> Retirer l'annonce du marché</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.btn-sig-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const annId = btn.getAttribute('data-ann-id');
        const annonce = cachedAnnonces.find(a => String(a.id) === String(annId));
        if (annonce) openAnnonceDetailsModal(annonce);
      });
    });

    listContainer.querySelectorAll('.btn-sig-ignore').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sigId = btn.getAttribute('data-sig-id');
        await handleAdminIgnorerSignalement(sigId);
      });
    });

    listContainer.querySelectorAll('.btn-sig-withdraw').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sigId = btn.getAttribute('data-sig-id');
        const annId = btn.getAttribute('data-ann-id');
        await handleAdminRetirerAnnonce(sigId, annId);
      });
    });
  }

  // Ouverture de la modale de détails d'une annonce
  function openAnnonceDetailsModal(item) {
    if (!modalAnnonceDetails) return;
    currentDetailAnnonce = item;

    const bType = document.getElementById('annonceDetailTypeBadge');
    const bReg = document.getElementById('annonceDetailRegionBadge');
    const dRel = document.getElementById('annonceDetailDateRel');
    const dProd = document.getElementById('annonceDetailProduit');
    const dPrix = document.getElementById('annonceDetailPrix');
    const dQty = document.getElementById('annonceDetailQuantiteBadge');
    const dDesc = document.getElementById('annonceDetailDescription');
    const dAuteur = document.getElementById('annonceDetailAuteur');
    const dLoc = document.getElementById('annonceDetailLocation');
    const btnWa = document.getElementById('btnAnnonceWhatsapp');
    const btnCall = document.getElementById('btnAnnonceCall');

    if (bType) {
      bType.textContent = item.type === 'vente' ? ' À vendre' : ' On cherche';
      bType.className = `fin-detail-type-badge ${item.type === 'vente' ? 'type-subvention' : 'type-appel'}`;
    }
    if (bReg) bReg.textContent = ` ${item.commune || 'Burkina Faso'} (${item.region || ''})`;
    if (dRel) dRel.textContent = `Publiée ${formatAnnonceRelativeDate(item.created_at)}`;
    if (dProd) dProd.textContent = item.produit || 'Produit agricole';

    let priceDisplay = 'Prix à discuter';
    if (item.prix !== null && item.prix !== undefined && !isNaN(Number(item.prix)) && Number(item.prix) > 0) {
      priceDisplay = `${new Intl.NumberFormat('fr-FR').format(Number(item.prix))} F CFA`;
      if (item.prix_unite) priceDisplay += ` / ${item.prix_unite}`;
      if (item.prix_negociable) priceDisplay += ' (Négociable)';
    }
    if (dPrix) dPrix.textContent = priceDisplay;
    if (dQty) dQty.textContent = `Quantité : ${item.quantite} ${item.unite || ''}`;
    if (dDesc) dDesc.textContent = item.description || 'Aucune description détaillée fournie.';

    // Trouver le profil de l'auteur si disponible
    const authorProfile = PROFILES_DATA[item.profile_id];
    if (dAuteur) dAuteur.textContent = authorProfile?.name || 'Exploitant agricole vérifié';
    if (dLoc) dLoc.textContent = `${item.commune || 'Burkina Faso'} (${item.region || ''})`;

    // WhatsApp et Téléphone
    const cleanPhone = cleanBurkinaPhone(item.whatsapp || authorProfile?.phone || '');
    if (btnWa) {
      const waMessage = `Bonjour, je vous contacte depuis Révolution Agricole au sujet de votre annonce : ${item.produit} (${item.quantite} ${item.unite || ''}) à ${priceDisplay}. Est-ce toujours disponible ?`;
      btnWa.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
    }
    if (btnCall) {
      btnCall.href = `tel:+${cleanPhone}`;
    }

    modalAnnonceDetails.classList.remove('hidden');
  }

  function closeAnnonceDetailsModal() {
    if (modalAnnonceDetails) modalAnnonceDetails.classList.add('hidden');
    currentDetailAnnonce = null;
  }

  // Gestion du formulaire Étape par Étape pour publier une annonce
  function setPublishStep(step) {
    currentPublishStep = step;
    const step1El = document.getElementById('publishStep1');
    const step2El = document.getElementById('publishStep2');
    const item1 = document.getElementById('stepperItem1');
    const item2 = document.getElementById('stepperItem2');
    const line = document.getElementById('stepperLine');
    const subTitle = document.getElementById('publishAnnonceModalSubtitle');

    if (step === 1) {
      if (step1El) step1El.classList.remove('hidden');
      if (step2El) step2El.classList.add('hidden');
      if (item1) item1.classList.add('active');
      if (item2) item2.classList.remove('active');
      if (line) line.classList.remove('active');
      if (subTitle) subTitle.textContent = 'Étape 1 sur 2 : Que proposez-vous ?';
    } else {
      if (step1El) step1El.classList.add('hidden');
      if (step2El) step2El.classList.remove('hidden');
      if (item1) item1.classList.add('active');
      if (item2) item2.classList.add('active');
      if (line) line.classList.add('active');
      if (subTitle) subTitle.textContent = 'Étape 2 sur 2 : Localisation, photos et contact';
    }
  }

  function openPublishAnnonceModal(adToEdit = null) {
    if (!modalPublishAnnonce) return;
    currentEditingAnnonceId = adToEdit ? adToEdit.id : null;
    pendingAnnoncePhotos = [];

    const userProfile = PROFILES_DATA[currentProfileKey] || {};

    const typeInput = document.getElementById('annonceTypeChoice');
    const btnVente = document.getElementById('btnTypeVente');
    const btnAchat = document.getElementById('btnTypeAchat');
    const prodInput = document.getElementById('annonceProduit');
    const catInput = document.getElementById('annonceCategorie');
    const qtyInput = document.getElementById('annonceQuantite');
    const uniteInput = document.getElementById('annonceUnite');
    const prixInput = document.getElementById('annoncePrix');
    const prixUniteInput = document.getElementById('annoncePrixUnite');
    const negoInput = document.getElementById('annoncePrixNegociable');
    const communeInput = document.getElementById('annonceCommune');
    const regionInput = document.getElementById('annonceRegion');
    const descInput = document.getElementById('annonceDescription');
    const waInput = document.getElementById('annonceWhatsapp');
    const modalTitle = document.getElementById('publishAnnonceModalTitle');
    const submitBtnText = document.getElementById('btnSubmitAnnonceText');

    if (adToEdit) {
      if (modalTitle) modalTitle.textContent = 'Modifier l\'annonce';
      if (submitBtnText) submitBtnText.textContent = 'Enregistrer les modifications';
      if (typeInput) typeInput.value = adToEdit.type || 'vente';
      if (btnVente) btnVente.classList.toggle('active', adToEdit.type === 'vente');
      if (btnAchat) btnAchat.classList.toggle('active', adToEdit.type === 'achat');
      if (prodInput) prodInput.value = adToEdit.produit || '';
      if (catInput) catInput.value = adToEdit.categorie || 'legumes';
      if (qtyInput) qtyInput.value = adToEdit.quantite || '';
      if (uniteInput) uniteInput.value = adToEdit.unite || 'sac de 100 kg';
      if (prixInput) prixInput.value = adToEdit.prix || '';
      if (prixUniteInput) prixUniteInput.value = adToEdit.prix_unite || 'par sac';
      if (negoInput) negoInput.checked = !!adToEdit.prix_negociable;
      if (communeInput) communeInput.value = adToEdit.commune || '';
      if (regionInput) regionInput.value = adToEdit.region || 'Centre-Ouest';
      if (descInput) descInput.value = adToEdit.description || '';
      if (waInput) waInput.value = cleanBurkinaPhone(adToEdit.whatsapp || '').replace(/^226/, '');

      if (Array.isArray(adToEdit.photos)) {
        pendingAnnoncePhotos = adToEdit.photos.map(url => ({
          url: url,
          previewUrl: url,
          id: Math.random().toString(36).substring(2, 9)
        }));
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'Publier une annonce';
      if (submitBtnText) submitBtnText.textContent = 'Publier mon annonce';
      if (typeInput) typeInput.value = 'vente';
      if (btnVente) btnVente.classList.add('active');
      if (btnAchat) btnAchat.classList.remove('active');
      if (prodInput) prodInput.value = '';
      if (catInput) catInput.value = 'legumes';
      if (qtyInput) qtyInput.value = '';
      if (uniteInput) uniteInput.value = 'sac de 100 kg';
      if (prixInput) prixInput.value = '';
      if (prixUniteInput) prixUniteInput.value = 'par sac';
      if (negoInput) negoInput.checked = true;

      // Préremplissage localisation et contact depuis le profil connecté
      const locParts = (userProfile.location || '').split('(');
      const userCommune = locParts[0]?.trim() || 'Koudougou';
      const userRegion = locParts[1]?.replace(')', '').trim() || 'Centre-Ouest';

      if (communeInput) communeInput.value = userCommune;
      if (regionInput) regionInput.value = userRegion;
      if (descInput) descInput.value = '';
      if (waInput) {
        const rawPhone = userProfile.phone || '';
        waInput.value = cleanBurkinaPhone(rawPhone).replace(/^226/, '');
      }
    }

    renderAnnoncePhotoPreviews();
    setPublishStep(1);
    modalPublishAnnonce.classList.remove('hidden');
  }

  function closePublishAnnonceModal() {
    if (modalPublishAnnonce) modalPublishAnnonce.classList.add('hidden');
    pendingAnnoncePhotos = [];
    currentEditingAnnonceId = null;
  }

  function renderAnnoncePhotoPreviews() {
    const container = document.getElementById('annoncePhotoPreviews');
    const note = document.getElementById('annoncePhotoCountNote');
    if (!container) return;

    if (note) {
      note.textContent = `${pendingAnnoncePhotos.length} photo${pendingAnnoncePhotos.length > 1 ? 's' : ''} sélectionnée${pendingAnnoncePhotos.length > 1 ? 's' : ''} (max 3)`;
    }

    container.innerHTML = pendingAnnoncePhotos.map((p, idx) => `
      <div class="annonce-photo-preview-item" data-id="${p.id}">
        <img src="${p.previewUrl}" alt="Photo ${idx + 1}">
        <button type="button" class="annonce-photo-preview-del" data-id="${p.id}" title="Supprimer">&times;</button>
      </div>
    `).join('');

    container.querySelectorAll('.annonce-photo-preview-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        pendingAnnoncePhotos = pendingAnnoncePhotos.filter(p => p.id !== id);
        renderAnnoncePhotoPreviews();
      });
    });
  }

  // Soumission de publication d'annonce dans Supabase
  async function handleSaveAnnonce(e) {
    e.preventDefault();
    if (!supabaseClient) {
      showToast('️ Erreur', 'Connexion Supabase non disponible.');
      return;
    }

    const type = document.getElementById('annonceTypeChoice')?.value || 'vente';
    const produit = (document.getElementById('annonceProduit')?.value || '').trim();
    const categorie = document.getElementById('annonceCategorie')?.value || 'autres';
    const quantite = parseFloat(document.getElementById('annonceQuantite')?.value || '0');
    const unite = document.getElementById('annonceUnite')?.value || 'kg';
    const prixRaw = document.getElementById('annoncePrix')?.value;
    const prix = (prixRaw && prixRaw.trim() !== '') ? parseFloat(prixRaw) : null;
    const prix_unite = document.getElementById('annoncePrixUnite')?.value || 'par sac';
    const prix_negociable = !!document.getElementById('annoncePrixNegociable')?.checked;
    const commune = (document.getElementById('annonceCommune')?.value || '').trim();
    const region = document.getElementById('annonceRegion')?.value || 'Centre-Ouest';
    const description = (document.getElementById('annonceDescription')?.value || '').trim();
    const whatsapp = cleanBurkinaPhone(document.getElementById('annonceWhatsapp')?.value || '');

    if (!produit || isNaN(quantite) || quantite <= 0 || !commune || !whatsapp) {
      showToast('Champs obligatoires', 'Veuillez remplir le produit, la quantité, la commune et votre WhatsApp.');
      return;
    }

    const submitBtn = document.getElementById('btnSubmitAnnonce');
    const submitBtnText = document.getElementById('btnSubmitAnnonceText');
    const prevText = submitBtnText ? submitBtnText.textContent : 'Publier';

    try {
      if (submitBtn) submitBtn.disabled = true;
      if (submitBtnText) submitBtnText.textContent = 'Envoi des photos…';

      // Téléversement des photos vers le Storage 'annonces'
      const finalPhotoUrls = [];
      for (const item of pendingAnnoncePhotos) {
        if (item.url) {
          finalPhotoUrls.push(item.url);
        } else if (item.file) {
          const file = item.file;
          const fileName = (file.name || '').toLowerCase();
          const fileType = (file.type || '').toLowerCase();
          const isGif = fileType === 'image/gif' || fileName.endsWith('.gif');
          const isWebp = fileType === 'image/webp' || fileName.endsWith('.webp');

          if (isGif) {
            const url = await uploadAnnoncePhoto(file, 'image/gif', 'gif');
            finalPhotoUrls.push(url);
          } else if (isWebp) {
            const url = await uploadAnnoncePhoto(file, 'image/webp', 'webp');
            finalPhotoUrls.push(url);
          } else {
            // Photos normales JPG/PNG
            const url = await uploadAnnoncePhoto(file, fileType || 'image/jpeg', fileName.split('.').pop() || 'jpg');
            finalPhotoUrls.push(url);
          }
        }
      }

      if (submitBtnText) submitBtnText.textContent = 'Enregistrement…';

      const payload = {
        profile_id: currentProfileKey,
        type: type,
        produit: produit,
        categorie: categorie,
        quantite: quantite,
        unite: unite,
        prix: prix,
        prix_unite: prix_unite,
        prix_negociable: prix_negociable,
        commune: commune,
        region: region,
        description: description,
        photos: finalPhotoUrls,
        whatsapp: whatsapp,
        statut: 'active',
        date_expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      if (currentEditingAnnonceId) {
        // Mise à jour
        const { error } = await supabaseClient
          .from('annonces')
          .update(payload)
          .eq('id', currentEditingAnnonceId);

        if (error) throw error;
        showToast('Annonce mise à jour', `Votre annonce pour « ${produit} » a été modifiée avec succès.`);
      } else {
        // Nouvelle insertion
        const { error } = await supabaseClient
          .from('annonces')
          .insert([payload]);

        if (error) throw error;
        showToast('Annonce publiée ! ', `Votre annonce pour « ${produit} » est maintenant visible sur le Marché.`);
      }

      closePublishAnnonceModal();
      await fetchAnnonces();
    } catch (err) {
      console.error('Erreur handleSaveAnnonce :', err);
      showToast('Erreur', `Impossible d'enregistrer l'annonce : ${err.message || err}`);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitBtnText) submitBtnText.textContent = prevText;
    }
  }

  // Marquer une annonce comme vendue
  async function handleMarkAnnonceSold(id) {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('annonces')
        .update({ statut: 'vendue', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      showToast('Félicitations ! ', 'Votre annonce a été marquée comme vendue.');
      await fetchAnnonces();
    } catch (err) {
      showToast('Erreur', err.message || 'Impossible de mettre à jour le statut.');
    }
  }

  // Renouveler une annonce pour 30 jours
  async function handleRenewAnnonce(id) {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('annonces')
        .update({
          statut: 'active',
          date_expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      showToast('Annonce renouvelée ! ', 'Votre annonce est réactivée pour 30 jours supplémentaires.');
      await fetchAnnonces();
    } catch (err) {
      showToast('Erreur', err.message || 'Impossible de renouveler l\'annonce.');
    }
  }

  // Supprimer définitivement une annonce
  async function handleDeleteAnnonce(id) {
    if (!supabaseClient) return;
    if (!confirm('Voulez-vous vraiment supprimer définitivement cette annonce ? Cette action est irréversible.')) return;

    try {
      const { error } = await supabaseClient
        .from('annonces')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Annonce supprimée', 'L\'annonce a été retirée définitivement.');
      await fetchAnnonces();
    } catch (err) {
      showToast('Erreur', err.message || 'Impossible de supprimer l\'annonce.');
    }
  }

  // Modale de signalement
  function openSignalerAnnonceModal(annonce) {
    if (!modalSignalerAnnonce || !annonce) return;
    const idInput = document.getElementById('signalementAnnonceId');
    if (idInput) idInput.value = annonce.id;
    const commentInput = document.getElementById('signalementCommentaire');
    if (commentInput) commentInput.value = '';
    modalSignalerAnnonce.classList.remove('hidden');
  }

  function closeSignalerAnnonceModal() {
    if (modalSignalerAnnonce) modalSignalerAnnonce.classList.add('hidden');
  }

  async function handleSignalerAnnonce(e) {
    e.preventDefault();
    if (!supabaseClient) return;

    const annId = document.getElementById('signalementAnnonceId')?.value;
    const motifEl = document.querySelector('input[name="motifSignalement"]:checked');
    const motif = motifEl ? motifEl.value : 'autre';
    const commentaire = (document.getElementById('signalementCommentaire')?.value || '').trim();

    if (!annId) {
      showToast('Erreur', 'Identifiant d\'annonce manquant.');
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('signalements')
        .insert([{
          annonce_id: annId,
          profile_id: currentProfileKey,
          signaleur_id: currentProfileKey,
          motif: motif,
          commentaire: commentaire,
          statut: 'en_attente',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      showToast('Signalement envoyé ️', 'Merci pour votre vigilance. Notre équipe modère les annonces sous 24h.');
      closeSignalerAnnonceModal();
      closeAnnonceDetailsModal();
      await fetchSignalements();
    } catch (err) {
      showToast('Erreur', err.message || 'Impossible d\'envoyer le signalement.');
    }
  }

  // Modération administrative : retirer une annonce
  async function handleAdminRetirerAnnonce(sigId, annId) {
    if (!supabaseClient) return;
    if (!confirm('Confirmez-vous le retrait immédiat de cette annonce du marché public ?')) return;

    try {
      if (annId) {
        await supabaseClient
          .from('annonces')
          .update({ statut: 'retiree par la modération', updated_at: new Date().toISOString() })
          .eq('id', annId);
      }

      if (sigId) {
        await supabaseClient
          .from('signalements')
          .update({ statut: 'traite' })
          .eq('id', sigId);
      }

      showToast('Annonce retirée', 'L\'annonce a été immédiatement retirée du marché et le signalement est marqué traité.');
      await fetchAnnonces();
      await fetchSignalements();
    } catch (err) {
      showToast('Erreur', err.message || 'Erreur lors du retrait de l\'annonce.');
    }
  }

  // Modération administrative : ignorer un signalement non fondé
  async function handleAdminIgnorerSignalement(sigId) {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('signalements')
        .update({ statut: 'ignore' })
        .eq('id', sigId);

      if (error) throw error;
      showToast('Signalement classé', 'Le signalement a été classé sans suite.');
      await fetchSignalements();
    } catch (err) {
      showToast('Erreur', err.message || 'Erreur lors du traitement du signalement.');
    }
  }

  // HTML Mobile pour le Marché Agricole
  function getMobileMarcheHtml() {
    let list = cachedAnnonces.filter(a => a.statut === 'active');
    list = list.filter(a => a.type === marcheActiveType);
    if (marcheSelectedCategory && marcheSelectedCategory !== 'all') {
      list = list.filter(a => a.categorie === marcheSelectedCategory);
    }

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Marché Agricole</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">Achetez et vendez en direct bord champ</p>
          </div>
          <button type="button" class="btn-primary" id="btnMobileOpenPublishAnnonce" style="padding: 8px 12px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer;">+ Publier</button>
        </div>
      </div>

      <!-- Onglets Vente vs Achat Mobile -->
      <div class="marche-tabs-container">
        <button type="button" class="marche-main-tab ${marcheActiveType === 'vente' ? 'active' : ''}" id="btnMobileTabVente">
          <span> À vendre</span>
          <span class="marche-tab-count">${cachedAnnonces.filter(a => a.statut === 'active' && a.type === 'vente').length}</span>
        </button>
        <button type="button" class="marche-main-tab ${marcheActiveType === 'achat' ? 'active' : ''}" id="btnMobileTabAchat">
          <span> On cherche</span>
          <span class="marche-tab-count">${cachedAnnonces.filter(a => a.statut === 'active' && a.type === 'achat').length}</span>
        </button>
      </div>

      <!-- Liste des cartes mobile -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
        ${list.length === 0 ? `
          <div style="text-align: center; padding: 24px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
            <p style="font-weight: 700; font-size: 13px; margin: 0; color: #1E2822;">Aucune annonce trouvée</p>
          </div>
        ` : list.map(item => {
          const catMeta = ANNONCES_CATEGORIES_META[item.categorie] || { label: item.categorie || 'Autre', icon: '' };
          const photos = Array.isArray(item.photos) ? item.photos : [];
          const thumb = photos.length > 0 ? photos[0] : '';

          let priceDisplay = 'Prix à discuter';
          if (item.prix !== null && item.prix !== undefined && !isNaN(Number(item.prix)) && Number(item.prix) > 0) {
            priceDisplay = `${new Intl.NumberFormat('fr-FR').format(Number(item.prix))} F CFA`;
          }

          return `
            <div class="mobile-annonce-card" data-id="${item.id}" style="background: #FFF; border: 1px solid #E6EAE3; border-radius: 12px; padding: 12px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
              <div style="display: flex; gap: 12px;">
                ${thumb ? `
                  <img src="${thumb}" alt="${escapeHtml(item.produit)}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #F0F4EE;">
                ` : `
                  <div style="width: 80px; height: 80px; border-radius: 8px; background: #F0F4EE; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0;">${catMeta.icon}</div>
                `}
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <span style="font-size: 10.5px; font-weight: 700; color: #1E5E2A;">${catMeta.icon} ${catMeta.label}</span>
                    <span style="font-size: 10.5px; color: #7C8781;">${formatAnnonceRelativeDate(item.created_at)}</span>
                  </div>
                  <h4 style="font-size: 14px; font-weight: 800; color: #141A15; margin: 2px 0 4px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(item.produit)}</h4>
                  <div style="font-size: 13.5px; font-weight: 800; color: #1E5E2A; font-family: 'JetBrains Mono', monospace;">${priceDisplay}</div>
                  <div style="font-size: 11px; color: #556358; margin-top: 2px;"> ${item.quantite} ${escapeHtml(item.unite || '')} •  ${escapeHtml(item.commune || '')}</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // HTML Mobile pour Mes Annonces
  function getMobileMesAnnoncesHtml() {
    const myAds = cachedAnnonces.filter(a => String(a.profile_id) === String(currentProfileKey));

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;"> Mes Annonces</h2>
            <p style="font-size: 11.5px; color: #5B6660; margin: 0;">Gérez vos récoltes et offres</p>
          </div>
          <button type="button" class="btn-primary" id="btnMobileOpenPublishMesAnnonces" style="padding: 8px 12px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer;">+ Publier</button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${myAds.length === 0 ? `
          <div style="text-align: center; padding: 24px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
            <p style="font-weight: 700; font-size: 13px; margin: 0; color: #1E2822;">Vous n'avez pas encore publié d'annonce</p>
          </div>
        ` : myAds.map(item => `
          <div style="background: #FFF; border: 1px solid #E6EAE3; border-radius: 12px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="status-badge ${item.statut === 'active' ? 'status-active' : (item.statut === 'vendue' ? 'status-vendue' : 'status-expiree')}">${item.statut}</span>
              <span style="font-size: 11px; color: #7C8781;">${formatAnnonceExpiryInfo(item.date_expiration, item.statut)}</span>
            </div>
            <h4 style="font-size: 14.5px; font-weight: 800; color: #141A15; margin: 0 0 4px;">${escapeHtml(item.produit)}</h4>
            <div style="font-size: 12px; color: #556358; margin-bottom: 8px;">
              ${item.quantite} ${escapeHtml(item.unite || '')} • ${item.prix ? item.prix + ' F CFA' : 'À discuter'}
            </div>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-secondary btn-mobile-edit-ad" data-id="${item.id}" style="flex: 1; padding: 6px; font-size: 11px; justify-content: center;">️ Modifier</button>
              ${item.statut === 'active' ? `
                <button type="button" class="btn-secondary btn-mobile-sold-ad" data-id="${item.id}" style="flex: 1; padding: 6px; font-size: 11px; justify-content: center; color: #5B21B6;"> Vendue</button>
              ` : ''}
              ${item.statut !== 'active' ? `
                <button type="button" class="btn-primary btn-mobile-renew-ad" data-id="${item.id}" style="flex: 1; padding: 6px; font-size: 11px; justify-content: center;"> 30j</button>
              ` : ''}
              <button type="button" class="btn-secondary btn-mobile-del-ad" data-id="${item.id}" style="padding: 6px 10px; font-size: 11px; color: #C53030;">️</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // HTML Mobile pour Files de modération
  function getMobileAdminQueueHtml() {
    let list = cachedSignalements;
    if (adminQueueActiveStatusTab === 'en_attente') {
      list = list.filter(s => s.statut === 'en_attente');
    }

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <h2 style="font-size: 18px; font-weight: 800; color: #1E2822; margin: 0 0 2px;">️ Modération</h2>
        <p style="font-size: 11.5px; color: #5B6660; margin: 0;">Signalements reçus sur le Marché agricole</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${list.length === 0 ? `
          <div style="text-align: center; padding: 24px; background: #FFF; border-radius: 12px; border: 1px dashed #DDD;">
            <p style="font-weight: 700; font-size: 13px; margin: 0; color: #1E2822;">Aucun signalement en attente</p>
          </div>
        ` : list.map(sig => {
          const annonce = cachedAnnonces.find(a => String(a.id) === String(sig.annonce_id));
          return `
            <div style="background: #FFF; border: 1px solid #F5C6CB; border-left: 4px solid #C53030; border-radius: 12px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span class="signalement-motif-badge" style="font-size: 11px;"> ${escapeHtml(sig.motif)}</span>
                <span style="font-size: 10.5px; color: #7C8781;">${formatAnnonceRelativeDate(sig.created_at)}</span>
              </div>
              <strong style="font-size: 13.5px; color: #141A15; display: block; margin: 4px 0;">${escapeHtml(annonce?.produit || 'Annonce')}</strong>
              ${sig.commentaire ? `<p style="font-size: 12px; color: #6A2424; margin: 4px 0 8px;">${escapeHtml(sig.commentaire)}</p>` : ''}
              ${sig.statut === 'en_attente' ? `
                <div style="display: flex; gap: 6px; margin-top: 8px;">
                  <button type="button" class="btn-secondary btn-mobile-sig-ignore" data-sig-id="${sig.id}" style="flex: 1; padding: 6px; font-size: 11px; justify-content: center;">Ignorer</button>
                  <button type="button" class="btn-primary btn-mobile-sig-withdraw" data-sig-id="${sig.id}" data-ann-id="${sig.annonce_id}" style="flex: 2; padding: 6px; font-size: 11px; justify-content: center; background: #C53030; border-color: #C53030;">Retirer</button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ==================== ÉCOUTEURS D'ÉVÉNEMENTS DU MARCHÉ & ANNONCES ====================

  // Onglets Vente vs Achat
  const tabMarcheVente = document.getElementById('tabMarcheVente');
  const tabMarcheAchat = document.getElementById('tabMarcheAchat');
  if (tabMarcheVente && tabMarcheAchat) {
    tabMarcheVente.addEventListener('click', () => {
      marcheActiveType = 'vente';
      tabMarcheVente.classList.add('active');
      tabMarcheAchat.classList.remove('active');
      renderMarchePage();
    });
    tabMarcheAchat.addEventListener('click', () => {
      marcheActiveType = 'achat';
      tabMarcheAchat.classList.add('active');
      tabMarcheVente.classList.remove('active');
      renderMarchePage();
    });
  }

  // Recherche textuelle marché
  const searchAnnoncesInput = document.getElementById('searchAnnoncesInput');
  if (searchAnnoncesInput) {
    searchAnnoncesInput.addEventListener('input', (e) => {
      marcheSearchQuery = e.target.value;
      renderMarchePage();
    });
  }

  // Filtres catégories marché
  const filterAnnoncesChips = document.querySelectorAll('#filterAnnoncesCategoryContainer .type-filter-chip');
  filterAnnoncesChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterAnnoncesChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      marcheSelectedCategory = chip.getAttribute('data-cat') || 'all';
      renderMarchePage();
    });
  });

  // Filtre région marché
  const filterAnnoncesRegionSelect = document.getElementById('filterAnnoncesRegionSelect');
  if (filterAnnoncesRegionSelect) {
    filterAnnoncesRegionSelect.addEventListener('change', (e) => {
      marcheSelectedRegion = e.target.value;
      renderMarchePage();
    });
  }

  // Bouton Réinitialiser filtres marché
  const btnResetAnnoncesFilters = document.getElementById('btnResetAnnoncesFilters');
  if (btnResetAnnoncesFilters) {
    btnResetAnnoncesFilters.addEventListener('click', () => {
      marcheSelectedCategory = 'all';
      marcheSelectedRegion = 'all';
      marcheSearchQuery = '';
      if (searchAnnoncesInput) searchAnnoncesInput.value = '';
      if (filterAnnoncesRegionSelect) filterAnnoncesRegionSelect.value = 'all';
      filterAnnoncesChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-cat') === 'all'));
      renderMarchePage();
    });
  }

  // Bouton Ouvrir modale publication
  const btnOpenPublishAnnonceModal = document.getElementById('btnOpenPublishAnnonceModal');
  if (btnOpenPublishAnnonceModal) {
    btnOpenPublishAnnonceModal.addEventListener('click', () => openPublishAnnonceModal());
  }

  const btnOpenPublishFromEmpty = document.getElementById('btnOpenPublishFromEmpty');
  if (btnOpenPublishFromEmpty) {
    btnOpenPublishFromEmpty.addEventListener('click', () => openPublishAnnonceModal());
  }

  const btnOpenPublishFromMyEmpty = document.getElementById('btnOpenPublishFromMyEmpty');
  if (btnOpenPublishFromMyEmpty) {
    btnOpenPublishFromMyEmpty.addEventListener('click', () => openPublishAnnonceModal());
  }

  const btnClosePublishAnnonce = document.getElementById('btnClosePublishAnnonce');
  if (btnClosePublishAnnonce) {
    btnClosePublishAnnonce.addEventListener('click', closePublishAnnonceModal);
  }

  const btnCancelPublishStep1 = document.getElementById('btnCancelPublishStep1');
  if (btnCancelPublishStep1) {
    btnCancelPublishStep1.addEventListener('click', closePublishAnnonceModal);
  }

  // Stepper : Aller à l'étape 2
  const btnGoToStep2 = document.getElementById('btnGoToStep2');
  if (btnGoToStep2) {
    btnGoToStep2.addEventListener('click', () => {
      const prod = (document.getElementById('annonceProduit')?.value || '').trim();
      const qty = parseFloat(document.getElementById('annonceQuantite')?.value || '0');
      if (!prod) {
        showToast('Nom du produit requis', 'Veuillez saisir ou choisir un produit agricole.');
        document.getElementById('annonceProduit')?.focus();
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        showToast('Quantité requise', 'Veuillez saisir une quantité valide supérieure à 0.');
        document.getElementById('annonceQuantite')?.focus();
        return;
      }
      setPublishStep(2);
    });
  }

  // Stepper : Retourner à l'étape 1
  const btnBackToStep1 = document.getElementById('btnBackToStep1');
  if (btnBackToStep1) {
    btnBackToStep1.addEventListener('click', () => setPublishStep(1));
  }

  // Toggle Je vends / Je cherche
  const btnTypeVente = document.getElementById('btnTypeVente');
  const btnTypeAchat = document.getElementById('btnTypeAchat');
  const typeChoiceInput = document.getElementById('annonceTypeChoice');
  if (btnTypeVente && btnTypeAchat) {
    const setAnnonceTypeAction = (type) => {
      if (typeChoiceInput) typeChoiceInput.value = type;
      btnTypeVente.classList.toggle('active', type === 'vente');
      btnTypeAchat.classList.toggle('active', type === 'achat');
    };
    btnTypeVente.addEventListener('click', () => setAnnonceTypeAction('vente'));
    btnTypeAchat.addEventListener('click', () => setAnnonceTypeAction('achat'));
  }

  // Puces de suggestion rapide de produits
  document.querySelectorAll('#publishStep1 .quick-chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-val');
      const cat = chip.getAttribute('data-cat');
      const prodInput = document.getElementById('annonceProduit');
      const catSelect = document.getElementById('annonceCategorie');
      if (prodInput && val) prodInput.value = val;
      if (catSelect && cat) catSelect.value = cat;
    });
  });

  // Sélection de photos pour l'annonce
  const btnTriggerAnnoncePhoto = document.getElementById('btnTriggerAnnoncePhoto');
  const annoncePhotoInput = document.getElementById('annoncePhotoInput');
  if (btnTriggerAnnoncePhoto && annoncePhotoInput) {
    btnTriggerAnnoncePhoto.addEventListener('click', () => {
      annoncePhotoInput.click();
    });
    annoncePhotoInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        if (pendingAnnoncePhotos.length >= 3) {
          showToast('Limite atteinte', 'Vous pouvez ajouter au maximum 3 photos par annonce.');
          break;
        }
        pendingAnnoncePhotos.push({
          file: file,
          previewUrl: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(2, 9)
        });
      }
      renderAnnoncePhotoPreviews();
      annoncePhotoInput.value = '';
    });
  }

  // Soumission du formulaire de publication
  if (formPublishAnnonce) {
    formPublishAnnonce.addEventListener('submit', handleSaveAnnonce);
  }

  // Modale détails annonce
  const btnCloseAnnonceDetails = document.getElementById('btnCloseAnnonceDetails');
  if (btnCloseAnnonceDetails) {
    btnCloseAnnonceDetails.addEventListener('click', closeAnnonceDetailsModal);
  }

  const btnOpenSignalerAnnonce = document.getElementById('btnOpenSignalerAnnonce');
  if (btnOpenSignalerAnnonce) {
    btnOpenSignalerAnnonce.addEventListener('click', () => {
      if (currentDetailAnnonce) {
        openSignalerAnnonceModal(currentDetailAnnonce);
      }
    });
  }

  // Modale signalement
  const btnCloseSignalerAnnonce = document.getElementById('btnCloseSignalerAnnonce');
  if (btnCloseSignalerAnnonce) {
    btnCloseSignalerAnnonce.addEventListener('click', closeSignalerAnnonceModal);
  }

  const btnCancelSignalement = document.getElementById('btnCancelSignalement');
  if (btnCancelSignalement) {
    btnCancelSignalement.addEventListener('click', closeSignalerAnnonceModal);
  }

  if (formSignalerAnnonce) {
    formSignalerAnnonce.addEventListener('submit', handleSignalerAnnonce);
  }

  // Onglets statut modération admin
  const adminQueueTabs = document.querySelectorAll('.admin-queue-tab-btn');
  adminQueueTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminQueueTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      adminQueueActiveStatusTab = tab.getAttribute('data-status') || 'en_attente';
      renderAdminQueuePage();
    });
  });

  // Écouteurs délégués pour les événements mobiles d'annonces
  document.addEventListener('click', async (e) => {
    // Clic sur carte mobile d'annonce
    const mobAnnCard = e.target.closest('.mobile-annonce-card');
    if (mobAnnCard) {
      const id = mobAnnCard.getAttribute('data-id');
      const item = cachedAnnonces.find(a => String(a.id) === String(id));
      if (item) openAnnonceDetailsModal(item);
      return;
    }

    // Onglets vente/achat mobile
    if (e.target.closest('#btnMobileTabVente')) {
      marcheActiveType = 'vente';
      renderMobileView();
      return;
    }
    if (e.target.closest('#btnMobileTabAchat')) {
      marcheActiveType = 'achat';
      renderMobileView();
      return;
    }

    // Boutons de publication mobiles
    if (e.target.closest('#btnMobileOpenPublishAnnonce') || e.target.closest('#btnMobileOpenPublishMesAnnonces')) {
      openPublishAnnonceModal();
      return;
    }

    // Actions mes annonces mobile
    const mobEditAd = e.target.closest('.btn-mobile-edit-ad');
    if (mobEditAd) {
      const id = mobEditAd.getAttribute('data-id');
      const item = cachedAnnonces.find(a => String(a.id) === String(id));
      if (item) openPublishAnnonceModal(item);
      return;
    }

    const mobSoldAd = e.target.closest('.btn-mobile-sold-ad');
    if (mobSoldAd) {
      const id = mobSoldAd.getAttribute('data-id');
      await handleMarkAnnonceSold(id);
      return;
    }

    const mobRenewAd = e.target.closest('.btn-mobile-renew-ad');
    if (mobRenewAd) {
      const id = mobRenewAd.getAttribute('data-id');
      await handleRenewAnnonce(id);
      return;
    }

    const mobDelAd = e.target.closest('.btn-mobile-del-ad');
    if (mobDelAd) {
      const id = mobDelAd.getAttribute('data-id');
      await handleDeleteAnnonce(id);
      return;
    }

    // Modération mobile
    const mobSigIgnore = e.target.closest('.btn-mobile-sig-ignore');
    if (mobSigIgnore) {
      const id = mobSigIgnore.getAttribute('data-sig-id');
      await handleAdminIgnorerSignalement(id);
      return;
    }

    const mobSigWithdraw = e.target.closest('.btn-mobile-sig-withdraw');
    if (mobSigWithdraw) {
      const sigId = mobSigWithdraw.getAttribute('data-sig-id');
      const annId = mobSigWithdraw.getAttribute('data-ann-id');
      await handleAdminRetirerAnnonce(sigId, annId);
      return;
    }
  });

  // ==========================================
  // MODULE ADMINISTRATION : UTILISATEURS
  // ==========================================
  let cachedAdminUsers = [];
  let adminUsersSearchQuery = '';
  let adminUsersSelectedRegion = 'all';

  function formatAdminDate(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '—';
    }
  }

  function formatAdminDateTime(isoStr) {
    if (!isoStr) return 'Jamais connecté';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return 'Jamais connecté';
      const datePart = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      const timePart = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${datePart} à ${timePart}`;
    } catch (e) {
      return '—';
    }
  }

  function formatAdminRelativeTime(isoStr) {
    if (!isoStr) return 'Jamais';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return 'Jamais';
      const now = new Date();
      const diffSec = Math.floor((now - d) / 1000);
      if (diffSec < 60) return "À l'instant";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `Il y a ${diffDays} j`;
      const diffMonths = Math.floor(diffDays / 30);
      return `Il y a ${diffMonths} mois`;
    } catch (e) {
      return '—';
    }
  }

  function getCleanBurkinaWhatsAppUrl(rawPhone, userName = '') {
    if (!rawPhone) return null;
    const digits = rawPhone.replace(/\D/g, '');
    let fullNumber = digits;
    if (digits.length === 8) {
      fullNumber = '226' + digits;
    } else if (digits.startsWith('00226')) {
      fullNumber = digits.replace(/^00/, '');
    } else if (!digits.startsWith('226') && digits.length > 8) {
      fullNumber = '226' + digits.slice(-8);
    }
    const cleanFirst = userName ? userName.trim().split(' ')[0] : 'Exploitant';
    const msg = encodeURIComponent(`Bonjour ${cleanFirst}, je vous contacte depuis la plateforme Révolution Agricole.`);
    return `https://wa.me/${fullNumber}?text=${msg}`;
  }

  async function fetchAdminUtilisateurs() {
    if (!supabaseClient) return [];
    const isCurAdmin = Boolean(PROFILES_DATA[currentProfileKey]?.isAdmin);
    if (!isCurAdmin) return [];

    try {
      const { data, error } = await supabaseClient.rpc('get_admin_utilisateurs');
      if (error) {
        console.warn('Erreur chargement utilisateurs admin :', error);
        return [];
      }

      cachedAdminUsers = Array.isArray(data) ? data : [];
      updateAdminUsersCounters();
      populateAdminUsersRegions();
      renderAdminUtilisateurs();
      return cachedAdminUsers;
    } catch (err) {
      console.error('Erreur RPC get_admin_utilisateurs :', err);
      return [];
    }
  }

  function updateAdminUsersCounters() {
    const all = cachedAdminUsers || [];
    const now = new Date();

    const is7d = (dStr) => {
      if (!dStr) return false;
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return false;
      return (now - d) <= (7 * 24 * 60 * 60 * 1000) && (now - d) >= 0;
    };

    const total = all.length;
    const new7d = all.filter(u => is7d(u.date_inscription)).length;
    const active7d = all.filter(u => is7d(u.derniere_connexion)).length;
    const paid = all.filter(u => u.is_pro || (u.abo_status === 'active' && u.abo_expires_at && new Date(u.abo_expires_at) > now)).length;

    const elTotal = document.getElementById('adminStatTotalUsers');
    if (elTotal) elTotal.innerHTML = `${total} <small>inscrits</small>`;

    const elNew = document.getElementById('adminStatNewUsersWeek');
    if (elNew) elNew.innerHTML = `${new7d} <small>cette semaine</small>`;

    const elActive = document.getElementById('adminStatActiveUsers7d');
    if (elActive) elActive.innerHTML = `${active7d} <small>actifs</small>`;

    const elPaid = document.getElementById('adminStatPaidUsers');
    if (elPaid) elPaid.innerHTML = `${paid} <small>abonnés Pro</small>`;

    const navBadge = document.getElementById('navAdminUsersBadge');
    if (navBadge) navBadge.textContent = String(total);

    const mobBadge = document.getElementById('mobileDrawerUsersBadge');
    if (mobBadge) mobBadge.textContent = String(total);
  }

  function populateAdminUsersRegions() {
    const select = document.getElementById('adminUsersRegionSelect');
    if (!select) return;

    const currentVal = select.value || 'all';
    const regionsSet = new Set();
    (cachedAdminUsers || []).forEach(u => {
      if (u.location) {
        const match = u.location.match(/\(([^)]+)\)/);
        if (match) regionsSet.add(match[1].trim());
        else regionsSet.add(u.location.trim());
      }
    });

    (cachedRegions || []).forEach(r => {
      if (r.nom) regionsSet.add(r.nom.trim());
    });

    const sortedRegions = Array.from(regionsSet).sort((a, b) => a.localeCompare(b, 'fr'));

    let html = '<option value="all">Toutes les régions</option>';
    sortedRegions.forEach(reg => {
      html += `<option value="${escapeHtml(reg)}" ${currentVal === reg ? 'selected' : ''}>${escapeHtml(reg)}</option>`;
    });

    select.innerHTML = html;
  }

  function renderAdminUtilisateurs() {
    if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
      renderMobileView();
      return;
    }
    renderAdminUtilisateursTable();
  }

  function renderAdminUtilisateursTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    const emptyState = document.getElementById('adminUsersEmptyState');
    const countEl = document.getElementById('adminUsersFilteredCount');
    if (!tbody) return;

    let list = cachedAdminUsers || [];
    const query = (adminUsersSearchQuery || '').toLowerCase().trim();
    const region = adminUsersSelectedRegion || 'all';

    if (query) {
      list = list.filter(u => {
        const name = (u.full_name || '').toLowerCase();
        const phone = (u.phone || '').replace(/\s+/g, '');
        const cleanQ = query.replace(/\s+/g, '');
        return name.includes(query) || phone.includes(cleanQ);
      });
    }

    if (region !== 'all') {
      const regLower = region.toLowerCase();
      list = list.filter(u => {
        const loc = (u.location || '').toLowerCase();
        const vil = (u.villages || '').toLowerCase();
        return loc.includes(regLower) || vil.includes(regLower);
      });
    }

    if (countEl) countEl.textContent = String(list.length);

    if (list.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const now = new Date();

    tbody.innerHTML = list.map(user => {
      const isPaid = Boolean(user.is_pro || (user.abo_status === 'active' && user.abo_expires_at && new Date(user.abo_expires_at) > now));
      const whatsappUrl = getCleanBurkinaWhatsAppUrl(user.phone, user.full_name);

      const roleBadge = user.role === 'buyer' 
        ? '<span style="font-size: 11px; font-weight: 700; background: #EBF8FF; color: #2B6CB0; padding: 2px 7px; border-radius: 999px;">Acheteur</span>'
        : user.role === 'provider' 
        ? '<span style="font-size: 11px; font-weight: 700; background: #FEFCBF; color: #975A16; padding: 2px 7px; border-radius: 999px;">Fournisseur</span>'
        : user.is_admin 
        ? '<span style="font-size: 11px; font-weight: 700; background: #FEEBC8; color: #C05621; padding: 2px 7px; border-radius: 999px;">Admin</span>'
        : '<span style="font-size: 11px; font-weight: 700; background: #E6FFFA; color: #234E52; padding: 2px 7px; border-radius: 999px;">Producteur</span>';

      const culturesHtml = user.cultures 
        ? user.cultures.split(',').map(c => `<span style="display: inline-block; font-size: 11.5px; font-weight: 600; background: var(--bleu-clair, #E6EFF6); color: var(--bleu-principal, #05507E); padding: 2px 8px; border-radius: 6px; margin: 2px;">${escapeHtml(c.trim())}</span>`).join(' ')
        : '<span style="font-size: 12px; color: #A0AEC0; font-style: italic;">Aucune culture</span>';

      const aboBadge = isPaid
        ? `<div style="display: inline-flex; flex-direction: column; gap: 2px;">
            <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 800; background: #FBF1D6; color: #8A6400; padding: 4px 8px; border-radius: 8px;">
              ⭐ Pro (Saison)
            </span>
            ${user.abo_expires_at ? `<span style="font-size: 10.5px; color: #718096;">Fin : ${formatAdminDate(user.abo_expires_at)}</span>` : ''}
          </div>`
        : `<span style="font-size: 12px; font-weight: 700; background: #EDF2F7; color: #4A5568; padding: 4px 8px; border-radius: 8px;">
            Découverte (Gratuit)
          </span>`;

      return `
        <tr style="border-bottom: 1px solid #F0ECE1; transition: background-color 0.15s;">
          <td style="padding: 14px 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--bleu-clair, #E6EFF6); color: var(--bleu-principal, #05507E); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0;">
                ${escapeHtml((user.full_name || 'U').trim().slice(0, 2).toUpperCase())}
              </div>
              <div>
                <strong style="font-size: 14px; color: #1A1A1A; display: block;">${escapeHtml(user.full_name || 'Utilisateur')}</strong>
                ${roleBadge}
              </div>
            </div>
          </td>
          <td style="padding: 14px 12px;">
            <div style="font-size: 13.5px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px;">
              ${escapeHtml(user.phone || 'Non renseigné')}
            </div>
            ${whatsappUrl ? `
              <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 5px; background: #25D366; color: #FFFFFF; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; text-decoration: none; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.585 1.761.884 2.79.884 3.179 0 5.766-2.587 5.767-5.766.002-3.18-2.585-5.77-5.766-5.77zm0 10.455c-.947 0-1.748-.28-2.457-.751l-.176-.118-1.58.414.422-1.54-.12-.191c-.551-.876-.842-1.638-.842-2.503 0-2.584 2.102-4.686 4.687-4.686 2.584 0 4.686 2.102 4.686 4.686 0 2.585-2.102 4.689-4.62 4.689z"/></svg>
                <span>WhatsApp</span>
              </a>
            ` : ''}
          </td>
          <td style="padding: 14px 12px;">
            <div style="font-size: 13.5px; font-weight: 600; color: #1A1A1A;">
              ${escapeHtml(user.location || 'Burkina Faso')}
            </div>
            ${user.villages ? `<div style="font-size: 12px; color: #718096; margin-top: 2px;">Village : ${escapeHtml(user.villages)}</div>` : ''}
          </td>
          <td style="padding: 14px 12px; max-width: 200px;">
            ${culturesHtml}
          </td>
          <td style="padding: 14px 12px;">
            <div style="font-size: 13px; font-weight: 600; color: #1A1A1A;">
              ${formatAdminDate(user.date_inscription)}
            </div>
            <div style="font-size: 11px; color: #718096;">
              ${formatAdminRelativeTime(user.date_inscription)}
            </div>
          </td>
          <td style="padding: 14px 12px;">
            <div style="font-size: 13px; font-weight: 600; color: #1A1A1A;">
              ${user.derniere_connexion ? formatAdminRelativeTime(user.derniere_connexion) : '<span style="color: #A0AEC0;">Jamais</span>'}
            </div>
            ${user.derniere_connexion ? `<div style="font-size: 10.5px; color: #718096;">${formatAdminDateTime(user.derniere_connexion)}</div>` : ''}
          </td>
          <td style="padding: 14px 12px;">
            ${aboBadge}
          </td>
          <td style="padding: 14px 12px; text-align: right;">
            ${isPaid ? `
              <button type="button" class="btn-activate-subscription" data-user-id="${user.id}" data-user-name="${escapeHtml(user.full_name || '')}" data-user-phone="${escapeHtml(user.phone || '')}" style="display: inline-flex; align-items: center; gap: 5px; background: #FAF7F0; color: var(--bleu-principal, #05507E); border: 1.5px solid var(--bleu-principal, #05507E); border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;" title="Prolonger de 6 mois">
                <span>+ Prolonger</span>
              </button>
            ` : `
              <button type="button" class="btn-activate-subscription" data-user-id="${user.id}" data-user-name="${escapeHtml(user.full_name || '')}" data-user-phone="${escapeHtml(user.phone || '')}" style="display: inline-flex; align-items: center; gap: 5px; background: var(--bleu-principal, #05507E); color: #FFFFFF; border: none; border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 1px 3px rgba(5,80,126,0.2); transition: all 0.2s;" title="Activer pour 1 saison (6 mois)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>Activer saison</span>
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  async function handleAdminActiverAbonnement(userId, userName, userPhone) {
    if (!userId) return;
    const isCurAdmin = Boolean(PROFILES_DATA[currentProfileKey]?.isAdmin);
    if (!isCurAdmin) {
      showToast('Accès refusé', 'Seul un administrateur peut activer un abonnement.');
      return;
    }

    const confirmed = window.confirm(`Voulez-vous activer manuellement l'abonnement Pro d'une saison (6 mois) pour ${userName || 'cet exploitant'} (${userPhone || 'sans numéro'}) ?\n\nCette action activera immédiatement le statut Pro et notifiera l'utilisateur.`);
    if (!confirmed) return;

    try {
      showToast('Traitement…', 'Activation de l\'abonnement en cours dans Supabase…');
      const { data, error } = await supabaseClient.rpc('admin_activer_abonnement', {
        p_user_id: userId,
        p_duree_mois: 6
      });

      if (error) {
        showToast('⚠️ Erreur', error.message || 'Impossible d\'activer l\'abonnement.');
        return;
      }

      showToast('⭐ Abonnement Pro activé !', `L'abonnement d'une saison a été validé pour ${userName}.`);
      await fetchAdminUtilisateurs();
    } catch (err) {
      console.error('Erreur activation abonnement admin :', err);
      showToast('⚠️ Erreur', err.message || 'Une erreur inattendue est survenue.');
    }
  }

  function getMobileAdminUtilisateursHtml() {
    const all = cachedAdminUsers || [];
    const now = new Date();

    const is7d = (dStr) => {
      if (!dStr) return false;
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return false;
      return (now - d) <= (7 * 24 * 60 * 60 * 1000) && (now - d) >= 0;
    };

    const total = all.length;
    const new7d = all.filter(u => is7d(u.date_inscription)).length;
    const active7d = all.filter(u => is7d(u.derniere_connexion)).length;
    const paid = all.filter(u => u.is_pro || (u.abo_status === 'active' && u.abo_expires_at && new Date(u.abo_expires_at) > now)).length;

    let list = all;
    const query = (adminUsersSearchQuery || '').toLowerCase().trim();
    const region = adminUsersSelectedRegion || 'all';

    if (query) {
      list = list.filter(u => {
        const name = (u.full_name || '').toLowerCase();
        const phone = (u.phone || '').replace(/\s+/g, '');
        const cleanQ = query.replace(/\s+/g, '');
        return name.includes(query) || phone.includes(cleanQ);
      });
    }

    if (region !== 'all') {
      const regLower = region.toLowerCase();
      list = list.filter(u => {
        const loc = (u.location || '').toLowerCase();
        const vil = (u.villages || '').toLowerCase();
        return loc.includes(regLower) || vil.includes(regLower);
      });
    }

    const regionsSet = new Set();
    all.forEach(u => {
      if (u.location) {
        const match = u.location.match(/\(([^)]+)\)/);
        if (match) regionsSet.add(match[1].trim());
        else regionsSet.add(u.location.trim());
      }
    });
    (cachedRegions || []).forEach(r => { if (r.nom) regionsSet.add(r.nom.trim()); });
    const sortedRegions = Array.from(regionsSet).sort((a, b) => a.localeCompare(b, 'fr'));

    return `
      <div style="margin-bottom: 14px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #1E5E2A; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 19px; font-weight: 800; color: #1A1A1A; margin: 0 0 2px;">👥 Utilisateurs</h2>
            <p style="font-size: 12px; color: #4A4A4A; margin: 0;">Gestion des comptes et abonnements</p>
          </div>
          <button type="button" class="btn-refresh-mobile-users" id="btnRefreshMobileUsers" style="background: var(--bleu-clair, #E6EFF6); color: var(--bleu-principal, #05507E); border: none; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
            🔄 Actualiser
          </button>
        </div>
      </div>

      <!-- 4 Chiffres Mobile en Grille 2x2 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
        <div style="background: #F1F8EE; border: 1px solid #E0EFE0; border-radius: 12px; padding: 12px;">
          <span style="font-size: 11px; font-weight: 600; color: #4A4A4A; text-transform: uppercase;">Total inscrits</span>
          <div style="font-size: 22px; font-weight: 800; color: var(--bleu-principal, #05507E); margin-top: 2px;">${total}</div>
        </div>
        <div style="background: #F0F6FD; border: 1px solid #DEECFA; border-radius: 12px; padding: 12px;">
          <span style="font-size: 11px; font-weight: 600; color: #4A4A4A; text-transform: uppercase;">Nouveaux 7j</span>
          <div style="font-size: 22px; font-weight: 800; color: #2B6CB0; margin-top: 2px;">+${new7d}</div>
        </div>
        <div style="background: #FEF9EB; border: 1px solid #F8EECB; border-radius: 12px; padding: 12px;">
          <span style="font-size: 11px; font-weight: 600; color: #4A4A4A; text-transform: uppercase;">Actifs 7j</span>
          <div style="font-size: 22px; font-weight: 800; color: #B7791F; margin-top: 2px;">${active7d}</div>
        </div>
        <div style="background: #F6F3FD; border: 1px solid #ECE5FA; border-radius: 12px; padding: 12px;">
          <span style="font-size: 11px; font-weight: 600; color: #4A4A4A; text-transform: uppercase;">Abonnés Pro</span>
          <div style="font-size: 22px; font-weight: 800; color: #6B46C1; margin-top: 2px;">⭐ ${paid}</div>
        </div>
      </div>

      <!-- Recherche & Filtre Mobile -->
      <div style="background: #FFF; border: 1px solid #ECE6D9; border-radius: 14px; padding: 12px; margin-bottom: 14px;">
        <input type="search" id="adminUsersMobileSearch" placeholder="Rechercher nom ou téléphone…" value="${escapeHtml(adminUsersSearchQuery)}" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1.5px solid #E2E8F0; font-size: 13px; font-family: inherit; margin-bottom: 8px; outline: none; box-sizing: border-box;">
        <select id="adminUsersMobileRegion" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1.5px solid #E2E8F0; font-size: 13px; font-family: inherit; font-weight: 600; outline: none; background: #FFF; box-sizing: border-box;">
          <option value="all">Toutes les régions</option>
          ${sortedRegions.map(reg => `<option value="${escapeHtml(reg)}" ${region === reg ? 'selected' : ''}>${escapeHtml(reg)}</option>`).join('')}
        </select>
      </div>

      <!-- Liste des cartes Utilisateurs Mobile -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${list.length === 0 ? `
          <div style="text-align: center; padding: 30px 16px; background: #FFF; border-radius: 14px; border: 1px dashed #DDD;">
            <p style="font-weight: 700; font-size: 13.5px; color: #1A1A1A; margin: 0 0 4px;">Aucun utilisateur trouvé</p>
            <p style="font-size: 12px; color: #718096; margin: 0;">Modifiez votre recherche ou filtre régional.</p>
          </div>
        ` : list.map(user => {
          const isPaid = Boolean(user.is_pro || (user.abo_status === 'active' && user.abo_expires_at && new Date(user.abo_expires_at) > now));
          const whatsappUrl = getCleanBurkinaWhatsAppUrl(user.phone, user.full_name);
          return `
            <div style="background: #FFF; border: 1px solid #ECE6D9; border-radius: 14px; padding: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                  <strong style="font-size: 14px; color: #1A1A1A; display: block;">${escapeHtml(user.full_name || 'Exploitant')}</strong>
                  <span style="font-size: 11.5px; color: #718096;">📍 ${escapeHtml(user.location || 'Burkina Faso')}${user.villages ? ` • ${escapeHtml(user.villages)}` : ''}</span>
                </div>
                ${isPaid ? `
                  <span style="font-size: 11px; font-weight: 800; background: #FBF1D6; color: #8A6400; padding: 3px 8px; border-radius: 6px;">⭐ PRO</span>
                ` : `
                  <span style="font-size: 11px; font-weight: 600; background: #EDF2F7; color: #718096; padding: 3px 8px; border-radius: 6px;">Gratuit</span>
                `}
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
                ${user.cultures ? user.cultures.split(',').map(c => `<span style="font-size: 11px; background: var(--bleu-clair, #E6EFF6); color: var(--bleu-principal, #05507E); font-weight: 600; padding: 2px 6px; border-radius: 4px;">🌱 ${escapeHtml(c.trim())}</span>`).join(' ') : '<span style="font-size: 11px; color: #A0AEC0;">Aucune culture déclarée</span>'}
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #718096; border-top: 1px solid #F0ECE1; padding-top: 8px; margin-bottom: 10px;">
                <span>Inscrit : ${formatAdminDate(user.date_inscription)}</span>
                <span>Actif : ${user.derniere_connexion ? formatAdminRelativeTime(user.derniere_connexion) : 'Jamais'}</span>
              </div>

              <div style="display: flex; gap: 8px; align-items: center;">
                ${whatsappUrl ? `
                  <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; display: inline-flex; justify-content: center; align-items: center; gap: 6px; background: #25D366; color: #FFF; font-weight: 700; font-size: 12px; padding: 8px; border-radius: 8px; text-decoration: none;">
                    <span>WhatsApp</span>
                  </a>
                ` : ''}
                ${isPaid ? `
                  <button type="button" class="btn-activate-subscription" data-user-id="${user.id}" data-user-name="${escapeHtml(user.full_name || '')}" data-user-phone="${escapeHtml(user.phone || '')}" style="flex: 1; background: #FAF7F0; color: var(--bleu-principal, #05507E); border: 1.5px solid var(--bleu-principal, #05507E); font-weight: 700; font-size: 12px; padding: 8px; border-radius: 8px; cursor: pointer;">
                    + Prolonger
                  </button>
                ` : `
                  <button type="button" class="btn-activate-subscription" data-user-id="${user.id}" data-user-name="${escapeHtml(user.full_name || '')}" data-user-phone="${escapeHtml(user.phone || '')}" style="flex: 1; background: var(--bleu-principal, #05507E); color: #FFF; border: none; font-weight: 700; font-size: 12px; padding: 8px; border-radius: 8px; cursor: pointer;">
                    ⭐ Activer saison
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Écouteurs de recherche et filtres admin utilisateurs (Desktop)
  const adminUsersSearchInput = document.getElementById('adminUsersSearchInput');
  if (adminUsersSearchInput) {
    adminUsersSearchInput.addEventListener('input', (e) => {
      adminUsersSearchQuery = e.target.value;
      renderAdminUtilisateursTable();
    });
  }

  const adminUsersRegionSelect = document.getElementById('adminUsersRegionSelect');
  if (adminUsersRegionSelect) {
    adminUsersRegionSelect.addEventListener('change', (e) => {
      adminUsersSelectedRegion = e.target.value;
      renderAdminUtilisateursTable();
    });
  }

  const btnRefreshAdminUsers = document.getElementById('btnRefreshAdminUsers');
  if (btnRefreshAdminUsers) {
    btnRefreshAdminUsers.addEventListener('click', async () => {
      showToast('Actualisation…', 'Chargement des utilisateurs…');
      await fetchAdminUtilisateurs();
      showToast('À jour', 'Liste des utilisateurs actualisée.');
    });
  }

  // Écouteurs délégués au clic pour les boutons "Activer abonnement"
  document.addEventListener('click', async (e) => {
    const btnAct = e.target.closest('.btn-activate-subscription');
    if (btnAct) {
      const uId = btnAct.getAttribute('data-user-id');
      const uName = btnAct.getAttribute('data-user-name');
      const uPhone = btnAct.getAttribute('data-user-phone');
      await handleAdminActiverAbonnement(uId, uName, uPhone);
      return;
    }

    if (e.target.closest('#btnRefreshMobileUsers')) {
      showToast('Actualisation…', 'Chargement des utilisateurs…');
      await fetchAdminUtilisateurs();
      showToast('À jour', 'Liste des utilisateurs actualisée.');
      return;
    }
  });

  // Écouteurs pour la recherche mobile
  document.addEventListener('input', (e) => {
    if (e.target.id === 'adminUsersMobileSearch') {
      adminUsersSearchQuery = e.target.value;
      renderMobileView();
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'adminUsersMobileRegion') {
      adminUsersSelectedRegion = e.target.value;
      renderMobileView();
    }
  });

  // 8. INITIALISATION AU CHARGEMENT DE LA PAGE
  async function initAppAuth() {
    const loadingScreen = document.getElementById('appLoadingScreen');
    function hideLoadingScreen() {
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }
    // Failsafe absolu : l'écran de chargement ne doit JAMAIS rester bloqué
    setTimeout(hideLoadingScreen, 2500);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlHash = window.location.hash || '';

      // 1. Détection des erreurs retournées par Supabase dans l'URL (ex: lien expiré ou déjà utilisé)
      const hasUrlError = searchParams.has('error') || searchParams.has('error_description') || 
                          urlHash.includes('error=') || urlHash.includes('error_code=') || urlHash.includes('error_description=');

      if (hasUrlError) {
        hideLoadingScreen();
        if (viewportContainer) viewportContainer.classList.add('hidden');
        if (authPortalScreen) authPortalScreen.classList.remove('hidden');
        switchPortalTab('forgot');
        const alertBox = document.getElementById('forgotPasswordAlert');
        if (alertBox) {
          alertBox.textContent = "Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.";
          alertBox.classList.remove('hidden');
        }
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (e) {}
        return;
      }

      // 2. Traitement du flux PKCE (?code=...) si présent
      const codeParam = searchParams.get('code');
      if (codeParam && supabaseClient) {
        try {
          console.log('[Auth PKCE] Code détecté dans l\'URL, échange en cours...');
          const { data: pkceData, error: pkceErr } = await supabaseClient.auth.exchangeCodeForSession(codeParam);
          if (pkceErr) {
            console.warn('[Auth PKCE] Erreur échange de code :', pkceErr);
            hideLoadingScreen();
            if (viewportContainer) viewportContainer.classList.add('hidden');
            if (authPortalScreen) authPortalScreen.classList.remove('hidden');
            switchPortalTab('forgot');
            const alertBox = document.getElementById('forgotPasswordAlert');
            if (alertBox) {
              alertBox.textContent = "Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.";
              alertBox.classList.remove('hidden');
            }
            return;
          } else if (pkceData?.session) {
            console.log('[Auth PKCE] Échange réussi pour :', pkceData.session.user?.email);
          }
        } catch (pkceEx) {
          console.error('[Auth PKCE] Exception échange code :', pkceEx);
        }
      }

      // 3. Détection de récupération de mot de passe (reset=1 ou hash type=recovery)
      const isResetParam = searchParams.get('reset') === '1' || searchParams.get('type') === 'recovery';
      const hasHashRecovery = urlHash.includes('type=recovery') || urlHash.includes('reset-password');

      if (isResetParam || hasHashRecovery || isRecoveryMode) {
        console.log('[Auth] Mode récupération de mot de passe actif.');
        hideLoadingScreen();
        showResetPasswordScreen();
        return;
      }

      let sessionUser = null;
      if (supabaseClient) {
        try {
          const { data: { session } } = await supabaseClient.auth.getSession();
          if (session?.user) {
            sessionUser = session.user;
          }
        } catch (e) {
          console.warn('Session Supabase getSession :', e);
        }
      }

      if (!sessionUser && supabaseClient) {
        const loginEmail = searchParams.get('login_email');
        const loginPass = searchParams.get('login_pass');
        if (loginEmail && loginPass) {
          try {
            const { data } = await supabaseClient.auth.signInWithPassword({
              email: loginEmail,
              password: loginPass
            });
            if (data?.user) {
              sessionUser = data.user;
            }
          } catch (e) {
            console.warn('[Auth] Erreur login param :', e);
          }
        }
      }

      // Charger les financements, conseils, modèles, matériels, régions, météo, notifications, annonces et signalements dès le démarrage
      fetchFinancements().catch(() => {});
      fetchConseils().catch(() => {});
      fetchModelesCultures().catch(() => {});
      fetchMateriels().catch(() => {});
      fetchRegions().catch(() => {});
      loadAndRenderWeather().catch(() => {});
      fetchNotifications().catch(() => {});
      fetchAnnonces().catch(() => {});
      fetchSignalements().catch(() => {});

      if (sessionUser) {
        await checkUserProfileAndProceed(sessionUser);
        await fetchFinancements();
        await fetchConseils();
        await fetchModelesCultures();
        await fetchMateriels();
        await fetchRegions();
        await fetchNotifications();
        await fetchAnnonces();
        await fetchSignalements();
        if (PROFILES_DATA[currentProfileKey]?.isAdmin) {
          await fetchAdminUtilisateurs().catch(() => {});
        }
        await fetchUserParcels(currentProfileKey);
        await fetchEtapesCulture();
        await fetchCycleTasks(currentProfileKey);
        handleRoute();
      } else {
        try {
          localStorage.removeItem('revolution_session_user');
        } catch (e) {}
        if (viewportContainer) viewportContainer.classList.add('hidden');
        if (authPortalScreen) authPortalScreen.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Erreur initAppAuth :', err);
      if (typeof window.showStartupErrorFallback === 'function') {
        window.showStartupErrorFallback(err);
      }
    } finally {
      hideLoadingScreen();
    }
  }

  // ==================== GESTION UNIVERSELLE DU VERROUILLAGE DU DÉFILEMENT (MODALES) ====================
  function syncBodyModalScrollLock() {
    try {
      const openBackdrops = document.querySelectorAll('.modal-backdrop:not(.hidden)');
      let hasOpenModal = false;
      for (let i = 0; i < openBackdrops.length; i++) {
        const el = openBackdrops[i];
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          hasOpenModal = true;
          break;
        }
      }

      if (hasOpenModal) {
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
      }
    } catch (e) {
      console.warn('Erreur syncBodyModalScrollLock :', e);
    }
  }

  // Observer toutes les modales pour basculer le verrouillage du scroll arrière-plan
  try {
    const modalObserver = new MutationObserver(() => {
      syncBodyModalScrollLock();
    });
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modalObserver.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
    });
  } catch (e) {
    console.warn('MutationObserver modales non supporté :', e);
  }

  // Fermeture au clic sur le fond (backdrop) pour toutes les modales si touché à l'extérieur
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        const closeBtn = backdrop.querySelector('.modal-close-btn, #btnCloseManageMateriel, #btnCloseMaterielDetails, #btnCloseManageModele, #btnCloseCropModal, #btnCloseModalPricing, #btnCloseModalCheckout');
        if (closeBtn) {
          closeBtn.click();
        } else {
          backdrop.classList.add('hidden');
        }
        syncBodyModalScrollLock();
      }
    });
  });

  updateDashboardDateTime();
  setInterval(updateDashboardDateTime, 10000);

  // ==========================================
  // MODULE PWA : SERVICE WORKER, INSTALLATION & GESTION VISIBILITÉ
  // ==========================================
  let deferredPwaPrompt = null;

  function isRunningInStandaloneMode() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  function isIosDevice() {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    ) && !window.MSStream;
  }

  function updatePwaVisibility() {
    const installed = isPwaInstalled();
    const homeCardClosed = isPwaHomeCardClosed();

    // 1. Bouton menu bureau
    const navItemInstall = document.getElementById('navItemInstallPwa');
    if (navItemInstall) {
      navItemInstall.style.display = installed ? 'none' : '';
    }

    // 2. Bouton tiroir mobile
    const btnMobDrawerPwa = document.getElementById('btnMobileDrawerInstallPwa');
    if (btnMobDrawerPwa) {
      btnMobDrawerPwa.style.display = installed ? 'none' : '';
    }

    // 3. Carte d'installation sur l'accueil bureau
    const homeCard = document.getElementById('pwaHomeCard');
    if (homeCard) {
      if (installed || homeCardClosed) {
        homeCard.classList.add('hidden');
      } else {
        homeCard.classList.remove('hidden');
      }
    }

    // 4. Carte d'installation sur l'accueil mobile
    const mobHomeCard = document.getElementById('pwaMobileHomeCard');
    if (mobHomeCard) {
      if (installed || homeCardClosed) {
        mobHomeCard.style.display = 'none';
      } else {
        mobHomeCard.style.display = '';
      }
    }

    // 5. Bandeau flottant
    const banner = document.getElementById('pwaInstallBanner');
    if (banner && installed) {
      banner.classList.add('hidden');
    }
  }

  function triggerPwaInstallFlow() {
    if (isPwaInstalled()) {
      showToast('Application déjà installée', 'Révolution Agricole est déjà installée sur votre appareil !');
      updatePwaVisibility();
      return;
    }

    if (deferredPwaPrompt) {
      // Déclencher directement l'invite native du navigateur (Android / Chrome Desktop)
      deferredPwaPrompt.prompt();
      deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('Installation confirmée', 'L\'application Révolution Agricole s\'installe sur votre écran d\'accueil.');
          try {
            localStorage.setItem('pwa_installed', '1');
          } catch (e) {}
          updatePwaVisibility();
        }
        deferredPwaPrompt = null;
      });
      return;
    }

    if (isIosDevice()) {
      // Afficher les explications illustrées spécifiques iPhone (iOS Safari)
      const modalIos = document.getElementById('modalIosInstall');
      if (modalIos) {
        modalIos.classList.remove('hidden');
        syncBodyModalScrollLock();
      }
      return;
    }

    // Autres cas (navigateur sans invite déclenchable ou desktop sans prompt)
    showToast('Installer l\'application', 'Ouvrez le menu de votre navigateur (⋮ ou Partager) et choisissez « Installer » ou « Sur l\'écran d\'accueil ».');
  }

  function initPwaModule() {
    // 1. Enregistrement du Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .then((registration) => {
            console.log(' [PWA] Service Worker actif et enregistré avec succès ! Scope :', registration.scope);

            // Détection et application automatique des mises à jour au prochain lancement
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log(' [PWA] Une nouvelle version est prête pour le prochain lancement.');
                    showToast('Mise à jour prête', 'La nouvelle version de l\'application s\'appliquera automatiquement au prochain lancement.');
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('️ [PWA] Échec enregistrement Service Worker :', err);
          });

        // Rechargement transparent lors du changement de contrôleur SW
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            console.log(' [PWA] Nouveau Service Worker activé.');
          }
        });
      });
    }

    // 2. Événement beforeinstallprompt (Android / Chrome Desktop)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPwaPrompt = e;
      console.log(' [PWA] Invite d\'installation native capturée.');

      // Si l'application n'est pas déjà installée, mettre à jour la visibilité
      updatePwaVisibility();
      checkAndShowPwaBanner();
    });

    // 3. Événement appinstalled (Installation terminée -> disparition des boutons)
    window.addEventListener('appinstalled', () => {
      console.log(' [PWA] Application installée avec succès sur l\'appareil !');
      showToast('Application installée', 'Retrouvez Révolution Agricole directement sur votre écran d\'accueil.');
      try {
        localStorage.setItem('pwa_installed', '1');
      } catch (e) {}
      // Le bouton et la carte disparaissent immédiatement
      updatePwaVisibility();
    });

    // 4. Gestion du bandeau à la première visite
    const banner = document.getElementById('pwaInstallBanner');
    const btnDismiss = document.getElementById('btnPwaDismiss');
    const btnInstall = document.getElementById('btnPwaInstall');

    function checkAndShowPwaBanner() {
      if (isPwaInstalled()) return;
      try {
        if (localStorage.getItem('pwa_dismissed') === '1' || localStorage.getItem('pwa_installed') === '1') {
          return;
        }
      } catch (e) {}

      // Délai de 3s pour ne pas gêner le premier affichage
      setTimeout(() => {
        if (!isPwaInstalled() && banner) {
          banner.classList.remove('hidden');
        }
      }, 3000);
    }

    // Vérifier pour iOS à la première visite
    if (isIosDevice() && !isPwaInstalled()) {
      checkAndShowPwaBanner();
    }

    if (btnDismiss) {
      btnDismiss.addEventListener('click', () => {
        if (banner) banner.classList.add('hidden');
        try { localStorage.setItem('pwa_dismissed', '1'); } catch (e) {}
      });
    }

    if (btnInstall) {
      btnInstall.addEventListener('click', () => {
        triggerPwaInstallFlow();
        if (banner) banner.classList.add('hidden');
      });
    }

    // 5. Carte d'installation sur l'accueil bureau (refermable)
    const btnInstallHome = document.getElementById('btnInstallPwaHomeCard');
    if (btnInstallHome) {
      btnInstallHome.addEventListener('click', () => {
        triggerPwaInstallFlow();
      });
    }

    const btnCloseHome = document.getElementById('btnClosePwaHomeCard');
    if (btnCloseHome) {
      btnCloseHome.addEventListener('click', () => {
        const homeCard = document.getElementById('pwaHomeCard');
        if (homeCard) homeCard.classList.add('hidden');
        try { localStorage.setItem('pwa_home_card_closed', '1'); } catch (e) {}
      });
    }

    const btnDismissHome = document.getElementById('btnDismissPwaHomeCard');
    if (btnDismissHome) {
      btnDismissHome.addEventListener('click', () => {
        const homeCard = document.getElementById('pwaHomeCard');
        if (homeCard) homeCard.classList.add('hidden');
        try { localStorage.setItem('pwa_home_card_closed', '1'); } catch (e) {}
      });
    }

    // 6. Fermeture de la modale iOS (Bouton et Croix)
    const btnCloseIos = document.getElementById('btnCloseIosInstall');
    const btnCloseIosCross = document.getElementById('btnCloseIosInstallCross');
    const modalIos = document.getElementById('modalIosInstall');

    function closeIosModal() {
      if (modalIos) {
        modalIos.classList.add('hidden');
        syncBodyModalScrollLock();
      }
    }

    if (btnCloseIos) btnCloseIos.addEventListener('click', closeIosModal);
    if (btnCloseIosCross) btnCloseIosCross.addEventListener('click', closeIosModal);

    // 7. Liens de navigation vers #installer dans la sidebar et le drawer
    const navItemInstall = document.getElementById('navItemInstallPwa');
    if (navItemInstall) {
      navItemInstall.addEventListener('click', (e) => {
        e.preventDefault();
        triggerPwaInstallFlow();
      });
    }

    // Initialiser immédiatement la visibilité selon l'état actuel (installé ou non)
    updatePwaVisibility();
  }

  // ==========================================
  // MODULE PROFIL & PARAMÈTRES (REVAGRIK SAHELO-TECH V5)
  // ==========================================

  // 1. Fonctions de gestion de l'affichage (Taille du texte)
  function applyTextSize(size) {
    const root = document.documentElement;
    root.classList.remove('text-size-large', 'text-size-xlarge');
    if (size === 'large') {
      root.classList.add('text-size-large');
    } else if (size === 'xlarge') {
      root.classList.add('text-size-xlarge');
    }
    try {
      localStorage.setItem('revagrik_text_size', size);
    } catch (e) {}

    document.querySelectorAll('.btn-text-size-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-size') === size);
    });
  }

  // 2. Gestion des préférences de notifications (Supabase profiles.notif_prefs)
  async function saveNotificationPref(prefKey, isChecked) {
    const profile = PROFILES_DATA[currentProfileKey] || {};
    if (!profile.notif_prefs || typeof profile.notif_prefs !== 'object') {
      profile.notif_prefs = {
        meteo_alertes: true,
        conseil_du_jour: true,
        nouveaux_financements: true,
        rappels_exploitation: true,
        marche: true
      };
    }
    profile.notif_prefs[prefKey] = isChecked;

    const userId = currentAuthUser?.id || currentProfileKey;
    if (supabaseClient && userId && !userId.startsWith('user_')) {
      try {
        const { error } = await supabaseClient
          .from('profiles')
          .update({
            notif_prefs: profile.notif_prefs,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.warn('⚠️ Erreur mise à jour notif_prefs dans Supabase :', error);
        }
      } catch (err) {
        console.warn('⚠️ Exception saveNotificationPref :', err);
      }
    }

    showToast('Préférence enregistrée', isChecked ? 'Notification activée.' : 'Notification désactivée.');
  }

  // 3. Changement de photo de profil (Canvas 400px + Supabase Storage avatars)
  async function handleAvatarUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Format non supporté', 'Veuillez sélectionner un fichier image valide (JPG, PNG ou WEBP).');
      return;
    }

    const userId = currentAuthUser?.id || currentProfileKey;
    if (!userId) {
      showToast('Connexion requise', 'Veuillez vous connecter pour mettre à jour votre photo.');
      return;
    }

    showToast('Traitement de l\'image', 'Optimisation et envoi de votre photo en cours…');

    try {
      // Redimensionnement côté client en Canvas max 400px
      const resizedBlob = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            const maxDim = 400;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Erreur de conversion de l\'image en canvas'));
            }, 'image/jpeg', 0.85);
          };
          img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsDataURL(file);
      });

      const fileName = `${userId}/avatar_${Date.now()}.jpg`;

      if (supabaseClient && !userId.startsWith('user_')) {
        const { data: uploadData, error: uploadErr } = await supabaseClient
          .storage
          .from('avatars')
          .upload(fileName, resizedBlob, {
            contentType: 'image/jpeg',
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadErr) {
          console.error('Erreur upload avatar Supabase Storage:', uploadErr);
          showToast('Erreur d\'envoi', 'Impossible d\'enregistrer l\'image sur le serveur.');
          return;
        }

        const { data: publicUrlData } = supabaseClient
          .storage
          .from('avatars')
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData?.publicUrl || '';

        // Mise à jour de la table profiles
        const { error: profileErr } = await supabaseClient
          .from('profiles')
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (profileErr) {
          console.warn('⚠️ Erreur mise à jour avatar_url dans profiles:', profileErr);
        }

        updateAvatarEverywhere(publicUrl);
        showToast('Photo mise à jour', 'Votre nouvelle photo de profil est bien enregistrée !');
      } else {
        const localUrl = URL.createObjectURL(resizedBlob);
        updateAvatarEverywhere(localUrl);
        showToast('Photo mise à jour', 'Photo de profil modifiée localement.');
      }
    } catch (err) {
      console.error('Erreur globale handleAvatarUpload:', err);
      showToast('Erreur', 'Impossible de traiter cette image.');
    }
  }

  function updateAvatarEverywhere(url) {
    if (!url) return;
    if (PROFILES_DATA[currentProfileKey]) {
      PROFILES_DATA[currentProfileKey].avatar = url;
    }
    document.querySelectorAll('#profileHeroAvatarImg, .profile-avatar-img, #userHeaderAvatar, #sidebarAvatarImg, .mobile-drawer-avatar, #modalAccountAvatar').forEach(img => {
      img.src = url;
    });
  }

  // 4. Modale "Mes informations"
  const modalEditProfile = document.getElementById('modalEditProfile');
  const formEditProfileInfo = document.getElementById('formEditProfileInfo');

  async function openEditProfileModal() {
    if (!modalEditProfile) return;
    const profile = PROFILES_DATA[currentProfileKey] || {};

    if (cachedRegions.length === 0) {
      await fetchRegions();
    }

    const selRegion = document.getElementById('selectEditRegion');
    if (selRegion) {
      const curVal = profile.region_id || '';
      selRegion.innerHTML = '<option value="">Sélectionnez votre région…</option>' +
        (cachedRegions || []).map(r => `<option value="${r.id}">${escapeHtml(r.nom)} (${escapeHtml(r.chef_lieu)})</option>`).join('');
      if (curVal) selRegion.value = curVal;
    }

    const inpName = document.getElementById('inputEditFullName');
    if (inpName) {
      inpName.value = profile.name || (currentAuthUser?.user_metadata?.full_name || '');
    }

    const inpVillage = document.getElementById('inputEditVillage');
    if (inpVillage) {
      inpVillage.value = profile.village || '';
    }

    const selActivite = document.getElementById('selectEditActivite');
    if (selActivite) {
      selActivite.value = profile.activite_principale || 'Producteur';
    }

    const phoneText = document.getElementById('modalReadonlyPhoneText');
    if (phoneText) {
      phoneText.textContent = profile.phone || (currentAuthUser ? currentAuthUser.email : 'Non renseigné');
    }

    modalEditProfile.classList.remove('hidden');
    syncBodyModalScrollLock();
  }

  function closeEditProfileModal() {
    if (modalEditProfile) {
      modalEditProfile.classList.add('hidden');
      syncBodyModalScrollLock();
    }
  }

  // 5. Modale Sécurité / Changement de mot de passe
  const modalChangePassword = document.getElementById('modalChangePassword');
  const formChangePasswordModal = document.getElementById('formChangePasswordModal');

  function openChangePasswordModal() {
    if (!modalChangePassword) return;
    const isGoogle = currentAuthUser?.app_metadata?.provider === 'google';
    const titleEl = document.getElementById('modalPasswordHeaderTitle');
    const wrapOld = document.getElementById('wrapOldPasswordRow');
    const inputOld = document.getElementById('inputOldPassword');

    if (titleEl) {
      titleEl.textContent = isGoogle ? 'Créer un mot de passe' : 'Changer mon mot de passe';
    }
    if (wrapOld) {
      wrapOld.style.display = isGoogle ? 'none' : 'block';
    }
    if (inputOld) {
      inputOld.required = !isGoogle;
    }
    if (formChangePasswordModal) {
      formChangePasswordModal.reset();
    }

    modalChangePassword.classList.remove('hidden');
    syncBodyModalScrollLock();
  }

  function closeChangePasswordModal() {
    if (modalChangePassword) {
      modalChangePassword.classList.add('hidden');
      syncBodyModalScrollLock();
    }
  }

  // 6. Modale Suppression de compte
  const modalDeleteAccountConfirm = document.getElementById('modalDeleteAccountConfirm');

  function openDeleteAccountModal() {
    if (!modalDeleteAccountConfirm) return;
    const profile = PROFILES_DATA[currentProfileKey] || {};
    const accId = currentAuthUser?.id || currentProfileKey || 'compte';
    const accName = profile.name || 'Exploitant';
    const waMsg = `Bonjour, je souhaite demander la suppression définitive de mon compte REVAGRIK.\nIdentifiant : ${accId}\nNom : ${accName}`;
    const btnWa = document.getElementById('btnSendDeleteRequestWhatsApp');
    if (btnWa) {
      btnWa.href = `https://wa.me/22678010529?text=${encodeURIComponent(waMsg)}`;
    }

    modalDeleteAccountConfirm.classList.remove('hidden');
    syncBodyModalScrollLock();
  }

  function closeDeleteAccountModal() {
    if (modalDeleteAccountConfirm) {
      modalDeleteAccountConfirm.classList.add('hidden');
      syncBodyModalScrollLock();
    }
  }

  // 7. Modale Légale (Conditions / Confidentialité - Bientôt disponible)
  const modalLegalNotice = document.getElementById('modalLegalNotice');

  function openLegalNoticeModal(title = "Conditions d'utilisation") {
    if (!modalLegalNotice) return;
    const titleEl = document.getElementById('legalNoticeModalTitle');
    if (titleEl) titleEl.textContent = title;
    modalLegalNotice.classList.remove('hidden');
    syncBodyModalScrollLock();
  }

  function closeLegalNoticeModal() {
    if (modalLegalNotice) {
      modalLegalNotice.classList.add('hidden');
      syncBodyModalScrollLock();
    }
  }

  // 8. Actions Application : Installation & Partage
  function handleSettingsInstallPwa() {
    if (typeof triggerPwaInstallFlow === 'function') {
      triggerPwaInstallFlow();
    } else if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
    } else if (isIosDevice()) {
      showToast('Installation iPhone', 'Appuyez sur le bouton Partager en bas (icône carré avec flèche), puis sur « Sur l\'écran d\'accueil ».');
    } else {
      showToast('Installation Android', 'Appuyez sur le menu (⋮) en haut à droite de votre navigateur, puis sur « Ajouter à l\'écran d\'accueil ».');
    }
  }

  function handleSettingsShareApp() {
    const shareData = {
      title: 'REVAGRIK - Révolution Agricole',
      text: 'Découvre REVAGRIK, l\'application pour les agriculteurs du Burkina Faso !',
      url: 'https://r2volution-agricole.vercel.app'
    };
    if (navigator.share && typeof navigator.share === 'function') {
      navigator.share(shareData).catch(() => {});
    } else {
      try {
        navigator.clipboard.writeText(shareData.url);
        showToast('Lien copié', 'Le lien de l\'application REVAGRIK a été copié dans votre presse-papiers.');
      } catch (e) {
        showToast('REVAGRIK', 'Partagez le lien : https://r2volution-agricole.vercel.app');
      }
    }
  }

  // 9. Recherche de l'abonnement actif dans public.subscriptions
  async function getActiveSubscription(profileId) {
    if (!supabaseClient || !profileId) return null;
    try {
      const { data, error } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) return data;
    } catch (e) {
      console.warn('⚠️ Erreur recherche abonnement Supabase :', e);
    }
    return null;
  }

  function formatShortDateFr(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return String(dateStr);
    }
  }

  // 10. Rendu complet de la page Profil (Bureau)
  async function renderProfilPage() {
    const profile = PROFILES_DATA[currentProfileKey] || {};
    const fullName = profile.name || (currentAuthUser?.user_metadata?.full_name || 'Exploitant');
    const avatar = profile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&h=180&q=80';
    const contact = profile.phone || (currentAuthUser ? currentAuthUser.email : '--');

    // Statistiques parcelles & cycles
    const parcelsCount = (cachedUserParcels || []).length;
    const totalArea = (cachedUserParcels || []).reduce((acc, p) => acc + (parseFloat(p.area_ha) || 0), 0);
    const totalAreaStr = totalArea > 0 ? (Number.isInteger(totalArea) ? totalArea.toFixed(0) : totalArea.toFixed(1)) + ' ha' : '0 ha';
    const activeCyclesCount = (cachedCropCycles || []).filter(c => c.statut !== 'termine' && c.statut !== 'archive' && c.status !== 'Terminé' && c.status !== 'Récolté').length;

    // Région, village, activité
    if (cachedRegions.length === 0) {
      await fetchRegions();
    }
    const regionObj = (cachedRegions || []).find(r => r.id === profile.region_id);
    const regionName = regionObj ? `${regionObj.nom} (${regionObj.chef_lieu})` : (profile.location ? profile.location.replace(/^📍\s*/, '') : 'Non renseignée');
    const villageName = profile.village || 'Non renseigné';
    const activiteName = profile.activite_principale || 'Producteur';
    const phoneVal = profile.phone || (currentAuthUser ? currentAuthUser.email : 'Non renseigné');

    // Statut d'abonnement
    let isSubscribed = userSubscriptionStatus[currentProfileKey] === true || profile.isPro === true || profile.is_pro === true;
    let planName = 'Pro Producteur';
    let startsAtStr = '';
    let expiresAtStr = '';

    const sub = await getActiveSubscription(currentProfileKey);
    if (sub) {
      if (sub.status === 'actif' || isSubscribed) {
        isSubscribed = true;
        planName = sub.plan_name || 'Pro Producteur';
        if (sub.starts_at) startsAtStr = formatShortDateFr(sub.starts_at);
        if (sub.expires_at) expiresAtStr = formatShortDateFr(sub.expires_at);
      }
    }

    // Mise à jour des éléments DOM Bureau
    const heroAvatar = document.getElementById('profileHeroAvatarImg');
    if (heroAvatar) heroAvatar.src = avatar;

    const heroName = document.getElementById('profileHeroFullName');
    if (heroName) heroName.textContent = fullName;

    const heroContact = document.getElementById('profileHeroContact');
    if (heroContact) heroContact.textContent = contact;

    const heroBadgeWrap = document.getElementById('profileHeroBadgeWrap');
    if (heroBadgeWrap) {
      if (isSubscribed) {
        heroBadgeWrap.innerHTML = `
          <span class="profile-badge-pill is-pro">
            <i data-lucide="award" style="width: 14px; height: 14px;"></i>
            <span>Abonné${expiresAtStr ? ' • Fin ' + expiresAtStr : ''}</span>
          </span>
        `;
      } else {
        heroBadgeWrap.innerHTML = `
          <span class="profile-badge-pill is-free">
            <i data-lucide="shield" style="width: 14px; height: 14px;"></i>
            <span>Gratuit</span>
          </span>
        `;
      }
    }

    const infoFullName = document.getElementById('profileInfoFullName');
    if (infoFullName) infoFullName.textContent = fullName;

    const infoRegion = document.getElementById('profileInfoRegion');
    if (infoRegion) infoRegion.textContent = regionName;

    const infoVillage = document.getElementById('profileInfoVillage');
    if (infoVillage) infoVillage.textContent = villageName;

    const infoActivite = document.getElementById('profileInfoActivite');
    if (infoActivite) infoActivite.textContent = activiteName;

    const infoPhone = document.getElementById('profileInfoPhone');
    if (infoPhone) infoPhone.textContent = phoneVal;

    const statParcels = document.getElementById('profileStatParcels');
    if (statParcels) statParcels.textContent = parcelsCount;

    const statArea = document.getElementById('profileStatArea');
    if (statArea) statArea.textContent = totalAreaStr;

    const statCycles = document.getElementById('profileStatCycles');
    if (statCycles) statCycles.textContent = activeCyclesCount;

    // Liens WhatsApp pré-remplis vers +226 78 01 05 29
    const accId = currentAuthUser?.id || profile.phone || fullName;
    const subMsg = `Bonjour, je veux m'abonner à REVAGRIK. Mon numéro de compte : ${accId}`;
    const whatsappSubUrl = `https://wa.me/22678010529?text=${encodeURIComponent(subMsg)}`;
    const renewMsg = `Bonjour, je veux renouveler mon abonnement REVAGRIK. Mon numéro de compte : ${accId}`;
    const whatsappRenewUrl = `https://wa.me/22678010529?text=${encodeURIComponent(renewMsg)}`;

    const aboContent = document.getElementById('profileAboContent');
    if (aboContent) {
      if (isSubscribed) {
        aboContent.innerHTML = `
          <div class="profile-card-top">
            <h4 class="profile-card-title">
              <i data-lucide="award" style="color: var(--vert-revagrik);"></i>
              <span>Mon abonnement</span>
            </h4>
            <span class="profile-badge-pill is-pro" style="padding: 4px 10px; font-size: 12px;">Actif</span>
          </div>
          <div style="background: #E5F3E6; border: 1.5px solid #C4E3C6; border-radius: 14px; padding: 14px; margin-bottom: 14px;">
            <strong style="font-size: 16px; color: #1E5E2A; display: block; margin-bottom: 4px;">Formule ${escapeHtml(planName)}</strong>
            <p style="font-size: 13px; color: #2D4A32; margin: 0;">
              ${startsAtStr ? 'Début : ' + startsAtStr + ' • ' : ''}Échéance : <strong>${expiresAtStr || 'En cours'}</strong>
            </p>
          </div>
          <a href="${whatsappRenewUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%; justify-content: center; min-height: 48px; border-radius: 12px; font-weight: 800; background: var(--vert-revagrik); color: #FFF; text-decoration: none;">
            <i data-lucide="message-circle" style="width: 18px; height: 18px;"></i>
            <span>Renouveler mon abonnement</span>
          </a>
        `;
      } else {
        aboContent.innerHTML = `
          <div class="profile-card-top">
            <h4 class="profile-card-title">
              <i data-lucide="award"></i>
              <span>Mon abonnement</span>
            </h4>
            <span class="profile-badge-pill is-free" style="padding: 4px 10px; font-size: 12px;">Formule Gratuite</span>
          </div>
          <p style="font-size: 13.5px; color: #4A4A4A; line-height: 1.5; margin: 0 0 12px;">
            Passez au forfait <strong>Pro Producteur (5 000 F CFA/mois)</strong> pour bénéficier de tous les avantages :
          </p>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1A1A1A;">
              <i data-lucide="check" style="width: 16px; height: 16px; color: var(--vert-revagrik); flex-shrink: 0;"></i>
              <span>Alertes SMS météo & ravageurs en temps réel</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1A1A1A;">
              <i data-lucide="check" style="width: 16px; height: 16px; color: var(--vert-revagrik); flex-shrink: 0;"></i>
              <span>Fiches techniques agronomiques 100% hors-ligne</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1A1A1A;">
              <i data-lucide="check" style="width: 16px; height: 16px; color: var(--vert-revagrik); flex-shrink: 0;"></i>
              <span>Calculs illimités de marge nette et rentabilité</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1A1A1A;">
              <i data-lucide="check" style="width: 16px; height: 16px; color: var(--vert-revagrik); flex-shrink: 0;"></i>
              <span>Visibilité prioritaire sur le marché agricole</span>
            </div>
          </div>
          <a href="${whatsappSubUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%; justify-content: center; min-height: 52px; border-radius: 14px; font-weight: 800; font-size: 15px; background: var(--ocre, #A85A1C); color: #FFF; text-decoration: none; box-shadow: 0 4px 14px rgba(168, 90, 28, 0.25);">
            <i data-lucide="message-circle" style="width: 19px; height: 19px;"></i>
            <span>S'abonner à REVAGRIK</span>
          </a>
        `;
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // 11. Rendu HTML de la page Profil pour mobile
  function getMobileProfilHtml() {
    const profile = PROFILES_DATA[currentProfileKey] || {};
    const fullName = profile.name || (currentAuthUser?.user_metadata?.full_name || 'Exploitant');
    const avatar = profile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&h=180&q=80';
    const contact = profile.phone || (currentAuthUser ? currentAuthUser.email : '--');

    const parcelsCount = (cachedUserParcels || []).length;
    const totalArea = (cachedUserParcels || []).reduce((acc, p) => acc + (parseFloat(p.area_ha) || 0), 0);
    const totalAreaStr = totalArea > 0 ? (Number.isInteger(totalArea) ? totalArea.toFixed(0) : totalArea.toFixed(1)) + ' ha' : '0 ha';
    const activeCyclesCount = (cachedCropCycles || []).filter(c => c.statut !== 'termine' && c.statut !== 'archive' && c.status !== 'Terminé' && c.status !== 'Récolté').length;

    const regionObj = (cachedRegions || []).find(r => r.id === profile.region_id);
    const regionName = regionObj ? `${regionObj.nom} (${regionObj.chef_lieu})` : (profile.location ? profile.location.replace(/^📍\s*/, '') : 'Non renseignée');
    const villageName = profile.village || 'Non renseigné';
    const activiteName = profile.activite_principale || 'Producteur';
    const phoneVal = profile.phone || (currentAuthUser ? currentAuthUser.email : 'Non renseigné');

    const isSubscribed = userSubscriptionStatus[currentProfileKey] === true || profile.isPro === true || profile.is_pro === true;

    const accId = currentAuthUser?.id || profile.phone || fullName;
    const subMsg = `Bonjour, je veux m'abonner à REVAGRIK. Mon numéro de compte : ${accId}`;
    const whatsappSubUrl = `https://wa.me/22678010529?text=${encodeURIComponent(subMsg)}`;
    const renewMsg = `Bonjour, je veux renouveler mon abonnement REVAGRIK. Mon numéro de compte : ${accId}`;
    const whatsappRenewUrl = `https://wa.me/22678010529?text=${encodeURIComponent(renewMsg)}`;

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #05507E; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 20px; font-weight: 800; color: #1A1A1A; margin: 0;">Mon Profil</h2>
          <span style="font-size: 12px; color: #7C8781;">REVAGRIK</span>
        </div>
      </div>

      <div class="profile-page-wrapper">
        <!-- 1. En-tête Hero du Profil -->
        <section class="profile-hero-card">
          <div class="profile-avatar-wrap">
            <img src="${avatar}" alt="Photo de profil" class="profile-avatar-img">
            <button type="button" class="profile-camera-btn btn-trigger-avatar-upload" title="Changer ma photo de profil" aria-label="Changer ma photo de profil">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </button>
          </div>
          <h3 class="profile-hero-name">${escapeHtml(fullName)}</h3>
          <p class="profile-hero-contact">${escapeHtml(contact)}</p>
          <div>
            ${isSubscribed ? `
              <span class="profile-badge-pill is-pro">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                <span>Abonné</span>
              </span>
            ` : `
              <span class="profile-badge-pill is-free">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Gratuit</span>
              </span>
            `}
          </div>
        </section>

        <!-- 2. Mes informations -->
        <section class="profile-section-card">
          <div class="profile-card-top">
            <h4 class="profile-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
              <span>Mes informations</span>
            </h4>
            <button type="button" class="profile-btn-edit btn-trigger-edit-profile">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <span>Modifier</span>
            </button>
          </div>

          <div class="profile-info-grid">
            <div class="profile-info-row">
              <span class="profile-info-label">Nom complet</span>
              <span class="profile-info-val">${escapeHtml(fullName)}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Région</span>
              <span class="profile-info-val">${escapeHtml(regionName)}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Village ou commune</span>
              <span class="profile-info-val">${escapeHtml(villageName)}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Activité principale</span>
              <span class="profile-info-val">${escapeHtml(activiteName)}</span>
            </div>
            <div class="profile-info-row" style="grid-column: 1 / -1;">
              <span class="profile-info-label">Numéro de téléphone</span>
              <span class="profile-info-val">${escapeHtml(phoneVal)}</span>
            </div>
          </div>

          <div class="profile-readonly-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bleu-principal)" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Pour changer de numéro, <a href="https://wa.me/22678010529?text=Bonjour,%20je%20souhaite%20changer%20mon%20num%C3%A9ro%20de%20t%C3%A9l%C3%A9phone%20sur%20REVAGRIK." target="_blank" rel="noopener noreferrer" style="color: var(--bleu-principal); font-weight: 700; text-decoration: underline;">contactez-nous sur WhatsApp</a>.</span>
          </div>
        </section>

        <!-- 3. Mon exploitation en bref -->
        <section class="profile-section-card">
          <div class="profile-card-top">
            <h4 class="profile-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 20h10"/><path d="M10 20c0-4 1.5-6.5 4-8"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
              <span>Mon exploitation en bref</span>
            </h4>
          </div>

          <div class="profile-stats-grid">
            <div class="profile-stat-box">
              <span class="profile-stat-num">${parcelsCount}</span>
              <span class="profile-stat-lbl">Parcelles</span>
            </div>
            <div class="profile-stat-box">
              <span class="profile-stat-num">${totalAreaStr}</span>
              <span class="profile-stat-lbl">Surface totale</span>
            </div>
            <div class="profile-stat-box">
              <span class="profile-stat-num">${activeCyclesCount}</span>
              <span class="profile-stat-lbl">Cycles en cours</span>
            </div>
          </div>

          <a href="#synthese" class="btn-secondary" style="width: 100%; justify-content: center; min-height: 46px; font-weight: 700; border-radius: 12px; text-decoration: none;">
            <span>Voir mon exploitation</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </section>

        <!-- 4. Mon abonnement -->
        <section class="profile-section-card">
          ${isSubscribed ? `
            <div class="profile-card-top">
              <h4 class="profile-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--vert-revagrik)" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                <span>Mon abonnement</span>
              </h4>
              <span class="profile-badge-pill is-pro" style="padding: 4px 10px; font-size: 12px;">Actif</span>
            </div>
            <div style="background: #E5F3E6; border: 1.5px solid #C4E3C6; border-radius: 14px; padding: 14px; margin-bottom: 14px;">
              <strong style="font-size: 15px; color: #1E5E2A; display: block; margin-bottom: 4px;">Formule Pro Producteur</strong>
              <p style="font-size: 12.5px; color: #2D4A32; margin: 0;">Abonnement actif sur votre compte REVAGRIK.</p>
            </div>
            <a href="${whatsappRenewUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%; justify-content: center; min-height: 48px; border-radius: 12px; font-weight: 800; background: var(--vert-revagrik); color: #FFF; text-decoration: none;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Renouveler mon abonnement</span>
            </a>
          ` : `
            <div class="profile-card-top">
              <h4 class="profile-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                <span>Mon abonnement</span>
              </h4>
              <span class="profile-badge-pill is-free" style="padding: 4px 10px; font-size: 12px;">Formule Gratuite</span>
            </div>
            <p style="font-size: 13px; color: #4A4A4A; line-height: 1.5; margin: 0 0 12px;">
              Passez au forfait <strong>Pro Producteur (5 000 F CFA/mois)</strong> :
            </p>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #1A1A1A;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--vert-revagrik)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Alertes SMS météo & ravageurs en direct</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #1A1A1A;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--vert-revagrik)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Fiches techniques 100% hors-ligne</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #1A1A1A;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--vert-revagrik)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Calculs illimités de rentabilité & marge</span>
              </div>
            </div>
            <a href="${whatsappSubUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%; justify-content: center; min-height: 50px; border-radius: 14px; font-weight: 800; font-size: 14.5px; background: var(--ocre, #A85A1C); color: #FFF; text-decoration: none;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>S'abonner à REVAGRIK</span>
            </a>
          `}
        </section>

        <!-- Lien vers Paramètres -->
        <section class="profile-section-card card-go-to-settings" style="padding: 14px 18px; cursor: pointer;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: var(--bleu-clair); color: var(--bleu-principal); display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              </div>
              <div>
                <strong style="font-size: 15px; color: #1A1A1A; display: block;">Paramètres de l'application</strong>
                <span style="font-size: 12px; color: #7C8781;">Affichage, notifications et sécurité</span>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </section>
      </div>
    `;
  }

  // 12. Rendu de la page Paramètres (Bureau)
  function renderParametresPage() {
    const profile = PROFILES_DATA[currentProfileKey] || {};
    const prefs = profile.notif_prefs || {
      meteo_alertes: true,
      conseil_du_jour: true,
      nouveaux_financements: true,
      rappels_exploitation: true,
      marche: true
    };

    const tMeteo = document.getElementById('toggleNotifMeteo');
    if (tMeteo) tMeteo.checked = prefs.meteo_alertes !== false;

    const tConseil = document.getElementById('toggleNotifConseil');
    if (tConseil) tConseil.checked = prefs.conseil_du_jour !== false;

    const tFin = document.getElementById('toggleNotifFinancements');
    if (tFin) tFin.checked = prefs.nouveaux_financements !== false;

    const tExploit = document.getElementById('toggleNotifExploitation');
    if (tExploit) tExploit.checked = prefs.rappels_exploitation !== false;

    const tMarche = document.getElementById('toggleNotifMarche');
    if (tMarche) tMarche.checked = prefs.marche !== false;

    const curSize = localStorage.getItem('revagrik_text_size') || 'normal';
    document.querySelectorAll('.btn-text-size-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-size') === curSize);
    });

    const labelSec = document.getElementById('labelSecurityPasswordAction');
    if (labelSec) {
      if (currentAuthUser?.app_metadata?.provider === 'google') {
        labelSec.textContent = 'Créer un mot de passe';
      } else {
        labelSec.textContent = 'Changer mon mot de passe';
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // 13. Rendu HTML de la page Paramètres pour mobile
  function getMobileParametresHtml() {
    const profile = PROFILES_DATA[currentProfileKey] || {};
    const prefs = profile.notif_prefs || {
      meteo_alertes: true,
      conseil_du_jour: true,
      nouveaux_financements: true,
      rappels_exploitation: true,
      marche: true
    };
    const curSize = localStorage.getItem('revagrik_text_size') || 'normal';
    const isGoogle = currentAuthUser?.app_metadata?.provider === 'google';

    return `
      <div style="margin-bottom: 12px;">
        <a href="#dashboard" class="breadcrumb-back-link mobile-back-to-dashboard" style="font-size: 12px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; color: #05507E; font-weight: 700; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Tableau de bord</span>
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 20px; font-weight: 800; color: #1A1A1A; margin: 0;">Paramètres</h2>
          <span style="font-size: 12px; color: #7C8781;">Préférences</span>
        </div>
      </div>

      <div class="settings-page-wrapper">
        <!-- 1. Affichage -->
        <section class="profile-section-card">
          <h4 class="profile-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            <span>Affichage</span>
          </h4>
          <p style="font-size: 13px; color: #4A4A4A; margin: 4px 0 12px;">Taille du texte sur votre écran :</p>

          <div class="text-size-pills-row">
            <button type="button" class="btn-text-size-pill ${curSize === 'normal' ? 'active' : ''}" data-size="normal">
              <span>Normal</span>
            </button>
            <button type="button" class="btn-text-size-pill ${curSize === 'large' ? 'active' : ''}" data-size="large">
              <span style="font-size: 15px;">Grand</span>
            </button>
            <button type="button" class="btn-text-size-pill ${curSize === 'xlarge' ? 'active' : ''}" data-size="xlarge">
              <span style="font-size: 17px; font-weight: 800;">Très grand</span>
            </button>
          </div>
        </section>

        <!-- 2. Notifications -->
        <section class="profile-section-card">
          <h4 class="profile-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>Notifications</span>
          </h4>
          <p style="font-size: 13px; color: #4A4A4A; margin: 4px 0 14px;">Activez ou coupez les alertes selon vos besoins :</p>

          <div class="settings-switch-row">
            <div class="settings-switch-info">
              <p class="settings-switch-title">Météo et alertes</p>
              <p class="settings-switch-desc">Pluie imminente, vents et alertes agronomiques</p>
            </div>
            <label class="toggle-switch-wrap">
              <input type="checkbox" class="toggle-notif-switch" data-key="meteo_alertes" ${prefs.meteo_alertes !== false ? 'checked' : ''}>
              <span class="toggle-slider-round"></span>
            </label>
          </div>

          <div class="settings-switch-row">
            <div class="settings-switch-info">
              <p class="settings-switch-title">Conseil du jour</p>
              <p class="settings-switch-desc">Le conseil technique matinal de nos agronomes</p>
            </div>
            <label class="toggle-switch-wrap">
              <input type="checkbox" class="toggle-notif-switch" data-key="conseil_du_jour" ${prefs.conseil_du_jour !== false ? 'checked' : ''}>
              <span class="toggle-slider-round"></span>
            </label>
          </div>

          <div class="settings-switch-row">
            <div class="settings-switch-info">
              <p class="settings-switch-title">Nouveaux financements</p>
              <p class="settings-switch-desc">Subventions PReCA, fonds d'appui et échéances</p>
            </div>
            <label class="toggle-switch-wrap">
              <input type="checkbox" class="toggle-notif-switch" data-key="nouveaux_financements" ${prefs.nouveaux_financements !== false ? 'checked' : ''}>
              <span class="toggle-slider-round"></span>
            </label>
          </div>

          <div class="settings-switch-row">
            <div class="settings-switch-info">
              <p class="settings-switch-title">Rappels de mon exploitation</p>
              <p class="settings-switch-desc">Dates de repiquage, début des récoltes et entretien</p>
            </div>
            <label class="toggle-switch-wrap">
              <input type="checkbox" class="toggle-notif-switch" data-key="rappels_exploitation" ${prefs.rappels_exploitation !== false ? 'checked' : ''}>
              <span class="toggle-slider-round"></span>
            </label>
          </div>

          <div class="settings-switch-row">
            <div class="settings-switch-info">
              <p class="settings-switch-title">Marché</p>
              <p class="settings-switch-desc">Alertes de mise en vente et opportunités bord-champ</p>
            </div>
            <label class="toggle-switch-wrap">
              <input type="checkbox" class="toggle-notif-switch" data-key="marche" ${prefs.marche !== false ? 'checked' : ''}>
              <span class="toggle-slider-round"></span>
            </label>
          </div>
        </section>

        <!-- 3. Sécurité -->
        <section class="profile-section-card">
          <h4 class="profile-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Sécurité</span>
          </h4>
          <p style="font-size: 13px; color: #4A4A4A; margin: 4px 0 14px;">Gérez l'accès à votre compte :</p>

          <button type="button" class="btn-secondary btn-open-change-password" style="width: 100%; justify-content: center; min-height: 48px; border-radius: 12px; font-weight: 700;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
            <span>${isGoogle ? 'Créer un mot de passe' : 'Changer mon mot de passe'}</span>
          </button>
        </section>

        <!-- 4. Application -->
        <section class="profile-section-card">
          <h4 class="profile-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            <span>Application</span>
          </h4>

          <div class="settings-menu-item btn-settings-install-pwa" role="button" tabindex="0">
            <div class="settings-menu-item-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Installer l'application</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div class="settings-menu-item btn-settings-share-app" role="button" tabindex="0">
            <div class="settings-menu-item-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span>Partager REVAGRIK</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div class="settings-menu-item" style="cursor: default;">
            <div class="settings-menu-item-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              <span>Version de l'application</span>
            </div>
            <span style="font-size: 13px; font-weight: 700; color: #7C8781;">v3.5 - Octobre 2026</span>
          </div>
        </section>

        <!-- 5. Aide -->
        <section class="profile-section-card">
          <h4 class="profile-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Aide</span>
          </h4>

          <a href="https://wa.me/22678010529?text=Bonjour,%20j'ai%20besoin%20d'aide%20sur%20REVAGRIK." target="_blank" rel="noopener noreferrer" class="settings-menu-item">
            <div class="settings-menu-item-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Nous contacter sur WhatsApp</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </a>

          <div class="settings-menu-item btn-open-terms" role="button" tabindex="0">
            <div class="settings-menu-item-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Conditions d'utilisation</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div class="settings-menu-item btn-open-privacy" role="button" tabindex="0">
            <div class="settings-menu-item-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              <span>Politique de confidentialité</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </section>

        <!-- 6. Déconnexion & Suppression -->
        <section style="display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 8px;">
          <button type="button" class="btn-secondary btn-settings-logout" style="width: 100%; justify-content: center; min-height: 50px; font-weight: 700; border-radius: 14px; border: 1.5px solid var(--bleu-principal); color: var(--bleu-principal); background: #FFFFFF;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Se déconnecter</span>
          </button>

          <button type="button" class="btn-open-delete-account" style="background: none; border: none; color: #C0392B; font-size: 13px; font-weight: 600; text-decoration: underline; cursor: pointer; padding: 8px 12px;">
            Supprimer mon compte
          </button>
        </section>
      </div>
    `;
  }

  // 14. Liaison des écouteurs d'événements pour Profil & Paramètres
  function bindProfilAndParametresEventListeners() {
    // A. Changement de photo (Desktop et Mobile)
    const inpFile = document.getElementById('inputProfileAvatarFile');
    document.querySelectorAll('#btnChangeProfileAvatar, .btn-trigger-avatar-upload').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (inpFile) inpFile.click();
      };
    });

    if (inpFile && !inpFile._boundUpload) {
      inpFile._boundUpload = true;
      inpFile.addEventListener('change', () => {
        if (inpFile.files && inpFile.files[0]) {
          handleAvatarUpload(inpFile.files[0]);
          inpFile.value = '';
        }
      });
    }

    // B. Modale "Mes informations"
    document.querySelectorAll('#btnOpenEditProfileModal, .btn-trigger-edit-profile').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        openEditProfileModal();
      };
    });

    const btnCloseEditCross = document.getElementById('btnCloseEditProfileCross');
    if (btnCloseEditCross) btnCloseEditCross.onclick = closeEditProfileModal;
    const btnCancelEdit = document.getElementById('btnCancelEditProfile');
    if (btnCancelEdit) btnCancelEdit.onclick = closeEditProfileModal;

    if (modalEditProfile && !modalEditProfile._boundBackdrop) {
      modalEditProfile._boundBackdrop = true;
      modalEditProfile.addEventListener('click', (e) => {
        if (e.target === modalEditProfile) closeEditProfileModal();
      });
    }

    if (formEditProfileInfo && !formEditProfileInfo._boundSubmit) {
      formEditProfileInfo._boundSubmit = true;
      formEditProfileInfo.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inpFullName = document.getElementById('inputEditFullName');
        const selReg = document.getElementById('selectEditRegion');
        const inpVill = document.getElementById('inputEditVillage');
        const selAct = document.getElementById('selectEditActivite');

        const newName = (inpFullName?.value || '').trim();
        const newRegionId = selReg?.value || null;
        const newVillage = (inpVill?.value || '').trim();
        const newActivite = selAct?.value || 'Producteur';

        if (!newName) {
          showToast('Nom requis', 'Veuillez saisir votre nom complet.');
          return;
        }

        const regObj = (cachedRegions || []).find(r => r.id === newRegionId);
        const regName = regObj ? `${regObj.nom} (${regObj.chef_lieu})` : '';
        const newLoc = newVillage ? `${newVillage}, ${regName}` : regName;

        const userId = currentAuthUser?.id || currentProfileKey;
        if (supabaseClient && userId && !userId.startsWith('user_')) {
          try {
            const { error } = await supabaseClient
              .from('profiles')
              .update({
                full_name: newName,
                region_id: newRegionId,
                village: newVillage,
                activite_principale: newActivite,
                location: newLoc,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            if (error) {
              console.error('Erreur mise à jour profil Supabase:', error);
              showToast('Erreur', 'Impossible d\'enregistrer les modifications.');
              return;
            }
          } catch (err) {
            console.error('Exception update profile:', err);
          }
        }

        // Mise à jour de l'état local
        if (PROFILES_DATA[currentProfileKey]) {
          PROFILES_DATA[currentProfileKey].name = newName;
          PROFILES_DATA[currentProfileKey].region_id = newRegionId;
          PROFILES_DATA[currentProfileKey].village = newVillage;
          PROFILES_DATA[currentProfileKey].activite_principale = newActivite;
          PROFILES_DATA[currentProfileKey].location = newLoc;
        }

        if (userHeaderName) userHeaderName.textContent = newName;
        const cleanFirst = newName.trim().split(' ')[0] || newName;
        if (greetingTitle) greetingTitle.innerHTML = `Bonjour, ${cleanFirst} <span class="greeting-emoji"></span>`;

        closeEditProfileModal();
        renderProfilPage();
        if (currentViewMode === 'mobile' || window.innerWidth < 1024) {
          renderMobileView();
        }
        showToast('Informations enregistrées', 'Vos informations personnelles ont été mises à jour.');
      });
    }

    // C. Lien vers Paramètres depuis Profil
    document.querySelectorAll('#cardGoToSettings, .card-go-to-settings').forEach(card => {
      card.onclick = () => {
        window.location.hash = 'parametres';
        handleRoute();
      };
    });

    // D. Sélecteur de taille de texte
    document.querySelectorAll('.btn-text-size-pill').forEach(btn => {
      btn.onclick = () => {
        const sz = btn.getAttribute('data-size') || 'normal';
        applyTextSize(sz);
        showToast('Affichage mis à jour', `Taille de texte ajustée : ${sz}.`);
      };
    });

    // E. Interrupteurs de notifications
    document.querySelectorAll('.toggle-notif-switch, #toggleNotifMeteo, #toggleNotifConseil, #toggleNotifFinancements, #toggleNotifExploitation, #toggleNotifMarche').forEach(sw => {
      sw.onchange = () => {
        let key = sw.getAttribute('data-key');
        if (!key) {
          if (sw.id === 'toggleNotifMeteo') key = 'meteo_alertes';
          else if (sw.id === 'toggleNotifConseil') key = 'conseil_du_jour';
          else if (sw.id === 'toggleNotifFinancements') key = 'nouveaux_financements';
          else if (sw.id === 'toggleNotifExploitation') key = 'rappels_exploitation';
          else if (sw.id === 'toggleNotifMarche') key = 'marche';
        }
        if (key) {
          saveNotificationPref(key, sw.checked);
        }
      };
    });

    // F. Sécurité / Mot de passe
    document.querySelectorAll('#btnOpenChangePasswordModal, .btn-open-change-password').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        openChangePasswordModal();
      };
    });

    const btnClosePassCross = document.getElementById('btnCloseChangePasswordCross');
    if (btnClosePassCross) btnClosePassCross.onclick = closeChangePasswordModal;
    const btnCancelPass = document.getElementById('btnCancelChangePassword');
    if (btnCancelPass) btnCancelPass.onclick = closeChangePasswordModal;

    if (modalChangePassword && !modalChangePassword._boundBackdrop) {
      modalChangePassword._boundBackdrop = true;
      modalChangePassword.addEventListener('click', (e) => {
        if (e.target === modalChangePassword) closeChangePasswordModal();
      });
    }

    if (formChangePasswordModal && !formChangePasswordModal._boundSubmit) {
      formChangePasswordModal._boundSubmit = true;
      formChangePasswordModal.addEventListener('submit', async (e) => {
        e.preventDefault();
        const p1 = document.getElementById('inputNewPassword')?.value || '';
        const p2 = document.getElementById('inputConfirmPassword')?.value || '';

        if (p1.length < 6) {
          showToast('Erreur', 'Le mot de passe doit comporter au moins 6 caractères.');
          return;
        }
        if (p1 !== p2) {
          showToast('Erreur', 'Les deux mots de passe ne correspondent pas.');
          return;
        }

        const btnSub = document.getElementById('btnSubmitChangePassword');
        if (btnSub) {
          btnSub.disabled = true;
          btnSub.textContent = 'Enregistrement…';
        }

        try {
          if (supabaseClient) {
            const { error } = await supabaseClient.auth.updateUser({ password: p1 });
            if (error) {
              showToast('Erreur', error.message || 'Impossible de modifier le mot de passe.');
              return;
            }
          }
          showToast('Mot de passe mis à jour', 'Votre nouveau mot de passe est désormais actif.');
          closeChangePasswordModal();
          formChangePasswordModal.reset();
        } catch (err) {
          showToast('Erreur', 'Une erreur est survenue lors de la mise à jour.');
        } finally {
          if (btnSub) {
            btnSub.disabled = false;
            btnSub.textContent = 'Enregistrer';
          }
        }
      });
    }

    // G. Application : Installer & Partager
    document.querySelectorAll('#btnSettingsInstallPwa, .btn-settings-install-pwa').forEach(btn => {
      btn.onclick = handleSettingsInstallPwa;
    });

    document.querySelectorAll('#btnSettingsShareApp, .btn-settings-share-app').forEach(btn => {
      btn.onclick = handleSettingsShareApp;
    });

    // H. Aide & Légal
    document.querySelectorAll('#btnOpenTermsModal, .btn-open-terms').forEach(btn => {
      btn.onclick = () => openLegalNoticeModal("Conditions d'utilisation");
    });

    document.querySelectorAll('#btnOpenPrivacyModal, .btn-open-privacy').forEach(btn => {
      btn.onclick = () => openLegalNoticeModal("Politique de confidentialité");
    });

    const btnCloseLegal = document.getElementById('btnCloseLegalNoticeModal');
    if (btnCloseLegal) btnCloseLegal.onclick = closeLegalNoticeModal;

    if (modalLegalNotice && !modalLegalNotice._boundBackdrop) {
      modalLegalNotice._boundBackdrop = true;
      modalLegalNotice.addEventListener('click', (e) => {
        if (e.target === modalLegalNotice) closeLegalNoticeModal();
      });
    }

    // I. Déconnexion
    document.querySelectorAll('#btnSettingsLogout, .btn-settings-logout').forEach(btn => {
      btn.onclick = () => {
        if (typeof performLogout === 'function') {
          performLogout();
        }
      };
    });

    // J. Suppression de compte
    document.querySelectorAll('#btnOpenDeleteAccountModal, .btn-open-delete-account').forEach(btn => {
      btn.onclick = openDeleteAccountModal;
    });

    const btnCancelDel = document.getElementById('btnCancelDeleteAccountModal');
    if (btnCancelDel) btnCancelDel.onclick = closeDeleteAccountModal;

    if (modalDeleteAccountConfirm && !modalDeleteAccountConfirm._boundBackdrop) {
      modalDeleteAccountConfirm._boundBackdrop = true;
      modalDeleteAccountConfirm.addEventListener('click', (e) => {
        if (e.target === modalDeleteAccountConfirm) closeDeleteAccountModal();
      });
    }
  }

  // 15. Initialisation automatique du module au démarrage
  function initSettingsAndProfileModule() {
    const savedSize = localStorage.getItem('revagrik_text_size') || 'normal';
    applyTextSize(savedSize);
    bindProfilAndParametresEventListeners();
  }

  initPwaModule();

  initAppAuth();

  initSettingsAndProfileModule();

  // 7. Test/Vérification tiroir ouvert si demandé via paramètre URL
  if (urlParams.get('open_drawer') === '1') {
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('mobileDrawerOverlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }
});
