# Medical Books DZ

Trilingual (English / Arabic RTL / French) online bookstore for medical textbooks and general books, delivering across all 58 Algerian wilayas.

## Stack

- **Framework:** Next.js 16 (App Router, React 18, TypeScript)
- **Styling:** Tailwind CSS 3.4 with a yellow/black brand identity and full dark mode
- **Database:** PostgreSQL (Neon) via Prisma 5
- **State:** Zustand (cart, wishlist)
- **i18n:** Locale routes `[lang]` with dictionaries in `lib/i18n/dictionaries/`, locale detection in `proxy.ts`

## Getting started

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, ADMIN_*, SESSION_SECRET
npm run db:push           # push Prisma schema
npm run db:seed           # seed categories, publishers, books, promos, orders
npm run dev               # http://localhost:3000
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |

## Environment (`.env`)

```
DATABASE_URL=postgresql://...        # Neon connection string
SITE_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=...
SESSION_SECRET=...
```

## Routes

### Storefront (`/[lang]`)

- `/` — home (hero, categories, featured, best sellers, series, offers, reviews, newsletter)
- `/shop` — catalog with filters (category, author, publisher, year, price, rating, language, format), sorting, pagination
- `/book/[slug]` — product page with reviews, related books, series info
- `/bundles`, `/series/[slug]` — book bundles and series
- `/cart`, `/checkout` — cart and checkout (COD now; CIB / Edahabia placeholder)
- `/track` — order tracking by order code + phone
- `/wishlist` — wishlist with share/import links
- `/account` — order history by phone
- `/about`, `/faq` (accordion), `/shipping`, `/returns`, `/terms`, `/privacy`, `/contact`
- 404 page for unknown routes

### Admin (`/[lang]/admin`)

- `/admin/login` — session login (signed cookie, 12 h)
- `/admin` — dashboard (revenue, orders, top books, recent orders, sales by category)
- `/admin/orders` — manage order status, tracking URL, shipping company
- `/admin/products` — product list with stock/sold
- `/admin/promos` — promo codes
- `/admin/newsletter` — subscribers

### API

- `GET /api/search?q=&lang=` — book search (titles, author, ISBN)
- `GET /api/promo?code=&total=` — promo validation
- `GET /api/books` — book listing

## Project structure

```
app/                 # App Router pages, actions, API routes
  [lang]/            # locale segment (en | ar | fr)
  actions/           # server actions (orders, admin)
  api/               # route handlers
components/          # UI components (navbar, footer, shop, admin, ...)
lib/
  i18n/dictionaries/ # en, ar, fr dictionaries (Dict type from en.ts)
  shipping.ts        # 58 wilayas with codes and shipping fees
prisma/
  schema.prisma      # models: Book, Category, Publisher, Order, ...
  seed.ts            # medical catalog seed data
public/              # logo, favicon, apple icon
proxy.ts             # locale detection / redirect middleware
```

## Design notes

- Brand: yellow `#ffd400` on near-black, logo-driven identity, rounded pill navigation, glass header
- Arabic locale renders `dir="rtl"` with Arabic-capable fonts (Tajawal)
- Page transitions via `app/[lang]/template.tsx`; motion respects `prefers-reduced-motion`
- Money in Algerian dinar (DA); free shipping threshold and per-wilaya fees in `lib/shipping.ts`
