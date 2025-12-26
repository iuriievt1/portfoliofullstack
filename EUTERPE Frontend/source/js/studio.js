// studio.js
(function () {
  // УСЛУГИ НА ДВУХ ЯЗЫКАХ
  const SERVICES = {
    cs: [
      {
        title: "Videozáznamy klasických koncertů",
        text: "Snímání více kamerami z různých perspektiv, samostatný záznam zvuku a citlivý střih. Výsledkem je působivé reportážní video nebo celovečerní koncertní záznam."
      },
      {
        title: "Videozáznamy dětských koncertů",
        text: "Naši kameramani z EUTERPE STUDIO natočí vystoupení vašich talentovaných žáků a sestříhají film, který potěší učitele, rodiče i děti. Obvykle používáme dvě kamery pro celkové i detailní záběry a při střihu dbáme na to, aby ve filmu byly všechny důležité, radostné a nezapomenutelné momenty."
      },
      {
        title: "Videozáznamy dalších akcí",
        text: "Natáčíme kulturní festivaly, slavnostní večery, soutěže i firemní akce. Spojujeme dokumentární přístup s filmovou estetikou, aby záznam zachytil atmosféru, emoce i vizuální krásu celé události."
      },
      {
        title: "Imageová videa",
        text: "EUTERPE STUDIO vytváří imageová videa pro sólové umělce i skupiny. Hlavním cílem je vytvořit nebo podtrhnout váš scénický image tak, aby zapůsobil na publikum i profesionály v oboru."
      },
      {
        title: "Prezentační video",
        text: "Připravujeme prezentační videa o umělcích, souborech, festivalech i projektech, vhodná pro web, sociální sítě i partnery. Naši tvůrci pro vás připraví kreativní scénář zaměřený na vaše cíle a sdělení."
      },
      {
        title: "Zvukový záznam zpěvu",
        text: "Realizujeme profesionální zvukové nahrávky pro soutěžní přihlášky, portfolia zpěváků i přihlášky do předních světových divadel. Pracujeme s kvalitním vybavením a dbáme na přirozený, nosný a reprezentativní zvuk hlasu."
      },
      {
        title: "Hudební aranže",
        text: "EUTERPE STUDIO spolupracuje s předními skladateli a aranžéry z různých zemí. Připravujeme úpravy rockových skladeb pro symfonické orchestry i současné aranže populárních a nových písní na míru konkrétním interpretům."
      },
      {
        title: "Sound production",
        text: "Pomáháme vybrat ideální podmínky pro každého interpreta i repertoár. Zajišťujeme výběr a rozmístění mikrofonů, umělecký dohled nad nahráváním i hrubý mix, který připraví materiál pro finální postprodukci."
      },
      {
        title: "Imageové fotografování",
        text: "Tvoříme kreativní fotografie pro vaše portfolio, které odhalují osobnost interpreta. Fotografové EUTERPE STUDIO mají zkušenosti s hvězdami klasické, operní i populární scény a vědí, jaké snímky fungují na producenty, publikum i poroty."
      },
      {
        title: "Humorná videa s přáními",
        text: "Originální dárek pro kolegy, přátele nebo rodinu. Scénárista EUTERPE STUDIO pro vás připraví jedinečný námět, který v humorné formě vypráví o životě, úspěchu či významné události vašich blízkých. Kreativní střih a moderní zpracování udělají z videa vzpomínku, ke které se budete rádi vracet."
      }
    ],
    en: [
      {
        title: "Classical concert recordings",
        text: "Multi-camera recording from different angles, dedicated audio capture and careful editing. The result is an engaging concert film or a full-length documentation of the performance."
      },
      {
        title: "Children’s concert recordings",
        text: "Our EUTERPE STUDIO camera crew will capture the performances of your talented students and edit a film that delights teachers, parents and the children themselves. We usually work with two cameras for wide shots and close-ups and make sure the final cut includes all the key, joyful and unforgettable moments."
      },
      {
        title: "Recordings of other events",
        text: "We film cultural festivals, gala evenings, competitions and corporate events. Our approach combines documentary sensitivity with cinematic visuals so that the video conveys atmosphere, emotions and the visual character of the whole event."
      },
      {
        title: "Image / concept videos",
        text: "EUTERPE STUDIO creates image-driven videos for solo artists and ensembles. The main goal is to shape or highlight your stage image in a way that resonates with audiences as well as industry professionals."
      },
      {
        title: "Presentation videos",
        text: "We produce presentation videos about artists, ensembles, festivals and creative projects, tailored for websites, social media and partners. Our team develops a creative concept focused on your goals, message and target audience."
      },
      {
        title: "Vocal recording sessions",
        text: "We provide professional vocal recordings for competition applications, artist portfolios and submissions to leading opera houses and theatres. We work with high-end equipment and aim for a natural, expressive and representative sound of the voice."
      },
      {
        title: "Musical arrangements",
        text: "EUTERPE STUDIO collaborates with renowned composers and arrangers from different countries. We create arrangements of iconic rock pieces for symphony orchestras as well as contemporary versions of popular and new songs tailored to specific performers."
      },
      {
        title: "Sound production",
        text: "We help you choose the optimal recording conditions and repertoire. We take care of microphone selection and placement, artistic supervision during the session and a solid rough mix that prepares the material for final post-production."
      },
      {
        title: "Image / portfolio photography",
        text: "We create expressive, image-driven photographs for your portfolio that reveal your artistic personality. EUTERPE STUDIO photographers have worked with stars of classical, opera and popular music and know what kind of images work best for producers, audiences and juries."
      },
      {
        title: "Humorous greeting videos",
        text: "A unique gift for colleagues, friends or family. Our screenwriter at EUTERPE STUDIO will design a playful concept that tells the story of your loved one or their big achievement in a humorous way. Creative editing and modern styling turn the video into a keepsake everyone will want to watch again and again."
      }
    ]
  };

  const NEXT_LABEL = {
    cs: "Další služba",
    en: "Next service"
  };

  // ЭЛЕМЕНТЫ В DOM
  const rowEl = document.querySelector(".js-service-row");
  if (!rowEl) return;

  const numberEl = document.getElementById("service-number");
  const titleEl = document.getElementById("service-title");
  const textEl = document.getElementById("service-text");
  const nextBtn = rowEl.querySelector(".service-next");

  let currentIndex = 0;

  function getLang() {
    if (window.$i18n && window.$i18n.lang) return window.$i18n.lang;
    return "cs";
  }

  function formatNumber(idx) {
    const n = idx + 1; // 0–9 -> 1–10
    return n < 10 ? "0" + n : String(n);
  }

  function renderService() {
    const lang = getLang();
    const list = SERVICES[lang] || SERVICES.cs;
    const item = list[currentIndex] || list[0];

    numberEl.textContent = formatNumber(currentIndex);
    titleEl.textContent = item.title;
    textEl.textContent = item.text;

    if (nextBtn) {
      nextBtn.textContent = NEXT_LABEL[lang] || NEXT_LABEL.cs;
    }
  }

  function goNext() {
    rowEl.classList.add("is-changing");

    setTimeout(() => {
      const lang = getLang();
      const list = SERVICES[lang] || SERVICES.cs;
      currentIndex = (currentIndex + 1) % list.length;
      renderService();
      rowEl.classList.remove("is-changing");
    }, 250);
  }

  // КЛИКИ
  rowEl.addEventListener("click", (event) => {
    if (event.target.closest(".service-next")) return;
    goNext();
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      goNext();
    });
  }

  // ===== РЕАКЦИЯ НА СМЕНУ ЯЗЫКА =====

  // 1) Если $i18n уже есть — оборачиваем switchLang
  if (window.$i18n && typeof window.$i18n.switchLang === "function") {
    const originalSwitch = window.$i18n.switchLang;

    window.$i18n.switchLang = async function (lang) {
      await originalSwitch(lang);  // сначала переводы по data-i18n
      renderService();             // потом обновляем услугу
    };
  }

  // 2) Фоллбек: ловим клик по .lang-switch (если порядок скриптов не идеален)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".lang-switch");
    if (!btn) return;
    // небольшая задержка, чтобы translate.js успел подгрузить JSON и применить тексты
    setTimeout(renderService, 80);
  });

  // СТАРТОВЫЙ РЕНДЕР
  renderService();
})();


// ==== CTA MODAL ZANECHAT POPTÁVKU ====
(function () {
  const modal = document.getElementById("studio-modal");
  if (!modal) return;

  const openBtn = document.querySelector(".js-studio-cta-open");
  const closeEls = modal.querySelectorAll(".js-studio-cta-close");

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (openBtn) {
    openBtn.addEventListener("click", openModal);
  }

  closeEls.forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
})();
