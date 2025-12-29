(function () {
	const header = document.getElementById('site-header');
	const burger = document.getElementById('burger');
	const navDrop = document.getElementById('nav-drop');

	if (!header || !burger) return;

	/* ----- Burger toggle (desktop anim line + mobile drop) ----- */
	const toggle = () => {
		const open = burger.classList.toggle('is-open');
		header.classList.toggle('menu-open', open);
		burger.setAttribute('aria-expanded', String(open));
		if (typeof i18n !== 'undefined' && i18n.t) {
			burger.setAttribute('aria-label', open ? i18n.t('aria.closeMenu') : i18n.t('aria.openMenu'));
		}
	};

	burger.addEventListener('click', toggle);

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && burger.classList.contains('is-open')) {
			toggle();
		}
	});

	/* Закрывать мобильную выпадайку по клику на ссылку */
	navDrop?.addEventListener('click', (e) => {
		if (e.target.matches('a') && burger.classList.contains('is-open')) {
			toggle();
		}
	});

	/* ----- Page transitions (zoom/blur) с защитой от «залипания» ----- */
	const enableTransitions = () => {
		let isNavigating = false;

		// ждём animation/transitionend на body или срабатываем по таймауту
		const waitForEnd = (el, fallbackMs) => new Promise((resolve) => {
			let done = false;
			const finish = () => {
				if (done) return;
				done = true;
				el.removeEventListener('animationend', onEnd, true);
				el.removeEventListener('transitionend', onEnd, true);
				resolve();
			};
			const onEnd = (ev) => { if (ev.target === el) finish(); };

			el.addEventListener('animationend', onEnd, true);
			el.addEventListener('transitionend', onEnd, true);

			// можно переопределить из CSS переменной, иначе fallback
			const cssVal = getComputedStyle(el).getPropertyValue('--page-exit-ms').trim();
			const cssMs = cssVal ? parseInt(cssVal, 10) : NaN;
			const timeout = Number.isFinite(cssMs) && cssMs > 0 ? cssMs : fallbackMs;
			setTimeout(finish, timeout);
		});

		// очистка входной анимации при загрузке (страховка)
		const clearEnter = async () => {
			const body = document.body;
			const cssVal = getComputedStyle(body).getPropertyValue('--page-enter-ms').trim();
			const cssMs = cssVal ? parseInt(cssVal, 10) : NaN;
			const timeout = Number.isFinite(cssMs) && cssMs > 0 ? cssMs : 700;
			await waitForEnd(body, timeout);
			body.classList.remove('page-enter');
		};

		// обработка кликов по ссылкам с data-transition
		const links = document.querySelectorAll('a[data-transition]');
		links.forEach((a) => {
			a.addEventListener('click', async (e) => {
				const url = a.getAttribute('href') || '';
				const isExternal = /^(https?:)?\/\//i.test(url);
				const isHash = url.startsWith('#');
				const newTab = a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button === 1;

				// только обычная внутренняя навигация
				if (!url || isExternal || isHash || newTab || isNavigating) return;

				e.preventDefault();
				isNavigating = true;

				const body = document.body;
				body.classList.add('page-exit');

				// ждём завершение animation/transition или 800мс и уходим
				await waitForEnd(body, 800);
				window.location.href = url;
			}, { passive: false });
		});

		// при возврате из bfcache и просто на всякий — всегда чистим классы
		window.addEventListener('pageshow', (e) => {
			document.body.classList.remove('page-exit');
			if (e.persisted) document.body.classList.remove('page-enter');
		});

		// финальная страховка очистки входной анимации
		clearEnter();
	};

	/* ----- Reveal on scroll ----- */
	const enableReveal = () => {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12 });

		document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
	};

	document.addEventListener('DOMContentLoaded', () => {
		enableTransitions();
		enableReveal();
	});
})();

// akce js (ваш блок) — ДОБАВЛЕН только трек-хэндлер клика с геометрией
(function () {
	const track = document.querySelector('.events-track');
	if (!track) return;

	const EASING   = 'cubic-bezier(.25,.8,.25,1)';
	const DURATION = 900;

	const DEPTH_SCALE = { 1: 0.92, 2: 0.96, 3: 1.00 };
	const DEPTH_Z     = { 1: -40, 2: -20, 3: 0 };

	const items = Array.from(track.querySelectorAll('.event-item'));

	/* берём --pad-x из :root (адаптив) */
	function getPadX() {
		const v = getComputedStyle(document.documentElement).getPropertyValue('--pad-x').trim();
		const num = parseFloat(v);
		return Number.isFinite(num) ? num : 110;
	}

	/* базовые ширины из CSS, далее авто-масштаб */
	const baseW = (function () {
		const cs = getComputedStyle(track);
		return {
			1: parseFloat(cs.getPropertyValue('--w-back'))  || 0,
			2: parseFloat(cs.getPropertyValue('--w-mid'))   || 0,
			3: parseFloat(cs.getPropertyValue('--w-front')) || 0
		};
	})();

	function setVar(name, v) { track.style.setProperty(name, v + 'px'); }
	function cssNum(name)    { return parseFloat(getComputedStyle(track).getPropertyValue(name)) || 0; }

	function autoScaleWidths() {
		const padX = getPadX();
		const W    = track.clientWidth;
		const need = (baseW[1] * 0.5) + (baseW[2] * 0.5) + baseW[3];
		const avail = Math.max(0, W - 2 * padX);
		let s = avail / need;
		s = Math.max(0.6, Math.min(1.6, s));
		setVar('--w-back',  baseW[1] * s);
		setVar('--w-mid',   baseW[2] * s);
		setVar('--w-front', baseW[3] * s);
	}

	function sizes() {
		return {
			1: { w: cssNum('--w-back'),  h: cssNum('--h-back'),  y: cssNum('--y-back')  },
			2: { w: cssNum('--w-mid'),   h: cssNum('--h-mid'),   y: cssNum('--y-mid')   },
			3: { w: cssNum('--w-front'), h: cssNum('--h-front'), y: cssNum('--y-front') }
		};
	}

	function computeX(sz) {
		const padX = getPadX();
		const W  = track.clientWidth;
		const x3 = W - padX - sz[3].w;
		const x2 = x3 - (sz[2].w / 2);
		const x1 = x2 - (sz[1] ? (sz[1].w / 1.7) : 0);
		return { 1: x1, 2: x2, 3: x3 };
	}

	function finalTransform(pos, X, SZ) {
		return `translate3d(${X[pos]}px, ${SZ[pos].y}px, ${DEPTH_Z[pos]}px) scale(${DEPTH_SCALE[pos]})`;
	}

	/* мгновенная расстановка */
	function layoutInstant() {
		autoScaleWidths();
		const SZ = sizes();
		const X  = computeX(SZ);
		items.forEach((el) => {
			const pos = el.classList.contains('pos-3') ? 3 : el.classList.contains('pos-2') ? 2 : 1;
			el.style.transform = finalTransform(pos, X, SZ);
		});
	}

	layoutInstant();
	window.addEventListener('resize', layoutInstant, { passive: true });

	let busy = false;
	let timer = null;

	function flipOnce(forward = true) {
		if (busy) return;

		const p1 = track.querySelector('.event-item.pos-1');
		const p2 = track.querySelector('.event-item.pos-2');
		const p3 = track.querySelector('.event-item.pos-3');
		if (!p1 || !p2 || !p3) return;

		busy = true;

		// BEFORE
		const before = new Map();
		[p1, p2, p3].forEach(el => before.set(el, el.getBoundingClientRect()));

		// порядок: 3->1, 1->2, 2->3 (вперёд) или наоборот
		if (forward) {
			p3.classList.replace('pos-3', 'pos-1');
			p1.classList.replace('pos-1', 'pos-2');
			p2.classList.replace('pos-2', 'pos-3');
		} else {
			p1.classList.replace('pos-1', 'pos-3');
			p2.classList.replace('pos-2', 'pos-1');
			p3.classList.replace('pos-3', 'pos-2');
		}

		autoScaleWidths();
		const SZ = sizes();
		const X  = computeX(SZ);

		// финальные трансформации
		[p1, p2, p3].forEach(el => {
			const pos = el.classList.contains('pos-3') ? 3 : el.classList.contains('pos-2') ? 2 : 1;
			el.style.transform = finalTransform(pos, X, SZ);
		});

		// FLIP дельтой
		[p1, p2, p3].forEach((el, idx) => {
			const a = el.getBoundingClientRect();
			const b = before.get(el);
			const dx = b.left - a.left;
			const dy = b.top  - a.top;

			el.animate(
				[
					{ transform: `translate(${dx}px, ${dy}px)`, filter: 'blur(0.4px) brightness(1.02)', opacity: 0.985 },
					{ transform: 'translate(0, 0)',              filter: 'blur(0px) brightness(1)',       opacity: 1 }
				],
				{
					duration: DURATION,
					easing: EASING,
					fill: 'both',
					composite: 'add',
					delay: idx * 40
				}
			);
		});

		setTimeout(() => { busy = false; }, DURATION + 24);
	}

	function start() { stop(); timer = setInterval(() => flipOnce(true), 5400); }
	function stop()  { if (timer) clearInterval(timer); timer = null; }

	start();
	track.addEventListener('mouseenter', stop);
	track.addEventListener('mouseleave', start);

	/* свайп на мобильных */
	let touchX = null;
	track.addEventListener('touchstart', (e) => {
		if (!e.touches || !e.touches[0]) return;
		touchX = e.touches[0].clientX;
	}, { passive: true });
	track.addEventListener('touchend', (e) => {
		if (touchX === null) return;
		const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : touchX;
		const dx = endX - touchX;
		touchX = null;
		if (Math.abs(dx) < 28) return;
		flipOnce(dx < 0);
		start();
	}, { passive: true });

	/* -------- ДОБАВЛЕНО: синхрон текста и единый клик-хэндлер по треку -------- */
	(function enhance() {
		// синхронизируем overlay текст с подписями (если пусто после i18n)
		items.forEach(item => {
			const name   = item.querySelector('.card-name')?.textContent?.trim() || '';
			const teaser = item.querySelector('.card-teaser')?.textContent?.trim() || '';
			const oTitle = item.querySelector('.card-overlay .ovl-body h3');
			const oText  = item.querySelector('.card-overlay .ovl-body p');
			if (oTitle && !oTitle.textContent) oTitle.textContent = name;
			if (oText  && !oText.textContent)  oText.textContent  = teaser;

			// плавно прячем подпись снизу на hover/focus
			const cap = item.querySelector('.caption-out');
			if (cap) {
				cap.style.transition = cap.style.transition || 'opacity 260ms ease, transform 260ms ease';
				const hide = () => { cap.style.opacity = '0'; cap.style.transform = 'translateY(-6px)'; cap.style.pointerEvents = 'none'; };
				const show = () => { cap.style.opacity = '1'; cap.style.transform = 'translateY(0)';    cap.style.pointerEvents = '';     };
				item.addEventListener('mouseenter', hide);
				item.addEventListener('mouseleave', show);
				item.addEventListener('focusin', hide);
				item.addEventListener('focusout', show);
			}
		});

		// единая обработка клика по сцене: вычисляем, в какую карточку попали
		function layout() {
			const SZ = sizes();
			const X  = computeX(SZ);
			return { SZ, X };
		}

		function selectByPos(pos) {
			if (busy) return;
			stop();
			if (pos === 3) {
				const front = track.querySelector('.event-item.pos-3');
				const link = front?.querySelector('.ovl-actions .btn')?.getAttribute('href');
				if (link) window.location.href = link;
				return;
			}
			if (pos === 2) {
				flipOnce(true);    // средняя -> фронт
			} else if (pos === 1) {
				flipOnce(false);   // задняя -> фронт
			}
			setTimeout(start, 5200);
		}

		track.addEventListener('click', (e) => {
			// игнор клика по кнопке «Více», пусть ведёт по ссылке
			if (e.target.closest('.ovl-actions .btn')) return;

			const rect = track.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const { SZ, X } = layout();

			// проверяем попадание в прямоугольники карточек (приоритет фронта)
			const hit = [3,2,1].find(pos => {
				const withinX = x >= X[pos] && x <= X[pos] + SZ[pos].w;
				const withinY = y >= SZ[pos].y && y <= SZ[pos].y + SZ[pos].h;
				return withinX && withinY;
			});

			if (hit) {
				e.preventDefault();
				e.stopPropagation();
				selectByPos(hit);
			}
		}, { passive: false });
	})();
})();

/* =========================
   Galerie filter
   ========================= */
(() => {
  const filter  = document.querySelector('.gal-filter');
  if (!filter) return;

  const btn     = document.getElementById('gal-filter-btn');
  const list    = filter.querySelector('.gal-options');
  const valueEl = filter.querySelector('.gal-select-value');
  const options = Array.from(list.querySelectorAll('.gal-option'));
  const cards   = Array.from(document.querySelectorAll('.gal-grid .gal-card'));

  function applyFilter(val){
    const v = (val || 'vse').toLowerCase();
    cards.forEach(card => {
      const cats = (card.dataset.cat || '').toLowerCase().trim().split(/\s+/);
      const show = (v === 'vse' || cats.includes(v));
      card.classList.toggle('is-hidden', !show);
    });
  }

  // открыть/закрыть список
  btn.addEventListener('click', () => {
    const open = list.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // выбор опции
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('is-active'));
      opt.classList.add('is-active');

      valueEl.textContent = opt.textContent.trim();
      list.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');

      applyFilter(opt.dataset.value || 'vse');
    });
  });

  // клик вне — закрыть
  document.addEventListener('click', (e) => {
    if (!filter.contains(e.target)) {
      list.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // инициализация (поддержка data-current="...")
  applyFilter(filter.dataset.current || 'vse');
})();


/* ===== Modal open/close (для кнопки "Objednat" и окна #concert-modal) ===== */
(() => {
  const body = document.body;

  function openModal(id){
    const m = document.getElementById(id);
    if (!m) return;
    m._lastFocus = document.activeElement;

    m.classList.add('is-open');
    m.setAttribute('aria-hidden','false');
    m.removeAttribute('hidden');

    body.dataset.scrollLock = body.style.overflow || '';
    body.style.overflow = 'hidden';

    const focusable = m.querySelector('.concert-modal__close') || m.querySelector('[tabindex],button,input,textarea,select,a[href]');
    if (focusable) focusable.focus();
  }

  function closeModal(m){
    if (!m) return;
    m.classList.remove('is-open');
    m.setAttribute('aria-hidden','true');

    body.style.overflow = body.dataset.scrollLock || '';
    delete body.dataset.scrollLock;

    if (m._lastFocus && typeof m._lastFocus.focus === 'function') {
      m._lastFocus.focus();
    }
  }

  // ОТКРЫТЬ: поддерживаем и data-open, и data-concert-open
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open],[data-concert-open]');
    if (opener) {
      const id =
        opener.getAttribute('data-open') ||
        opener.getAttribute('data-concert-open') ||
        'concert-modal'; // если атрибут без значения
      openModal(id);
    }
  });

  /// ЗАКРЫТЬ: поддерживаем и data-close, и data-concert-close
document.addEventListener('click', (e) => {
  const closer = e.target.closest('[data-close],[data-concert-close]');
  if (!closer) return;

  // нашли ближайший диалог или корневую модалку
  const maybe = closer.closest('.concert-modal, [role="dialog"]');
  // гарантированно получаем корень .concert-modal
  const modalRoot = maybe
    ? (maybe.classList.contains('concert-modal') ? maybe : maybe.closest('.concert-modal'))
    : document.getElementById('concert-modal');

  if (modalRoot) closeModal(modalRoot);
});
})();

(() => {
  const root = document.querySelector('.concerts-types');
  if (!root) return;

  const items = Array.from(root.querySelectorAll('.ct-item'));
  let closeTimer = null;

  function activate(type){
    // сбросить предыдущий автозакрывающий таймер
    if (closeTimer){
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    items.forEach(it => {
      const btn = it.querySelector('.ct-pill');
      const gal = it.querySelector('.ct-gallery');
      const match = btn?.dataset.type === type;

      btn?.classList.toggle('is-active', match);
      btn?.setAttribute('aria-expanded', match ? 'true' : 'false');

      if (gal){
        if (match){
          gal.classList.add('is-open');
          gal.removeAttribute('hidden');
        } else {
          gal.classList.remove('is-open');
          gal.setAttribute('hidden','');
        }
      }
    });

    // автозакрыть через 3.5 сек, ТОЛЬКО после клика
    closeTimer = setTimeout(() => {
      const activeItem = items.find(it => it.querySelector('.ct-pill.is-active'));
      if (!activeItem) return;

      const btn = activeItem.querySelector('.ct-pill');
      const gal = activeItem.querySelector('.ct-gallery');

      btn?.classList.remove('is-active');
      btn?.setAttribute('aria-expanded','false');
      if (gal){
        gal.classList.remove('is-open');
        gal.setAttribute('hidden','');
      }
    }, 3500);
  }

  // только клики
  items.forEach(it => {
    const btn = it.querySelector('.ct-pill');
    if (!btn) return;
    btn.addEventListener('click', () => activate(btn.dataset.type));
  });

  // без автоинициализации — по умолчанию все закрыты
})();

(function(){
  const audio = document.getElementById('bgm');
  if (!audio) return;

  audio.volume = 0.0;

  // Плавный fade-in
  function fadeTo(target, dur=600){
    return new Promise(res=>{
      const start = audio.volume;
      const delta = Math.max(0, Math.min(1, target)) - start;
      const t0 = performance.now();
      const step = t => {
        const k = Math.min(1, (t - t0) / dur);
        audio.volume = start + delta * k;
        if (k < 1) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });
  }

  // Попытка автозапуска на загрузке
  async function tryAutoplay(){
    try{
      await audio.play();           // часто упадёт — это ок
      await fadeTo(0.35, 700);
      detachUnlockers();
    }catch(_){
      attachUnlockers();            // ждём ПЕРВОГО жеста
    }
  }

  // Разблокировка WebAudio (некоторые движки требуют resume)
  let ac;
  async function resumeAudioContext(){
    try{
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state !== 'running') await ac.resume();
    }catch(_){}
  }

  // Список «жестов», которые считаются пользовательским действием
  const EVENTS = ['pointerdown','pointerup','touchstart','touchend','keydown','wheel','pointermove'];
  function onFirstUserGesture(){
    // Сняли слушатели сразу, чтобы не дёргались
    detachUnlockers();
    resumeAudioContext().finally(async ()=>{
      try{
        // некоторые браузеры требуют вызвать play в САМОМ обработчике жеста
        const p = audio.play();
        if (p && typeof p.then === 'function') await p;
        await fadeTo(0.35, 500);
      }catch(_){
        // Если даже тут откажут — не мучаем пользователя
      }
    });
  }
  function attachUnlockers(){
    EVENTS.forEach(ev => window.addEventListener(ev, onFirstUserGesture, { once: true, passive: true }));
  }
  function detachUnlockers(){
    EVENTS.forEach(ev => window.removeEventListener(ev, onFirstUserGesture, { passive: true }));
  }

  // Пауза при сворачивании / продолжение при возврате
  document.addEventListener('visibilitychange', async ()=>{
    if (document.hidden){
      try { await fadeTo(0.0, 200); audio.pause(); } catch(_){}
    } else {
      tryAutoplay();
    }
  });

  // Запуск
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', tryAutoplay, { once: true });
  } else {
    tryAutoplay();
  }
})();

(function(){
  const btn = document.querySelector('.mp-left .mp-more-btn');
  const box = document.getElementById('mp-more');
  if (!btn || !box) return;

  function toggle(){
    const open = box.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));

    // Переключаем подписи (совместимо с твоим i18n — тексты берутся из DOM)
    const labelOpen  = btn.querySelector('.label-open');
    const labelClose = btn.querySelector('.label-close');
    if (labelOpen && labelClose){
      labelOpen.hidden  = open;
      labelClose.hidden = !open;
    }

    // Для плавного раскрытия измерим фактическую высоту
    if (open){
      // выставим реальную max-height из scrollHeight
      box.style.maxHeight = box.scrollHeight + 'px';
      // после анимации снимем inline (чтоб работал ресайз/перевод)
      box.addEventListener('transitionend', function te(e){
        if (e.propertyName === 'max-height'){ box.style.maxHeight = ''; box.removeEventListener('transitionend', te); }
      });
    } else {
      // при закрытии — фиксируем текущую высоту и сразу сворачиваем
      box.style.maxHeight = box.scrollHeight + 'px';
      requestAnimationFrame(()=>{ box.style.maxHeight = '0px'; });
    }
  }

  btn.addEventListener('click', toggle);
})();


(function(){
  const LS_KEY='cookieConsentV2';
  const $banner=document.getElementById('cb-banner');
  const $ovl=document.getElementById('cb-ovl');
  const $modal=document.getElementById('cb-modal');
  const $analytics=document.getElementById('cb-analytics');
  const $ads=document.getElementById('cb-ads');

  // utils
  const show=(el)=>{ el.classList.add('cb-show'); el.style.display='block'; };
  const hide=(el)=>{ el.classList.remove('cb-show'); el.style.display='none'; };
  const openModal=()=>{ show($ovl); $modal.style.display='block'; };
  const closeModal=()=>{ hide($ovl); $modal.style.display='none'; };

  function applyConsent(c){
    gtag('consent','update',{
      analytics_storage: c.analytics ? 'granted':'denied',
      ad_storage:        c.ads ? 'granted':'denied',
      ad_user_data:      c.ads ? 'granted':'denied',
      ad_personalization:c.ads ? 'granted':'denied'
    });
  }
  function saveConsent(c){
    localStorage.setItem(LS_KEY, JSON.stringify(c));
    applyConsent(c);
  }
  function loadConsent(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY)); }
    catch(e){ return null; }
  }

  // initial
  const saved=loadConsent();
  if(saved){
    $analytics.checked=!!saved.analytics;
    $ads.checked=!!saved.ads;
    applyConsent(saved);
    hide($banner);
  }else{
    show($banner);
  }

  // buttons
  document.getElementById('cb-accept').addEventListener('click',()=>{
    const c={analytics:true, ads:true};
    saveConsent(c); hide($banner);
  });
  document.getElementById('cb-decline').addEventListener('click',()=>{
    const c={analytics:false, ads:false};
    saveConsent(c); hide($banner);
  });
  document.getElementById('cb-settings').addEventListener('click',openModal);
  document.getElementById('cb-accept2').addEventListener('click',()=>{
    const c={analytics:true, ads:true};
    saveConsent(c); closeModal(); hide($banner);
  });
  document.getElementById('cb-save').addEventListener('click',()=>{
    const c={analytics:$analytics.checked, ads:$ads.checked};
    saveConsent(c); closeModal(); hide($banner);
  });
  document.getElementById('cb-cancel').addEventListener('click',closeModal);

  // close modal on overlay click / esc
  $ovl.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

  // expose reopen function (optional)
  window.reopenCookieBanner = function(){
    show($banner);
  };
})();
