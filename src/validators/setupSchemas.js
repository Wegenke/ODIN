const z = require('zod')

const setupSchema = z.object({
  household:z.object({
    name: z.string().transform(val => val.toUpperCase())
  }),
  user: z.object({
    name: z.string(),
    nick_name: z.string().default('PARENT').transform(val => val.toUpperCase()),
    avatar: z.object({style:z.string()}).passthrough(),
    pin: z.string().min(4).max(8)
  })
})

module.exports = {setupSchema}