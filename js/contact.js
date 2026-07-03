/* Contact form validation & submission */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#cf-name');
    const email = form.querySelector('#cf-email');
    const message = form.querySelector('#cf-message');

    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      [name, email, message].forEach(field => {
        if (!field.value.trim()) field.focus();
      });
      return;
    }

    const btn = form.querySelector('.form-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="lang-en">Sending...</span><span class="lang-kr">전송 중...</span>';

    /* Simulate submission — replace with actual endpoint (Formspree, Netlify, etc.) */
    setTimeout(() => {
      form.reset();
      success?.classList.add('visible');
      btn.style.display = 'none';
    }, 800);
  });
});
