import type { HttpContext } from '@adonisjs/core/http'
import { ExceptionHandler } from '@adonisjs/core/http'
import AppError from '#exceptions/app_error'
import { fail } from '#utils/api_response'

export default class HttpExceptionHandler extends ExceptionHandler {
  public async handle(error: any, ctx: HttpContext) {
    const { response } = ctx

    // AppError (controle do domínio)
    if (error instanceof AppError) {
      return fail(response, error.status ?? 400, error.apiCode, error.message, error.details)
    }

    // VineJS validation
    if (error?.code === 'E_VALIDATION_ERROR') {
      const details = error.messages ?? error.message
      return fail(response, 422, 'VALIDATION_ERROR', 'Validation failed', details)
    }

    // Route not found
    if (error?.code === 'E_ROUTE_NOT_FOUND') {
      return fail(response, 404, 'NOT_FOUND', 'Route not found')
    }

    // Lucid "Row not found"
    if (error?.code === 'E_ROW_NOT_FOUND') {
      return fail(response, 404, 'NOT_FOUND', 'Resource not found')
    }

    // Postgres unique violation
    if (error?.code === '23505') {
      return fail(response, 409, 'CONFLICT', 'Resource conflict')
    }

    // Postgres foreign key violation
    if (error?.code === '23503') {
      return fail(response, 409, 'CONFLICT', 'Foreign key constraint violation')
    }

    // Default
    return fail(
      response,
      error?.status ?? 500,
      'INTERNAL_ERROR',
      'Unexpected error',
      process.env.NODE_ENV !== 'production'
        ? { name: error?.name, message: error?.message, stack: error?.stack }
        : undefined
    )
  }
}
