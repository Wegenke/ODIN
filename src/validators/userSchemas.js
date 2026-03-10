const z = require('zod')

const userSchema = z.object({
  name: z.string(),
  nick_name: z.string().optional().transform(val => val?.toUpperCase()),
  avatar: z.object({style:z.string()}).passthrough(),
  role: z.enum(['parent','child']),
  pin: z.string().min(4).max(8)
})

const updateUserSchema = z.object({
  name: z.string(),
  nick_name: z.string().transform(val => val?.toUpperCase()),
  avatar: z.object({style:z.string()}).passthrough(),
  role: z.enum(['parent','child']),
  pin: z.string().min(4).max(8)
}).partial()

const updateMeSchema = z.object({
  nick_name: z.string().optional().transform(val => val?.toUpperCase()),
  avatar: z.object({style:z.string()}).passthrough(),
  pin: z.string().min(4).max(8)
}).partial()

module.exports = {userSchema, updateUserSchema, updateMeSchema}