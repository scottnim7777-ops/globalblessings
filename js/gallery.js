/* Gallery: filter + lightbox */
document.addEventListener('DOMContentLoaded', () => {

  /* Filter */
  const filters = document.querySelectorAll('.gallery-filter');
  const items = document.querySelectorAll('.gallery-item');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      const cat = btn.dataset.filter;
      items.forEach(item => {
        item.classList.toggle('hidden', cat !== 'all' && item.dataset.category !== cat);
      });
    });
  });

  /* Lightbox */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbClose = lightbox?.querySelector('.lightbox__close');
  const lbPrev = lightbox?.querySelector('.lightbox__prev');
  const lbNext = lightbox?.querySelector('.lightbox__next');
  let currentIndex = 0;

  const visibleItems = () => [...items].filter(i => !i.classList.contains('hidden'));

  const openLightbox = (index) => {
    const visible = visibleItems();
    if (!visible[index]) return;
    currentIndex = index;
    const img = visible[index].querySelector('img');
    lbImg.src = img.src.replace('w=600','w=1200');
    lbImg.alt = img.alt;
    lightbox?.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbImg.focus?.();
  };

  const closeLightbox = () => {
    lightbox?.classList.remove('open');
    document.body.style.overflow = '';
  };

  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => {
    const visible = visibleItems();
    openLightbox((currentIndex - 1 + visible.length) % visible.length);
  });
  lbNext?.addEventListener('click', () => {
    const visible = visibleItems();
    openLightbox((currentIndex + 1) % visible.length);
  });

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbPrev?.click();
    if (e.key === 'ArrowRight') lbNext?.click();
  });
});
