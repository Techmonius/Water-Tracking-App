function $(id) {
  return document.getElementById(id);
}

let toastTimer;
function toast(message) {
  const box = $('toast');
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), 1500);
}

function closeDialog(id) {
  const dialog = $(id);
  if (dialog && dialog.open) dialog.close();
}

function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
  document.documentElement.dataset.theme = resolved;
}

function celebrateGoal() {
  const hero = $('hero');
  hero.classList.remove('celebrate');
  void hero.offsetWidth;
  hero.classList.add('celebrate');
  navigator.vibrate?.([25, 40, 25]);

  const wrap = $('confetti');
  wrap.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.left = `${Math.random() * 100}vw`;
    dot.style.background = ['#35aef4', '#19a974', '#ffd166', '#ef476f'][i % 4];
    dot.style.animationDelay = `${Math.random() * 0.25}s`;
    wrap.appendChild(dot);
  }
  setTimeout(() => { wrap.innerHTML = ''; }, 1200);
}

function animateWater() {
  const water = $('water');
  water.classList.remove('slosh');
  void water.offsetWidth;
  water.classList.add('slosh');
  setTimeout(() => water.classList.remove('slosh'), 700);
}

function showUpdateBanner() {
  const banner = $('updateBanner');
  banner.hidden = false;
  banner.classList.add('show');
}

function hideUpdateBanner() {
  const banner = $('updateBanner');
  banner.classList.remove('show');
  banner.hidden = true;
}
