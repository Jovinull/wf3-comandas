import vine from '@vinejs/vine'

export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(60),
    sortOrder: vine.number().min(0).max(9999).optional(),
    isActive: vine.boolean().optional()
  })
)

export const updateCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(60).optional(),
    sortOrder: vine.number().min(0).max(9999).optional(),
    isActive: vine.boolean().optional()
  })
)
