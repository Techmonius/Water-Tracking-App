// Small override so the update ribbon never stays visually stuck.
(function () {
  const banner = document.getElementById('updateBanner');
  const button = document.getElementById('updateNow');
  if (!banner || !button) return;

  button.addEventListener('click', async function (event) {
    event.preventDefault();
    banner.classList.remove('show');
    button.disabled = true;
    button.textContent = 'Updating...';

    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister().catch(() => undefined)));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch (_) {}

    const url = new URL(window.location.href);
    url.searchParams.set('refresh', Date.now());
    url.searchParams.set('app', '2026-06-22-10');
    window.location.replace(url.toString());
  }, true);
})();
