# Microservices Practice

A comprehensive event-driven microservices architecture built with Node.js, TypeScript, and AWS. This project demonstrates best practices for building scalable, observable, and maintainable microservices using asynchronous messaging, database-per-service patterns, and infrastructure-as-code.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Setup Instructions](#setup-instructions)
  - [Local Development](#local-development)
  - [Docker Setup](#docker-setup)
  - [AWS Deployment (Pulumi)](#aws-deployment-pulumi)
- [API Documentation](#api-documentation)
  - [Orders Service](#orders-service)
  - [Invoices Service](#invoices-service)
  - [Kong API Gateway](#kong-api-gateway)
- [Event-Driven Architecture](#event-driven-architecture)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Development Guide](#development-guide)
  - [Running Services Locally](#running-services-locally)
  - [Database Migrations](#database-migrations)
  - [Message Broker Setup](#message-broker-setup)
- [Observability](#observability)
- [Troubleshooting](#troubleshooting)
- [Project Health](#project-health)

---

## 🎯 Project Overview

This repository demonstrates a production-ready microservices ecosystem with the following characteristics:

- **Event-Driven**: Asynchronous communication via RabbitMQ AMQP
- **Database-Per-Service**: Each microservice maintains its own PostgreSQL database
- **API Gateway**: Kong handles request routing and cross-cutting concerns
- **Infrastructure as Code**: AWS deployment via Pulumi
- **Observability**: Built-in OpenTelemetry instrumentation for distributed tracing
- **Type-Safe**: Full TypeScript stack with Zod schema validation
- **Containerized**: Docker and Docker Compose for local development

---

## 🏗️ Architecture

### High-Level Flow

```
Client Request
   ↓
Kong API Gateway (Port 8000)
   ├─→ /orders → Orders Service (Port 3333)
   └─→ /invoices → Invoices Service (Port 3334)
         ↓
   [PostgreSQL Databases]
         ↓
   [RabbitMQ Message Broker]
         ↓
   Services communicate via Events (e.g., order-created)
```

### Service Communication Pattern

1. **Orders Service** creates an order and publishes an `OrderCreatedMessage` event
2. **Invoices Service** listens to the `orders` queue and processes order events
3. Services maintain eventual consistency through asynchronous messaging
4. Each service has its own PostgreSQL database (no shared database)

---

## 🛠️ Technology Stack

### Core Services
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 22.x | Runtime |
| **TypeScript** | Latest | Type safety |
| **Fastify** | 5.3.3 | HTTP Framework |
| **PostgreSQL** | Latest | Persistent storage |
| **RabbitMQ** | 3.x (management plugin) | Message broker |

### Data Layer
| Technology | Version | Purpose |
|---|---|---|
| **Drizzle ORM** | 0.44.2 | Type-safe query builder |
| **Drizzle Kit** | 0.31.1 | Schema migrations |
| **pg** | 8.16 | PostgreSQL driver |

### API & Validation
| Technology | Version | Purpose |
|---|---|---|
| **Zod** | 3.25.61 | Schema validation |
| **fastify-type-provider-zod** | 5.0.1 | Fastify + Zod integration |
| **@fastify/cors** | 11.0.1 | CORS middleware |

### Message Queue
| Technology | Version | Purpose |
|---|---|---|
| **amqplib** | 0.10.8 | AMQP client for RabbitMQ |

### Observability
| Technology | Version | Purpose |
|---|---|---|
| **@opentelemetry/api** | 1.9.0 | Tracing API |
| **@opentelemetry/sdk-node** | 0.52.0 | Node.js SDK |
| **@opentelemetry/auto-instrumentations-node** | 0.60.1 | Auto-instrumentation |

### Infrastructure
| Technology | Version | Purpose |
|---|---|---|
| **Pulumi** | 3.113.0 | Infrastructure as Code |
| **@pulumi/aws** | 6.0.0 | AWS provider |
| **Docker** | Latest | Container runtime |

### API Gateway
| Technology | Version | Purpose |
|---|---|---|
| **Kong** | 3.9 | API Gateway |

---

## 📁 Project Structure

```
microservices-practice/
│
├── app-orders/                      # Order Management Service
│   ├── src/
│   │   ├── http/
│   │   │   └── server.ts           # Express-like HTTP server
│   │   ├── db/
│   │   │   ├── client.ts           # Drizzle client
│   │   │   ├── schema/             # Customers, Orders tables
│   │   │   └── migrations/         # SQL migration files
│   │   ├── broker/
│   │   │   ├── broker.ts           # AMQP connection
│   │   │   ├── subscriber.ts       # Message listening
│   │   │   └── channels/           # Queue definitions
│   │   └── tracer/
│   │       └── tracer.ts           # OpenTelemetry setup
│   ├── Dockerfile
│   ├── compose.yaml                # Local dev environment
│   ├── drizzle.config.ts          # ORM configuration
│   ├── package.json
│   └── tsconfig.json
│
├── app-invoices/                    # Invoice Management Service
│   ├── src/
│   │   ├── http/
│   │   │   └── server.ts
│   │   ├── db/
│   │   │   ├── client.ts
│   │   │   ├── schema/             # Invoices table
│   │   │   └── migrations/
│   │   ├── broker/
│   │   │   ├── broker.ts
│   │   │   └── channels/           # Queue subscriptions
│   │   └── tracer/
│   │       └── tracer.ts
│   ├── Dockerfile
│   ├── compose.yaml
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── contracts/                       # Shared Message Types
│   └── messages/
│       └── order-created-message.ts # Type-safe message contract
│
├── infra/                           # AWS Infrastructure (Pulumi)
│   ├── src/
│   │   ├── cluster.ts              # ECS cluster
│   │   ├── load-balancer.ts        # Load balancer
│   │   ├── images/                 # Docker image definitions
│   │   ├── listeners/              # Port/network listeners
│   │   ├── services/               # ECS services (orders, invoices, rabbitmq, kong)
│   │   └── index.ts                # Main Pulumi stack
│   ├── Pulumi.yaml
│   ├── Pulumi.dev.yaml
│   ├── package.json
│   └── tsconfig.json
│
├── docker/                          # Docker Configuration
│   └── kong/
│       ├── Dockerfile              # Kong API gateway
│       ├── config.template.yaml    # Service routing
│       └── startup.sh              # Gateway initialization
│
├── compose.yaml                     # Root Kong gateway setup
├── README.md                        # This file
└── LICENSE

```

---

## ✨ Features

### Orders Service (`app-orders`)
- ✅ **Customer Management**: Store customer information (name, email, address)
- ✅ **Order Creation**: Create orders with validation
- ✅ **Event Publishing**: Publish `OrderCreatedMessage` events via RabbitMQ
- ✅ **RESTful API**: Health checks and order endpoints
- ✅ **Observability**: OpenTelemetry tracing instrumentation
- ✅ **Type Safety**: Zod schema validation on all endpoints

### Invoices Service (`app-invoices`)
- ✅ **Invoice Management**: Store and track invoices
- ✅ **Event Consumption**: Listen to order-created events from RabbitMQ
- ✅ **Event-Driven Processing**: Generate invoices when orders are created
- ✅ **Message Acknowledgment**: Proper AMQP message handling
- ✅ **Database Persistence**: PostgreSQL-backed storage
- ✅ **API Endpoints**: Health checks and invoice retrieval

### Infrastructure & Operations
- ✅ **API Gateway**: Kong for unified request routing
- ✅ **Message Broker**: RabbitMQ with management UI
- ✅ **Infrastructure as Code**: Full AWS stack definition with Pulumi
- ✅ **Container Orchestration**: AWS ECS Fargate integration
- ✅ **Distributed Tracing**: OpenTelemetry with Jaeger support
- ✅ **Load Balancing**: AWS ELB for service distribution
- ✅ **CORS Support**: Cross-origin requests enabled

---

## 📋 Prerequisites

### Required
- **Node.js**: 22.x or higher
- **npm**: 10.x or higher
- **Docker**: Latest version
- **Docker Compose**: 2.x or higher

### Optional (for AWS deployment)
- **Pulumi CLI**: 3.100+ (for infrastructure deployment)
- **AWS CLI**: Configured with credentials
- **AWS Account**: For resource provisioning

---

## 🚀 Quick Start

### Option 1: Local Development (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/yourusername/microservices-practice.git
cd microservices-practice

# Install dependencies for all services
cd app-orders && npm install && cd ..
cd app-invoices && npm install && cd ..
cd infra && npm install && cd ..

# Set up environment files (see Configuration section)
cp app-orders/.env.example app-orders/.env
cp app-invoices/.env.example app-invoices/.env

# Start local development environment
cd app-orders
npm run dev

# In another terminal
cd app-invoices
npm run dev
```

### Option 2: Docker Compose (Recommended for Integration Testing)

```bash
# Build and start all services including Kong and databases
docker-compose -f app-orders/compose.yaml up -d
docker-compose -f app-invoices/compose.yaml up -d
docker-compose up -d  # Kong gateway

# Check services
curl http://localhost:8000/health  # Via Kong proxy
curl http://localhost:3333/health   # Direct to Orders service
```

### Option 3: AWS Deployment (Pulumi)

```bash
cd infra

# Set up AWS credentials
export AWS_REGION=us-east-1

# Initialize/update Pulumi stack
pulumi stack select dev

# Deploy infrastructure
pulumi up

# Get service endpoints
pulumi stack output
```

---

## 📖 Setup Instructions

### Local Development

#### 1. Install Dependencies

```bash
# Orders service
cd app-orders
npm install

# Invoices service
cd ../app-invoices
npm install

# Infrastructure (if deploying to AWS)
cd ../infra
npm install
```

#### 2. Configure Environment Variables

Create `.env` files in each service:

**app-orders/.env:**
```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://user:password@localhost:5482/orders_db
BROKER_URL=amqp://admin:admin@localhost:5672
OTEL_SERVICE_NAME=orders-service
```

**app-invoices/.env:**
```env
NODE_ENV=development
PORT=3334
DATABASE_URL=postgresql://user:password@localhost:5483/invoices_db
BROKER_URL=amqp://admin:admin@localhost:5672
OTEL_SERVICE_NAME=invoices-service
```

#### 3. Initialize Databases

```bash
# Orders service
cd app-orders
npm run db:push

# Invoices service
cd ../app-invoices
npm run db:push
```

#### 4. Run Services

```bash
# Terminal 1: Orders service
cd app-orders
npm run dev

# Terminal 2: Invoices service
cd app-invoices
npm run dev

# Test health endpoints
curl http://localhost:3333/health
curl http://localhost:3334/health
```

---

### Docker Setup

#### 1. Build Images

```bash
# Orders service
docker build -t orders-service:latest app-orders/

# Invoices service
docker build -t invoices-service:latest app-invoices/

# Kong gateway
docker build -t kong-gateway:latest docker/kong/
```

#### 2. Start Services with Compose

```bash
# Start orders service (includes PostgreSQL)
docker-compose -f app-orders/compose.yaml up -d

# Start invoices service (includes PostgreSQL)
docker-compose -f app-invoices/compose.yaml up -d

# Start Kong gateway
docker-compose up -d

# Start RabbitMQ (uncomment in compose files first)
docker run -d -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin \
  rabbitmq:3-management
```

#### 3. Verify Services

```bash
# Check containers
docker-compose ps

# View logs
docker-compose logs -f orders-service
docker-compose logs -f invoices-service

# Test APIs
curl http://localhost:8000/orders/health  # Via Kong
curl http://localhost:3333/health          # Direct to orders
```

---

### AWS Deployment (Pulumi)

#### 1. Prerequisites

```bash
# Install Pulumi
curl -fsSL https://get.pulumi.com | sh

# Configure AWS credentials
aws configure

# Or use environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
```

#### 2. Deploy Infrastructure

```bash
cd infra

# Install dependencies
npm install

# Select or create a stack
pulumi stack select dev
# or: pulumi stack init dev

# Preview changes
pulumi preview

# Deploy
pulumi up

# View outputs
pulumi stack output
```

#### 3. Access Deployed Services

```bash
# Get the API endpoint
pulumi stack output apiEndpoint

# Access RabbitMQ management UI
pulumi stack output rabbitMQAdminUrl

# Test service
curl $(pulumi stack output apiEndpoint)/orders/health
```

#### 4. Cleanup

```bash
pulumi destroy
```

---

## 📡 API Documentation

### Orders Service

**Base URL (Local)**: `http://localhost:3333`
**Base URL (Kong Gateway)**: `http://localhost:8000/orders`
**Base URL (AWS)**: Check `pulumi stack output`

#### Endpoints

##### Create Order

```http
POST /orders
Content-Type: application/json

{
  "amount": 99.99
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-123",
  "customerId": "uuid-456",
  "amount": 99.99,
  "status": "pending",
  "createdAt": "2026-03-29T10:00:00Z"
}
```

**Validation Rules:**
- `amount`: Required, must be a positive number

---

##### Health Check

```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

### Invoices Service

**Base URL (Local)**: `http://localhost:3334`  
**Base URL (Kong Gateway)**: `http://localhost:8000/invoices`

#### Endpoints

##### Health Check

```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

### Kong API Gateway

**Admin URL**: `http://localhost:8002`  
**Proxy URL**: `http://localhost:8000`

#### Configured Routes

1. **Orders Service** → `/orders`
   - Proxy to: Orders Service (port 3333)
   - Methods: GET, POST, PUT, DELETE, OPTIONS
   - CORS: Enabled for all origins

2. **Invoices Service** → `/invoices`
   - Proxy to: Invoices Service (port 3334)
   - Methods: GET, POST, PUT, DELETE, OPTIONS
   - CORS: Enabled for all origins

#### Kong API Examples

```bash
# Create route
curl -X POST http://localhost:8001/services/orders/routes \
  -d "name=orders_route" \
  -d "paths=/orders"

# Create service
curl -X POST http://localhost:8001/services \
  -d "name=orders" \
  -d "url=http://orders:3333"
```

---

## 🔄 Event-Driven Architecture

### Message Contract

**File**: [contracts/messages/order-created-message.ts](contracts/messages/order-created-message.ts)

```typescript
interface OrderCreatedMessage {
  orderId: string
  amount: number
  customer: {
    id: string
  }
}
```

### Message Flow

#### 1. Publishing (Orders Service)

When an order is created:

```typescript
// app-orders/src/http/server.ts
server.post('/orders', async (request, reply) => {
  const order = await createOrder(request.body);
  
  // Publish event
  await dispatchOrderCreatedMessage({
    orderId: order.id,
    amount: order.amount,
    customer: { id: order.customerId }
  });
  
  return reply.code(201).send(order);
});
```

#### 2. Consuming (Invoices Service)

The Invoices service listens to the queue:

```typescript
// app-invoices/src/broker/subscriber.ts
export async function subscribeToOrdersQueue() {
  const channel = await connectToRabbitMQ();
  await channel.assertQueue('orders');
  
  channel.consume('orders', async (msg) => {
    const orderEvent = JSON.parse(msg.content.toString());
    
    // Generate invoice
    await createInvoice({
      orderId: orderEvent.orderId,
      createdAt: new Date()
    });
    
    // Acknowledge message
    channel.ack(msg);
  });
}
```

### Queue Configuration

- **Queue Name**: `orders`
- **Exchange**: Default (AMQP)
- **Routing**: Direct routing pattern
- **Durability**: Enabled
- **Auto-acknowledge**: Disabled (manual ACK required)
- **Connection String**: `amqp://admin:admin@localhost:5672`

---

## 💾 Database Schema

### Orders Service Database

#### Customers Table
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(255),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'cancelled'))
);
```

---

### Invoices Service Database

#### Invoices Table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚙️ Configuration

### Environment Variables

#### Orders Service

| Variable | Example | Description |
|---|---|---|
| `NODE_ENV` | `development` | Node environment |
| `PORT` | `3333` | HTTP server port |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `BROKER_URL` | `amqp://admin:admin@localhost:5672` | RabbitMQ connection string |
| `OTEL_SERVICE_NAME` | `orders-service` | Observability service name |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://jaeger:4317` | Tracing endpoint |

#### Invoices Service

| Variable | Example | Description |
|---|---|---|
| `NODE_ENV` | `development` | Node environment |
| `PORT` | `3334` | HTTP server port |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `BROKER_URL` | `amqp://admin:admin@localhost:5672` | RabbitMQ connection string |
| `OTEL_SERVICE_NAME` | `invoices-service` | Observability service name |

#### Kong Gateway

| Variable | Example | Description |
|---|---|---|
| `ORDERS_SERVICE_URL` | `http://orders:3333` | Orders service endpoint |
| `INVOICES_SERVICE_URL` | `http://invoices:3334` | Invoices service endpoint |
| `KONG_DATABASE` | `off` | Database mode (off = db-less) |

---

## 👨‍💻 Development Guide

### Running Services Locally

```bash
# Terminal 1: Orders Service
cd app-orders
npm run dev

# Terminal 2: Invoices Service
cd app-invoices
npm run dev

# Terminal 3: Kong Gateway (optional)
docker-compose up kong

# Test
curl http://localhost:3333/health
curl http://localhost:3334/health
```

### Available npm Scripts

#### Both Services

```bash
npm run dev          # Development mode with watch
npm run start        # Production mode
npm run build        # Compile TypeScript
npm run db:push     # Run database migrations
npm run db:studio   # Open Drizzle Studio (visual DB editor)
```

#### Infrastructure

```bash
pulumi up           # Deploy infrastructure
pulumi down         # Destroy infrastructure
pulumi preview      # Preview changes
pulumi stack output # View outputs
```

---

### Database Migrations

#### Create a New Migration

```bash
cd app-orders

# Modify schema file (src/db/schema/...)
# Then run:
npm run db:generate

# This creates a new migration file in src/db/migrations/
```

#### Apply Migrations

```bash
npm run db:push
```

#### Rollback Migrations

```bash
npm run db:drop  # Drop all tables (development only!)
npm run db:push  # Recreate from scratch
```

#### View Database

```bash
npm run db:studio  # Opens Drizzle Studio at localhost:323
```

---

### Message Broker Setup

#### RabbitMQ Management UI

Access at: `http://localhost:15672`
- **Username**: `admin`
- **Password**: `admin`

#### View Queues

1. Open `http://localhost:15672`
2. Go to **Queues** tab
3. Look for `orders` queue
4. Monitor message count and consumer status

#### Test Messages

```bash
# Use amqp-cli or similar tools
# Or implement test endpoints in services
curl -X POST http://localhost:3333/test/publish-message
```

---

## 🔍 Observability

### OpenTelemetry Instrumentation

Services are automatically instrumented for:
- HTTP requests/responses
- Fastify framework hooks
- PostgreSQL queries
- RabbitMQ connections
- Custom spans (app-specific)

### Enable Tracing

Set environment variables:

```env
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317
OTEL_RESOURCE_ATTRIBUTES=service.version=1.0.0
```

### Jaeger UI

Optional distributed tracing backend:

```bash
# Start Jaeger (from docker-compose or manual)
docker run -d \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one

# Access at http://localhost:16686
```

### Viewing Traces

1. Start services with Jaeger endpoint configured
2. Open `http://localhost:16686`
3. Select service from dropdown
4. View trace timelines and details

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Error

**Error**: `FATAL: database "orders_db" does not exist`

**Solution**:
```bash
# Check PostgreSQL is running
docker-compose ps

# Check database creation script
cat app-orders/docker/create-test-database.sql

# Manually initialize database
docker exec postgres-orders-service psql -U user -c "CREATE DATABASE orders_db;"
```

---

#### 2. RabbitMQ Connection Failed

**Error**: `Connection refused at amqp://localhost:5672`

**Solution**:
```bash
# Start RabbitMQ (uncomment in compose file)
docker run -d -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin \
  rabbitmq:3-management

# Verify connection
docker logs <rabbitmq-container>

# Check broker URL in .env files
```

---

#### 3. Kong Gateway Returns 502

**Error**: `<upstream error>`

**Solution**:
```bash
# Check if services are running
curl http://localhost:3333/health
curl http://localhost:3334/health

# View Kong logs
docker-compose logs kong

# Verify routes configuration
curl http://localhost:8001/routes

# Check upstream services
curl http://localhost:8001/upstreams
```

---

#### 4. Migrations Fail

**Error**: `Migration failed: syntax error`

**Solution**:
```bash
# Check migration state
npm run db:status

# Drop and recreate (development only)
npm run db:drop
npm run db:push

# View migration files
ls -la src/db/migrations/
```

---

#### 5. Node.js Version Incompatibility

**Error**: `Engine node 22.x required`

**Solution**:
```bash
# Check Node version
node --version

# Update Node.js
nvm install 22
nvm use 22

# Or download from https://nodejs.org/
```

---

#### 6. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3333`

**Solution**:
```bash
# Find process using port
lsof -i :3333
netstat -ano | findstr :3333  # Windows

# Kill process
kill -9 <PID>
fuser -k 3333/tcp  # Unix

# Or use different port
PORT=3335 npm run dev
```

---

#### 7. Environment Variables Not Loaded

**Error**: `undefined environment variable: DATABASE_URL`

**Solution**:
```bash
# Ensure .env file exists in correct directory
ls app-orders/.env
cat app-orders/.env

# Check file is in project root, not elsewhere
# Restart service after creating .env
npm run dev
```

---

#### 8. Type Errors in TypeScript

**Error**: `Type 'unknown' is not assignable`

**Solution**:
```bash
# Rebuild TypeScript
npm run build

# Clear cache and reinstall
rm -rf node_modules
npm install
npm run build

# Check tsconfig.json settings
```

---

#### 9. Messages Not Being Consumed

**Error**: Messages sit in RabbitMQ queue, not processed

**Solution**:
```bash
# Verify subscriber is running
curl http://localhost:3334/health

# Check RabbitMQ logs
docker logs <rabbitmq-container>

# Manual test message
npm run test:publish-message

# Review subscriber code for errors
```

---

#### 10. AWS Deployment Fails

**Error**: `Pulumi deployment error`

**Solution**:
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify AWS region
export AWS_REGION=us-east-1

# Check resource limits
aws ec2 describe-account-attributes

# Preview first
pulumi preview

# Check Pulumi logs
pulumi logs -f
```

---

### Debugging Techniques

#### Enable Debug Logging

```bash
# Orders service
DEBUG=* npm run dev

# Invoices service  
DEBUG=app:* npm run dev
```

#### Check Database Directly

```bash
# Connect to Orders database
psql postgresql://user:password@localhost:5482/orders_db

# View tables
\dt

# Check data
SELECT * FROM orders;
```

#### Monitor RabbitMQ

```bash
# Access management UI
http://localhost:15672

# Check "Queues" tab for message counts
# Check "Connections" tab for active clients
```

---

### Performance Troubleshooting

#### Slow Queries

```bash
# Enable query logging in Drizzle config
database_log: true

# View slow queries
npm run db:studio  # Visual query explorer
```

#### Memory Leaks

```bash
# Monitor memory usage
node --inspect npm run dev

# Open in DevTools
chrome://inspect
```

---

## 📊 Project Health

### Checklist for Production Readiness

- [ ] All environment variables configured
- [ ] Databases initialized and migrated
- [ ] RabbitMQ running with management UI accessible
- [ ] Kong routes properly configured
- [ ] OpenTelemetry endpoints configured
- [ ] SSL/TLS certificates installed (if using HTTPS)
- [ ] Error handling and logging implemented
- [ ] Rate limiting configured in Kong
- [ ] Authentication/Authorization implemented
- [ ] Health checks passing on all services

---

### Useful Commands Reference

```bash
# Service Health
curl http://localhost:3333/health
curl http://localhost:3334/health
curl http://localhost:8000/health

# Create Test Order
curl -X POST http://localhost:3333/orders \
  -H "Content-Type: application/json" \
  -d '{"amount": 99.99}'

# View RabbitMQ Queues
open http://localhost:15672

# Inspect Database
npm run db:studio

# View AWS Infrastructure
pulumi stack select dev
pulumi stack output

# Build Services
docker-compose build

# Clean Up
docker-compose down -v
```

---

## 📚 Additional Resources

- [Fastify Documentation](https://www.fastify.io/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials)
- [Zod Validation](https://zod.dev/)
- [OpenTelemetry Documentation](https://opentelemetry.io/)
- [Kong API Gateway Docs](https://docs.konghq.com/)
- [Pulumi Infrastructure as Code](https://www.pulumi.com/docs/)
- [Docker & Compose](https://docs.docker.com/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
