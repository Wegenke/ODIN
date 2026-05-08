const z = require('zod')

const createRewardNoteSchema = z.object({
  body: z.string().trim().min(1).max(2000)
})

const updateRewardNoteSchema = z.object({
  body: z.string().trim().min(1).max(2000)
})

module.exports = { createRewardNoteSchema, updateRewardNoteSchema }
