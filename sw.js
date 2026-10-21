/**
 * Service Worker — Révolution Agricole PWA
 * Version: 20261021.3
 * Stratégie de mise en cache rapide, résiliente et sécurisée (Zéro mise en cache Supabase/Auth)
 */

const CACHE_NAME = 'revolution-agricole-v20261021.3';
const OFFLINE_URL = 'offline.html';

// Ressources applicatives critiques à pré-cacher pour un démarrage ultra-rapide
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'offline.html',
  'manifest.json',
  'styles/theme.css',
  'styles/main.css',
  'scripts/app.js',
  'images/icons/icon-192x192.png',
  'images/icons/icon-512x512.png',
  'images/icons/icon-maskable-192x192.png',
  'images/icons/icon-maskable-512x512.png',
  'images/icons/apple-touch-icon.png',
  'images/icons/ios-step1-share.png',
  'images/icons/ios-step2-home.png'
];

// 1. INSTALLATION : Pré-chargement des fichiers du cœur d'application
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('⚠️ [SW] Certains assets non critiques n\'ont pu être pré-cachés :', err);
      });
    }).then(() => {
      // Forcer l'activation immédiate sans attendre la fermeture des onglets
      return self.skipWaiting();
    })
  );
});

// 2. ACTIVATION : Nettoyage automatique des anciens caches obsolètes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name.startsWith('revolution-agricole-')) {
            console.log('🧹 [SW] Suppression de l\'ancien cache obsolète :', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // Prendre le contrôle immédiat de toutes les pages ouvertes
      return self.clients.claim();
    })
  );
});

// 3. INTERCEPTION RÉSEAU (FETCH)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // RÈGLE ABSOLUE : Zéro mise en cache pour Supabase, les APIs d'authentification et les méthodes d'écriture
  if (
    request.method !== 'GET' ||
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/auth/v1') ||
    url.pathname.includes('/rest/v1') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    // Laisser passer directement sur le réseau sans aucun cache
    return;
  }

  // A. REQUÊTES DE NAVIGATION (Chargement de pages HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Si le réseau répond bien, cloner la page dans le cache
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // En cas de coupure totale de réseau, tenter le cache de la page ou la page offline dédiée
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const cachedIndex = await caches.match('index.html');
          if (cachedIndex) return cachedIndex;

          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || new Response('Vous êtes hors connexion', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // B. RESSOURCES STATIQUES (CSS, JS, Polices, Images locales)
  // Stratégie Stale-While-Revalidate : répondre instantanément par le cache, rafraîchir en tâche de fond
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // En cas d'échec réseau, on a déjà servi le cache s'il existe
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. MESSAGE : Mise à jour à la demande
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
