// ============================================================
// SERVICES: левое меню категорий + правые секции
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.services-nav__item');   // все блоки в левом меню
  const sections = document.querySelectorAll('.service-section');      // все секции справа

  if (!navItems.length || !sections.length) return;

  // флаг: сейчас идёт программный скролл true или false
  let isManualScroll = false;

  // --- helper: ДЛЯ КЛИКА ---
  function getScrollOffset() {
    const w = window.innerWidth;

    if (w <= 640) {
      // мобильный
      return 310;
    }
    if (w <= 1024) {
      // планшет
      return 110;
    }

    // десктоп
    return 140;
  }

  // --- ГЛАВНАЯ функция: какая секция сейчас активна ---
  function setActiveSection(targetId) {
    // 1) СПРАВА: показать is-visible
    sections.forEach((sec) => {
      if (sec.id === targetId) {
        sec.classList.add('is-visible');
      } else {
        sec.classList.remove('is-visible');
      }
    });

    // 2) СЛЕВА: подсветка активной категории + её подкатегорий
    navItems.forEach((item) => {
      if (item.dataset.target === targetId) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });
  }

  // --- Стартовая секция: первая или та, что пришла через ?service= ---
  let initialId = sections[0].id;

  const params = new URLSearchParams(window.location.search);
  const serviceFromUrl = params.get('service');   // например video / events / design / marketing

  if (serviceFromUrl) {
    const candidateId = `service-${serviceFromUrl}`;
    if (document.getElementById(candidateId)) {
      initialId = candidateId;
    }
  }

  // сразу включаем стартовую (для подсветки/видимости)
  setActiveSection(initialId);

  // 🔥 ЕСЛИ ПРИШЛИ ЧЕРЕЗ ?service=..., мягко докручиваем страницу ДО НУЖНОЙ СЕКЦИИ
  // для обычного href="services.html" ЭТО НЕ ВЫПОЛНЯЕТСЯ → НИКАКОГО ДЁРГАНИЯ
  if (serviceFromUrl) {
    setTimeout(() => {
      const targetSection = document.getElementById(initialId);
      if (!targetSection) return;

      const anchor =
        targetSection.querySelector('.service-section__media') || targetSection;

      const rect = anchor.getBoundingClientRect();
      const offset = getScrollOffset();
      const targetY = rect.top + window.pageYOffset - offset;

      // включаем режим ручного скролла, чтобы observer не вмешивался
      isManualScroll = true;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth',
      });

      // ✅ ещё раз ЖЁСТКО активируем нужную секцию и меню,
      // чтобы перебить возможный триггер observer-а
      setActiveSection(initialId);
      targetSection.classList.add('is-visible');

      setTimeout(() => {
        isManualScroll = false;
      }, 700);
    }, 300);
  }

  // --- КЛИК в меню слева -> активируем секцию + плавно скроллим к ФОТО ---
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      setActiveSection(targetId);

      // скроллим к .service-section__media (фото), с учётом шапок
      const anchor =
        targetSection.querySelector('.service-section__media') || targetSection;

      const rect = anchor.getBoundingClientRect();
      const offset = getScrollOffset();
      const targetY = rect.top + window.pageYOffset - offset;

      // включаем режим ручного скролла, чтобы observer не мешал
      isManualScroll = true;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth',
      });

      // через ~600 мс (длительность скролла) снова разрешаем observer
      setTimeout(() => {
        isManualScroll = false;
      }, 600);
    });
  });

  // --- IntersectionObserver: переключение по SCROLL-у ---
  const observer = new IntersectionObserver(
    (entries) => {
      if (isManualScroll) return;

      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        setActiveSection(id);
      });
    },
    {
      threshold: 0.25,
      rootMargin: '-20% 0px -35% 0px',
    }
  );

  sections.forEach((sec) => observer.observe(sec));
});
/* ============================================================
   CONTACT MODAL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('contact-modal');
  const successModal = document.getElementById('contact-success-modal');
  if (!modal || !successModal) return;

  const dialog = modal.querySelector('.contact-modal__dialog');
  const closeBtn = modal.querySelector('.contact-modal__close');
  const backdrop = modal.querySelector('.contact-modal__backdrop');
  const form = document.getElementById('contact-modal-form');
  const msgEl = document.getElementById('contact-modal-message');
  const contextEl = document.getElementById('contact-modal-context');
  const hiddenService = document.getElementById('contact-modal-service');
  const hiddenSection = document.getElementById('contact-modal-section');
  const selectService = form.querySelector('select[name="service"]');

  const successCloseBtn = successModal.querySelector('.contact-success__close');
  const successActionBtn = successModal.querySelector('.contact-success__button');
  const successBackdrop = successModal.querySelector('.contact-modal__backdrop');

  const SERVICE_LABELS = {
    events: 'Event Production',
    video: 'Video Production',
    design: 'Design & IT',
    marketing: 'Marketing Services',
  };

  // открыть модалку (фото или кнопка "MAKE A REQUEST")
  function openModal(serviceKey, sectionTitle) {
    const serviceLabel = SERVICE_LABELS[serviceKey] || serviceKey || '';

    // контекст в шапке модалки
    contextEl.textContent =
      serviceLabel && sectionTitle
        ? `${serviceLabel} · ${sectionTitle}`
        : serviceLabel || sectionTitle || '';

    // скрытые поля для бэкенда
    hiddenService.value = serviceLabel;
    hiddenSection.value = sectionTitle || '';

    // селект с услугой в форме
    selectService.value = '';
    if (serviceLabel) {
      Array.from(selectService.options).forEach((opt) => {
        if (opt.value === serviceLabel) {
          selectService.value = serviceLabel;
        }
      });
    }

    // сброс сообщения
    msgEl.textContent = '';
    msgEl.className = 'contact-modal__message';

    // показать модалку
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  function openSuccessModal() {
    successModal.classList.add('is-open');
  }

  function closeSuccessModal() {
    successModal.classList.remove('is-open');
  }

  // === ТРИГГЕРЫ: картинка секции + кнопка MAKE A REQUEST ===
  const triggers = document.querySelectorAll(
    '.service-section__media, .js-service-contact'
  );

  triggers.forEach((el) => {
    el.style.cursor = 'pointer';

    el.addEventListener('click', () => {
      const section = el.closest('.service-section');
      if (!section) return;

      const serviceKey =
        el.dataset.service || section.dataset.service || '';

      let sectionTitle = '';
      if (el.dataset.section) {
        sectionTitle = el.dataset.section;
      } else {
        const titleEl = section.querySelector('.service-section__title');
        sectionTitle = titleEl ? titleEl.textContent.trim() : '';
      }

      openModal(serviceKey, sectionTitle);
    });
  });

  // --- закрытие модалки ---
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // --- success-модалка ---
  successCloseBtn.addEventListener('click', closeSuccessModal);
  successBackdrop.addEventListener('click', closeSuccessModal);
  successActionBtn.addEventListener('click', closeSuccessModal);

  function showMsg(text, type) {
    msgEl.textContent = text || '';
    msgEl.className = 'contact-modal__message';
    if (type === 'error') msgEl.classList.add('contact-modal__message--error');
    if (type === 'success') msgEl.classList.add('contact-modal__message--success');
  }

  // отправка формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = (formData.get('name') || '').trim();
    const phone = (formData.get('phone') || '').trim();
    const email = (formData.get('email') || '').trim();
    const service = (formData.get('service') || '').trim();
    const message = (formData.get('message') || '').trim();
    const human = formData.get('human');

    if (!name || !phone || !email || !service || !message) {
      showMsg('Please fill in all required fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMsg('Please enter a valid email.', 'error');
      return;
    }

    if (!human) {
      showMsg('Please confirm that you are not a robot.', 'error');
      return;
    }

    showMsg('Sending...', null);

    const body = new URLSearchParams();
    formData.forEach((value, key) => {
      body.append(key, value);
    });

    try {
      const response = await fetch('/source/php/modal.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: body.toString(),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (_) {}

      if (response.ok && data && data.success) {
        form.reset();
        showMsg('', null);
        closeModal();
        openSuccessModal();
      } else {
        const errText =
          (data && data.error) ||
          'Something went wrong. Please try again later.';
        showMsg(errText, 'error');
      }
    } catch (err) {
      showMsg('Network error. Please try again.', 'error');
    }
  });
});
