document.addEventListener('DOMContentLoaded', () => {
  // refs
  const toggle        = document.getElementById('va-toggle');
  const widget        = document.getElementById('va-widget');
  const closeBtn      = document.getElementById('va-close');
  const msgs          = document.getElementById('va-messages');
  const crumbs        = document.getElementById('va-crumbs');

  const primaryTitle  = document.getElementById('va-primary-title');
  const primaryGroup  = primaryTitle?.closest('.va-group');
  const primaryList   = document.getElementById('va-primary');

  const suggestTitle  = document.getElementById('va-suggest-title');
  const suggestGroup  = suggestTitle?.closest('.va-group');
  const suggestList   = document.getElementById('va-suggest');

  const backBtn       = document.getElementById('va-back');
  const restartBtn    = document.getElementById('va-restart');
  const langSelector  = document.getElementById('languageSwitcher');

  // state
  let data = {};
  let lang = localStorage.getItem('lang') || 'cs';
  let path = ['main'];                     // хлебные крошки
  let autoScroll = true;                   // автопрокрутка вниз
  const DEFAULT_SUGGEST = ['contact','pricing','why'];
  const collapsed = { primary: true, suggest: true }; // изначально свёрнуты

  // i18n UI
  const T = {
    primary: { cs:'Doporučené', ru:'Рекомендуем', en:'Recommended' },
    more:    { cs:'Další témata', ru:'Другие темы', en:'More topics' },
    back:    { cs:'Назад', ru:'Назад', en:'Back' },
    restart: { cs:'Сначала', ru:'Сначала', en:'Restart' },
    menu:    { cs:'Menu', ru:'Меню', en:'Menu' },
    hello:   { cs:'Jak vám mohu pomoci?', ru:'Чем могу помочь?', en:'How can I assist you today?' },
    contactPhone: { cs:'📞 Telefon', ru:'📞 Телефон', en:'📞 Phone' },
    contactWA:    { cs:'💬 WhatsApp', ru:'💬 WhatsApp', en:'💬 WhatsApp' },
    contactTG:    { cs:'✈️ Telegram', ru:'✈️ Telegram', en:'✈️ Telegram' }
  };

  /* ================== INIT / EVENTS ================== */
  toggle.addEventListener('click', () => {
    widget.classList.toggle('hidden');
    if (!msgs.hasChildNodes()) init();
  });

  closeBtn.addEventListener('click', () => widget.classList.add('hidden'));

  if (langSelector) {
    langSelector.addEventListener('change', () => {
      lang = langSelector.value;
      localStorage.setItem('lang', lang);
      applyLangToEverything(); // ПЕРЕВОДИМ ВЕСЬ ИНТЕРФЕЙС И СООБЩЕНИЯ
    });
  }

  msgs.addEventListener('scroll', () => {
    autoScroll = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 60;
  });

  backBtn.addEventListener('click', () => {
    if (path.length > 1) {
      path.pop();
      drawNodeUI(current()); // без нового сообщения
    }
  });

  restartBtn.addEventListener('click', () => softReset()); // мягкий рестарт

  // кликабельные заголовки — свёртывание/разворачивание
  primaryTitle.addEventListener('click', () => toggleGroup('primary'));
  suggestTitle.addEventListener('click', () => toggleGroup('suggest'));

  function toggleGroup(which) {
    collapsed[which] = !collapsed[which];
    if (which === 'primary') {
      primaryGroup.classList.toggle('collapsed', collapsed.primary);
    } else {
      suggestGroup.classList.toggle('collapsed', collapsed.suggest);
    }
  }

  /* ================== CORE ================== */
  function init() {
    fetch('/src/data/faq.json')
      .then(r => r.json())
      .then(json => { data = json; softReset(); })
      .catch(console.error);
  }

  function softReset() {
    msgs.innerHTML = '';
    path = ['main'];

    // Изначально обе группы свёрнуты
    collapsed.primary = true;
    collapsed.suggest = true;
    primaryGroup?.classList.add('collapsed');
    suggestGroup?.classList.add('collapsed');

    crumbs.textContent = T.menu[lang];

    // Приветствие — создаём сообщение с меткой для последующего авто-перевода
    botSay('👋 ' + T.hello[lang], { kind: 'greeting' });

    setTimeout(() => showNode('main'), 300);
  }

  function current() { return path[path.length - 1]; }

  // ==== Сообщения (с метаданными для языка) ====
  function botSay(text, meta = {}) {
    const div = document.createElement('div');
    div.className = 'va-msg bot';
    div.textContent = text;

    // Сохраняем ключи для авто-перевода
    if (meta.kind) div.dataset.kind = meta.kind;           // 'greeting' | 'answer'
    if (meta.nodeId) div.dataset.nodeId = meta.nodeId;     // id узла для ответов

    msgs.appendChild(div);
    keepScroll();
  }

  function userSay(text) {
    const div = document.createElement('div');
    div.className = 'va-msg user';
    div.textContent = text;
    msgs.appendChild(div);
    keepScroll();
  }

  function keepScroll() { if (autoScroll) msgs.scrollTop = msgs.scrollHeight; }

  // ==== Хлебные крошки ====
  function buildCrumbs() {
    if (path.length <= 1) return T.menu[lang];
    const names = path.slice(1).map(id => {
      const n = data[id];
      return n?.question?.[lang] || n?.id || '';
    }).filter(Boolean);
    return [T.menu[lang]].concat(names).join(' › ');
  }

  // ==== Показ узла (добавляет/обновляет ответ) ====
  function showNode(nodeId) {
    const node = data[nodeId];
    if (!node) return;
    crumbs.textContent = buildCrumbs();

    if (node.answer && node.answer[lang]) {
      // Ответ узла как сообщение с привязкой к nodeId
      botSay(node.answer[lang], { kind: 'answer', nodeId });
      if (nodeId === 'contact') renderContactBar(); // контакт-панель как сообщение
    }
    drawLists(node);
  }

  // Перерисовать только UI текущего узла (без нового сообщения)
  function drawNodeUI(nodeId) {
    const node = data[nodeId];
    if (!node) return;
    crumbs.textContent = buildCrumbs();
    drawLists(node);
  }

  // ==== Списки опций ====
  function drawLists(node) {
    // Локализация заголовков групп и кнопок действий
    primaryTitle.textContent = T.primary[lang];
    suggestTitle.textContent = T.more[lang];
    backBtn.textContent = `🔙 ${T.back[lang]}`;
    restartBtn.textContent = `🔄 ${T.restart[lang]}`;

    // Очистка списков
    primaryList.innerHTML = '';
    suggestList.innerHTML = '';

    // PRIMARY — логичные шаги
    const prim = (node.options || []).map(id => data[id]).filter(Boolean);
    renderOptionGroup(primaryList, prim);

    // SUGGESTED — дополнительные темы
    const suggestIds = node.suggest && node.suggest.length
      ? node.suggest
      : DEFAULT_SUGGEST;

    const sug = suggestIds
      .filter(id => id !== node.id && !(node.options||[]).includes(id))
      .map(id => data[id])
      .filter(Boolean);

    renderOptionGroup(suggestList, sug);

    // Состояния свёрнутости — уважаем текущие флаги
    primaryGroup.classList.toggle('collapsed', collapsed.primary);
    suggestGroup.classList.toggle('collapsed', collapsed.suggest);

    // Кнопка «Назад» активна только если есть куда
    backBtn.disabled = !(node.back || path.length > 1);
  }

  // Рендер списка опций (с пагинацией)
  function renderOptionGroup(container, items, pageSize = 5) {
    const parentGroup = container.closest('.va-group');
    if (!items || !items.length) {
      parentGroup.style.display = 'none';
      return;
    }
    parentGroup.style.display = '';
    container.innerHTML = '';

    const pages = [];
    for (let i = 0; i < items.length; i += pageSize) pages.push(items.slice(i, i + pageSize));
    let p = 0;

    const draw = () => {
      container.innerHTML = '';
      pages[p].forEach(item => {
        const btn  = document.createElement('button');
        btn.className = 'va-option';
        const ico  = document.createElement('span'); ico.className = 'ico';  ico.textContent = item.icon || '•';
        const txt  = document.createElement('span'); txt.className = 'txt';  txt.textContent = item.question?.[lang] || '';
        const chev = document.createElement('span'); chev.className = 'chev'; chev.textContent = '›';
        btn.appendChild(ico); btn.appendChild(txt); btn.appendChild(chev);

        btn.onclick = () => {
          userSay(item.question?.[lang] || '');
          path.push(item.id);
          showNode(item.id);
        };

        container.appendChild(btn);
      });

      if (pages.length > 1) {
        const nav = document.createElement('div');
        Object.assign(nav.style, { display:'flex', justifyContent:'center', gap:'8px', marginTop:'4px' });

        const prev = document.createElement('button');
        prev.className = 'va-action'; prev.textContent = '‹';
        prev.disabled = (p === 0);
        prev.onclick = () => { p--; draw(); };

        const next = document.createElement('button');
        next.className = 'va-action'; next.textContent = '›';
        next.disabled = (p === pages.length - 1);
        next.onclick = () => { p++; draw(); };

        nav.appendChild(prev); nav.appendChild(next);
        container.appendChild(nav);
      }
    };
    draw();
  }

  // ==== Контактная панель — как сообщение бота ====
  function renderContactBar() {
    const bar = document.createElement('div');
    bar.className = 'va-contact va-msg bot';
    bar.dataset.kind = 'contactBar'; // чтобы перевести при смене языка

    const b1 = document.createElement('button');
    b1.className = 'phone';  b1.innerHTML = T.contactPhone[lang];
    b1.onclick = () => window.open('tel:+420123456789');

    const b2 = document.createElement('button');
    b2.className = 'wa';     b2.innerHTML = T.contactWA[lang];
    b2.onclick = () => window.open('https://wa.me/420123456789');

    const b3 = document.createElement('button');
    b3.className = 'tg';     b3.innerHTML = T.contactTG[lang];
    b3.onclick = () => window.open('https://t.me/veltora_support');

    bar.appendChild(b1); bar.appendChild(b2); bar.appendChild(b3);
    msgs.appendChild(bar);
    if (autoScroll) msgs.scrollTop = msgs.scrollHeight;
  }

  /* ===== ПОЛНАЯ ЛОКАЛИЗАЦИЯ НА ЛЕТУ (включая старые сообщения) ===== */
  function applyLangToEverything() {
    // 1) Хлебные крошки
    crumbs.textContent = buildCrumbs();

    // 2) Заголовки групп и кнопки действий + перечень опций текущего узла
    drawNodeUI(current());

    // 3) Перевод существующих БОТ-сообщений:
    //    - приветствие (data-kind="greeting")
    //    - ответы узлов (data-kind="answer" data-node-id="...").
    msgs.querySelectorAll('.va-msg.bot').forEach(el => {
      const kind = el.dataset.kind;
      if (kind === 'greeting') {
        el.textContent = '👋 ' + T.hello[lang];
      } else if (kind === 'answer' && el.dataset.nodeId && data[el.dataset.nodeId]?.answer?.[lang]) {
        el.textContent = data[el.dataset.nodeId].answer[lang];
      } else if (kind === 'contactBar') {
        // Переводим подписи кнопок контактов
        const phone = el.querySelector('.phone');
        const wa    = el.querySelector('.wa');
        const tg    = el.querySelector('.tg');
        if (phone) phone.innerHTML = T.contactPhone[lang];
        if (wa)    wa.innerHTML    = T.contactWA[lang];
        if (tg)    tg.innerHTML    = T.contactTG[lang];
      }
    });
  }
});
