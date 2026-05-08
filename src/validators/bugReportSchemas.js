const z = require('zod')

const createBugReportSchema = z.object({
  body: z.string().trim().min(1).max(2000)
})

const updateBugReportSchema = z.object({
  status: z.enum(['open', 'resolved', 'dismissed'])
})

module.exports = { createBugReportSchema, updateBugReportSchema }
