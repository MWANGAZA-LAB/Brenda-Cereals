# 🌾 Brenda Cereals - E-commerce Platform

A modern e-commerce platform for cereal and grain trading built with Next.js 15, featuring multi-currency payment support (M-Pesa, Safaricom Paybill & Bitcoin Wallet).

## ✨ Features

- **🛒 E-commerce**: Product catalog, shopping cart, checkout, order management
- **🔐 Authentication**: User registration, login, role-based access control
- **💳 Payments**: M-Pesa integration, Safaricom Paybill direct payment, Bitcoin Wallet QR code support
- **🗄️ Database**: Prisma ORM with PostgreSQL, type-safe operations
- **📱 Mobile-First**: Responsive design optimized for African markets
- **🌍 Multi-language**: English and Swahili support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.2, React 19, TailwindCSS 4.x, TypeScript 5
- **Backend**: Next.js API Routes, Prisma 5, NextAuth.js
- **Database**: PostgreSQL
- **Payments**: M-Pesa API, Bitcoin/Lightning Network
- **Testing**: Jest, React Testing Library

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp apps/web/.env.example apps/web/.env.local

# Generate Prisma client
npx prisma generate --schema=prisma/schema.prisma

# Start development
npm run dev
```

Visit `http://localhost:3001`

## 📱 API Endpoints

- **Auth**: `POST /api/auth/signup`, `POST /api/auth/signin`
- **Products**: `GET /api/products`, `POST /api/orders`
- **Payments**: `POST /api/payments/mpesa/initiate`, `POST /api/payments/bitcoin/initiate`
- **System**: `GET /api/health`, `GET /api/metrics`

## 🔧 Development

```bash
npm run dev              # Development server
npm run build           # Production build
npm test                # Run tests
npm run lint            # Code linting
```

## 🚀 Current Status

✅ **Production Ready** - All core systems operational
- Development server: `localhost:3001`
- Authentication: ✅ Working
- Payments: ✅ M-Pesa + Bitcoin integrated
- Database: ✅ Connected
- Tests: ✅ 24/24 passing

---

**Made with ❤️ in Kenya** 🇰🇪
