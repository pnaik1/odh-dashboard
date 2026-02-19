# Quickstart: Eval Hub UI — Local Development

**Branch**: `1-evaluations-ui`
**Package**: `packages/eval-hub`

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 22.0.0 | Check: `node -v` |
| npm | ≥ 10.0.0 | Check: `npm -v` |
| Go | ≥ 1.24 | Check: `go version` |
| make | any | For BFF Makefile targets |

---

## 1. Install Dependencies

```bash
# From repo root — installs all packages (including eval-hub)
npm install
```

---

## 2. Configure Environment

```bash
# Copy the example env file
cp packages/eval-hub/.env.local.example packages/eval-hub/.env.local
```

Key variables in `.env.local`:

| Variable | Default | Description |
|----------|---------|-------------|
| `EVAL_HUB_URL` | `http://localhost:9090` | Eval Hub control plane URL |
| `PORT` | `8343` | BFF HTTP port |
| `LOG_LEVEL` | `debug` | BFF log level |
| `ALLOWED_ORIGINS` | `http://localhost:9000` | CORS origins |

> **Note**: `.env.local` is gitignored and MUST NOT be committed.

---

## 3. Start the BFF (with mock Eval Hub client)

```bash
cd packages/eval-hub/bff

# Run BFF with mock Eval Hub responses (no live Eval Hub needed)
make run MOCK_EH_CLIENT=true MOCK_K8S_CLIENT=true

# Or run against a real Eval Hub instance
make run EVAL_HUB_URL=http://your-eval-hub-host:8080
```

The BFF will be available at `http://localhost:8343`.

**Verify BFF is running**:
```bash
curl http://localhost:8343/api/v1/health
# Expected: {"status":"healthy","components":{"mlflow":{"status":"healthy"},...}}
```

---

## 4. Start the Frontend (Module Federation dev server)

```bash
cd packages/eval-hub

# Install frontend deps (first time)
npm run install:module

# Start the MF remote dev server on port 9103
cd frontend && npm run start:dev
```

The frontend MF remote will be available at `http://localhost:9103/remoteEntry.js`.

---

## 5. Start the ODH Dashboard Shell (to load the MF remote)

```bash
# From repo root
npm run dev
```

The Dashboard shell loads the eval-hub MF remote from `localhost:9103` when the
`federation-config` ConfigMap has the `evalHub` local dev config pointing to `localhost:9103`.

---

## 6. Run Tests

```bash
# Unit tests (frontend)
cd packages/eval-hub && npx jest

# BFF unit tests
cd packages/eval-hub/bff && make test

# Contract tests (requires BFF running with mocks)
cd packages/eval-hub && npm run test:contract

# Cypress component/mock tests
cd packages/eval-hub && npm run cypress:server:dev
# In another terminal:
npx cypress open --project packages/cypress
```

---

## 7. Build for Production

```bash
# Build Docker image
docker build -t eval-hub packages/eval-hub

# Run container
docker run -p 8343:8343 \
  -e EVAL_HUB_URL=http://eval-hub-service:8080 \
  -e LOG_LEVEL=INFO \
  eval-hub
```

---

## 8. Deploy to Cluster (Kustomize)

```bash
# Edit params.env to set the eval-hub image:
# packages/eval-hub-manifests/params.env → eval-hub-ui-image=quay.io/...

kubectl apply -k manifests/modular-architecture
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| BFF returns 502 Bad Gateway | Eval Hub API unreachable | Start with `MOCK_EH_CLIENT=true` |
| Frontend shows "MLFlow not enabled" | BFF health reports mlflow unhealthy | Run BFF with `MOCK_K8S_CLIENT=true` |
| MF remote not loading in shell | Wrong port in federation-config | Ensure `local.port=9103` in federation-configmap.yaml |
| Contract tests fail | BFF response shape mismatch | Check `contracts/eval-hub-bff.yaml` against BFF handler output |

