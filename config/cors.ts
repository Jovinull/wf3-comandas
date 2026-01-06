import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/cors'

/**
 * Parse a comma-separated list of allowed origins from env.
 * Example: "http://localhost:3000,https://app.seudominio.com"
 */
function parseOrigins(raw?: string): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

const configuredOrigins = parseOrigins(env.get('CORS_ORIGINS'))

/**
 * CORS config tuned for an API:
 * - Allow requests without Origin (curl/Postman)
 * - In dev/test, if CORS_ORIGINS is empty, allow any origin (DX)
 * - In production, require explicit allow-list (safer)
 * - Enable credentials only when origins are explicitly set (no wildcard + credentials conflict)
 */
const corsConfig = defineConfig({
  enabled: true,

  origin: (requestOrigin) => {
    // No origin header (curl/Postman, alguns clients): permitir
    if (!requestOrigin) return true

    // Se não configurou origens, liberar tudo em dev/test para facilitar
    if (configuredOrigins.length === 0 && !app.inProduction) return true

    // Em produção, só permitir as origens explicitamente liberadas
    return configuredOrigins.includes(requestOrigin)
  },

  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  headers: true,
  exposeHeaders: [],

  // Só habilita credentials quando há allow-list explícita
  credentials: configuredOrigins.length > 0,

  maxAge: 90,
})

export default corsConfig
