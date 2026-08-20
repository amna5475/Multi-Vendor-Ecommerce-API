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

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Sequelize |
| Database | PostgreSQL |
| Cache / messaging-ready | Redis (via Docker Compose) |
| Auth | JWT (RBAC) |
| Docs | Swagger UI |
| Containers | Docker, Docker Compose |

## Project Structure

- `controllers/` — request handling and response formatting
- `services/` — business logic
- `models/` — schema and relationships ([dbModel.js](models/dbModel.js))
- `middleware/` — authentication, authorization, validation
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

## API Documentation

Interactive Swagger UI:

`http://localhost:3000/api-docs`

Role-based endpoint reference: [API_ROLES_DOCUMENTATION.md](API_ROLES_DOCUMENTATION.md)

Postman collection: [POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json)

## Contributing

This project is built around real marketplace use cases. Explore the modules and extend carefully with tests and clear commits.
