# w_shop

Ecommerce store for shirts, stickers, and 3D prints.

- `backend/` — [Medusa v2](https://medusajs.com) commerce backend (`shop-api`)
- `storefront/` — Next.js 15 storefront (`shop-web`)

Deploys to the homelab K3s cluster via Flux GitOps; manifests live in
[`wielandtech-labs/w_homelab`](https://github.com/wielandtech-labs/w_homelab).
See `AGENTS.md` for the tag scheme, env contracts, and promotion ladder.

## Local development

Requires Node >= 20 and a Postgres database.

```bash
cd backend && yarn && yarn dev        # Medusa on :9000 (admin at /app)
cd storefront && yarn && yarn dev     # Next.js on :8000
```

Copy `.env.template` to `.env` in each directory first.
