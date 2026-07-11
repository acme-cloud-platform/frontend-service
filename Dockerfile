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

# The distroless nodejs base image already sets ENTRYPOINT to its node
# binary — we only need to supply the script as CMD (not override
# ENTRYPOINT), so the final effective command becomes `node server.js`.
# Setting ENTRYPOINT here instead would try to execute server.js directly
# as a binary, which fails with "executable file not found in $PATH".
CMD ["server.js"]