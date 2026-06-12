# AGENTS.md — w_shop conventions

Ecommerce store (shirts, stickers, 3D prints): Medusa v2 backend + Next.js
storefront, deployed to the K3s homelab via GitOps. Deployment manifests do
NOT live here — they live in `wielandtech-labs/w_homelab` under
`clusters/{dev,prod}/apps/{shop-api,shop-web}/`.

## Layout

- `backend/` — Medusa v2 (image `ghcr.io/wielandtech-labs/shop-api`, port 9000).
  Health endpoint: `/health`. Config via env: `DATABASE_URL`, `REDIS_URL`,
  `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `JWT_SECRET`, `COOKIE_SECRET`.
  The container runs `medusa db:migrate` before `medusa start` (single
  replica assumption — revisit if scaling out).
- `storefront/` — Next.js 15 storefront (image
  `ghcr.io/wielandtech-labs/shop-web`, port 8000). Server-side env:
  `MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`,
  `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_DEFAULT_REGION`.

## Image tags drive deployments

`.github/workflows/docker.yaml` builds BOTH images with one shared tag per
event (a matrix build off a single tag-compute job):

| Event | Tag | Effect |
|---|---|---|
| Push to `main` | `YYYYMMDD-HHMMSS-<shortsha>` | Flux deploys to **prod** |
| Push to any other branch | `dev-YYYYMMDD-HHMMSS-<shortsha>` | Flux deploys to **dev** |
| Same-repo pull request | `pr-<number>-<shortsha>` | Review apps `pr-N-shop-api` / `pr-N-shop-web` |

Never change these tag formats — Flux ImagePolicies and the review-app
automation in w_homelab parse them. **A push to `main` is a production
deploy.** Merge only after validating on a review app or dev.

## Known sharp edges

- **NEXT_PUBLIC_* inlining**: the storefront image is built with a
  placeholder `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. Server-side code
  (`src/lib/config.ts`, `src/middleware.ts`) reads `process.env` at runtime,
  so the HelmRelease env supplies the real key. Anything referenced in
  CLIENT components gets the build-time placeholder — Stripe checkout
  (`NEXT_PUBLIC_STRIPE_KEY`) will need a runtime-config strategy in Phase 2.
- `generateStaticParams` calls the backend during `next build`; failures are
  caught and return `[]`, so CI builds work without a live backend (pages
  render dynamically instead).
- Builds run on the shared org runner pool (`homelab-dind`) against the
  in-cluster buildkitd (`driver: remote`); no local Docker daemon, so
  `docker run`/service containers do NOT work in CI.

## Promotion ladder

1. PR → review apps deploy (merge the generated `chore(review)` PR in w_homelab).
2. Branch push → dev tracks the newest `dev-*` tag.
3. Merge to `main` → prod tag → Flux deploys; post-merge verification gates it.

Rollback = revert the environment's HelmRelease image tag in w_homelab via PR.

## Project roadmap

Phased plan lives with the homelab planning docs: POD-first (Printful API for
shirts/stickers, Slant 3D for 3D prints), Stripe Checkout payments, local bulk
runs (Thread West, Muskegon) for proven designs. Custom Medusa v2 fulfillment
modules for Printful/Slant 3D are the Phase 2/3 work.
