// /source/js/cms-frontend.js
(function () {
  async function loadCmsContent(lang) {
    lang = (lang || document.documentElement.getAttribute('lang') || 'cs').toLowerCase();

    /* ============================
       1) ТЕКСТЫ
    ============================ */
    try {
      const r = await fetch('/registration/api/cms/get-texts.php?lang=' + encodeURIComponent(lang));
      const data = await r.json();

      if (data.ok) {
        const texts = data.texts || {};

        document.querySelectorAll('[data-cms-key]').forEach(el => {
          const key = el.getAttribute('data-cms-key');
          if (key && texts[key] != null) {
            el.innerHTML = texts[key];
          }
        });
      }
    } catch (e) {
      console.error('CMS Text Error:', e);
    }

    /* ============================
       2) ССЫЛКИ (включая iframe)
    ============================ */
    try {
      const r = await fetch('/registration/api/cms/get-links.php');
      const data = await r.json();

      if (data.ok) {
        const links = data.links || {};

        document.querySelectorAll('[data-cms-link]').forEach(el => {
          const key = el.getAttribute('data-cms-link');
          const url = key ? links[key] : null;
          if (!url) return;

          const tag = el.tagName.toUpperCase();

          if (tag === 'A') {
            // обычная ссылка
            el.setAttribute('href', url);
          } else if (tag === 'IFRAME') {
            // ссылка в iframe → это src
            el.setAttribute('src', url);
          } else {
            // fallback - если вдруг используешь link на других элементах
            el.setAttribute('href', url);
          }
        });
      }
    } catch (e) {
      console.error('CMS Links Error:', e);
    }

    /* ============================
       3) КАРТИНКИ
    ============================ */
    try {
      const r = await fetch('/registration/api/cms/get-media.php');
      const data = await r.json();

      if (data.ok) {
        const media = data.media || {};

        document.querySelectorAll('[data-cms-img]').forEach(el => {
          const slot = el.getAttribute('data-cms-img');
          if (slot && media[slot] && media[slot][0]) {
            const src = '/' + media[slot][0].replace(/^\/+/, '');

            if (el.tagName.toUpperCase() === 'IMG') {
              el.setAttribute('src', src);
            } else {
              el.style.backgroundImage = `url("${src}")`;
            }
          }
        });
      }
    } catch (e) {
      console.error('CMS Media Error:', e);
    }
  }

  /* ============================
     INIT
  ============================ */
  document.addEventListener('DOMContentLoaded', () => {
    const lang = (document.documentElement.getAttribute('lang') || 'cs').toLowerCase();
    loadCmsContent(lang);
  });

  // Глобальная функция — вызывается при смене языка
  window.cmsReload = loadCmsContent;
})();
