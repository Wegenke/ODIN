const z = require('zod')

const loginSchema = z.object({
  user_id: z.number().int().positive(),
  pin: z.string().min(4).max(8)
})

module.exports = {loginSchema}