# 🚀 AVIAR Production Deployment & Setup Guide

This guide details everything required to deploy the **AVIAR** e-commerce software (Next.js Frontend + Express & MySQL Backend) to production securely and reliably.

---

## 📋 Architecture Overview

- **Frontend**: Next.js 16 (React 19, TailwindCSS, SSR/SSG)
- **Backend**: Node.js Express 5, Sequelize ORM, MySQL, Helmet, Rate Limiting, Compression
- **Storage**: Local `/uploads` directory or Cloudinary CDN
- **Payments**: Cash on Delivery (default) & Stripe Integration

---

## 🛠️ Step 1: Environment Configuration

### 1. Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and update the values:

```env
# Server
PORT=5000
NODE_ENV=production

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=aviar_db

# Security & Authentication
JWT_SECRET=your_super_strong_random_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# Allowed Frontend URLs (comma-separated if multiple domains)
FRONTEND_URL=https://shop.aviarbd.com,https://aviarbd.com

# Initial Admin Credentials (created on first boot)
ADMIN_EMAIL=admin@aviarbd.com
ADMIN_PASSWORD=YourStrongAdminPassword123!

# Database Alter Mode (keep false in production)
DB_SYNC_ALTER=false

# Optional Stripe Integration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_CURRENCY=bdt
```

### 2. Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env` (or set environment variables in your hosting dashboard):

```env
# Public Backend API URL
NEXT_PUBLIC_API_URL=https://api.aviarbd.com

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Cloudinary (Optional, for media storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=3000
NODE_ENV=production
```

---

## 🐳 Option A: Docker Compose Deployment (Recommended)

Run the full stack (MySQL + Backend + Frontend) in one command:

```bash
# 1. Edit docker-compose.yml or supply environment variables
# 2. Start all containers in background
docker compose up -d --build

# 3. Check container logs
docker compose logs -f
```

---

## 🖥️ Option B: Linux VPS Deployment (Ubuntu / Debian + PM2 + Nginx)

### 1. Install Node.js, PM2, and MySQL
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential nginx

# Install PM2
sudo npm install -g pm2
```

### 2. Database Setup
```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE aviar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aviar_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON aviar_db.* TO 'aviar_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
Import the initial schema:
```bash
mysql -u aviar_user -p aviar_db < database.sql
```

### 3. Install & Build
```bash
# Backend
cd backend
npm install --omit=dev
cd ..

# Frontend
cd frontend
npm install
npm run build
cd ..
```

### 4. Start Services with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 5. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/aviar.conf`:

```nginx
# API Backend (api.aviarbd.com)
server {
    server_name api.aviarbd.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }
}

# Frontend Storefront (aviarbd.com, shop.aviarbd.com)
server {
    server_name aviarbd.com www.aviarbd.com shop.aviarbd.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site & get SSL certificates with Let's Encrypt Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/aviar.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d aviarbd.com -d www.aviarbd.com -d shop.aviarbd.com -d api.aviarbd.com
```

---

## 🌐 Option C: Vercel (Frontend) + VPS / Cloud (Backend)

1. **Deploy Backend**: Deploy the `backend/` directory to your VPS, Railway, Render, or DigitalOcean App Platform.
2. **Deploy Frontend to Vercel**:
   - Import the `frontend/` directory into Vercel.
   - In Vercel Project Settings > Environment Variables, add:
     - `NEXT_PUBLIC_API_URL` = `https://your-backend-api-domain.com`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
     - `CLOUDINARY_CLOUD_NAME` = `...`
     - `CLOUDINARY_API_KEY` = `...`
     - `CLOUDINARY_API_SECRET` = `...`
   - Deploy.

---

## 🔒 Production Security Checklist

- [x] **Security Headers**: Enabled via `helmet` and Next.js `securityHeaders` in `next.config.ts`.
- [x] **Rate Limiting**: Enabled on API routes and strict rate limits on `/api/auth/login`, `/api/admin/login`, `/api/auth/register`.
- [x] **Payload Compression**: Enabled with `compression` middleware.
- [x] **CORS Origin Whitelisting**: Flexible, secure configuration through `FRONTEND_URL`.
- [x] **Environment Variable Isolation**: Sensitive keys (`JWT_SECRET`, database passwords, Stripe secrets) isolated in `.env`.
- [x] **Database Security**: Parameterized queries via Sequelize ORM to prevent SQL injection.
- [x] **Upload Sanitization**: File type filtering (excluding SVG to prevent stored XSS) and 5MB size limit.
- [x] **Graceful Shutdown**: Server handles `SIGINT`/`SIGTERM` to cleanly close open connections and pools.
