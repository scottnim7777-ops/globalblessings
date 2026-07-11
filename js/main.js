/* ============================================================
   Global Blessings — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. Navbar scroll behavior
  ---------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  const callBar = document.querySelector('.mobile-call-bar');
  const hero = document.querySelector('.hero');
  const handleScroll = () => {
    navbar?.classList.toggle('navbar--scrolled', window.scrollY > 40);
    const threshold = hero ? hero.offsetHeight * 0.85 : window.innerHeight * 0.85;
    callBar?.classList.toggle('mobile-call-bar--visible', window.scrollY > threshold);
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
     7. Cursor glow (dark sections only, reduced-motion safe)
  ---------------------------------------------------------- */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reducedMotion) {
    const glow = document.createElement('div');
    glow.style.cssText = [
      'position:fixed', 'pointer-events:none', 'z-index:9997',
      'width:320px', 'height:320px', 'border-radius:50%',
      'background:radial-gradient(circle,rgba(184,137,59,0.12) 0%,transparent 70%)',
      'transform:translate(-50%,-50%)', 'transition:opacity 0.4s ease',
      'opacity:0', 'top:0', 'left:0', 'will-change:transform'
    ].join(';');
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0, rafId = null;
    let glowActive = false;

    const darkSections = () => document.querySelectorAll('.hero, .section--dark');

    const isOverDark = (x, y) => {
      for (const sec of darkSections()) {
        const r = sec.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return true;
      }
      return false;
    };

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const shouldShow = isOverDark(mouseX, mouseY);
      if (shouldShow !== glowActive) {
        glowActive = shouldShow;
        glow.style.opacity = glowActive ? '1' : '0';
      }
      if (glowActive && !rafId) {
        const tick = () => {
          glowX += (mouseX - glowX) * 0.1;
          glowY += (mouseY - glowY) * 0.1;
          glow.style.left = glowX + 'px';
          glow.style.top = glowY + 'px';
          rafId = Math.abs(glowX - mouseX) > 0.5 || Math.abs(glowY - mouseY) > 0.5
            ? requestAnimationFrame(tick) : null;
        };
        rafId = requestAnimationFrame(tick);
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     8. Luxury image fade-in
  ---------------------------------------------------------- */
  document.querySelectorAll('main img').forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('img-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('img-loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('img-loaded'), { once: true });
    }
  });

  /* ----------------------------------------------------------
     9. Contact Modal
  ---------------------------------------------------------- */
  const contactModal = document.getElementById('contactModal');
  if (contactModal) {
    const backdrop = contactModal.querySelector('.contact-modal__backdrop');
    const closeBtn = contactModal.querySelector('.contact-modal__close');
    const form = contactModal.querySelector('.contact-modal__form');
    const successWrap = contactModal.querySelector('.contact-modal__success');

    const openModal = () => {
      contactModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      contactModal.classList.remove('open');
      document.body.style.overflow = '';
    };

    backdrop?.addEventListener('click', closeModal);
    closeBtn?.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && contactModal.classList.contains('open')) closeModal();
    });

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (!/^(\.\/)?\/?contact(\.html)?$/.test(href)) return;
      const inFooter = link.closest('.footer');
      if (!inFooter) {
        link.addEventListener('click', e => { e.preventDefault(); openModal(); });
      }
    });

    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const data = new FormData(form);
      try {
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString()
        });
      } catch (_) {}
      form.style.display = 'none';
      if (successWrap) successWrap.style.display = 'flex';
    });
  }

});
