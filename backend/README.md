# INSOCtor Backend API

Backend API service for the INSOCtor unified SOC dashboard. Integrates with Wazuh, IRIS, Shuffle, and MISP.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your service credentials:
   - Wazuh API URL, username, and password
   - IRIS API URL and API key
   - Shuffle API URL and API key
   - MISP API URL and API key

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Alerts
- `GET /api/alerts` - Get all alerts with optional filters
- `GET /api/alerts/stats` - Get alert statistics
- `GET /api/alerts/:id` - Get specific alert
- `POST /api/alerts/:id/case` - Create case from alert
- `PUT /api/alerts/:id/status` - Update alert status

### Logs
- `GET /api/logs` - Get logs with pagination
- `GET /api/logs/stream` - Real-time log streaming (SSE)

### Cases
- `GET /api/cases` - Get all cases
- `GET /api/cases/stats` - Get case statistics
- `GET /api/cases/:id` - Get specific case
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Close case
- `POST /api/cases/:id/alerts/:alertId` - Link alert to case

### Rules
- `GET /api/rules` - Get all Wazuh rules
- `GET /api/rules/:id` - Get specific rule

## Architecture

```
backend/
├── src/
│   ├── config/          # Configuration and logger
│   ├── services/        # External service integrations
│   │   ├── wazuh.service.ts
│   │   ├── iris.service.ts
│   │   ├── shuffle.service.ts
│   │   └── misp.service.ts
│   ├── routes/          # API route handlers
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Main Express application
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## Development

The backend uses:
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Axios** - HTTP client for external APIs
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Security

- API credentials stored in `.env` (never committed)
- Rate limiting on all API endpoints
- Helmet for security headers
- CORS restricted to frontend URL
- HTTPS support for external services
