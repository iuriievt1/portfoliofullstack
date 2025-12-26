window.addEventListener('load', () => {
    const marquee = document.querySelector('.js-marquee');
    const track = document.querySelector('.js-marquee-track');
    if (!marquee || !track) return;

    const SPEED = 0.6; // скорость, можешь поменять
    let offset = 0;

    // клонируем элементы, чтобы дорожка была длиннее экрана
    const items = Array.from(track.children);
    let totalWidth = track.getBoundingClientRect().width;
    const viewportWidth = marquee.getBoundingClientRect().width;

    while (totalWidth < viewportWidth * 2 && items.length) {
      items.forEach((item) => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
      });
      totalWidth = track.getBoundingClientRect().width;
    }

    function tick() {
      offset -= SPEED;

      const first = track.firstElementChild;
      if (first) {
        // ширина карточки + её margin-right
        const style = getComputedStyle(first);
        const marginRight = parseFloat(style.marginRight) || 0;
        const fullWidth = first.offsetWidth + marginRight;

        // когда первый полностью ушёл налево вместе с отступом —
        // перекидываем его в конец и сдвигаем offset назад на его полную ширину
        if (Math.abs(offset) >= fullWidth) {
          offset += fullWidth;
          track.appendChild(first);
        }
      }

      track.style.transform = `translateX(${offset}px)`;
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
