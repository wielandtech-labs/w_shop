import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// The homelab HelmReleases provide discrete DATABASE_*/REDIS_*/SECRET_KEY
// vars (wielandtech-labs convention); compose URLs from them. Explicit
// DATABASE_URL/REDIS_URL take precedence (local dev via .env).
const databaseUrl =
  process.env.DATABASE_URL ||
  (process.env.DATABASE_HOST
    ? `postgres://${process.env.DATABASE_USER}:${encodeURIComponent(
        process.env.DATABASE_PASSWORD || ''
      )}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT || '5432'}/${
        process.env.DATABASE_NAME
      }`
    : undefined)

const redisUrl =
  process.env.REDIS_URL ||
  (process.env.REDIS_IP
    ? `redis://${process.env.REDIS_IP}:${process.env.REDIS_PORT || '6379'}`
    : undefined)

// The dev fallback is public (this repo is), so a deployment that loses its
// secret must refuse to start rather than sign tokens with it.
function secret(name: string): string {
  const value = process.env[name] || process.env.SECRET_KEY
  if (value) return value
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} or SECRET_KEY must be set when NODE_ENV=production`)
  }
  return 'supersecret'
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl,
    redisUrl,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: secret('JWT_SECRET'),
      cookieSecret: secret('COOKIE_SECRET'),
    }
  }
})
