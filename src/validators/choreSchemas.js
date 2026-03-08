const z = require('zod')

const choreSchema = z.object({
  title: z.string(),
  points: z.number().int().positive(),
  description: z.string().optional(),
  recurrence_rule: z.string().optional()
})

const updateChoreSchema = z.object({
  title: z.string(),
  points: z.number().int().positive(),
  description: z.string(),
  recurrence_rule: z.string()
}).partial()

module.exports = {choreSchema, updateChoreSchema}