const z = require('zod')

const transactionSchema = z.object({
  page: z.coerce.number().int().positive(),
  limit: z.coerce.number().int().positive(),
  source: z.enum(['chore_approved', 'reward_contribution', 'reward_refund', 'adjustment_reward', 'adjustment_penalty'])
}).partial()


module.exports = {transactionSchema}