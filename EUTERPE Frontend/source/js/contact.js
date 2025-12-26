(function(){
  function bindAjaxForm(form) {
    if (!form) return;

    const msgEl = form.querySelector('[role="status"], .cf-msg, .concert-form__msg') || document.getElementById('cf-msg');
    const btn   = form.querySelector('button[type="submit"], .cf-btn');
    const ENDPOINT = form.getAttribute('action') || '/source/php/contact.php';

    function setMsg(text, ok=false){
      if (!msgEl) return;
      msgEl.textContent = text || '';
      msgEl.style.color = ok ? '#9be29b' : '#bdbdbd';
    }

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      setMsg('');
      if (btn) btn.disabled = true;

      try{
        const fd = new FormData(form);

        // honeypot
        if (!fd.has('website')) fd.append('website','');

        const res = await fetch(ENDPOINT, {
          method: 'POST',
          body: fd,
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        const data = await res.json().catch(()=>({ ok:false, message:'Neznámá odpověď serveru.' }));

        if(res.ok && data.ok){
          setMsg(data.message || 'Děkujeme! Vaše zpráva byla odeslána.', true);
          form.reset();
        }else{
          setMsg(data.message || 'Nepodařilo se odeslat. Zkuste to prosím znovu.');
        }
      }catch(err){
        setMsg('Chyba připojení. Zkuste to prosím znovu.');
      }finally{
        if (btn) btn.disabled = false;
      }
    });
  }

  bindAjaxForm(document.getElementById('contact-form'));
  bindAjaxForm(document.getElementById('concert-form'));
  bindAjaxForm(document.getElementById('studio-request-form'));
})();
