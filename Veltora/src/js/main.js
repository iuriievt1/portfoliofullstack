document.addEventListener('DOMContentLoaded', () => {
  const langSwitcher = document.getElementById('languageSwitcher');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  langSwitcher.addEventListener('change', (e) => {
    const lang = e.target.value;
    localStorage.setItem('lang', lang);
    applyTranslations(lang);
  });

  const savedLang = localStorage.getItem('lang') || 'cs';
  langSwitcher.value = savedLang;
  applyTranslations(savedLang);

  burger.addEventListener('click', () => {
    nav.classList.toggle('active');
  });
});
