const doCache = true;
const CACHE_NAME = 'base-cache';
const appShellAssets = [
	'./index.html',
	'./app.js',
];

self.addEventListener('activate', (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.key()
			.then((keyList) => {
				Promise.all(keyList.map((key) => {
					if (!cacheWhitelist.includes(key)) {
						// console.log('Deleting cache: ', key);
						return caches.delete(key);
					}
				}))
			})
	)
});

self.addEventListener('install', (event) => {
	if (doCache) {
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('Service worker caching appShell');
				return cache.addAll(appShellAssets);
			});
	}
});

self.addEventListener('fetch', (event) => {
	if (doCache) {
		event.respondWith(
			caches.match(event.request).then(response => response || fetch(event.request));
		);
	}
});
