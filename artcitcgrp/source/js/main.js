document.addEventListener("DOMContentLoaded", function () {
	const header = document.querySelector(".header");
	const burger = document.querySelector(".header__burger");
	const lang = document.querySelector(".lang");
	const langCurrent = document.querySelector(".lang__current");
	const langLabel = document.querySelector("[data-current-lang]");
	const langOptions = document.querySelectorAll(".lang__option");

	/* Бургер */

	if (burger && header) {
		burger.addEventListener("click", function () {
			const isOpen = header.classList.toggle("is-open");
			burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
		});
	}

	/* Выпадающее меню языков */

	if (lang && langCurrent) {
		langCurrent.addEventListener("click", function () {
			const isOpen = lang.classList.toggle("is-open");
			langCurrent.setAttribute("aria-expanded", isOpen ? "true" : "false");
		});

		document.addEventListener("click", function (event) {
			if (!lang.contains(event.target)) {
				lang.classList.remove("is-open");
				langCurrent.setAttribute("aria-expanded", "false");
			}
		});
	}

	langOptions.forEach(function (button) {
		button.addEventListener("click", function () {
			const langCode = button.getAttribute("data-lang");

			if (!langCode) {
				return;
			}

			// сохраняем выбранный язык
			try {
				localStorage.setItem("arctic_lang", langCode);
			} catch (e) {
				// если localStorage недоступен — игнорируем
			}

			if (window.I18N) {
				window.I18N.setLanguage(langCode);
			}

			if (langLabel) {
				// показываем CZ вместо CS
				langLabel.textContent = langCode === "cs" ? "CZ" : langCode.toUpperCase();
			}

			if (lang && langCurrent) {
				lang.classList.remove("is-open");
				langCurrent.setAttribute("aria-expanded", "false");
			}
		});
	});

	/* Стартовый язык */

	let initialLang = "cs";

	try {
		const storedLang = localStorage.getItem("arctic_lang");
		if (storedLang) {
			initialLang = storedLang;
		}
	} catch (e) {
		// если localStorage недоступен — оставляем cs
	}

	if (window.I18N) {
		window.I18N.setLanguage(initialLang);
	}

	if (langLabel) {
		// тоже CZ вместо CS при загрузке
		langLabel.textContent = initialLang === "cs" ? "CZ" : initialLang.toUpperCase();
	}

	/* Hero cards */

	const heroCards = document.querySelectorAll("[data-hero-card]");

	function setActiveHeroCard(target) {
		heroCards.forEach(function (card) {
			if (card === target) {
				card.classList.add("is-flipped");
			} else {
				card.classList.remove("is-flipped");
			}
		});
	}

	if (heroCards.length > 0) {
		const prefersHover = window.matchMedia("(hover: hover)").matches;

		heroCards.forEach(function (card) {
			if (prefersHover) {
				card.addEventListener("mouseenter", function () {
					card.classList.add("is-flipped");
				});

				card.addEventListener("mouseleave", function () {
					card.classList.remove("is-flipped");
				});
			}

			card.addEventListener("click", function () {
				if (prefersHover) {
					return;
				}

				if (card.classList.contains("is-flipped")) {
					card.classList.remove("is-flipped");
				} else {
					setActiveHeroCard(card);
				}
			});
		});
	}

	/* Hero background slideshow */

	const heroBackground = document.querySelector(".hero__background");

	if (heroBackground) {
		const totalImages = 10;
		const layers = [];

		for (let i = 1; i <= totalImages; i += 1) {
			const number = String(i).padStart(2, "0");
			const layer = document.createElement("div");

			layer.className = "hero__bg-layer";
			layer.style.backgroundImage = 'url("assets/photo/hero/' + number + '.jpg")';

			if (i === 1) {
				layer.classList.add("is-active");
			}

			heroBackground.appendChild(layer);
			layers.push(layer);
		}

		let currentIndex = 0;

		if (layers.length > 1) {
			setInterval(function () {
				const nextIndex = (currentIndex + 1) % layers.length;

				layers[currentIndex].classList.remove("is-active");
				layers[nextIndex].classList.add("is-active");

				currentIndex = nextIndex;
			}, 5000);
		}
	}
});

/* Footer form: send email via PHP */

const footerForm = document.getElementById("footer-form");
const footerMessage = document.querySelector(".footer-form__message");

if (footerForm && footerMessage) {
	footerForm.addEventListener("submit", function (event) {
		event.preventDefault();

		const input = footerForm.querySelector(".footer-form__input");

		if (!input) {
			return;
		}

		const email = input.value.trim();

		if (!email) {
			return;
		}

		const formData = new URLSearchParams();
		formData.append("email", email);

		fetch("/source/php/footer.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: formData.toString()
		})
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				if (data && data.success) {
					footerMessage.classList.add("is-visible");
					input.value = "";
				} else {
					console.error("Footer form error:", data);
				}
			})
			.catch(function (error) {
				console.error("Footer form error:", error);
			});
	});
}

/* Services: sliders */

const serviceSliders = document.querySelectorAll("[data-service-slider]");

if (serviceSliders.length > 0) {
	serviceSliders.forEach(function (slider) {
		const images = slider.querySelectorAll(".service-card__image");

		if (images.length <= 1) {
			return;
		}

		let currentIndex = 0;

		// первая уже с is-active в HTML, но на всякий случай
		images[currentIndex].classList.add("is-active");

		setInterval(function () {
			images[currentIndex].classList.remove("is-active");
			currentIndex = (currentIndex + 1) % images.length;
			images[currentIndex].classList.add("is-active");
		}, 3000);
	});
}

/* Consultation modal */

const consultationBtn = document.querySelector(".about-cta__btn");
const modal = document.getElementById("consultation-modal");
const modalForm = document.getElementById("consultation-form");
const modalMessage = document.getElementById("modal-form-message");
const otherTopicWrapper = document.getElementById("modal-other-topic-wrapper");

function openModal() {
	if (!modal) {
		return;
	}
	modal.classList.add("is-open");
	modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
	if (!modal) {
		return;
	}
	modal.classList.remove("is-open");
	modal.setAttribute("aria-hidden", "true");
}

if (consultationBtn && modal) {
	consultationBtn.addEventListener("click", function (event) {
		event.preventDefault();
		openModal();
	});
}

if (modal) {
	const closeElements = modal.querySelectorAll("[data-modal-close]");

	closeElements.forEach(function (el) {
		el.addEventListener("click", function () {
			closeModal();
		});
	});
}

document.addEventListener("keydown", function (event) {
	if (event.key === "Escape" && modal && modal.classList.contains("is-open")) {
		closeModal();
	}
});

/* Показ поля для своего варианта темы */

if (modalForm && otherTopicWrapper) {
	const topicRadios = modalForm.querySelectorAll('input[name="topic"]');

	function updateOtherTopicVisibility() {
		let show = false;

		topicRadios.forEach(function (radio) {
			if (radio.checked && radio.value === "other") {
				show = true;
			}
		});

		otherTopicWrapper.style.display = show ? "flex" : "none";
	}

	topicRadios.forEach(function (radio) {
		radio.addEventListener("change", updateOtherTopicVisibility);
	});

	updateOtherTopicVisibility();
}

/* Отправка формы модалки через PHP (тот же endpoint, что и футер) */

if (modalForm && modalMessage) {
	const modalMsgRequired = document.getElementById("modal-msg-required");
	const modalMsgSuccess = document.getElementById("modal-msg-success");
	const modalMsgError = document.getElementById("modal-msg-error");

	modalForm.addEventListener("submit", function (event) {
		event.preventDefault();

		modalMessage.textContent = "";
		modalMessage.classList.remove("is-success", "is-error");

		const formData = new URLSearchParams();

		const phoneInput = modalForm.querySelector('input[name="phone"]');
		const emailInput = modalForm.querySelector('input[name="email"]');
		const topicRadio = modalForm.querySelector('input[name="topic"]:checked');
		const otherTopicInput = modalForm.querySelector('textarea[name="otherTopic"]');

		const phone = phoneInput ? phoneInput.value.trim() : "";
		const email = emailInput ? emailInput.value.trim() : "";
		const topicValue = topicRadio ? topicRadio.value : "";
		const otherTopic = otherTopicInput ? otherTopicInput.value.trim() : "";

		if (!phone || !email || !topicValue) {
			if (modalMsgRequired) {
				modalMessage.textContent = modalMsgRequired.textContent;
			} else {
				modalMessage.textContent = "Vyplňte prosím všechna povinná pole.";
			}
			modalMessage.classList.add("is-error");
			return;
		}

		formData.append("phone", phone);
		formData.append("email", email);
		formData.append("topic", topicValue);
		formData.append("otherTopic", otherTopic);

		fetch("/source/php/footer-form.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: formData.toString()
		})
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				if (data && data.success) {
					if (modalMsgSuccess) {
						modalMessage.textContent = modalMsgSuccess.textContent;
					} else {
						modalMessage.textContent = "Děkujeme, brzy se vám ozveme.";
					}
					modalMessage.classList.add("is-success");
					modalForm.reset();

					if (otherTopicWrapper) {
						otherTopicWrapper.style.display = "none";
					}
				} else {
					if (modalMsgError) {
						modalMessage.textContent = modalMsgError.textContent;
					} else {
						modalMessage.textContent = "Něco se pokazilo, zkuste to prosím znovu.";
					}
					modalMessage.classList.add("is-error");
					console.error("Consultation form error:", data);
				}
			})
			.catch(function (error) {
				if (modalMsgError) {
					modalMessage.textContent = modalMsgError.textContent;
				} else {
					modalMessage.textContent = "Něco se pokazilo, zkuste to prosím znovu.";
				}
				modalMessage.classList.add("is-error");
				console.error("Consultation form error:", error);
			});
	});
}
/* Cookie banner */

document.addEventListener("DOMContentLoaded", function () {
	const cookieBanner = document.getElementById("cookie-banner");
	const cookieAcceptBtn = document.querySelector(".cookie-banner__btn--accept");

	if (!cookieBanner || !cookieAcceptBtn) {
		return;
	}

	let cookiesAccepted = false;

	try {
		cookiesAccepted = localStorage.getItem("arctic_cookies_accepted") === "1";
	} catch (e) {
		// localStorage недоступен — просто показываем баннер
	}

	if (cookiesAccepted) {
		cookieBanner.classList.add("cookie-banner--hidden");
	}

	cookieAcceptBtn.addEventListener("click", function () {
		try {
			localStorage.setItem("arctic_cookies_accepted", "1");
		} catch (e) {
			// игнорируем ошибки
		}
		cookieBanner.classList.add("cookie-banner--hidden");
	});
});
