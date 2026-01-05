import vine from '@vinejs/vine'

export const createWaiterValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(80),
    isActive: vine.boolean().optional(),
  })
)

export const updateWaiterValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(80).optional(),
    isActive: vine.boolean().optional(),
  })
)
