(function () {
  function hideUpdateRibbon() {
    var banner = document.getElementById('updateBanner');
    if (!banner) return;
    banner.classList.remove('show');
    banner.style.display = 'none';
  }

  hideUpdateRibbon();
  setTimeout(hideUpdateRibbon, 900);
  setTimeout(hideUpdateRibbon, 2000);
})();
