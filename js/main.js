/* ============================================================
   Global Blessings — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. Navbar scroll behavior
  ---------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  const handleScroll = () => {
    navbar?.classList.toggle('navbar--scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ----------------------------------------------------------
     2. Mobile menu
  ---------------------------------------------------------- */
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu__close');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
    document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : '';
  });
  mobileClose?.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  });
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ----------------------------------------------------------
     3. Language toggle
  ---------------------------------------------------------- */
  const storedLang = localStorage.getItem('gb-lang') || 'en';
  applyLang(storedLang);

  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      applyLang(lang);
      localStorage.setItem('gb-lang', lang);
    });
  });

  function applyLang(lang) {
    document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  /* ----------------------------------------------------------
     4. Scroll reveal (Intersection Observer)
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     5. Hero parallax (subtle)
  ---------------------------------------------------------- */
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY * 0.3;
      heroBg.style.transform = `translateY(${y}px)`;
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     6. Active nav link
  ---------------------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__nav a, .mobile-menu nav a').forEach(link => {
    const linkPath = link.getAttribute('href')?.split('/').pop();
    if (linkPath === currentPath) link.classList.add('active');
  });

  /* ----------------------------------------------------------
     7. Newsletter form
  ---------------------------------------------------------- */
  const newsletterForm = document.querySelector('.newsletter-form');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    const btn = newsletterForm.querySelector('button');
    if (!input?.value) return;
    btn.textContent = '✓ Subscribed';
    btn.style.background = 'var(--sage)';
    btn.disabled = true;
    input.value = '';
  });

});
