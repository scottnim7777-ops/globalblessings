/* Contact form — mail.php submission */
document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl    = form.querySelector('#cf-name');
    const phoneEl   = form.querySelector('#cf-phone');
    const messageEl = form.querySelector('#cf-message');
    const btn       = form.querySelector('.form-submit');
    const labelEl   = btn.querySelector('.submit-label');
    const loadingEl = btn.querySelector('.submit-loading');

    /* --- validation --- */
    let firstInvalid = null;
    [nameEl, phoneEl, messageEl].forEach(el => {
      el.classList.remove('input-error');
      if (!el.value.trim()) {
        el.classList.add('input-error');
        if (!firstInvalid) firstInvalid = el;
      }
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    /* --- loading state --- */
    btn.disabled     = true;
    labelEl.hidden   = true;
    loadingEl.hidden = false;
    successEl.hidden = true;
    errorEl.hidden   = true;

    /* --- payload --- */
    const payload = {
      '이름':      nameEl.value.trim(),
      '핸드폰번호': phoneEl.value.trim(),
      '이메일':    form.querySelector('#cf-email').value.trim(),
      '유입경로':  form.querySelector('#cf-hear').value,
      '문의내용':  messageEl.value.trim(),
    };

    try {
      const res  = await fetch('mail.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        form.reset();
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        btn.hidden = true;
      } else {
        throw new Error('failed');
      }
    } catch {
      errorEl.hidden   = false;
      btn.disabled     = false;
      labelEl.hidden   = false;
      loadingEl.hidden = true;
    }
  });

  /* clear error state on input */
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('input-error'));
  });
});
