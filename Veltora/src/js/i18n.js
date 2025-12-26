let translations = {};

async function applyTranslations(lang = 'cs') {
  const res = await fetch('/src/data/i18n.json');
  translations = await res.json();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key] && translations[key][lang]) {
      el.textContent = translations[key][lang];
    }
  });

  document.documentElement.lang = lang;
}
