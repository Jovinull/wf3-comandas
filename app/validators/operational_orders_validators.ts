import vine from '@vinejs/vine'

export const createOrderValidator = vine.compile(
  vine.object({
    operationalWaiterId: vine.string().uuid(),
    note: vine.string().trim().maxLength(300).optional(),
    items: vine.array(
      vine.object({
        productId: vine.string().uuid(),
        quantity: vine.number().min(1).max(999)
      })
    )
    .minLength(1)
    .maxLength(100)
  })
)
