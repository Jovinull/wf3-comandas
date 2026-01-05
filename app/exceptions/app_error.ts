import { Exception } from '@adonisjs/core/exceptions'
import type { ApiErrorCode } from '#utils/enums'

export default class AppError extends Exception {
  public readonly apiCode: ApiErrorCode
  public readonly details?: unknown

  constructor(apiCode: ApiErrorCode, message: string, status: number, details?: unknown) {
    super(message, { status })
    this.apiCode = apiCode
    this.details = details
  }
}
