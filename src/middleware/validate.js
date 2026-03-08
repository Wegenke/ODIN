
const validate = (zod) => {
  return (req,res,next) => {
    const result = zod.safeParse(req.body)
    return !result.success? res.status(400).json(result.error.errors) : next()
  }
}

module.exports = validate