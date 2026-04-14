<<<<<<< HEAD
<<<<<<< HEAD
# sokany-website
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
=======
# 🛒 E-Commerce Frontend (Next.js + WooCommerce)
>>>>>>> f4b70d4 (hello from Sokany Store)

Production-grade e-commerce frontend built with Next.js using a scalable feature-based architecture.
Backend is powered by WordPress + WooCommerce (Headless).

---

## 🚀 Tech Stack

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Zustand (State Management)
* React Query (Data Fetching & Caching)
* Axios
* Zod (Validation)

---

## 🧠 Architecture Overview

This project follows a **feature-based architecture**:

/features → business logic (products, cart, etc.)
/components → reusable UI
/app → routing (pages)
/lib → API layer
/hooks → shared hooks

---

## 🔄 Data Flow

UI → Hooks → Services → API Route → WooCommerce API

---

## 🎯 Data Source Strategy (IMPORTANT)

The project supports switching between:

* Mock Data (for development)
* Real WooCommerce API

### Controlled by environment variable:

NEXT_PUBLIC_USE_MOCK=true

---

### Behavior:

* If true → uses mock data
* If false → calls internal API

👉 No UI changes required

---

## 🔌 API Integration

We use internal API routes:

/app/api/*

### Why?

* Hide WooCommerce API keys
* Secure requests
* Centralize logic

---

## 🔐 Environment Variables

Create `.env.local`:

NEXT_PUBLIC_API_URL=https://yourstore.com
WC_CONSUMER_KEY=ck_xxxxx
WC_CONSUMER_SECRET=cs_xxxxx
NEXT_PUBLIC_USE_MOCK=true

---

## 🛒 Cart System

* Built with Zustand
* Persisted in localStorage
* Supports:

  * Add to cart
  * Remove item
  * Clear cart

---

## 🖼️ Image System

* Static images → /public/images
* Product images → WooCommerce API
* Fallback image included

---

## 🧩 Folder Structure

/app
/features
/components
/lib
/hooks
/types

---

## 🚀 Getting Started

### 1. Install dependencies

npm install

---

### 2. Run development server

npm run dev

---

### 3. Open

http://localhost:3000

---

## 🌳 Branching Strategy

* main → Production
* develop → Integration
* feature/* → Features
* fix/* → Bugs
* hotfix/* → Urgent fixes

---

## 🔁 Workflow

1. Create branch from develop
2. Work on feature
3. Push branch
4. Create Pull Request
5. Review → Merge

<<<<<<< HEAD
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 380e778 (hello from react)
=======
---

## 🧠 Code Rules

* No API calls inside components
* Use hooks + services
* Keep UI separate from logic
* Use TypeScript strictly

---

## 🧪 Validation

* Use Zod for:

  * API responses
  * Forms

---

## ⚠️ Security

* Never expose API keys in frontend
* Always use internal API routes

---

## 🎯 Goal

Build a scalable, maintainable, and production-ready frontend that integrates seamlessly with WooCommerce.

---

## 🤝 Contributing

Please check CONTRIBUTING.md before contributing.

---

## 🚀 Future Plans

* WooCommerce full integration
* AI automation
* Admin dashboard
* Order management system

---

Built with ❤️
>>>>>>> f4b70d4 (hello from Sokany Store)
