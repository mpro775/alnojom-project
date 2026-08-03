# Alnjoom Telecom Storefront

This is the Next.js storefront application for Alnjoom Telecom, built with the App Router (Next.js 16) and React 19. It serves as the customer-facing e-commerce interface.

## Architecture & BFF Notes

This storefront utilizes the Next.js App Router and Server Components as a pseudo Backend-for-Frontend (BFF). 
- It communicates directly with the primary backend API (`BACKEND_API_URL`).
- Data fetching and API interactions are mostly handled on the server side using Server Components, Next.js Server Actions, and Route Handlers, hiding secrets from the browser client.
- Type-safe API contracts are generated from the backend's OpenAPI specifications, located in `src/lib/api/types.generated.ts` and managed through `src/lib/api/contracts`.

## Environment Variables

Copy `.env.example` to `.env.local` or `.env` to configure your environment variables:

```bash
cp .env.example .env.local
```

Key variables:
- `NEXT_PUBLIC_APP_URL`: Public canonical storefront URL used for metadata, sitemap, and redirects.
- `BACKEND_API_URL`: Server-only Alnjoom API origin. Do not prefix with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_MEDIA_HOST`: Exact public media origin allowed by `next/image` (host or full origin).

## Development

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Generation

To generate and update the TypeScript types from the backend OpenAPI schema, make sure the backend schema is available at `../docs/api/openapi.json` and run:

```bash
npm run api:generate
```

You can verify the types and contracts using:
```bash
npm run api:check
npm run audit:contracts
```

## Testing

The project is equipped with unit and End-to-End (E2E) testing.

- **Unit/Integration tests** (Vitest):
  ```bash
  npm run test
  ```
- **Test Coverage**:
  ```bash
  npm run test:coverage
  ```
- **E2E tests** (Playwright):
  ```bash
  npm run test:e2e
  ```

## Build

To build the application for production:

```bash
npm run build
```

This will create an optimized production build in the `.next` directory. The project is configured with `output: "standalone"` to bundle all required dependencies in a lightweight output for Docker deployments.

## Docker

You can build and run the application using Docker. The provided `Dockerfile` uses a multi-stage build optimized for production.

```bash
# Build the image
docker build -t alnjoom-storefront .

# Run the container
docker run -p 3000:3000 --env-file .env alnjoom-storefront
```

## Deployment / Coolify

This project is optimized for deployment via **Coolify** (or similar container orchestration platforms) utilizing the Dockerfile deployment strategy. 
Since `output: "standalone"` is enabled in `next.config.ts`, Coolify can effortlessly build and run the included `Dockerfile`, producing a very lightweight Node.js Alpine container with minimal footprint.
