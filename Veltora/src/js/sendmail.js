document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const message = document.getElementById("formMessage");

  fetch("/src/php/send_mail.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      message.textContent = "✅ Děkujeme! Vaše zpráva byla úspěšně odeslána.";
      message.className = "form__message success";
      message.style.display = "block";
      form.reset();
      grecaptcha.reset();
    } else {
      message.textContent = "❌ Chyba při odesílání. Zkuste to prosím znovu.";
      message.className = "form__message error";
      message.style.display = "block";
    }
  })
  .catch(() => {
    message.textContent = "❌ Server není dostupný. Zkuste to později.";
    message.className = "form__message error";
    message.style.display = "block";
  });
});
