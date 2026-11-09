# KeratinNow — сайт + админ-панель Decap CMS

## Как устроено

```
admin/index.html       ← страница админки (/admin/)
admin/config.yml       ← какие поля видит клиентка
content/*.json         ← все тексты, цены, ссылки, фото (их и правит админка)
index.template.html    ← дизайн страницы с метками {{...}}
build.js               ← собирает index.html из шаблона и content/*.json
netlify.toml           ← Netlify запускает `node build.js` при каждом деплое
```

Клиентка сохраняет изменения в админке → Decap делает коммит в GitHub →
Netlify пересобирает сайт (≈ 30–60 сек) → изменения на сайте.

## Установка (один раз)

1. **Скопируйте файлы в корень репозитория** рядом с `images/`, `price.pdf`, `privacy.html`.
2. **Удалите старый `index.html` из репозитория** — теперь он собирается автоматически:
   ```bash
   git rm --cached index.html
   git add .
   git commit -m "Decap CMS"
   git push
   ```
3. **Проверьте ветку** в `admin/config.yml` → `branch: main` (если у вас `master` — замените).
4. **Netlify → Project configuration → Identity** → Enable Identity.
   - Registration preferences → **Invite only** (иначе зарегистрироваться сможет кто угодно).
5. **Identity → Services → Git Gateway** → Enable Git Gateway.
6. **Identity → Invite users** → введите почту клиентки.
   Она получит письмо, перейдёт по ссылке на сайт, задаст пароль и окажется в админке.
7. Дальше вход всегда по адресу **https://keratinnow.netlify.app/admin/**

## Что может менять клиентка

- Главный экран: заголовок, подзаголовок, кнопка и ссылка на запись
- О салоне: тексты и фото
- Услуги и цены: добавлять/удалять/переставлять, цены, длительность, PDF прайс-листа
- Галерея и «До/После»: заменять и добавлять фото
- Контакты: адреса, телефоны, почта, ссылки на соцсети
- SEO: заголовок вкладки, описание, картинка превью

Дизайн, вёрстка и скрипты ей недоступны — их можно сломать только правкой
`index.template.html`.

## Локальная проверка

```bash
node build.js     # создаст index.html, откройте его в браузере
```

## Если Git Gateway перестанет работать

Netlify пометил Git Gateway как устаревший (работает, но не развивается).
Запасной вариант — бэкенд `github` (закомментирован в `config.yml`):
клиентке понадобится аккаунт GitHub с доступом к репозиторию, а в Netlify —
OAuth-провайдер GitHub (Project configuration → Access & security → OAuth).
