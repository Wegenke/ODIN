const bcrypt = require('bcrypt')
const userService = require('../services/userService')

const saltRounds = 10

const getUsers = async (req,res) =>{
  try{
    const {household_id} = req.session.user
    const users = await userService.getUsers(household_id)
    return res.status(200).json(users)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getUserById = async (req,res) =>{
  try{
    const {id} = req.params
    const {household_id} = req.session.user
    const user = await userService.getUserById(id, household_id)

    if(!user) return res.status(404).json({message:"User not found"})
    return res.status(200).json(user)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getUserTransactions = async (req,res) =>{
  try{
    const {id} = req.params
    const {household_id} = req.session.user
    const transactions = await userService.getUserTransactions(id, household_id)
    return res.status(200).json(transactions)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const createUser = async (req,res) => {
  try{
    const {household_id} = req.session.user
    const {name, nick_name, avatar, role, pin} = req.body
    const hashed = await bcrypt.hash(pin, saltRounds)
    const user = await userService.createUser({household_id, name, nick_name, avatar, role, pin_hash:hashed})
    return res.status(201).json(user)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getRecentPinChanges = async (req,res) =>{
  try{
    const {household_id} = req.session.user
    const users = await userService.getRecentPinChanges(household_id)
    return res.status(200).json(users)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const updateUser = async (req,res) =>{
  try{
    const {id} = req.params
    const {household_id} = req.session.user
    const {name, nick_name, avatar, role, pin} = req.body
    const data = {name,nick_name,avatar,role}
    if(pin){
      data.pin_hash = await bcrypt.hash(pin, saltRounds)
      data.pin_last_changed = new Date()
    }

    const users = await userService.updateUser(id,household_id,data)
    return res.status(200).json(users)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const updateMe = async (req,res) =>{
  try{
    const {id} = req.session.user
    const {nick_name, avatar, pin} = req.body
    const data = {nick_name,avatar}
    if(pin){
      data.pin_hash = await bcrypt.hash(pin, saltRounds)
      data.pin_last_changed = new Date()
    }
    const users = await userService.updateMe(id,data)
    return res.status(200).json(users)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

module.exports = {getUsers, getUserById, getUserTransactions,createUser,getRecentPinChanges, updateUser, updateMe}