import vine from '@vinejs/vine'

export const createTableValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(40),
    description: vine.string().trim().maxLength(140).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateTableValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(40).optional(),
    description: vine.string().trim().maxLength(140).optional(),
    isActive: vine.boolean().optional(),
  })
)
