const CACHE_NAME = 'neopixel-studio-v1';
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/editor',
    '/devices',
    '/manifest.json',
];

// Install - cache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch - network first, cache fallback
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Skip API calls from caching
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => new Response(
                    JSON.stringify({ error: 'Offline - command queued' }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                ))
        );
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const cloned = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Background sync for offline commands
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-pending-commands') {
        event.waitUntil(syncPendingCommands());
    }
});

async function syncPendingCommands() {
    const db = await openDB();
    const commands = await getAllCommands(db);
    for (const cmd of commands) {
        try {
            await fetch(`/api/devices/${cmd.deviceId}/sync`);
            await deleteCommand(db, cmd.id);
        } catch (e) {
            console.log('[SW] Sync failed, will retry:', e);
        }
    }
}

// IndexedDB helpers for offline queue
function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('neopixel-offline', 1);
        req.onupgradeneeded = (e) => e.target.result.createObjectStore('commands', { keyPath: 'id', autoIncrement: true });
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = reject;
    });
}

function getAllCommands(db) {
    return new Promise((resolve) => {
        const tx = db.transaction('commands', 'readonly');
        const req = tx.objectStore('commands').getAll();
        req.onsuccess = () => resolve(req.result);
    });
}

function deleteCommand(db, id) {
    return new Promise((resolve) => {
        const tx = db.transaction('commands', 'readwrite');
        tx.objectStore('commands').delete(id).onsuccess = resolve;
    });
}
