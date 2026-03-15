const z = require('zod')

const choreSchema = z.object({
  title: z.string(),
  points: z.number().int().positive().refine(v => v % 10 === 0, 'Must be a multiple of 10'),
  description: z.string().optional(),
  emoji: z.string().min(1).default('🦺')
})

const updateChoreSchema = z.object({
  title: z.string(),
  points: z.number().int().positive().refine(v => v % 10 === 0, 'Must be a multiple of 10'),
  description: z.string(),
  emoji:z.string().min(1)
}).partial()

module.exports = {choreSchema, updateChoreSchema}