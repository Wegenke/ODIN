const dashboardService = require('../services/dashboardService')

const getParentDashboard = async (req,res) =>{
  try{
    const {household_id} = req.user
    const dashboard = await dashboardService.getParentDashboard(household_id)
    return res.status(200).json(dashboard)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getChildDashboard = async (req,res) =>{
  try{
    const {id,household_id} = req.user
    const dashboard = await dashboardService.getChildDashboard(id,household_id)
    return res.status(200).json(dashboard)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const viewChildDashboard = async (req, res) => {
  try {
    const { household_id } = req.user
    const child_id = Number(req.params.child_id)
    const dashboard = await dashboardService.getChildDashboard(child_id, household_id)
    return res.status(200).json(dashboard)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {getParentDashboard, getChildDashboard, viewChildDashboard}