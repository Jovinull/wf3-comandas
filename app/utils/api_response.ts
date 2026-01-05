import type { Response } from '@adonisjs/core/http'
import type { ApiErrorCode } from '#utils/enums'

export function ok<T>(response: Response, data: T, status = 200) {
  return response.status(status).json({ ok: true, data })
}

export function fail(
  response: Response,
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown
) {
  return response.status(status).json({
    ok: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {})
    }
  })
}
