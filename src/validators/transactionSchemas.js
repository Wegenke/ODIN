const z = require('zod')

const VALID_SOURCES = ['chore_approved', 'reward_contribution', 'reward_refund', 'adjustment_reward', 'adjustment_penalty']

const transactionSchema = z.object({
  page: z.coerce.number().int().positive(),
  limit: z.coerce.number().int().positive(),
  source: z.string().refine(
    val => val.split(',').every(s => VALID_SOURCES.includes(s)),
    { message: 'Invalid source value' }
  ),
  child_id: z.coerce.number().int().positive()
}).partial()


module.exports = {transactionSchema}