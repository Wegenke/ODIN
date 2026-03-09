const authService = require('../services/authService')

const getProfiles = async (req,res) => {
  try{
    const profiles = await authService.getProfiles()
    return res.status(200).json(profiles)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
    return res.status(500).json({message:'Server error'})
  }
}

const login = async (req,res) => {
  try{
    const {user_id, pin} = req.body
    const safeUser = await authService.login(user_id, pin)
    req.session.user = safeUser
    return res.status(200).json(safeUser)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
    return res.status(500).json({message:'Server error'})
  }

}

const logout = async (req,res) => {
  req.session.destroy()
  return res.status(200).json({message:'Logged out'})
}

const getSession = async (req,res) => {
  return req.session.user ? res.status(200).json(req.session.user) : res.status(401).json({message: "Not authenticated"})
}

module.exports = {getProfiles, login, logout, getSession}