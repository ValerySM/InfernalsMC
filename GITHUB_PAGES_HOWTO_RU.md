# Как захостить этот фронтенд на GitHub Pages

Ниже — самый простой и стабильный вариант: **GitHub Pages через GitHub Actions**.

## 1) Залей проект на GitHub
1. Создай новый репозиторий на GitHub (например `infernals-grunge`).
2. Загрузи туда этот проект.
3. Важно: ветка должна называться **main** (или измени в workflow файл, если у тебя другая).

## 2) Включи GitHub Pages
1. Открой репозиторий → **Settings** → **Pages**.
2. В разделе **Build and deployment** выбери:
   - **Source**: `GitHub Actions`

## 3) Деплой
1. Сделай push в `main`.
2. GitHub сам запустит workflow **Deploy to GitHub Pages**.
3. После успешного деплоя сайт будет по адресу:
   `https://<username>.github.io/<repo>/`

## Что уже сделано в проекте
- Добавлен workflow: `.github/workflows/deploy-pages.yml`
- Добавлена поддержка `VITE_BASE` в `vite.config.ts` (нужно для подпапки `/repo/` на Pages)
- Добавлен SPA fallback для роутинга на GitHub Pages:
  - `client/public/404.html`
  - патч в `client/index.html`

## Локальный запуск
```bash
npm install
npm start
```

## Локальная сборка
Обычная сборка (как в проекте):
```bash
npm run build
```

Сборка именно для GitHub Pages (артефакт в папку `dist/`):
```bash
# Linux / macOS
VITE_BASE=/your-repo/ npm run build:pages

# Windows PowerShell
$env:VITE_BASE="/your-repo/"; npm run build:pages

# Windows CMD
set VITE_BASE=/your-repo/ && npm run build:pages
```
