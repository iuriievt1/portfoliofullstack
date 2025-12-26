(function () {
  const loader = document.getElementById("cinema-loader");
  const pageWrap = document.querySelector(".page-wrap") || document.body;
  const isFirstIntro = document.documentElement.classList.contains("intro-first");

  // Если нет лоадера или это не первый заход – ничего не делаем
  if (!loader || !pageWrap || !isFirstIntro) {
    return;
  }

  // Помечаем, что интро уже показывали в этой вкладке
  try {
    sessionStorage.setItem("cinemaIntroSeen", "1");
  } catch (e) {}

  const totalTextTime = 5000; // 5 секунд

  window.addEventListener("load", () => {
    // После показа текстов начинаем "открывать экран"
    setTimeout(() => {
      loader.classList.add("cinema-loader--closing");

      // Плавно показываем контент
      pageWrap.style.opacity = "1";
      pageWrap.style.transform = "scale(1)";

      // После анимации "шторок" прячем лоадер
      setTimeout(() => {
        loader.classList.add("cinema-loader--hidden");

        setTimeout(() => {
          if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }, 400);
      }, 700);
    }, totalTextTime);
  });
})();
