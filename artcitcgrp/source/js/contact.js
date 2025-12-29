document.addEventListener("DOMContentLoaded", function () {
	const contactForm = document.getElementById("contact-form");
	const contactMessage = document.getElementById("contact-form-message");
	const contactServiceSelect = document.getElementById("contact-service");
	const contactSubservices = document.getElementById("contact-subservices");

	/* Показ / скрытие подуслуг при выборе Stavebnictví */

	if (contactServiceSelect && contactSubservices) {
		function updateSubservicesVisibility() {
			const value = contactServiceSelect.value;
			contactSubservices.style.display = value === "construction" ? "block" : "none";
		}

		contactServiceSelect.addEventListener("change", updateSubservicesVisibility);
		updateSubservicesVisibility();
	}

	/* Отправка формы на отдельный PHP */

	if (contactForm && contactMessage) {
		const contactMsgRequired = document.getElementById("contact-msg-required");
		const contactMsgSuccess = document.getElementById("contact-msg-success");
		const contactMsgError = document.getElementById("contact-msg-error");

		contactForm.addEventListener("submit", function (event) {
			event.preventDefault();

			contactMessage.textContent = "";
			contactMessage.classList.remove("is-success", "is-error");

			const formData = new URLSearchParams();

			const emailInput = contactForm.querySelector('input[name="email"]');
			const phoneInput = contactForm.querySelector('input[name="phone"]');
			const nameInput = contactForm.querySelector('input[name="name"]');
			const companyInput = contactForm.querySelector('input[name="company"]');
			const serviceSelect = contactForm.querySelector('select[name="service"]');
			const messageInput = contactForm.querySelector('textarea[name="message"]');
			const notRobotInput = contactForm.querySelector('input[name="notRobot"]');
			const privacyInput = contactForm.querySelector('input[name="privacy"]');
			const subserviceInputs = contactForm.querySelectorAll('input[name="subservices"]:checked');

			const email = emailInput ? emailInput.value.trim() : "";
			const phone = phoneInput ? phoneInput.value.trim() : "";
			const name = nameInput ? nameInput.value.trim() : "";
			const company = companyInput ? companyInput.value.trim() : "";
			const service = serviceSelect ? serviceSelect.value : "";
			const message = messageInput ? messageInput.value.trim() : "";
			const notRobot = notRobotInput ? notRobotInput.checked : false;
			const privacy = privacyInput ? privacyInput.checked : false;

			const subservices = [];
			subserviceInputs.forEach(function (input) {
				subservices.push(input.value);
			});

			// Проверка обязательных полей
			if (!email || !phone || !name || !service || !notRobot || !privacy) {
				if (contactMsgRequired) {
					contactMessage.textContent = contactMsgRequired.textContent;
				} else {
					contactMessage.textContent = "Vyplňte prosím všechna povinná pole.";
				}
				contactMessage.classList.add("is-error");
				return;
			}

			formData.append("email", email);
			formData.append("phone", phone);
			formData.append("name", name);
			formData.append("company", company);
			formData.append("service", service);
			formData.append("message", message);
			formData.append("subservices", subservices.join(", "));
			formData.append("notRobot", notRobot ? "1" : "0");
			formData.append("privacy", privacy ? "1" : "0");

			fetch("/source/php/contact.php", {
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
						if (contactMsgSuccess) {
							contactMessage.textContent = contactMsgSuccess.textContent;
						} else {
							contactMessage.textContent = "Děkujeme, vaše zpráva byla odeslána.";
						}
						contactMessage.classList.add("is-success");
						contactForm.reset();

						if (contactSubservices) {
							contactSubservices.style.display = "none";
						}
					} else {
						if (contactMsgError) {
							contactMessage.textContent = contactMsgError.textContent;
						} else {
							contactMessage.textContent = "Něco se pokazilo, zkuste to prosím znovu.";
						}
						contactMessage.classList.add("is-error");
						console.error("Contact form error:", data);
					}
				})
				.catch(function (error) {
					if (contactMsgError) {
						contactMessage.textContent = contactMsgError.textContent;
					} else {
						contactMessage.textContent = "Něco se pokazilo, zkuste to prosím znovu.";
					}
					contactMessage.classList.add("is-error");
					console.error("Contact form error:", error);
				});
		});
	}
});
