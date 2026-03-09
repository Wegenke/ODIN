
const validate = (zod) => {
  return (req,res,next) => {
    const result = zod.safeParse(req.body)
    if (!result.success) return res.status(400).json(result.error.errors)
    req.body = result.data
    next()
  }
}

module.exports = validate