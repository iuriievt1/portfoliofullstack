document.addEventListener("DOMContentLoaded", function () {
  const estimateSection = document.querySelector(".estimate");
  if (!estimateSection) return;

  const steps = Array.from(document.querySelectorAll(".estimate-step"));
  const totalSteps = steps.length;
  const currentStepEl = document.getElementById("estimate-current-step");
  const totalStepsEl = document.getElementById("estimate-total-steps");
  const progressBar = document.getElementById("estimate-progress-bar");
  const prevBtn = document.getElementById("estimate-prev");
  const nextBtn = document.getElementById("estimate-next");
  const areaInput = document.getElementById("estimate-area");
  const imageBox = document.querySelector("[data-estimate-image]");
  const contactBlock = document.getElementById("estimate-contact");

  const modal = document.getElementById("estimate-modal");
  const modalText = document.getElementById("estimate-modal-text");
  const modalTitle = modal ? modal.querySelector(".estimate-modal__title") : null;
  const modalCloseEls = modal ? modal.querySelectorAll("[data-modal-close]") : [];

  let currentIndex = 0;

  if (totalStepsEl) {
    totalStepsEl.textContent = String(totalSteps);
  }

  const stepImages = [
    "/assets/photo/05.jpg",
    "/assets/photo/03.jpg",
    "/assets/photo/07 copy.jpg",
    "/assets/photo/12.jpg",
    "/assets/photo/45.jpg"
  ];

  /* ---------- Modal ---------- */

  function openModal(message, type) {
    if (!modal) return;
    if (modalText) {
      modalText.textContent = message;
    }
    if (modalTitle) {
      modalTitle.textContent = type === "success" ? "Success" : "Error!";
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  modalCloseEls.forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  /* ---------- Steps ---------- */

  function updateStep() {
    steps.forEach(function (step, index) {
      step.classList.toggle("is-active", index === currentIndex);
    });

    if (currentStepEl) {
      currentStepEl.textContent = String(currentIndex + 1);
    }

    if (progressBar) {
      const percent = ((currentIndex + 1) / totalSteps) * 100;
      progressBar.style.width = percent + "%";
    }

    if (imageBox && stepImages[currentIndex]) {
      imageBox.style.backgroundImage = 'url("' + stepImages[currentIndex] + '")';
    }

    if (contactBlock) {
      if (currentIndex === totalSteps - 1) {
        contactBlock.classList.add("is-visible");
      } else {
        contactBlock.classList.remove("is-visible");
      }
    }

    if (window.innerWidth < 768) {
      const rect = estimateSection.getBoundingClientRect();
      const offsetTop = rect.top + window.pageYOffset - 20;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
    }
  }

  function getErrorText(code) {
    switch (code) {
      case "step1":
        return "Please choose one of the options.";
      case "area":
        return "The area of the object is not filled in.";
      case "step3":
      case "step4":
      case "step5":
        return "Please select at least one option.";
      default:
        return "Please fill in the required field.";
    }
  }

  function validateStep(index) {
    const step = steps[index];
    if (!step) return true;

    const stepNumber = step.getAttribute("data-step");

    if (stepNumber === "1") {
      const selected = step.querySelector(".estimate-option.is-selected");
      if (!selected) {
        openModal(getErrorText("step1"), "error");
        return false;
      }
    }

    if (stepNumber === "2") {
      const v = areaInput ? areaInput.value.trim() : "";
      if (!v || Number(v) <= 0) {
        openModal(getErrorText("area"), "error");
        return false;
      }
    }

    if (stepNumber === "3") {
      const selected = step.querySelector(".estimate-style.is-selected");
      if (!selected) {
        openModal(getErrorText("step3"), "error");
        return false;
      }
    }

    if (stepNumber === "4") {
      const selected = step.querySelector(".estimate-option.is-selected");
      if (!selected) {
        openModal(getErrorText("step4"), "error");
        return false;
      }
    }

    if (stepNumber === "5") {
      const selected = step.querySelector(".estimate-style.is-selected");
      if (!selected) {
        openModal(getErrorText("step5"), "error");
        return false;
      }
    }

    return true;
  }

  function goNext() {
    if (!validateStep(currentIndex)) {
      return;
    }

    if (currentIndex < totalSteps - 1) {
      currentIndex += 1;
      updateStep();
    } else {
      if (contactBlock) {
        contactBlock.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateStep();
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", goNext);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", goPrev);
  }

  /* ---------- выбор опций ---------- */

  document.addEventListener("click", function (event) {
    const option = event.target.closest(".estimate-option, .estimate-style");
    if (!option) return;

    const group = option.getAttribute("data-group");
    if (!group) return;

    const selector =
      '.estimate-option[data-group="' +
      group +
      '"], .estimate-style[data-group="' +
      group +
      '"]';

    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.remove("is-selected");
    });

    option.classList.add("is-selected");
  });

  /* ---------- отправка на e-mail ---------- */

  function getSelectedValue(group) {
    const selected = document.querySelector(
      '.estimate-option.is-selected[data-group="' +
        group +
        '"], .estimate-style.is-selected[data-group="' +
        group +
        '"]'
    );
    return selected ? selected.getAttribute("data-value") || "" : "";
  }

  const contactForm = document.getElementById("estimate-contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // собираем ответы
      const spaceType = getSelectedValue("step1");
      const area = areaInput ? areaInput.value.trim() : "";
      const style = getSelectedValue("step3");
      const startWhen = getSelectedValue("step4");
      const city = getSelectedValue("step5");

      const nameInput = document.getElementById("estimate-name");
      const phoneInput = document.getElementById("estimate-phone");
      const messageInput = document.getElementById("estimate-message");

      const name = nameInput ? nameInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";
      const message = messageInput ? messageInput.value.trim() : "";

      if (!phone) {
        openModal("Please enter your phone number.", "error");
        return;
      }

      const formData = new URLSearchParams();
      formData.append("spaceType", spaceType);
      formData.append("area", area);
      formData.append("style", style);
      formData.append("startWhen", startWhen);
      formData.append("city", city);
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("message", message);

      fetch("/source/php/estimate.php", {
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
            openModal("Thank you! We will contact you soon.", "success");
            contactForm.reset();
          } else {
            openModal("Something went wrong. Please try again later.", "error");
            console.error("Estimate form error:", data);
          }
        })
        .catch(function (error) {
          openModal("Something went wrong. Please try again later.", "error");
          console.error("Estimate form error:", error);
        });
    });
  }

  /* ---------- стартовое состояние ---------- */

  updateStep();
});
