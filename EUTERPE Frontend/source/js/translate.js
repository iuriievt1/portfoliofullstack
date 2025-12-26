/* ===== I18N + REVEAL ===== */
(() => {
  const DEFAULT_LANG = 'cs';
  const SUPPORTED = ['cs', 'en'];
  const store = window.localStorage;

  function getInitLang() {
    const saved = store.getItem('lang');
    if (SUPPORTED.includes(saved)) return saved;
    const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (SUPPORTED.includes(htmlLang)) return htmlLang;
    return DEFAULT_LANG;
  }

  let currentLang = getInitLang();
  let dict = {};

  async function loadDict(lang) {
    const res = await fetch(`/source/lang/${lang}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error('i18n: failed to load ' + lang);
    return res.json();
  }

  function getKey(dict, path) {
    return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), dict);
  }

  function setText(el, value) {
    el.innerHTML = value;
  }

  function applyI18n() {
    // data-i18n (текст)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getKey(dict, key);
      if (val != null) setText(el, val);
    });

    // data-i18n-attr="placeholder:foo.bar|aria-label:baz"
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr').split('|');
      spec.forEach(pair => {
        const parts = pair.split(':');
        if (parts.length < 2) return;
        const attr = parts[0].trim();
        const key = parts[1].trim();
        if (!attr || !key) return;
        const val = getKey(dict, key);
        if (val != null) el.setAttribute(attr, val);
      });
    });

    // ставим правильный lang на <html>
    document.documentElement.setAttribute('lang', currentLang);

    // CMS: подтянуть тексты/ссылки/картинки под текущий язык
    if (window.cmsReload) {
      window.cmsReload(currentLang);
    }
  }

  async function switchLang(lang) {
    if (!SUPPORTED.includes(lang) || lang === currentLang) return;
    currentLang = lang;
    store.setItem('lang', lang);
    dict = await loadDict(lang);
    applyI18n();
  }

  // init
  loadDict(currentLang)
    .then(d => {
      dict = d;
      applyI18n();
    })
    .catch(console.error);

  // переключатели
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-switch');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    switchLang(lang).catch(console.error);
  });

  window.$i18n = { switchLang, get lang() { return currentLang; } };

  /* ===== Scroll Reveal ===== */
  const toReveal = document.querySelectorAll('.reveal');
  if (toReveal.length) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    toReveal.forEach(el => io.observe(el));
  }
})();
