const z = require('zod')

const createScheduleSchema = z.object({
  chore_id: z.number().int().positive(),
  child_id: z.number().int().positive(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  day_of_week: z.number().int().min(0).max(6).optional(),
  day_of_month: z.number().int().min(1).max(28).optional()
}).refine(data => {
  if (data.frequency === 'weekly') return data.day_of_week !== undefined
  return true
}, { message: 'day_of_week is required for weekly frequency' })
.refine(data => {
  if (data.frequency === 'monthly') return data.day_of_month !== undefined
  return true
}, { message: 'day_of_month is required for monthly frequency' })

const updateScheduleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  day_of_week: z.number().int().min(0).max(6).optional(),
  day_of_month: z.number().int().min(1).max(28).optional(),
  active: z.boolean().optional()
})

module.exports = { createScheduleSchema, updateScheduleSchema }
