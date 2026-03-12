const assignmentService = require('../services/assignmentService')

const getAvailableAssignments = async (req,res) => {
  try{
    const {household_id} = req.session.user
    const assignments = await assignmentService.getAvailableAssignments(household_id)
    return res.status(200).json(assignments)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getMyAssignments = async (req,res) => {
  try{
    const {id} = req.session.user
    const assignments = await assignmentService.getMyAssignments(id)
    return res.status(200).json(assignments)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getAssignments = async (req,res) => {
  try{
    const {household_id} = req.session.user
    const assignments = await assignmentService.getAssignments(household_id)
    return res.status(200).json(assignments)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const createAssignment = async (req,res) => {
  try{
    const {household_id} = req.session.user
    const {chore_id, child_id} = req.body
    const assignment_transactions = await assignmentService.createAssignment({chore_id, child_id}, household_id)
    return res.status(201).json(assignment_transactions)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const claimAssignment = async (req,res) => {
  try{
    const {id} = req.params
    const child_id = req.session.user.id
    const assignment = await assignmentService.claimAssignment(id,child_id)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const submitAssignment = async (req,res) => {
  try{
    const {id} = req.params
    const child_id = req.session.user.id
    const {comment} = req.body
    const assignment = await assignmentService.submitAssignment(id,child_id,comment)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const approveAssignment = async (req,res) => {
  try{
    const {id} = req.params
    const {id: reviewer_id, household_id} = req.session.user
    const approvedObject = await assignmentService.approveAssignment(id, reviewer_id, household_id)
    return res.status(200).json(approvedObject)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const rejectAssignment = async (req,res) => {
  try{
    const {id} = req.params
    const {id: reviewer_id, household_id} = req.session.user
    const {comment} = req.body
    const rejectedObject = await assignmentService.rejectAssignment(id, reviewer_id, household_id, comment)
    return res.status(200).json(rejectedObject)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const addComment = async (req,res) => {
  try{
    const {id} = req.params
    const {id: user_id, household_id} = req.session.user
    const {comment} = req.body
    const newComment = await assignmentService.addComment(id, user_id, comment, household_id)
    return res.status(201).json(newComment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getComments = async (req,res) => {
  try{
    const {id} = req.params
    const {household_id} = req.session.user
    const comments = await assignmentService.getComments(id, household_id)
    return res.status(200).json(comments)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const dismissAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const {id: reviewer_id, household_id} = req.session.user
    const {comment} = req.body

    const assignment = await assignmentService.dismissAssignment(id, reviewer_id, household_id, comment)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const startAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const child_id = req.session.user.id

    const assignment = await assignmentService.startAssignment(id,child_id)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const pauseAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const child_id = req.session.user.id
    const {comment} = req.body
    const assignment = await assignmentService.pauseAssignment(id,child_id,comment)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const resumeAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const child_id = req.session.user.id
    const {comment} = req.body
    const assignment = await assignmentService.resumeAssignment(id,child_id,comment)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const resumeRejectedAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const child_id = req.session.user.id
    const {comment} = req.body
    const assignment = await assignmentService.resumeRejectedAssignment(id,child_id,comment)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const cancelAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const {id: reviewer_id, household_id} = req.session.user
    const {comment} = req.body

    const assignment = await assignmentService.cancelAssignment(id, reviewer_id, household_id, comment)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const reassignAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const {id: reviewer_id, household_id} = req.session.user
    const {child_id,comment} = req.body

    const assignment = await assignmentService.reassignAssignment(id, reviewer_id, household_id, child_id, comment)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const parentPauseAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const {id: reviewer_id, household_id} = req.session.user
    const {comment} = req.body

    const pausedAssignment = await assignmentService.parentPauseAssignment(id, reviewer_id, household_id, comment)
    return res.status(200).json(pausedAssignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const pauseAllActive = async (req,res) =>{
  try{
    const {id:reviewer_id, household_id} = req.session.user
    const {comment} = req.body
    const pausedAssignments = await assignmentService.pauseAllActive(reviewer_id,household_id, comment)
    return res.status(200).json(pausedAssignments)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const assignAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const {id: reviewer_id, household_id} = req.session.user
    const {child_id, comment} = req.body

    const assignment = await assignmentService.assignAssignment(id, reviewer_id, household_id, child_id, comment)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const unassignAssignment = async (req,res) =>{
  try{
    const {id} = req.params
    const {id: reviewer_id, household_id} = req.session.user
    const {comment} = req.body

    const assignment = await assignmentService.unassignAssignment(id, reviewer_id, household_id, comment)
    return res.status(200).json(assignment)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

module.exports = {getAssignments, getMyAssignments, createAssignment, submitAssignment, approveAssignment, rejectAssignment, addComment, getComments, dismissAssignment, startAssignment, pauseAssignment, resumeAssignment, resumeRejectedAssignment, cancelAssignment, reassignAssignment, parentPauseAssignment, pauseAllActive, claimAssignment, getAvailableAssignments, assignAssignment, unassignAssignment}