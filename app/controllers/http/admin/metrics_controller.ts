import type { HttpContext } from '@adonisjs/core/http'
import AppError from '#exceptions/app_error'
import { ok } from '#utils/api_response'
import MetricsService from '#services/metrics_service'

export default class AdminMetricsController {
  public async summary({ response, tenant, request }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const { from, to } = request.qs()
    const service = new MetricsService()
    const data = await service.summary(tenant.restaurantId, from, to)

    return ok(response, data)
  }

  public async topProducts({ response, tenant, request }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const { from, to } = request.qs()
    const service = new MetricsService()
    const data = await service.topProducts(tenant.restaurantId, from, to)

    return ok(response, data)
  }

  public async byHour({ response, tenant, request }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const { from, to } = request.qs()
    const service = new MetricsService()
    const data = await service.byHour(tenant.restaurantId, from, to)

    return ok(response, data)
  }

  public async byWaiter({ response, tenant, request }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const { from, to } = request.qs()
    const service = new MetricsService()
    const data = await service.byWaiter(tenant.restaurantId, from, to)

    return ok(response, data)
  }
}
