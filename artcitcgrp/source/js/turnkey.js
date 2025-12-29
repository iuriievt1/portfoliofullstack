// /source/js/turnkey-gallery.js

document.addEventListener("DOMContentLoaded", function () {
  const sliders = document.querySelectorAll("[data-turnkey-slider]");

  if (!sliders.length) return;

  sliders.forEach(function (card) {
    const images = card.querySelectorAll(".turnkey-gallery-card__image");
    if (images.length <= 1) return;

    let currentIndex = 0;
    images[currentIndex].classList.add("is-active");

    setInterval(function () {
      images[currentIndex].classList.remove("is-active");
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].classList.add("is-active");
    }, 4000); // каждые 4 секунды
  });
});
