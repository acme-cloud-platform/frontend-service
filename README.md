# frontend-service

React (Vite) frontend for the Acme Cloud POC — order form + order list, calls `backend-service` at `/api`.

## Local development
```bash
npm install
npm run dev
```
Note: `/api` calls will fail locally unless you run a proxy or point `API_BASE` at a real backend URL — this app is designed to run behind the same ALB as `backend-service` in the cluster (see `k8s/ingress.yaml`).

## Deployment
Every push to `main` triggers `.github/workflows/deploy.yml`:
1. OIDC auth via the same role as `backend-service` (Phase 5)
2. Build (Vite) → Docker multi-stage build → push to `acme-cloud-poc-frontend` ECR repo (Phase 4)
3. `kubectl apply` the manifests to EKS (Phase 3)

## Important: shares one ALB with backend-service
`k8s/ingress.yaml` uses `alb.ingress.kubernetes.io/group.name: acme-cloud-poc` — the **same** group name as `backend-service`'s Ingress. This merges both into a single ALB instead of provisioning two separate ones. `group.order` controls rule priority: backend's `/api` (order 1) is evaluated before frontend's catch-all `/` (order 10).

See `platform-infrastructure/README.md` for the full architecture.
