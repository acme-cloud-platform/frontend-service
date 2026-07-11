# ---------- Stage 1: build the React app ----------
FROM node:20-slim AS builder

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Stage 2: serve on distroless — no shell, no npm, no OS packages ----------
# nginx has no official distroless equivalent, so instead of nginx we serve
# the built static files with a ~40-line zero-dependency Node HTTP server
# (server.js) — small enough to not need any npm packages at runtime, which
# means the final image needs nothing beyond the Node interpreter itself.
# Same hardening rationale as backend-service's Dockerfile: no shell, no
# package manager, drastically smaller attack surface, far fewer CVEs.
FROM gcr.io/distroless/nodejs20-debian12:nonroot

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY server.js .

EXPOSE 8080

# No shell in this image, so this must be exec-form pointing directly at
# the script — matches the same pattern as backend-service's ENTRYPOINT.
ENTRYPOINT ["server.js"]
