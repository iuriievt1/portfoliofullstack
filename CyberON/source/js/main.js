// ============================================================
// I18N: language switcher + JSON loader
// ============================================================
(function () {
  const switcher = document.querySelector('.lang-switcher');
  if (!switcher) return;

  const toggleBtn = switcher.querySelector('.lang-switcher__toggle');
  const currentSpan = switcher.querySelector('.lang-switcher__current');
  const options = switcher.querySelectorAll('.lang-switcher__option');

  let currentLang = localStorage.getItem('siteLang') || switcher.dataset.lang || 'en';
  switcher.dataset.lang = currentLang;

  let translations = {};

  function getLangLabel(lang) {
    if (!lang) return '';
    if (lang === 'cs') return 'CZ';
    return lang.toUpperCase();
  }

  async function loadLanguage(lang) {
    try {
      const res = await fetch(`/source/json/${lang}.json`, {
        cache: 'no-cache',
      });
      translations = await res.json();
      applyTranslations();
      window.I18N_DATA = window.I18N_DATA || {};
      window.I18N_DATA[lang] = translations;
    } catch (err) {
      console.error('I18N load error:', err);
    }
  }

  function getValueFromJSON(path) {
    return path.split('.').reduce((obj, key) => (obj ? obj[key] : null), translations);
  }

  function applyTranslations() {
    if (!translations) return;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const value = getValueFromJSON(key);
      if (value) el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const value = getValueFromJSON(key);
      if (value) el.placeholder = value;
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.dataset.i18nAriaLabel;
      const value = getValueFromJSON(key);
      if (value) el.setAttribute('aria-label', value);
    });
  }

  function updateOptionsVisibility() {
    currentSpan.textContent = getLangLabel(currentLang);

    options.forEach((btn) => {
      const lang = btn.getAttribute('data-lang');
      const li = btn.closest('li');
      if (!li) return;
      li.style.display = lang === currentLang ? 'none' : '';
    });
  }

  function closeMenu() {
    switcher.classList.remove('lang-switcher--open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    switcher.classList.add('lang-switcher--open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  loadLanguage(currentLang);
  updateOptionsVisibility();

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = switcher.classList.contains('lang-switcher--open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  options.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentLang = btn.getAttribute('data-lang') || 'en';
      switcher.dataset.lang = currentLang;
      localStorage.setItem('siteLang', currentLang);
      updateOptionsVisibility();
      loadLanguage(currentLang);
      closeMenu();
    });
  });

  document.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ============================================================
   FOOTER: Consultation form AJAX
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('footer-consult-form');
  if (!form) return;

  const emailInput = form.querySelector('input[name="email"]');
  const msgEl = document.getElementById('footer-consult-message');

  function getValueFromGlobal(path) {
    const lang = document.querySelector('.lang-switcher')?.dataset.lang || 'en';
    try {
      const data = window.I18N_DATA?.[lang];
      return path.split('.').reduce((o, k) => (o ? o[k] : null), data);
    } catch {
      return null;
    }
  }

  function setMessage(text, type) {
    msgEl.textContent = text || '';
    msgEl.classList.remove('footer-form__message--error', 'footer-form__message--success');
    if (type === 'error') msgEl.classList.add('footer-form__message--error');
    if (type === 'success') msgEl.classList.add('footer-form__message--success');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (emailInput.value || '').trim();

    const errEmpty = getValueFromGlobal('footer.form.error') || 'Please enter your email.';
    const errInvalid = getValueFromGlobal('footer.form.error') || 'Please enter a valid email.';
    const sendingMsg = getValueFromGlobal('footer.form.sending') || 'Sending...';
    const successMsg = getValueFromGlobal('footer.form.success') || 'Thank you.';

    if (!email) return setMessage(errEmpty, 'error');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setMessage(errInvalid, 'error');

    setMessage(sendingMsg);
    form.classList.add('is-loading');

    try {
      const response = await fetch('/source/php/footer.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: 'email=' + encodeURIComponent(email),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        setMessage(successMsg, 'success');
        form.reset();
      } else {
        setMessage(data?.error || 'Error. Try later.', 'error');
      }
    } catch {
      setMessage('Network error.', 'error');
    } finally {
      form.classList.remove('is-loading');
    }
  });
});

/* ============================================================
   PROJECT MODAL POPUP (info + request)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.project-card');
  const infoModals = document.querySelectorAll('.project_modal_popup');
  const requestModal = document.getElementById('project-request-modal');

  if (!cards.length) return;

  function openInfoModal(key) {
    const modal = document.querySelector(
      `.project_modal_popup[data-project-modal="${key}"]`
    );
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    if (
      !document.querySelector(
        '.project_modal_popup.is-open, .project_request_modal.is-open'
      )
    ) {
      document.body.classList.remove('modal-open');
    }
  }

  function openRequestModal(projectTitle) {
    if (!requestModal) return;

    const span = requestModal.querySelector('[data-request-project]');
    const hidden = requestModal.querySelector('input[name="project"]');
    if (span) span.textContent = projectTitle || '';
    if (hidden) hidden.value = projectTitle || '';

    requestModal.classList.add('is-open');
    document.body.classList.add('modal-open');
  }

  // клик по карточке -> открыть info-модалку
  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const key = card.dataset.project;
      if (!key) return;
      openInfoModal(key);
    });
  });

  // закрытие info-модалок
  infoModals.forEach((modal) => {
    const closeBtn = modal.querySelector('.project-modal__close');
    const backdrop = modal.querySelector('.project-modal__backdrop');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }
    if (backdrop) {
      backdrop.addEventListener('click', () => closeModal(modal));
    }

    // кнопка MAKE A REQUEST внутри info-модалки
    const requestBtn = modal.querySelector('[data-open-request="true"]');
    if (requestBtn) {
      requestBtn.addEventListener('click', () => {
        const title =
          modal.dataset.projectTitle ||
          modal.querySelector('.project-modal__title')?.textContent.trim() ||
          '';
        closeModal(modal);
        openRequestModal(title);
      });
    }
  });

  // закрытие request-модалки
  if (requestModal) {
    const closeBtn = requestModal.querySelector('.project-modal__close');
    const backdrop = requestModal.querySelector('.project-modal__backdrop');

    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(requestModal));
    if (backdrop) backdrop.addEventListener('click', () => closeModal(requestModal));
  }

  // ESC закрывает все модалки
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document
      .querySelectorAll('.project_modal_popup.is-open, .project_request_modal.is-open')
      .forEach((modal) => closeModal(modal));
  });

  // ========== AJAX: project_request_form -> project_popup.php ==========
  if (requestModal) {
    const form = document.getElementById('project-request-form');
    const msgEl = document.getElementById('project-request-message');

    function setMsg(text, type) {
      if (!msgEl) return;
      msgEl.textContent = text || '';
      msgEl.classList.remove(
        'project-modal__message--error',
        'project-modal__message--success'
      );
      if (type === 'error') msgEl.classList.add('project-modal__message--error');
      if (type === 'success') msgEl.classList.add('project-modal__message--success');
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const email = (formData.get('email') || '').trim();
        const message = (formData.get('message') || '').trim();

        if (!email || !message) {
          setMsg('Please fill in required fields.', 'error');
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setMsg('Please enter a valid email.', 'error');
          return;
        }

        setMsg('Sending...', null);

        try {
          const body = new URLSearchParams();
          formData.forEach((value, key) => {
            body.append(key, value);
          });

          const response = await fetch('/source/php/project_popup.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: body.toString(),
          });

          const data = await response.json().catch(() => null);

          if (response.ok && data && data.success) {
            setMsg('Thank you, we will contact you soon.', 'success');
            form.reset();
          } else {
            setMsg(
              (data && data.error) ||
                'Something went wrong. Please try again later.',
              'error'
            );
          }
        } catch (err) {
          setMsg('Network error. Please try again.', 'error');
        }
      });
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const readMoreButtons = document.querySelectorAll('.project-modal__readmore');

  readMoreButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.project-modal__text-wrap');
      if (!wrap) return;

      const more = wrap.querySelector('.project-modal__more');
      if (!more) return;

      const isOpen = more.classList.contains('is-open');
      const current = btn.textContent.trim().toLowerCase(); // текущий текст

      if (!isOpen) {
        // ОТКРЫВАЕМ
        more.style.height = more.scrollHeight + 'px';
        more.classList.add('is-open');

        // меняем текст в зависимости от ТОГО, что было
        if (current === 'read more') {
          btn.textContent = 'Read Less';
        } else if (current === 'číst více') {
          btn.textContent = 'Skrýt';
        } else {
          // если что-то третье — на всякий
          btn.textContent = 'Read Less';
        }
      } else {
        // ЗАКРЫВАЕМ
        more.style.height = more.scrollHeight + 'px';
        void more.offsetHeight;
        more.style.height = '0px';
        more.classList.remove('is-open');

        if (current === 'read less') {
          btn.textContent = 'Read More';
        } else if (current === 'skrýt') {
          btn.textContent = 'Číst Více';
        } else {
          btn.textContent = 'Read More';
        }
      }
    });
  });

  // После окончания анимации, когда блок ОТКРЫТ, ставим height:auto
  const moreBlocks = document.querySelectorAll('.project-modal__more');
  moreBlocks.forEach((more) => {
    more.addEventListener('transitionend', (e) => {
      if (e.propertyName !== 'height') return;

      if (more.classList.contains('is-open')) {
        more.style.height = 'auto';
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.querySelector('[data-cookie-banner]');
  if (!banner) return;

  const acceptBtn = banner.querySelector('[data-cookie-accept]');
  const essentialBtn = banner.querySelector('[data-cookie-essentials]');

  const CONSENT_KEY = 'cookie_consent'; // localStorage key

  const saved = localStorage.getItem(CONSENT_KEY);

  // если выбора ещё не было — показываем баннер
  if (!saved) {
    banner.classList.add('cookie-banner--visible');
  }

  function hideBanner() {
    banner.classList.remove('cookie-banner--visible');
    // можно добавить класс, если захочешь анимацию ухода
    banner.style.display = 'none';
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'all');
      hideBanner();
    });
  }

  if (essentialBtn) {
    essentialBtn.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'essential');
      hideBanner();
    });
  }
});
