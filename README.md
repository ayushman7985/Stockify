# Stockify

Stockify is a full-stack inventory and order management application. It lets you manage products, customers, and orders through a REST API and an interactive React dashboard, with all data stored in PostgreSQL.

## Features

### Product Management
- Create, read, update, and delete products
- Track SKU, price, and quantity in stock
- Prevent duplicate SKUs

### Customer Management
- Create and list customers
- Store full name, email, and phone number
- Prevent duplicate email addresses
- Block deletion when a customer has existing orders

### Order Management
- Create orders linked to a customer and one or more products
- Automatically calculate order totals
- Reduce product stock when an order is placed
- Restore stock when an order is cancelled/deleted
- View order history with customer and line-item details

## Business Logic

Stockify enforces the following rules at the API, validation, and database levels:

| Rule | Enforcement |
| ---- | ----------- |
| Product SKU must be unique | Pydantic validation, API check, DB unique constraint |
| Customer email must be unique | Email normalization, API check, DB unique constraint |
| Product quantity cannot be negative | Pydantic `ge=0`, DB check constraint |
| Orders blocked when stock is insufficient | Pre-order stock validation with `409 Conflict` |
| Order creation reduces stock automatically | Stock decremented on successful order commit |
| Order total calculated by backend | Total derived from product prices × quantities (client cannot set total) |
| Request data validated before processing | Pydantic schemas with field and model validators |
| Proper error handling | Global handlers for validation (`422`) and integrity errors (`409`) |

### HTTP Status Codes

| Code | Usage |
| ---- | ----- |
| `201` | Resource created (product, customer, order) |
| `204` | Resource deleted successfully |
| `400` | Invalid request logic (rare; most validation uses `422`) |
| `404` | Resource not found |
| `409` | Business rule conflict (duplicate SKU/email, insufficient stock, protected delete) |
| `422` | Invalid or missing request data |

## Frontend Features

### Dashboard
- Total products, customers, and orders
- Low stock product alerts (threshold: 5 units)
- Responsive summary cards

### Product Management
- Add, view, update, and delete products
- Client-side form validation with field-level errors

### Customer Management
- Add, view, and delete customers
- Email format validation

### Order Management
- Create multi-product orders
- View order list
- View detailed order modal (customer info, line items, totals)
- Cancel orders with stock restoration

### UI/UX
- Responsive design for desktop and mobile
- Organized component structure (`common/`, managers, context)
- Global state via React Context for messages and data refresh
- Success and error alerts with auto-dismiss
- Loading states and accessible modal dialogs

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Backend    | FastAPI, SQLAlchemy, Pydantic       |
| Frontend   | React 19, Vite                      |
| Database   | PostgreSQL 16                       |
| Deployment | Docker, Docker Compose              |

## Project Structure

```
Stoc/
├── backend/
│   ├── app/
│   │   ├── api/           # REST route handlers
│   │   ├── core/          # App configuration
│   │   ├── db/            # Database engine and session
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   └── main.py        # FastAPI application entrypoint
│   ├── alembic/           # Database migration scaffold
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env               # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Dashboard, managers, shared UI
│   │   ├── context/       # Global app state
│   │   └── utils/         # Validation and formatting helpers
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml     # Multi-service orchestration
```

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- Or, for local development without Docker:
  - Python 3.11+
  - Node.js 20+
  - PostgreSQL 16

## Quick Start (Docker)

1. Clone the repository and navigate to the project root:

```bash
cd Stoc
```

2. Ensure `backend/.env` exists with the required variables (see [Environment Variables](#environment-variables)).

3. Build and start all services:

```bash
docker compose up --build
```

4. Open the application:

| Service   | URL |
| --------- | --- |
| Frontend  | http://localhost:5173 |
| Backend   | http://localhost:8000 |
| API Docs  | http://localhost:8000/docs |
| Database  | `localhost:5420` |

5. Stop the stack:

```bash
docker compose down
```

Data persists across restarts in the `postgres_data` Docker volume. To remove stored data as well:

```bash
docker compose down -v
```

## Environment Variables

Create `backend/.env` with the following values:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=stockify_db

DB_HOST=db
DB_PORT=5432
DB_NAME=stockify_db
DB_USER=postgres
DB_PASSWORD=postgres

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

> **Note:** When running the backend locally (outside Docker), set `DB_HOST=localhost` and `DB_PORT=5420` to connect to the database exposed by Docker Compose.

## API Endpoints

### Health

| Method | Endpoint   | Description        |
| ------ | ---------- | ------------------ |
| GET    | `/health`  | Service health check |

### Products

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | `/products`        | Create a new product     |
| GET    | `/products`        | List all products        |
| GET    | `/products/{id}`   | Get a product by ID      |
| PUT    | `/products/{id}`   | Update a product         |
| DELETE | `/products/{id}`   | Delete a product         |

**Product fields:** `name`, `sku`, `price`, `quantity_in_stock`

### Customers

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| POST   | `/customers`         | Create a new customer     |
| GET    | `/customers`         | List all customers        |
| GET    | `/customers/{id}`    | Get a customer by ID      |
| DELETE | `/customers/{id}`    | Delete a customer         |

**Customer fields:** `full_name`, `email`, `phone_number`

### Orders

| Method | Endpoint         | Description                          |
| ------ | ---------------- | ------------------------------------ |
| POST   | `/orders`        | Create a new order                   |
| GET    | `/orders`        | List all orders                      |
| GET    | `/orders/{id}`   | Get order details by ID              |
| DELETE | `/orders/{id}`   | Cancel/delete an order (restores stock) |

**Order payload example:**

```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```

Interactive API documentation is available at http://localhost:8000/docs.

## Frontend Usage

The React dashboard provides three tabs:

1. **Products** — Add, edit, and delete inventory items
2. **Customers** — Add and manage customer records
3. **Orders** — Create multi-product orders and cancel existing ones

The frontend connects to the backend using `VITE_API_URL` (defaults to `http://localhost:8000`).

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database

Start only the database container if needed:

```bash
docker compose up db -d
```

## Docker Services

| Container           | Image / Build | Port Mapping  |
| ------------------- | ------------- | ------------- |
| `stockify_db`       | postgres:16   | 5420 → 5432   |
| `stockify_backend`  | stoc-backend  | 8000 → 8000   |
| `stockify_frontend` | stoc-frontend | 5173 → 5173   |

The backend waits for the database health check before starting.

## Database

Tables are created automatically on backend startup via SQLAlchemy. The main entities are:

- `products`
- `customers`
- `orders`
- `order_items`

Alembic is included for future schema migrations.

## Suggested Test Flow

1. Add products with name, SKU, price, and stock quantity
2. Add a customer with name, email, and phone
3. Create an order by selecting the customer and one or more products
4. Confirm product stock decreases after the order is placed
5. Cancel the order and confirm stock is restored

## License

This project is for educational and development use.
