(function () {
  function setText(el, val) { if (val != null) el.textContent = val; }
  function setHref(el, val) { if (val != null) el.setAttribute('href', val); }
  function setBg(el, val)   { if (val != null) el.style.backgroundImage = `url('${val}')`; }

  function get(obj, path) {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  }

  function renderServices(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    grid.innerHTML = services.map((s, i) => `
      <div class="service-item">
        <div class="service-item-header">
          <div class="service-item-header-left">
            <p class="service-num">${String(i + 1).padStart(2, '0')}</p>
            <h3 class="service-name">${s.name}</h3>
          </div>
          <svg class="service-chevron" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div class="service-body">
          <p class="service-desc">${s.description}</p>
          <p class="service-price">${s.price}</p>
        </div>
      </div>`).join('');
  }

  function renderGallery(urls) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = urls.map(u =>
      `<div class="gallery-item"><div class="gallery-inner"
        style="background-image:url('${u}')"></div></div>`).join('');
  }

  function renderBeforeAfter(items) {
    const grid = document.getElementById('beforeAfterGrid');
    if (!grid) return;
    grid.innerHTML = items.map(it => `
      <div class="ba-card">
        <img src="${it.src}" alt="${it.alt || ''}">
        <div class="ba-label"><span>до</span><span>после</span></div>
      </div>`).join('');
  }

  function renderAddresses(list) {
    const box = document.getElementById('addressesList');
    if (!box) return;
    box.innerHTML = list.map(a =>
      `<span class="contact-val">${a.text}<br>
        <small style="font-size:12px;opacity:.7;">${a.metro || ''}</small>
      </span>`).join('');
  }

  function renderPhones(list) {
    const box = document.getElementById('phonesList');
    if (!box) return;
    box.innerHTML = list.map((p, i) =>
      `<a href="tel:${p.replace(/[^\d+]/g, '')}" class="contact-val"
          style="${i > 0 ? 'margin-top:6px;' : ''}">${p}</a>`).join('');
  }

  function renderSocialLinks(list) {
    const box = document.getElementById('socialLinks');
    if (!box) return;
    box.innerHTML = list.map(l =>
      `<a href="${l.url}" target="_blank" class="social-link">
        <span class="social-name">${l.name}</span>
        <span class="social-arr">↗</span>
      </a>`).join('');
  }

  fetch('/content/site.json?t=' + Date.now())
    .then(r => r.json())
    .then(data => {
      // скалярные поля
      document.querySelectorAll('[data-content]').forEach(el => {
        setText(el, get(data, el.dataset.content));
      });
      document.querySelectorAll('[data-content-href]').forEach(el => {
        setHref(el, get(data, el.dataset.contentHref));
      });
      document.querySelectorAll('[data-content-bg]').forEach(el => {
        setBg(el, get(data, el.dataset.contentBg));
      });

      // списки
      renderServices(data.services || []);
      renderGallery(data.gallery || []);
      renderBeforeAfter(data.beforeAfter || []);
      renderAddresses(data.contacts?.addresses || []);
      renderPhones(data.contacts?.phones || []);
      renderSocialLinks(data.contacts?.socialLinks || []);

      // ссылки на прайс и на кнопки
      const priceBtn = document.getElementById('priceListBtn');
      if (priceBtn && data.servicesFooter?.priceListLink)
        priceBtn.href = data.servicesFooter.priceListLink;

      const emailLink = document.getElementById('emailLink');
      if (emailLink && data.contacts?.email)
        emailLink.href = 'mailto:' + data.contacts.email;

      const contactsBtn = document.getElementById('contactsBtn');
      if (contactsBtn && data.contacts?.buttonLink)
        contactsBtn.href = data.contacts.buttonLink;

      const privacyLink = document.getElementById('privacyLink');
      if (privacyLink && data.footer?.privacyLink)
        privacyLink.href = data.footer.privacyLink;

      // теперь можно инициализировать аккордеон (элементы уже в DOM)
      initAccordion();
    })
    .catch(err => console.error('[content-loader]', err));

  function initAccordion() {
    const isMobile = window.innerWidth <= 768;
    document.querySelectorAll('.service-item').forEach(item => {
      const header = item.querySelector('.service-item-header');
      if (!header) return;
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);
      if (isMobile) {
        newHeader.style.cursor = 'pointer';
        newHeader.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          document.querySelectorAll('.service-item.open')
            .forEach(el => el.classList.remove('open'));
          if (!isOpen) item.classList.add('open');
        });
      }
    });
  }
})();