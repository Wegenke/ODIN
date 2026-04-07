const z = require('zod')

const createParentTaskSchema = z.object({
  title: z.string().min(1).max(255)
})

const updateParentTaskSchema = z.object({
  title: z.string().min(1).max(255).optional()
})

const addNoteSchema = z.object({
  content: z.string().min(1).max(2000)
})

const reorderParentTasksSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1)
})

module.exports = { createParentTaskSchema, updateParentTaskSchema, addNoteSchema, reorderParentTasksSchema }
