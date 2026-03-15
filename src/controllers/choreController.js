const choreService = require('../services/choreService')

const getChores = async (req,res) => {
  try{
    const {household_id} = req.session.user
    const chores = await choreService.getChores(household_id)
    return res.status(200).json(chores)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const createChore = async (req,res) => {
  try{
    const {id, household_id} = req.session.user
    const {title, points, description, emoji} = req.body

    const chore = await choreService.createChore({created_by:id, household_id, title, points, description, emoji})
    return res.status(201).json(chore)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const updateChore = async (req,res) => {
  try{
    const {id} = req.params
    const {household_id} = req.session.user
    const chore = await choreService.updateChore(id, household_id,req.body)
    return res.status(200).json(chore)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

module.exports = {getChores, createChore, updateChore}