# ✨ AVIAR — Luxury E-Commerce Platform

A production-ready luxury e-commerce web application built with **Next.js 16 (React 19)** frontend and a **Node.js Express 5 + MySQL** backend.

---

## 🌟 Key Features

- **Storefront**: Responsive luxury design, dynamic product catalogs, search modal, cart drawer, wishlists, and order tracking.
- **Admin Dashboard**: Real-time sales metrics, product catalog management, section management, order fulfillment, coupon codes, and live chat.
- **Payment & Checkout**: Multi-step checkout with Cash on Delivery (COD) and Stripe credit card processing.
- **Security & Performance**: Hardened with Helmet, response compression, rate limiting, and robust input validation.
- **Multi-Deployment Ready**: Configured for Docker Compose, Linux VPS (PM2 + Nginx), Vercel, and cPanel (Phusion Passenger).

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express 5, Sequelize ORM, MySQL, Helmet, Rate Limiter
- **Image Storage**: Local `/uploads` or Cloudinary CDN
- **Process Manager**: PM2 / Docker

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 🐳 Docker Deployment

To launch the complete stack (MySQL + Backend + Frontend) in one command:

```bash
docker compose up -d --build
```

---

## 📖 Deployment Guide

For full step-by-step production deployment instructions (Linux VPS, Nginx, PM2, SSL, cPanel, Docker), refer to the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## 📄 License
Private & Proprietary.
