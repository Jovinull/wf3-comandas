import env from '#start/env'
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import type { UserRole } from '#utils/enums'

export type JwtPayload = {
  sub: string
  restaurantId: string
  role: UserRole
  iat?: number
  exp?: number
}

function getJwtSecret(): Secret {
  return env.get('JWT_SECRET') as Secret
}

function getJwtExpiresIn(): SignOptions['expiresIn'] {
  return env.get('JWT_EXPIRES_IN') as SignOptions['expiresIn']
}

export function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() })
}

export function verifyJwt(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret())
  return decoded as JwtPayload
}
