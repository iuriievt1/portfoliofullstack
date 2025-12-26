(function () {
	const dictionaries = {};
	let currentLanguage = "cs";

	function getNestedValue(object, path) {
		return path.split(".").reduce(function (acc, key) {
			if (acc && typeof acc === "object" && key in acc) {
				return acc[key];
			}
			return null;
		}, object);
	}

	function applyTranslations() {
		const elements = document.querySelectorAll("[data-i18n]");

		elements.forEach(function (element) {
			const key = element.getAttribute("data-i18n");
			const dict = dictionaries[currentLanguage];

			if (!dict || !key) {
				return;
			}

			const value = getNestedValue(dict, key);

			if (typeof value === "string") {
				element.textContent = value;
			}
		});
	}

	function loadLanguage(lang) {
		if (dictionaries[lang]) {
			currentLanguage = lang;
			applyTranslations();
			return Promise.resolve();
		}

		return fetch("/assets/i18n/" + lang + ".json")
			.then(function (response) {
				return response.json();
			})
			.then(function (json) {
				dictionaries[lang] = json;
				currentLanguage = lang;
				applyTranslations();
			})
			.catch(function (error) {
				console.error("Cannot load language:", lang, error);
			});
	}

	window.I18N = {
		setLanguage: function (lang) {
			return loadLanguage(lang);
		},
		getLanguage: function () {
			return currentLanguage;
		}
	};
})();
