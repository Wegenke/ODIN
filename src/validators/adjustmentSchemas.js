const z = require('zod')

const createAdjustmentSchema = z.object({
  child_id: z.number().int().positive(),
  points: z.number().int().multipleOf(5).refine(val => val !== 0, { message: 'Points cannot be zero' }),
  reason: z.string().min(1).max(500)
})

module.exports = { createAdjustmentSchema }
