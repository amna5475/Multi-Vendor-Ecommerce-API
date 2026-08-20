# E-Commerce Marketplace API

A production-oriented multi-vendor e-commerce backend API built with Node.js, Express, and Sequelize (PostgreSQL). Implements marketplace workflows similar to platforms like Daraz/Amazon-style seller ecosystems.

## Key Features

- **Multi-vendor architecture**: Seller onboarding, shop management, and staff (sub-user) management
- **Advanced product catalog**: Categories, brands, variants, and dynamic attributes
- **Marketing & campaigns**: Time-bound campaigns with product-level discount overrides
- **Financial system**: User wallets, refunds, transaction history, and seller settlements
- **Customer engagement**: Product Q&A, shop following, and verified-purchase reviews
- **Order lifecycle**: Inventory tracking, multi-step orders, shipment events, and returns
- **Security & audit**: JWT-based RBAC and administrative activity logging
- **Redis performance layer**: product/category caching and Redis-backed rate limiting

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Sequelize |
| Database | PostgreSQL |
| Cache & rate limiting | Redis (`ioredis`) |
| Auth | JWT (RBAC) |
| Docs | Swagger UI |
| Containers | Docker, Docker Compose |
| Testing | Jest, Supertest |

![Tests](https://img.shields.io/badge/tests-Jest%20%2B%20Supertest-brightgreen)

## Why Redis is used

Redis is not included as a buzzword — it solves concrete marketplace bottlenecks:

1. **Product & category caching** — public catalog reads (`GET /products`, `GET /products/:id`, `GET /categories`) are cached with short TTLs so high-traffic browsing does not hit PostgreSQL on every request.
2. **Cache invalidation on writes** — create/update/delete of products or categories bumps a version key and clears detail keys so shoppers do not see stale catalog data.
3. **Auth & API rate limiting** — login/register and general API traffic are limited per IP using Redis counters to reduce brute-force and abuse risk.

If Redis is down, the API **fails open**: requests still succeed against PostgreSQL, without cache/rate-limit storage.

## Project Structure

- `controllers/` — request handling and response formatting
- `services/` — business logic
- `models/` — schema and relationships ([dbModel.js](models/dbModel.js))
- `middleware/` — authentication, authorization, validation, rate limiting
- `helpers/cacheHelper.js` — Redis cache get/set/invalidation helpers
- `config/redis.js` — shared Redis client
- `routes/` — API endpoints ([ApiRoutes.js](routes/ApiRoutes.js))
- `adapters/` — external integrations (uploads, errors)

## Quick Start with Docker (recommended)

Someone should be able to clone this repo and run the stack with one command.

### 1. Configure environment

```bash
cp .env.example .env
```

Update `JWT_SECRET` in `.env` before sharing or deploying.

### 2. Start the stack

```bash
docker compose up --build
```

This starts:

- **API** on `http://localhost:3000`
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`

### 3. Verify

- Health: `http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/api-docs`

Stop the stack:

```bash
docker compose down
```

Persist data volumes while removing containers:

```bash
docker compose down
# To also wipe DB/cache volumes:
# docker compose down -v
```

## Local Development (without Docker for the API)

1. Ensure PostgreSQL (and optionally Redis) are running
2. Install dependencies:

```bash
npm install
```

3. Copy and configure env:

```bash
cp .env.example .env
```

For local API runs, set `POSTGRES_HOST=localhost` in `.env`.

4. Start:

```bash
npm run dev
```

## Testing

```bash
# All tests (unit + integration)
npm test

# Unit tests only (no database required)
npm run test:unit

# Integration tests (requires PostgreSQL from .env / docker compose)
npm run test:integration
```

Coverage focus:

- Authentication (register/login/validation)
- Product create & browse
- Seller permission checks
- Order placement + inventory decrement
- Inventory adjustment
- Return/refund request flow

Integration tests automatically skip when PostgreSQL is unavailable.

## API Documentation

Interactive Swagger UI:

`http://localhost:3000/api-docs`

Role-based endpoint reference: [API_ROLES_DOCUMENTATION.md](API_ROLES_DOCUMENTATION.md)

Postman collection: [POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json)

## Contributing

This project is built around real marketplace use cases. Explore the modules and extend carefully with tests and clear commits.
