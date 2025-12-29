document.addEventListener("DOMContentLoaded", function () {
	const contactGallery = document.querySelector(".contact__gallery");

	if (!contactGallery) {
		return;
	}

	const totalImages = 49;
	const slides = [];

	for (let i = 1; i <= totalImages; i += 1) {
		const number = String(i).padStart(2, "0"); // 01, 02, 03 ... 49
		const slide = document.createElement("div");

		slide.className = "contact__slide";
		slide.style.backgroundImage = 'url("/assets/photo/' + number + '.jpg")';

		if (i === 1) {
			slide.classList.add("is-active");
		}

		contactGallery.appendChild(slide);
		slides.push(slide);
	}

	let currentIndex = 0;

	if (slides.length > 1) {
		setInterval(function () {
			const nextIndex = (currentIndex + 1) % slides.length;

			slides[currentIndex].classList.remove("is-active");
			slides[nextIndex].classList.add("is-active");

			currentIndex = nextIndex;
		}, 4000);
	}
});
