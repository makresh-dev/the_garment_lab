# The Garment Lab

A full-stack e-commerce platform for precision-crafted garments — built with a **Next.js 16** frontend and a **Django 5 REST API** backend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database (Docker)](#database-docker)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API Overview](#api-overview)
- [Payments](#payments)
- [Deployment](#deployment)

---

## Overview

The Garment Lab is an independent fashion label specialising in architectural silhouettes and tactile, precision-crafted garments. This repository contains the complete codebase for its online store, including product browsing, cart management, checkout, UPI-based payment flow, and an order-tracking client portal.

---

## Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend     | Django 5.2, Django REST Framework |
| Auth        | JWT via `djangorestframework-simplejwt` (30 min access / 7-day refresh) |
| Database    | PostgreSQL 16 |
| Storage     | Django FileSystem (local) / AWS S3 via `django-storages` |
| Static      | WhiteNoise (compressed & cached) |
| Package Mgr | `bun` (frontend), `pip` / `venv` (backend) |
| Container   | Docker Compose (PostgreSQL only) |

---

## Project Structure

```
the_garment_lab/
├── backend/                  # Django project
│   ├── accounts/             # OTP-based registration & auth
│   ├── cart/                 # Shopping cart
│   ├── orders/               # Order management
│   ├── payments/             # UPI payment processing
│   ├── products/             # Product catalogue
│   ├── users/                # Custom user model
│   ├── config/               # Django settings & URLs
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── page.tsx          # Homepage
│   │   ├── products/         # Product listing & [slug] detail
│   │   ├── cart/             # Cart page
│   │   ├── checkout/         # Checkout flow
│   │   ├── orders/           # Client portal — order history
│   │   ├── order-success/    # Post-payment confirmation
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   └── verify-otp/       # OTP verification
│   ├── components/           # Shared React components
│   ├── lib/                  # API client, media helpers
│   ├── types/                # TypeScript type definitions
│   └── package.json
│
└── docker-compose.yml        # PostgreSQL service
```

---

## Features

- **Product Catalogue** — browsing, filtering, and slug-based product detail pages with image galleries and discount pricing
- **Cart** — persistent server-side cart with quantity management
- **Checkout** — address entry and order placement
- **Payments** — UPI QR code generation with `qrcode` and order confirmation
- **Authentication** — OTP-based email registration, JWT login, token refresh
- **Order Tracking** — client portal showing full order history and status
- **Dark Mode** — system-aware theme via `next-themes`
- **Admin** — Django admin for product, order, and user management

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 & **bun** ≥ 1.3
- **Python** ≥ 3.11 & **pip**
- **PostgreSQL** 16 (or Docker)

---

### Database (Docker)

The easiest way to spin up PostgreSQL locally:

```bash
docker compose up -d
```

This starts a `postgres:16` container at `localhost:5432` with:
- **DB:** `garmentlab`
- **User:** `garmentlab`
- **Password:** `garmentlab_password`

---

### Backend Setup

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and configure environment variables
cp .env.production.example .env
# Edit .env with your local values (see Environment Variables below)

# 4. Run migrations
python manage.py migrate

# 5. Create a superuser
python manage.py createsuperuser

# 6. Start the development server
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
bun install

# 2. Copy and configure environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start the development server
bun dev
```

The frontend will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | `development-only-secret-key` |
| `DEBUG` | Enable debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `DATABASE_URL` | Full Postgres connection URL (overrides `DB_*` vars) | — |
| `DB_NAME` | Database name | — |
| `DB_USER` | Database user | — |
| `DB_PASSWORD` | Database password | — |
| `DB_HOST` | Database host | — |
| `DB_PORT` | Database port | `5432` |
| `DB_SSL_REQUIRE` | Require SSL for DB connection | `False` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins | `http://localhost:3000` |
| `EMAIL_BACKEND` | Django email backend class | Console backend |
| `EMAIL_HOST` | SMTP host | — |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USE_TLS` | Use TLS for email | `True` |
| `EMAIL_HOST_USER` | SMTP username | — |
| `EMAIL_HOST_PASSWORD` | SMTP password / app password | — |
| `DEFAULT_FROM_EMAIL` | Sender name and address | `The Garment Lab <noreply@example.com>` |
| `UPI_ID` | UPI payment ID | `thegarmentlab@upi` |
| `UPI_NAME` | UPI display name | `The Garment Lab` |
| `SECURE_SSL_REDIRECT` | Redirect HTTP to HTTPS | `False` |
| `SESSION_COOKIE_SECURE` | Secure session cookies | `False` |
| `CSRF_COOKIE_SECURE` | Secure CSRF cookies | `False` |
| `SECURE_HSTS_SECONDS` | HSTS max-age in seconds | `0` |

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Django backend (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_UPI_ID` | UPI ID shown in the payment QR code |
| `NEXT_PUBLIC_UPI_NAME` | Display name shown in the payment QR code |

---

## API Overview

The backend exposes a RESTful JSON API under `/api/`. Authentication uses Bearer JWT tokens.

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register/`, `/api/auth/login/`, `/api/auth/token/refresh/` |
| OTP | `POST /api/accounts/verify-otp/` |
| Products | `GET /api/products/`, `GET /api/products/{slug}/` |
| Cart | `GET/POST /api/cart/`, `PATCH/DELETE /api/cart/{id}/` |
| Orders | `GET/POST /api/orders/`, `GET /api/orders/{id}/` |
| Payments | `POST /api/payments/` |

Pagination is set to **20 items per page** via `PageNumberPagination`. Filtering, search, and ordering are enabled via `django-filter`.

---

## Payments

Payments are handled via **UPI**. On checkout, the backend generates a `upi://` deep-link which the frontend renders as a scannable QR code (using the `qrcode` npm package). Supported payment methods:

- UPI QR scan (GPay, PhonePe, Paytm, any UPI app)
- Cash on Delivery

---

## Deployment

### Backend

The backend is production-ready with:
- **WhiteNoise** for static file serving
- **Gunicorn** as the WSGI server
- Full HTTPS / HSTS / CSRF security header configuration via env vars

Suggested hosting: **AWS EC2**, **Railway**, **Render**, or any VPS with PostgreSQL.

```bash
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Frontend

Deploy to **Vercel** (recommended) with `NEXT_PUBLIC_API_URL` pointing to your production backend.

```bash
bun run build
bun run start
```

---

> *"Form follows precision. Garments built to outlast trend cycles."*
