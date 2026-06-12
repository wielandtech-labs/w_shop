# syntax=docker/dockerfile:1
# Next.js storefront (shop-web), standalone output.
#
# NEXT_PUBLIC_* vars are inlined into client bundles at BUILD time. We build
# with a placeholder publishable key; server-side code (sdk config, middleware)
# reads process.env at runtime, so the real key is injected via the HelmRelease
# env. Client-side checkout (Stripe) will need a proper per-env strategy in
# Phase 2 — see AGENTS.md.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN node .yarn/releases/yarn-4.12.0.cjs install --immutable
COPY . .
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_build_placeholder
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
RUN node .yarn/releases/yarn-4.12.0.cjs build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
ENV PORT=8000 HOSTNAME=0.0.0.0
EXPOSE 8000
CMD ["node", "server.js"]
