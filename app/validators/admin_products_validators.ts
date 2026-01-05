import vine from '@vinejs/vine'

export const createProductValidator = vine.compile(
  vine.object({
    categoryId: vine.string().uuid(),
    name: vine.string().trim().minLength(2).maxLength(80),
    description: vine.string().trim().maxLength(300).optional(),
    price: vine.number().min(0.01).max(9999999),
    imageUrl: vine.string().trim().url().maxLength(500).optional(),
    isActive: vine.boolean().optional()
  })
)

export const updateProductValidator = vine.compile(
  vine.object({
    categoryId: vine.string().uuid().optional(),
    name: vine.string().trim().minLength(2).maxLength(80).optional(),
    description: vine.string().trim().maxLength(300).optional(),
    price: vine.number().min(0.01).max(9999999).optional(),
    imageUrl: vine.string().trim().url().maxLength(500).optional(),
    isActive: vine.boolean().optional()
  })
)
