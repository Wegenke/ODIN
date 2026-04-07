const rewardService = require('../services/rewardService')

const getRewards = async (req,res) => {
  try{
    const {household_id} = req.user
    const rewards = await rewardService.getRewards(household_id, req.query)
    return res.status(200).json(rewards)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getRewardById = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id} = req.params
    const rewards = await rewardService.getRewardById(id, household_id)
    return res.status(200).json(rewards)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const createReward = async (req,res) => {
  try{
    const {household_id, id, role} = req.user
    const reward = await rewardService.createReward(household_id, id, role, req.body)
    return res.status(201).json(reward)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const updateReward = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id} = req.params
    const reward = await rewardService.updateReward(id, household_id, req.body)
    return res.status(200).json(reward)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const approveReward = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id} = req.params
    const reward = await rewardService.approveReward(id,household_id, req.body.points_required)
    return res.status(200).json(reward)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const rejectReward = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id} = req.params
    const rejected = await rewardService.rejectReward(id,household_id)
    return res.status(200).json(rejected)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const contributeToReward = async (req,res) => {
  try{
    const household_id = req.user.household_id
    const child_id = req.user.id
    const {id} = req.params
    const contribution = await rewardService.contributeToReward(id, child_id, household_id, req.body.points)
    return res.status(201).json(contribution)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getRewardProgress = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id} = req.params
    const progress = await rewardService.getRewardProgress(id, household_id)
    return res.status(200).json(progress)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const redeemReward = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id} = req.params
    const redeemed =  await rewardService.redeemReward(id, household_id)
    return res.status(200).json(redeemed)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const archiveReward = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id} = req.params
    const archived =  await rewardService.archiveReward(id, household_id)
    return res.status(200).json(archived)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const cancelReward = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id} = req.params
    const canceled =  await rewardService.cancelReward(id, household_id)
    return res.status(200).json(canceled)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const requestContributionRefund = async (req,res) => {
  try{
    const household_id = req.user.household_id
    const child_id = req.user.id
    const {id} = req.params
    const redeemed =  await rewardService.requestContributionRefund(id, child_id, household_id)
    return res.status(200).json(redeemed)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const approveContributionRefund = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id, childId} = req.params
    const approved = await rewardService.approveContributionRefund(id, childId, household_id)
    return res.status(200).json(approved)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const rejectContributionRefund = async (req,res) => {
  try{
    const {household_id} = req.user
    const {id, childId} = req.params
    const rejected = await rewardService.rejectContributionRefund(id, childId, household_id)
    return res.status(200).json(rejected)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getRefundRequests = async (req,res) => {
  try{
    const {household_id} = req.user
    const refundRequests = await rewardService.getRefundRequests(household_id)
    return res.status(200).json(refundRequests)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

module.exports = { getRewards, getRewardById, createReward, updateReward, contributeToReward, getRewardProgress, redeemReward, approveReward, rejectReward, archiveReward, cancelReward, requestContributionRefund, approveContributionRefund, rejectContributionRefund, getRefundRequests}