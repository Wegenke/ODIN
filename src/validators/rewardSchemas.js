const z = require('zod')

const createRewardSchema = z.object({
  name: z.string().min(1).max(100).transform(v => v.trim().replace(/\b\w/g, c => c.toUpperCase())),
  description: z.string().optional(),
  link: z.string().optional(),
  points_required: z.number().int().positive().refine(v => v % 10 === 0, 'Must be a multiple of 10').optional(),
  is_shared: z.boolean().optional()
})

const updateRewardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string(),
  link: z.string(),
  points_required: z.number().int().positive().refine(v => v % 10 === 0, 'Must be a multiple of 10'),
  is_shared: z.boolean()
}).partial()

const approveRewardSchema = z.object({
  points_required: z.number().int().positive().refine(v => v % 10 === 0, 'Must be a multiple of 10')
})

const contributeSchema = z.object({
  points: z.number().int().positive().refine(v => v % 10 === 0, 'Must be a multiple of 10')
})

const getRewardQuerySchema = z.object({
  status: z.enum(['pending', 'active', 'funded', 'redeemed', 'archived']),
  sort: z.enum(['progress'])
}).partial()

module.exports = {createRewardSchema, updateRewardSchema, approveRewardSchema, contributeSchema, getRewardQuerySchema}
