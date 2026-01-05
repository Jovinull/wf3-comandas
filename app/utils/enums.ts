export enum UserRole {
  MANAGER = 'MANAGER',
  WAITER = 'WAITER'
}

export enum ComandaStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export enum OrderStatus {
  CREATED = 'CREATED'
}

export enum PrintJobStatus {
  PENDING = 'PENDING',
  PRINTED = 'PRINTED'
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
