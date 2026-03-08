const z = require('zod')

const createAssignmentSchema = z.object({
  chore_id: z.number().int().positive(),
  child_id: z.number().int().positive().optional()
})

const rejectAssignmentSchema = z.object({
  comment: z.string().max(500).optional()
})

const addCommentSchema = z.object({
  comment: z.string().min(1).max(500)
})

const optionalCommentSchema = z.object({
  comment: z.string().min(1).max(500).optional()
})

const reassignAssignmentSchema = z.object({
  child_id: z.number().int().positive(),
  comment: z.string().max(500).optional()
})

module.exports = {createAssignmentSchema, rejectAssignmentSchema, addCommentSchema, reassignAssignmentSchema, optionalCommentSchema}