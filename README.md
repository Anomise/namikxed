# Парная аватарка

Красивый сайт с призывом к действию для установки парной аватарки.

## Деплой на Vercel

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Авторизуйтесь:
```bash
vercel login
```

3. Деплой:
```bash
vercel --prod
```

Или через GitHub:
1. Загрузите репозиторий на GitHub
2. Зайдите на [vercel.com](https://vercel.com)
3. Нажмите "New Project" → Import Git Repository
4. Выберите репозиторий → Deploy

## Структура

```
├── index.html      # Основная страница
├── style.css       # Стили с адаптивностью
├── script.js       # Интерактивность
├── 1.jpg           # Первая аватарка
├── 2.jpg           # Вторая аватарка
├── vercel.json     # Конфигурация Vercel
└── package.json    # Метаданные проекта
```

## Мобильная адаптация

- iPhone SE (375px)
- iPhone 14/15 (390px)
- iPhone 14/15 Pro Max (430px)
- Samsung Galaxy (360px)
- Планшеты (768px+)
- Landscape режим
- Safe area (чёлка/динамики)
