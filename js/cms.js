(function () {
  'use strict';

  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function showToast(msg) {
    let toast = document.querySelector('.cms-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'cms-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('cms-show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('cms-show'), 2200);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ---------- 1. Apply saved overrides for everyone ---------- */
  function applyOverrides(data) {
    if (!data) return;
    document.querySelectorAll('[data-cms-id]').forEach((el) => {
      const id = el.getAttribute('data-cms-id');
      if (!(id in data)) return;
      const type = el.getAttribute('data-cms-type');
      if (type === 'image') {
        el.setAttribute('src', data[id]);
      } else if (type === 'richtext') {
        const paragraphs = data[id].split(/\n{2,}/).filter((p) => p.trim() !== '');
        el.innerHTML = paragraphs
          .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
          .join('');
      } else {
        el.innerHTML = escapeHtml(data[id]).replace(/\n/g, '<br>');
      }
    });
  }

  fetch('/.netlify/functions/content-get')
    .then((r) => (r.ok ? r.json() : {}))
    .then(applyOverrides)
    .catch(() => {});

  /* ---------- 2. Editor-only UI ---------- */
  const isEditor = getCookie('edit_ui') === '1';
  if (!isEditor) return;

  const LS_KEY = 'cms_edit_mode';

  function wrapImages() {
    document.querySelectorAll('[data-cms-type="image"]').forEach((img) => {
      if (img.closest('.cms-img-wrap')) return;
      const wrap = document.createElement('span');
      wrap.className = 'cms-img-wrap';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cms-img-btn';
      btn.textContent = '📷 사진 바꾸기';
      wrap.appendChild(btn);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openFilePicker(img);
      });
    });
  }

  function resizeAndUpload(file, img) {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxW = 1600;
        const scale = Math.min(1, maxW / image.width);
        const w = Math.round(image.width * scale);
        const h = Math.round(image.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        showToast('업로드 중...');
        fetch('/.netlify/functions/image-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: img.getAttribute('data-cms-id'), dataUrl }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.ok) {
              img.setAttribute('src', res.url);
              showToast('저장됨 ✓');
            } else {
              showToast('업로드 실패');
            }
          })
          .catch(() => showToast('업로드 실패'));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function openFilePicker(img) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => {
      if (input.files && input.files[0]) resizeAndUpload(input.files[0], img);
    });
    input.click();
  }

  function saveText(el) {
    const id = el.getAttribute('data-cms-id');
    const before = el.dataset.cmsBefore || '';
    let value = el.innerText;

    // Safety net: if almost all the previous content just got wiped out
    // (e.g. an accidental select-all + delete), confirm before saving.
    const trimmedBefore = before.trim();
    const trimmedNow = value.trim();
    if (trimmedBefore.length > 20 && trimmedNow.length < trimmedBefore.length * 0.15) {
      const proceed = window.confirm(
        '내용을 대부분 지우셨어요. 이대로 저장할까요?\n취소를 누르면 원래 내용으로 되돌아갑니다.'
      );
      if (!proceed) {
        el.innerText = before;
        return;
      }
    }

    if (trimmedNow === '') {
      el.innerHTML = ''; // clear stray <br> left by contenteditable so empty-state styling applies
      value = '';
    }

    fetch('/.netlify/functions/content-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, value }),
    })
      .then((r) => r.json())
      .then((res) => showToast(res.ok ? '저장됨 ✓' : '저장 실패'))
      .catch(() => showToast('저장 실패'));
  }

  const EDITABLE_SELECTOR = '[data-cms-type="text"], [data-cms-type="richtext"]';

  function wireTextEditing() {
    document.querySelectorAll(EDITABLE_SELECTOR).forEach((el) => {
      if (el.dataset.cmsWired) return;
      el.dataset.cmsWired = '1';
      el.addEventListener('focus', () => {
        el.dataset.cmsBefore = el.innerText;
      });
      el.addEventListener('blur', () => {
        if (el.innerText !== el.dataset.cmsBefore) saveText(el);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          el.blur();
        }
      });
    });
  }

  function setEditMode(on) {
    document.body.classList.toggle('cms-edit-mode', on);
    document.querySelectorAll(EDITABLE_SELECTOR).forEach((el) => {
      el.setAttribute('contenteditable', on ? 'true' : 'false');
    });
    localStorage.setItem(LS_KEY, on ? '1' : '0');
    const toggleBtn = document.querySelector('.cms-fab__toggle .cms-fab__label');
    if (toggleBtn) toggleBtn.textContent = on ? '편집 켜짐' : '편집 모드';
  }

  function buildUI() {
    wrapImages();
    wireTextEditing();

    const fab = document.createElement('div');
    fab.className = 'cms-fab';
    fab.innerHTML =
      '<button type="button" class="cms-fab__toggle"><span class="cms-dot"></span><span class="cms-fab__label">편집 모드</span></button>' +
      '<div class="cms-panel">' +
      '<h4>편집 모드 안내</h4>' +
      '<p>텍스트를 클릭하면 바로 수정할 수 있어요. 다 쓰고 다른 곳을 누르면 자동으로 저장됩니다. 사진은 사진 위에 마우스를 올리면 \'사진 바꾸기\' 버튼이 나와요.</p>' +
      '<p class="cms-panel__notice">이 버튼은 로그인하신 관리자님에게만 보여요. 다른 방문자에게는 절대 보이지 않으니 안심하세요.</p>' +
      '<button type="button" class="cms-panel__logout">로그아웃</button>' +
      '</div>';
    document.body.appendChild(fab);

    const toggleBtn = fab.querySelector('.cms-fab__toggle');
    const panel = fab.querySelector('.cms-panel');
    toggleBtn.addEventListener('click', () => {
      const isOn = document.body.classList.contains('cms-edit-mode');
      setEditMode(!isOn);
      panel.classList.toggle('cms-open', !isOn);
    });

    fab.querySelector('.cms-panel__logout').addEventListener('click', () => {
      fetch('/.netlify/functions/logout', { method: 'POST' }).finally(() => {
        location.reload();
      });
    });

    const stored = localStorage.getItem(LS_KEY);
    const savedOn = stored === null ? true : stored === '1';
    if (savedOn) {
      setEditMode(true);
    }

    // Right after a fresh login, briefly show the panel so the admin sees the
    // "visitors can't see this" reassurance without having to click anything.
    const justLoggedIn = document.referrer.indexOf('edit-login.html') !== -1;
    if (justLoggedIn) {
      panel.classList.add('cms-open');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }
})();
