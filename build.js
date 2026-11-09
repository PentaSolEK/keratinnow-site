/**
 * Сборка index.html из index.template.html + content/*.json
 * Запускается Netlify при каждом деплое (см. netlify.toml).
 * Локально: node build.js
 * Внешних зависимостей нет — нужен только Node.js 16+.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, 'content', name), 'utf8'));

const general  = read('general.json');
const hero     = read('hero.json');
const about    = read('about.json');
const services = read('services.json');
const gallery  = read('gallery.json');
const ba       = read('before_after.json');
const contacts = read('contacts.json');

// ── helpers ────────────────────────────────────────────────────────────────
const str = (v) => (v === undefined || v === null ? '' : String(v)).trim();
const esc = (v) =>
  str(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const escBr = (v) => esc(v).replace(/\r?\n/g, '<br>');
// путь к файлу: убираем ведущий "/", чтобы пути были относительными как раньше
const file = (v) => esc(str(v).replace(/^\/+/, ''));
const list = (v) => (Array.isArray(v) ? v : []);
// элементы списка из одного поля Decap хранит строкой, но на всякий случай понимаем и объект
const item = (v, key) => (v && typeof v === 'object' ? v[key] : v);
const pad = (n) => String(n).padStart(2, '0');
const tel = (v) => 'tel:' + str(v).replace(/[^\d+]/g, '');

const siteUrl = str(general.site_url).replace(/\/+$/, '');
const ogImage = str(general.og_image);
const ogImageAbs = /^https?:\/\//.test(ogImage)
  ? ogImage
  : `${siteUrl}/${ogImage.replace(/^\/+/, '')}`;

const chevron =
  '<svg class="service-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="6 9 12 15 18 9"/></svg>';

// ── blocks ─────────────────────────────────────────────────────────────────
const blocks = {
  ABOUT_PARAGRAPHS: list(about.paragraphs)
    .map((p) => `    <p class="about-text">${escBr(item(p, 'text'))}</p>`)
    .join('\n    <br>\n'),

  SERVICES: list(services.items)
    .map((s, i) => {
      const price = [str(s.duration), str(s.price)].filter(Boolean).map(esc).join(' · ');
      return `
    <div class="service-item">
      <div class="service-item-header">
        <div class="service-item-header-left">
          <p class="service-num">${pad(i + 1)}</p>
          <h3 class="service-name">${esc(s.name)}</h3>
        </div>
        ${chevron}
      </div>
      <div class="service-body">
        <p class="service-desc">${escBr(s.desc)}</p>
        <p class="service-price">${price}</p>
      </div>
    </div>`;
    })
    .join('\n'),

  GALLERY: list(gallery.images)
    .map(
      (g) =>
        `    <div class="gallery-item"><div class="gallery-inner" style="background-image:url('${file(item(g, 'image'))}');"></div></div>`
    )
    .join('\n'),

  BEFORE_AFTER: list(ba.items)
    .map(
      (b) => `    <div class="ba-card">
      <img src="${file(b.image)}" alt="${esc(b.alt || 'До и после')}" loading="lazy">
      <div class="ba-label"><span>${esc(ba.label_before)}</span><span>${esc(ba.label_after)}</span></div>
    </div>`
    )
    .join('\n'),

  ADDRESSES: list(contacts.addresses)
    .map((a) => {
      const metro = str(a.metro)
        ? `<br><small style="font-size:12px;opacity:.7;">${esc(a.metro)}</small>`
        : '';
      return `        <span class="contact-val">${esc(a.address)}${metro}</span>`;
    })
    .join('\n'),

  PHONES: list(contacts.phones)
    .map((p, i) => {
      const phone = item(p, 'phone');
      const style = i > 0 ? ' style="margin-top:6px;"' : '';
      return `        <a href="${esc(tel(phone))}" class="contact-val"${style}>${esc(phone)}</a>`;
    })
    .join('\n'),

  SOCIALS: list(contacts.socials)
    .map(
      (s) => `      <a href="${esc(s.url)}" target="_blank" rel="noopener" class="social-link">
        <span class="social-name">${esc(s.name)}</span>
        <span class="social-arr">↗</span>
      </a>`
    )
    .join('\n'),

  SOCIALS_NOTE: str(contacts.socials_note)
    ? `    <p style="margin-top:18px;font-size:11px;opacity:.55;line-height:1.5;">${escBr(contacts.socials_note)}</p>`
    : '',
};

// ── simple values ──────────────────────────────────────────────────────────
const vars = {
  title: esc(general.title),
  description: esc(general.description),
  og_description: esc(general.og_description || general.description),
  og_image_abs: esc(ogImageAbs),
  site_url: esc(siteUrl),
  footer_name: esc(general.footer_name),
  footer_copy: esc(general.footer_copy),
  year: String(new Date().getFullYear()),

  hero_title: esc(hero.title),
  hero_subtitle: esc(hero.subtitle),
  hero_button_text: esc(hero.button_text),
  hero_booking_url: esc(hero.booking_url),

  about_label: esc(about.label),
  about_title_line1: esc(about.title_line1),
  about_title_line2: esc(about.title_line2),
  about_image: file(about.image),

  services_title_line1: esc(services.title_line1),
  services_title_line2: esc(services.title_line2),
  services_note: escBr(services.note),
  price_button_text: esc(services.price_button_text),
  price_file: file(services.price_file),

  gallery_title_line1: esc(gallery.title_line1),
  gallery_title_line2: esc(gallery.title_line2),

  ba_title_line1: esc(ba.title_line1),
  ba_title_line2: esc(ba.title_line2),

  contacts_label: esc(contacts.label),
  contacts_title_line1: esc(contacts.title_line1),
  contacts_title_line2: esc(contacts.title_line2),
  email: esc(contacts.email),
  contacts_button_text: esc(contacts.button_text),
  contacts_booking_url: esc(contacts.booking_url),
};

// ── render ─────────────────────────────────────────────────────────────────
const template = fs.readFileSync(path.join(ROOT, 'index.template.html'), 'utf8');
const missing = new Set();

const html = template.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (m, key) => {
  if (key in blocks) return blocks[key];
  if (key in vars) return vars[key];
  missing.add(key);
  return '';
});

if (missing.size) {
  console.error('Неизвестные метки в шаблоне:', [...missing].join(', '));
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
console.log('✓ index.html собран');
