/* Contact form — Netlify Forms submission */
document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');
  if (!form) return;

  const encode = (data) =>
    Object.keys(data)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k] ?? ''))
      .join('&');

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

    try {
      await fetch('/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'contact',
          '이름':       nameEl.value.trim(),
          '핸드폰번호':  phoneEl.value.trim(),
          'email':      form.querySelector('#cf-email').value.trim(),
          '유입경로':   form.querySelector('#cf-hear').value,
          '문의내용':   messageEl.value.trim(),
        }),
      });

      form.reset();
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      btn.hidden = true;
    } catch {
      errorEl.hidden   = false;
      btn.disabled     = false;
      labelEl.hidden   = false;
      loadingEl.hidden = true;
    }
  });

  /* sync dual selects (EN/KR) */
  const hearEn = form.querySelector('#cf-hear');
  const hearKr = form.querySelector('#cf-hear-kr');
  if (hearEn && hearKr) {
    hearEn.addEventListener('change', () => { hearKr.value = hearEn.value; });
    hearKr.addEventListener('change', () => { hearEn.value = hearKr.value; });
  }

  /* clear error state on input */
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('input-error'));
  });
});
