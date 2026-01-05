import type { HttpContext } from '@adonisjs/core/http'
import PrintJob from '#models/print_job'
import AppError from '#exceptions/app_error'
import { ok } from '#utils/api_response'
import { PrintJobStatus } from '#utils/enums'

export default class PrintJobsController {
  public async pending({ response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const jobs = await PrintJob.query()
      .where('restaurantId', tenant.restaurantId)
      .where('status', PrintJobStatus.PENDING)
      .orderBy('createdAt', 'desc')
      .limit(50)

    return ok(
      response,
      jobs.map((j) => ({
        id: j.id,
        orderId: j.orderId,
        status: j.status,
        payload: j.payload,
        createdAt: j.createdAt,
      }))
    )
  }

  public async markPrinted({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const job = await PrintJob.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!job) throw new AppError('NOT_FOUND', 'Print job not found', 404)

    job.status = PrintJobStatus.PRINTED
    await job.save()

    return ok(response, { id: job.id, status: job.status })
  }
}
