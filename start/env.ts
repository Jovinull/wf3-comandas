/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| Aqui usamos o builder `@adonisjs/core/env` para:
| - validar variáveis de ambiente
| - tipar o env.get(...)
|
| Para LER variáveis em runtime, use:
|   - import env from '#start/env'
| ou
|   - import env from '@adonisjs/core/services/env'
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),

  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),

  APP_KEY: Env.schema.string(),

  /*
  |--------------------------------------------------------------------------
  | Database
  |--------------------------------------------------------------------------
  | Suporta os dois estilos:
  | - "Adonis clássico": DB_CONNECTION + PG_*
  | - "Custom": DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_DATABASE
  |
  | Deixe pelo menos UM conjunto preenchido no .env.
  */
  DB_CONNECTION: Env.schema.string.optional(),

  PG_HOST: Env.schema.string.optional(),
  PG_PORT: Env.schema.number.optional(),
  PG_USER: Env.schema.string.optional(),
  PG_PASSWORD: Env.schema.string.optional(),
  PG_DB_NAME: Env.schema.string.optional(),

  DB_HOST: Env.schema.string.optional(),
  DB_PORT: Env.schema.number.optional(),
  DB_USER: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | Auth (JWT)
  |--------------------------------------------------------------------------
  */
  JWT_SECRET: Env.schema.string(),
  JWT_EXPIRES_IN: Env.schema.string(),

  /*
  |--------------------------------------------------------------------------
  | CORS
  |--------------------------------------------------------------------------
  | Ex: "http://localhost:3000,https://meudominio.com"
  */
  CORS_ORIGINS: Env.schema.string.optional(),

  /*
  |--------------------------------------------------------------------------
  | Seed
  |--------------------------------------------------------------------------
  */
  DEFAULT_SEED_PASSWORD: Env.schema.string.optional(),
})
