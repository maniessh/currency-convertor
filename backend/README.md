# Currency Converter - Backend API

## Overview
REST API backend for the Currency Converter application, providing currency conversion and exchange rate services with caching and rate limiting.

## Features
- Real-time currency conversion
- Exchange rate API with multiple provider support
- Redis/node-cache for response caching
- Rate limiting to prevent abuse
- JWT authentication (planned)
- Historical rate tracking (planned)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest
EXCHANGE_RATE_API_KEY=your_api_key_here
CACHE_TTL_SECONDS=300
CACHE_CHECK_PERIOD_SECONDS=600
RATE_LIMIT_MAX=100
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Convert Currency
```
GET /api/rates?from=USD&to=EUR&amount=100
```

Response:
```json
{
  "success": true,
  "data": {
    "from": "USD",
    "to": "EUR",
    "amount": 100,
    "converted": 92.0,
    "rate": 0.920000,
    "source": "api",
    "timestamp": "2026-05-03T09:30:00.000Z"
  }
}
```

### Get All Rates
```
GET /api/rates/USD
```

### List Supported Currencies
```
GET /api/currencies
```

### Cache Statistics
```
GET /api/stats/cache
```

### Clear Cache
```
POST /api/cache/clear
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── app.js           # Express application
│   └── index.js         # Server entry point
├── tests/               # Test files
├── package.json
└── README.md
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker
```bash
docker build -t currency-converter-api .
docker run -p 3001:3001 currency-converter-api
```

### Environment
- Development: Local with hot reload
- Staging: AWS/GCP staging environment
- Production: Containerized with load balancing

## License
MIT