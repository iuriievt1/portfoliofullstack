// /source/js/ragistration.js
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = '/registration/api/subscribe';

  const modal = document.getElementById('subscribe-modal');
  const formStep1 = document.getElementById('subscribe-form-step1');
  const formStep2 = document.getElementById('subscribe-form-step2');
  const inputEmail = document.getElementById('sub-email');
  const inputPhone = document.getElementById('sub-phone');
  const inputCode  = document.getElementById('sub-code');
  const btnResend  = document.getElementById('btn-resend');
  const resendTimer = document.getElementById('resend-timer');
  const msg = document.getElementById('sub-msg');

  const openBtnForm = document.getElementById('ft-subscribe');
  const ftMsg = document.getElementById('ft-msg');

  let tokenId = null;
  let resendLeft = 0;
  let resendTimerId = null;
  let currentLang = (document.documentElement.getAttribute('lang') || 'cs').toLowerCase();

  function t(cs, en) { return currentLang === 'en' ? en : cs; }

  function openModal(prefillEmail = '') {
    if (prefillEmail) inputEmail.value = (prefillEmail || '').trim();
    modal?.classList.add('is-open');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (formStep1) formStep1.style.display = '';
    if (formStep2) formStep2.style.display = 'none';
    if (msg) msg.textContent = '';
    if (inputCode) inputCode.value = '';
    tokenId = null;
  }
  function closeModal() {
    modal?.classList.remove('is-open');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stopResendTimer();
  }
  function startResendTimer(seconds) {
    resendLeft = seconds;
    if (btnResend) btnResend.disabled = true;
    updateResendLabel();
    stopResendTimer();
    resendTimerId = setInterval(() => {
      resendLeft--;
      updateResendLabel();
      if (resendLeft <= 0) {
        stopResendTimer();
        if (btnResend) btnResend.disabled = false;
        updateResendLabel();
      }
    }, 1000);
  }
  function stopResendTimer() { if (resendTimerId) clearInterval(resendTimerId); resendTimerId = null; }
  function updateResendLabel() { if (resendTimer) resendTimer.textContent = String(Math.max(0, resendLeft)); }

  modal?.addEventListener('click', (e) => {
    if (e.target.matches('[data-close="modal"]') || e.target === modal.querySelector('.modal-backdrop')) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal(); });

  function showAdminLogin(email) {
    // если есть скрытый блок логина — покажи; иначе редирект
    const adminArea = document.getElementById('admin-login-area');
    if (adminArea) {
      adminArea.style.display = '';
      const adminEmailInput = adminArea.querySelector('input[type="email"], input[name="admin-email"]');
      if (adminEmailInput) adminEmailInput.value = email;
      return;
    }
    window.location.href = `/admin/login.php?email=${encodeURIComponent(email)}`;
  }

  // submit футерной формы
  openBtnForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]')?.value.trim() || '';
    if (ftMsg) ftMsg.textContent = '';
    if (!email) {
      if (ftMsg) ftMsg.textContent = t('Zadejte prosím e-mail.', 'Please enter your e-mail.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/check.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch (e) { console.error('Non-JSON response:', text); throw e; }

      if (data.ok && data.role === 'admin') { showAdminLogin(email); return; }
      if (data.ok && data.exists && data.verified) {
        if (ftMsg) ftMsg.textContent = t('Už jste přihlášeni k odběru. Děkujeme!', 'You are already subscribed. Thank you!');
        return;
      }
      openModal(email);
    } catch (err) {
      console.error(err);
      if (ftMsg) ftMsg.textContent = t('Nastala chyba sítě.', 'Network error.');
    }
  });

  // шаг 1
  formStep1?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = '';
    const email = inputEmail?.value.trim() || null;
    const phone = inputPhone?.value.trim() || null;
    if (!email && !phone) { if (msg) msg.textContent = t('Vyplňte e-mail nebo telefon.', 'Please enter e-mail or phone.'); return; }

    try {
      const res = await fetch(`${API_BASE}/start.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, lang: currentLang })
      });
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch (e) { console.error('Non-JSON response:', text); throw e; }

      if (!data.ok) {
        if (data.error === 'SMS_NOT_CONFIGURED') { if (msg) msg.textContent = t('SMS není k dispozici. Zkuste e-mail.', 'SMS is not configured. Please use e-mail.'); }
        else if (data.error === 'RATE_LIMIT') { if (msg) msg.textContent = t('Příliš mnoho pokusů. Zkuste za chvíli.', 'Too many attempts. Try again later.'); }
        else { if (msg) msg.textContent = t('Nastala chyba. Zkuste znovu.', 'Something went wrong. Try again.'); }
        return;
      }
      tokenId = data.tokenId;
      if (formStep1) formStep1.style.display = 'none';
      if (formStep2) formStep2.style.display = '';
      startResendTimer(data.cooldownSec || 30);
      if (msg) msg.textContent = (data.channel === 'sms')
        ? t(`Kód jsme poslali na SMS: ${data.to}`, `We sent a code by SMS: ${data.to}`)
        : t(`Kód jsme poslali na e-mail: ${data.to}`, `We sent a code to e-mail: ${data.to}`);
      inputCode?.focus();
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = t('Nastala chyba sítě.', 'Network error.');
    }
  });

  // шаг 2
  formStep2?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = '';
    const code = inputCode?.value.trim() || '';
    if (!tokenId || code.length !== 6) { if (msg) msg.textContent = t('Zadejte 6 znaků kódu.', 'Enter the 6-character code.'); return; }

    try {
      const res = await fetch(`${API_BASE}/verify.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, code })
      });
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch (e) { console.error('Non-JSON response:', text); throw e; }

      if (!data.ok) {
        const map = {
          'TOKEN_NOT_FOUND': t('Kód není platný.', 'Token not found.'),
          'TOKEN_CONSUMED': t('Kód již byl použit.', 'Code already used.'),
          'TOKEN_EXPIRED':  t('Platnost kódu vypršela.', 'Code expired.'),
          'CODE_INVALID':   t('Nesprávný kód.', 'Incorrect code.')
        };
        if (msg) msg.textContent = map[data.error] || t('Ověření selhalo.', 'Verification failed.');
        return;
      }
      if (msg) msg.textContent = t('Děkujeme! Odběr byl potvrzen.', 'Thank you! Subscription confirmed.');
      setTimeout(closeModal, 1200);
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = t('Nastala chyba sítě.', 'Network error.');
    }
  });

  btnResend?.addEventListener('click', async () => {
    if (!btnResend.disabled) formStep1?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-switch');
    if (!btn) return;
    currentLang = (btn.getAttribute('data-lang') || 'cs').toLowerCase();
  });
});
