# syntax=docker/dockerfile:1
# Medusa v2 backend (shop-api). Build output is .medusa/server, which is a
# self-contained app with its own package.json (Medusa deployment convention).

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN node .yarn/releases/yarn-4.12.0.cjs install --immutable
COPY . .
RUN node .yarn/releases/yarn-4.12.0.cjs build
# Production deps for the built server (it has its own package.json, no lockfile)
WORKDIR /app/.medusa/server
RUN npm install --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.medusa/server ./
EXPOSE 9000
# db:migrate is idempotent; fine as a pre-start step while we run one replica.
CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start --host 0.0.0.0 --port 9000"]
